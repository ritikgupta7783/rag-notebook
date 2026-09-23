from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from models.source import Source
from schemas.source import SourceOut
from services.notebook import get_notebook
from services.qdrant import delete_source_chunks
from services.s3 import delete_from_s3, upload_to_s3
from sqs.producer import publish_source_processing
from utils.deps import CurrentUser, Db

router = APIRouter(
    prefix="/sources",
    tags=["sources"],
)


@router.post(
    "",
    response_model=SourceOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_source(
    current_user: CurrentUser,
    db: Db,
    file: UploadFile = File(...),
    notebook_id: str = Query(...),
) -> SourceOut:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    notebook = await get_notebook(
        db,
        notebook_id,
        current_user.id,
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found",
        )

    file.file.seek(0, 2)
    size_bytes = file.file.tell()
    file.file.seek(0)

    source = Source(
        notebook_id=notebook_id,
        owner_id=current_user.id,
        name=file.filename,
        type="pdf",
        status="uploading",
        size_bytes=size_bytes,
        s3_key="",
    )

    s3_key = (
        f"notebooks/{notebook_id}/"
        f"sources/{source.id}/original.pdf"
    )

    try:
        upload_to_s3(
            file.file,
            s3_key,
            file.content_type,
        )

        source.s3_key = s3_key
        source.status = "processing"

        await db[Source.Collection].insert_one(
            source.to_document()
        )

    except Exception as error:
        if source.s3_key:
            try:
                delete_from_s3(source.s3_key)
            except Exception:
                pass

        try:
            await db[Source.Collection].delete_one(
                {"_id": source.id}
            )
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload source: {error}",
        ) from error

    try:
        publish_source_processing(
            source_id=source.id,
            notebook_id=notebook_id,
        )
    except Exception as error:
        source.mark_failed(
            f"Could not queue processing: {error}"
        )
        await db[Source.Collection].update_one(
            {"_id": source.id},
            {
                "$set": {
                    "status": source.status,
                    "error": source.error,
                    "updated_at": source.updated_at,
                }
            },
        )

    return SourceOut.model_validate(source)


@router.get(
    "",
    response_model=list[SourceOut],
)
async def list_sources(
    current_user: CurrentUser,
    db: Db,
    notebook_id: str = Query(...),
) -> list[SourceOut]:
    cursor = (
        db[Source.Collection]
        .find(
            {
                "notebook_id": notebook_id,
                "owner_id": current_user.id,
            }
        )
        .sort("created_at", -1)
    )

    sources = [
        Source.from_document(document)
        async for document in cursor
    ]

    return [
        SourceOut.model_validate(source)
        for source in sources
    ]


@router.delete("/{source_id}")
async def delete_source(
    source_id: str,
    current_user: CurrentUser,
    db: Db,
) -> dict[str, str]:
    source_doc = await db[Source.Collection].find_one(
        {
            "_id": source_id,
            "owner_id": current_user.id,
        }
    )

    if not source_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found",
        )

    s3_key = source_doc.get("s3_key")

    if s3_key:
        try:
            delete_from_s3(s3_key)
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete source file",
            ) from error

    try:
        delete_source_chunks(source_id)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete source embeddings",
        ) from error

    await db[Source.Collection].delete_one(
        {"_id": source_id}
    )

    return {"status": "ok"}

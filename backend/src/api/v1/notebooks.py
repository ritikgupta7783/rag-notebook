from fastapi import APIRouter, HTTPException, status

from schemas.notebook import NotebookCreate, NotebookOut, NotebookUpdate
from services.notebook import (
    count_sources,
    create_notebook,
    delete_notebook,
    get_notebook,
    list_notebooks,
    update_notebook,
)
from utils.deps import CurrentUser, Db

router = APIRouter(prefix="/notebooks", tags=["notebooks"])

@router.get("", response_model=list[NotebookOut])
async def list_user_notebooks(
    current_user: CurrentUser,
    db: Db,
) -> list[NotebookOut]:

    notebooks = await list_notebooks(db, current_user.id)

    return [
        NotebookOut(
            id=n.id,
            title=n.title,
            description=n.description,
            source_count=await count_sources(db, n.id),
            created_at=n.created_at,
            updated_at=n.updated_at,
        )
        for n in notebooks
    ]

@router.post("", response_model=NotebookOut, status_code=status.HTTP_201_CREATED)
async def create(
    payload: NotebookCreate,
    current_user: CurrentUser,
    db: Db,
) -> NotebookOut:

    notebook = await create_notebook(
        db,
        current_user.id,
        payload.title,
        payload.description,
    )

    return NotebookOut(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        source_count=0,
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
    )

@router.get("/{notebook_id}", response_model=NotebookOut)
async def get_one(
    notebook_id: str,
    current_user: CurrentUser,
    db: Db,
) -> NotebookOut:

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

    return NotebookOut(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        source_count=await count_sources(db, notebook.id),
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
    )

@router.patch("/{notebook_id}", response_model=NotebookOut)
async def rename(
    notebook_id: str,
    payload: NotebookUpdate,
    current_user: CurrentUser,
    db: Db,
) -> NotebookOut:

    notebook = await update_notebook(
        db,
        notebook_id,
        current_user.id,
        payload.title,
    )

    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found",
        )

    return NotebookOut(
        id=notebook.id,
        title=notebook.title,
        description=notebook.description,
        source_count=await count_sources(db, notebook.id),
        created_at=notebook.created_at,
        updated_at=notebook.updated_at,
    )

@router.delete("/{notebook_id}")
async def delete(
    notebook_id: str,
    current_user: CurrentUser,
    db: Db,
) -> dict[str, str]:

    deleted = await delete_notebook(
        db,
        notebook_id,
        current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found",
        )

    return {"status": "ok"}


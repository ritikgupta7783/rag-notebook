from typing import Any
from uuid import NAMESPACE_URL, UUID, uuid5

from qdrant_client.models import (
    FieldCondition,
    Filter,
    FilterSelector,
    MatchValue,
    PointStruct,
)

from configs.qdrant import COLLECTION_NAME, qdrant

def point_id(
    source_id: str,
    page: int,
    chunk_index: int,
) -> UUID:

    return uuid5(
        NAMESPACE_URL,
        f"{source_id}:{page}:{chunk_index}",
    )

def insert_chunks(
    chunks: list[dict[str, Any]],
) -> None:

    points = [
        PointStruct(
            id=point_id(
                chunk["source_id"],
                chunk["page"],
                chunk["chunk_index"],
            ),
            vector=chunk["embedding"],
            payload={
                "notebook_id": chunk["notebook_id"],
                "source_id": chunk["source_id"],
                "page": chunk["page"],
                "chunk_index": chunk["chunk_index"],
                "filename": chunk["filename"],
                "text": chunk["text"],
            },
        )
        for chunk in chunks
    ]

    if not points:
        return

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

def search_chunks(
    *,
    notebook_id: str,
    query_vector: list[float],
    limit: int = 8,
) -> list[Any]:

    response = qdrant.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="notebook_id",
                    match=MatchValue(value=notebook_id),
                ),
            ]
        ),
        limit=limit,
    )

    return response.points

def delete_source_chunks(source_id: str) -> None:

    qdrant.delete(
        collection_name=COLLECTION_NAME,
        points_selector=FilterSelector(
            filter=Filter(
                must=[
                    FieldCondition(
                        key="source_id",
                        match=MatchValue(value=source_id),
                    ),
                ]
            )
        ),
    )


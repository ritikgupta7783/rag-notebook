import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PayloadSchemaType,
    VectorParams,
)

load_dotenv()

QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
QDRANT_ENDPOINT = os.environ["QDRANT_ENDPOINT"]

VECTOR_SIZE = 2048

COLLECTION_NAME = "opennotebook_embeddings"

qdrant = QdrantClient(
    url=QDRANT_ENDPOINT,
    api_key=QDRANT_API_KEY,
)


def create_collection() -> None:
    collections = qdrant.get_collections().collections

    if not any(
        collection.name == COLLECTION_NAME
        for collection in collections
    ):
        qdrant.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )

    info = qdrant.get_collection(COLLECTION_NAME)
    indexed = set(info.payload_schema)

    for field in ("notebook_id", "source_id"):
        if field not in indexed:
            qdrant.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name=field,
                field_schema=PayloadSchemaType.KEYWORD,
            )


try:
    create_collection()
except Exception as error:
    print(
        f"[opennotebook] Could not ensure Qdrant collection "
        f"{COLLECTION_NAME!r} exists: {error}"
    )

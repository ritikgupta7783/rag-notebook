from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE = 2500
CHUNK_OVERLAP = 300

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    length_function=len,
    separators=[
        "\n\n",
        "\n",
        ". ",
        "? ",
        "! ",
        " ",
        "",
    ],
)

def chunk_text(
    text: str,
    *,
    page: int,
) -> list[dict]:

    text = text.strip()

    if not text:
        return []

    chunks = splitter.split_text(text)

    return [
        {
            "text": chunk,
            "page": page,
            "chunk_index": index,
        }
        for index, chunk in enumerate(chunks)
    ]


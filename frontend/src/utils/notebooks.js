export function toNotebook(nb) {
  return {
    id: nb.id,
    title: nb.title,
    description: nb.description ?? "",
    sourceCount: nb.source_count ?? 0,
    updatedAt: nb.updated_at,
  }
}

export function toSource(source) {
  return {
    id: source.id,
    name: source.name,
    type: source.type,
    status: source.status,
    sizeBytes: source.size_bytes ?? 0,
    pageCount: source.page_count ?? 0,
    chunkCount: source.chunk_count ?? 0,
    error: source.error ?? null,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
  }
}

export function toMessage(message) {
  return {
    id: message.id,
    role: message.role,
    status: message.status ?? "complete",
    content: message.content ?? "",
    createdAt: message.created_at,
  }
}


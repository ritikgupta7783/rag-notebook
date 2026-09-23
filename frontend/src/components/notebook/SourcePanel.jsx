import { useState } from "react"
import { toast } from "sonner"
import { MdDescription, MdVerticalSplit } from "react-icons/md"
import { UI } from "@/components/ui"
import { useWorkspace } from "@/context/WorkspaceContext"
import { cn } from "@/utils/cn"
import { UploadedSourceItems } from "./UploadedSourceItems"
import { SourceUploadModal } from "./SourceUploadModal"

function isPdf(name) {
  return /\.pdf$/i.test(name)
}

export function SourcePanel({ collapsed, onToggleCollapse }) {
  const { sources, uploadSources, sourcesLoading, uploads } = useWorkspace()
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleFiles(list) {
    if (!list) return
    const all = Array.from(list)
    const accepted = all.filter((f) => isPdf(f.name))
    const rejected = all.filter((f) => !isPdf(f.name))
    rejected.forEach(() => toast.error("Only PDF files are supported."))
    if (accepted.length === 0) return
    setBusy(true)
    try {
      const { uploaded, failed } = await uploadSources(accepted)
      uploaded.forEach((source) =>
        toast.success(`"${source.name}" added to your sources`),
      )
      failed.forEach(({ name, message }) =>
        toast.error(`"${name}" — ${message}`),
      )
    } finally {
      setBusy(false)
    }
  }

  if (collapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-[#1a1d20] pt-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex size-8 items-center justify-center rounded-lg text-[#9aa0a6] transition-colors hover:bg-white/5 hover:text-[#e3e3e3]"
          aria-label="Expand panel"
        >
          <MdVerticalSplit className="size-5 rotate-180" />
        </button>
        <span className="mt-2 text-[11px] font-medium tracking-wide text-[#9aa0a6] [writing-mode:vertical-rl]">
          Sources
        </span>
      </div>
    )
  }

  return (
    <div className="flex w-full shrink-0 flex-col border-r border-border bg-[#1a1d20] lg:w-[400px]">
      {}
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="text-base font-semibold text-[#e3e3e3]">Sources</h2>
        <UI.Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="rounded-full text-[#9aa0a6] hover:text-[#e3e3e3]"
          aria-label="Collapse panel"
        >
          <MdVerticalSplit className="size-5" />
        </UI.Button>
      </div>

      {}
      <div className="px-4 pt-3">
        <SourceUploadModal
          onUpload={handleFiles}
          trigger={
            <UI.Button
              disabled={busy}
              className="h-10 w-full rounded-full border border-white/15 bg-transparent text-[#e3e3e3] hover:bg-white/5"
            >
              <MdDescription className="size-4" />
              Add sources
            </UI.Button>
          }
        />
      </div>

      {}
      <div
        className="flex min-h-0 flex-1 flex-col"
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        {uploads.length > 0 && (
          <div className="shrink-0 space-y-1 px-2 pt-3">
            {uploads.map((u) => (
              <div
                key={u.key}
                className="flex items-center gap-3 rounded-xl px-2 py-2"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#262a30] shadow-sm ring-1 ring-white/10">
                  <MdDescription className="size-5 text-[#8ab4f8]" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {u.name}
                  </p>
                  <div className="h-1 overflow-hidden rounded-full bg-[#262a30]">
                    <div
                      className={cn(
                        "h-full rounded-full bg-[#8ab4f8] transition-[width] duration-200",
                        u.progress === 0 && "w-1/3 animate-pulse",
                      )}
                      style={u.progress > 0 ? { width: `${u.progress}%` } : undefined}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {u.progress}%
                </span>
              </div>
            ))}
          </div>
        )}

        {sourcesLoading ? (
          <div className="min-h-0 flex-1 space-y-0.5 px-2 pt-3 pb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-2 py-2"
              >
                <UI.Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <UI.Skeleton className="h-3.5 w-3/4" />
                  <UI.Skeleton className="h-3 w-1/2" />
                </div>
                <UI.Skeleton className="h-5 w-14 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ) : sources.length > 0 ? (
          <UI.ScrollArea className="min-h-0 flex-1 px-2 pt-3 pb-2">
            <div className="grid gap-0.5">
              {sources.map((source) => (
                <UploadedSourceItems key={source.id} source={source} />
              ))}
            </div>
          </UI.ScrollArea>
        ) : (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center transition-colors",
              dragging && "bg-white/[0.03]",
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-[#262a30] text-[#9aa0a6]">
              <MdDescription className="size-7" />
            </span>
            <p className="text-[15px] font-medium text-[#e3e3e3]">
              Saved sources will appear here
            </p>
            <p className="text-[13px] leading-relaxed text-[#9aa0a6]">
              Add a PDF to this notebook, then ask questions
              <br />
              or create things based on your sources.
            </p>
          </div>
        )}
      </div>

      {}
      {sources.length === 0 && (
        <p className="px-6 pb-4 text-center text-[13px] text-[#9aa0a6]">
          Drop files here or{" "}
          <SourceUploadModal
            onUpload={handleFiles}
            trigger={
              <span className="cursor-pointer font-medium text-[#8ab4f8] hover:underline">
                add a source
              </span>
            }
          />
        </p>
      )}
    </div>
  )
}


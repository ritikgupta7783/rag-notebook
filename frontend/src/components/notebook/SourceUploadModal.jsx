import { useRef, useState } from "react"
import { toast } from "sonner"
import { MdAdd, MdCheck, MdClose, MdCloudUpload } from "react-icons/md"
import { UI } from "@/components/ui"
import { cn } from "@/utils/cn"

const ACCEPTED = ".pdf,application/pdf"

function isPdf(name) {
  return /\.pdf$/i.test(name)
}

export function SourceUploadModal({ trigger, onUpload }) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  function addFiles(list) {
    if (!list) return
    const accepted = Array.from(list).filter((f) => isPdf(f.name))
    const rejected = Array.from(list).filter((f) => !isPdf(f.name))
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted])
    rejected.forEach(() => toast.error("Only PDF files are supported."))
  }

  function handleUpload() {
    if (files.length === 0) return
    const targets = [...files]
    setFiles([])
    setOpen(false)
    onUpload?.(targets)
  }

  return (
    <UI.Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setFiles([])
      }}
    >
      <UI.DialogTrigger asChild>
        {trigger ?? (
          <UI.Button className="gap-2 rounded-full">
            <MdAdd />
            Add sources
          </UI.Button>
        )}
      </UI.DialogTrigger>
      <UI.DialogContent className="sm:max-w-md">
        <UI.DialogHeader>
          <UI.DialogTitle>Add sources</UI.DialogTitle>
          <UI.DialogDescription>Upload a PDF to add it to this notebook.</UI.DialogDescription>
        </UI.DialogHeader>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            "grid cursor-pointer place-items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MdCloudUpload className="size-6" />
          </span>
          <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
          <p className="text-xs text-muted-foreground">PDF files only</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ""
            }}
          />
        </div>

        {files.length > 0 && (
          <div className="grid gap-1.5">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Remove file"
                >
                  <MdClose className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <UI.DialogFooter>
          <UI.Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </UI.Button>
          <UI.Button onClick={handleUpload} disabled={files.length === 0} className="gap-2">
            <MdCheck />
            Upload ({files.length})
          </UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  )
}


import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { MdEdit, MdSettings, MdShare } from "react-icons/md"
import { Shared } from "@/components/shared"
import { UI } from "@/components/ui"
import { useWorkspace } from "@/context/WorkspaceContext"
import { cn } from "@/utils/cn"
import { ChatPanel } from "./ChatPanel"
import { SourcePanel } from "./SourcePanel"

const HEADER_ACTIONS = [
  { key: "share", label: "Share", icon: MdShare },
  { key: "settings", label: "Settings", icon: MdSettings },
]

function EditableTitle() {
  const { notebookTitle, renameNotebook } = useWorkspace()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(notebookTitle)
  const inputRef = useRef(null)
  const cancelRef = useRef(false)
  const savingRef = useRef(false)

  useEffect(() => {
    if (editing) {
      setDraft(notebookTitle)
      cancelRef.current = false
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, notebookTitle])

  async function save() {
    if (savingRef.current) return
    if (cancelRef.current) {
      cancelRef.current = false
      setEditing(false)
      return
    }
    const clean = draft.trim()
    setEditing(false)
    if (!clean || clean === notebookTitle) return
    savingRef.current = true
    try {
      await renameNotebook(clean)
    } catch (error) {
      toast.error(error.message || "Could not rename the notebook.")
    } finally {
      savingRef.current = false
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            save()
          }
          if (e.key === "Escape") {
            cancelRef.current = true
            inputRef.current?.blur()
            setEditing(false)
          }
        }}
        maxLength={80}
        aria-label="Notebook title"
        className="h-8 min-w-0 rounded-lg border border-white/15 bg-[#22262b] px-2 text-[15px] font-medium text-[#e3e3e3] outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/40"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Rename notebook"
      className="group flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/5"
    >
      <span className="truncate text-[15px] font-medium text-[#e3e3e3]">{notebookTitle}</span>
      <MdEdit className="size-3.5 shrink-0 text-[#7c8189] opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  )
}

export function Notebook() {
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#121417] text-[#e3e3e3]">
      {}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-[#1a1d20] px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            title="Back to home"
            className="flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-80"
          >
            <Shared.BrandMark className="size-9 [&>svg]:size-5" />
          </Link>
          <EditableTitle />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {HEADER_ACTIONS.map(({ key, label, icon: Icon }) => (
            <UI.Button
              key={key}
              variant="ghost"
              onClick={() =>
                toast.info("This is a frontend preview — this action is coming soon.")
              }
              className={cn(
                "h-9 gap-2 rounded-full border border-white/10 bg-[#1e2227] px-4 text-sm text-[#e3e3e3]",
                "hover:bg-[#262a30] hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </UI.Button>
          ))}
        </div>
      </header>

      {}
      <div className="flex min-h-0 flex-1">
        <SourcePanel
          collapsed={sourcesCollapsed}
          onToggleCollapse={() => setSourcesCollapsed((c) => !c)}
        />
        <ChatPanel />
      </div>

      <footer className="flex h-9 shrink-0 items-center justify-center bg-[#121417] px-4">
        <p className="text-[11px] text-[#9aa0a6]">
          OpenNotebook can be inaccurate; please double check its responses.
        </p>
      </footer>
    </div>
  )
}


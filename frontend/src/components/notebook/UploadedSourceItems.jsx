import { useState } from "react"
import { toast } from "sonner"
import { MdDelete, MdMoreVert } from "react-icons/md"
import { SourceStatusBadge } from "./SourceStatusBadge"
import { SourceTypeIcon, SOURCE_TYPE_META } from "./SourceTypeIcon"
import { UI } from "@/components/ui"
import { useWorkspace } from "@/context/WorkspaceContext"

export function UploadedSourceItems({ source }) {
  const { removeSource } = useWorkspace()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const typeMeta = SOURCE_TYPE_META[source.type]

  async function handleRemove() {
    await removeSource(source.id)
    toast.success(`"${source.name}" removed`)
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#262a30] shadow-sm ring-1 ring-white/10">
        <SourceTypeIcon type={source.type} className="text-[#8ab4f8]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{source.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {typeMeta.label}
          {source.pageCount > 0 && ` · ${source.pageCount} pages`}
        </p>
        {source.status === "failed" && source.error && (
          <p className="mt-0.5 truncate text-xs text-red-500/90" title={source.error}>
            {source.error}
          </p>
        )}
      </div>

      <SourceStatusBadge status={source.status} />

      <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <UI.DropdownMenu>
          <UI.DropdownMenuTrigger asChild>
            <UI.Button variant="ghost" size="icon-sm" aria-label={source.name}>
              <MdMoreVert className="size-4" />
            </UI.Button>
          </UI.DropdownMenuTrigger>
          <UI.DropdownMenuContent align="end" sideOffset={4}>
            <UI.DropdownMenuItem
              variant="destructive"
              className="gap-2"
              onClick={() => setConfirmOpen(true)}
            >
              <MdDelete className="size-4" />
              Remove
            </UI.DropdownMenuItem>
          </UI.DropdownMenuContent>
        </UI.DropdownMenu>
      </div>

      <UI.AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <UI.AlertDialogContent>
          <UI.AlertDialogHeader>
            <UI.AlertDialogTitle>Remove</UI.AlertDialogTitle>
            <UI.AlertDialogDescription>{`"${source.name}" removed`}</UI.AlertDialogDescription>
          </UI.AlertDialogHeader>
          <UI.AlertDialogFooter>
            <UI.AlertDialogCancel>Cancel</UI.AlertDialogCancel>
            <UI.AlertDialogAction onClick={handleRemove} variant="destructive">
              Remove
            </UI.AlertDialogAction>
          </UI.AlertDialogFooter>
        </UI.AlertDialogContent>
      </UI.AlertDialog>
    </div>
  )
}


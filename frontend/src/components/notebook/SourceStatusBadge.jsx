import { MdRefresh } from "react-icons/md"
import { UI } from "@/components/ui"
import { cn } from "@/utils/cn"

const STATUS_STYLES = {
  uploading: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
  processing: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
  ready: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  failed: "border-transparent bg-red-500/10 text-red-700 dark:text-red-400",
}

const STATUS_LABELS = {
  uploading: "Uploading",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
}

export function SourceStatusBadge({ status }) {
  const busy = status === "uploading" || status === "processing"
  return (
    <UI.Badge variant="outline" className={cn("gap-1.5 font-medium", STATUS_STYLES[status])}>
      {busy ? (
        <MdRefresh className="size-3 animate-spin" />
      ) : (
        <span
          className={cn(
            "size-1.5 rounded-full",
            status === "ready" && "bg-emerald-500",
            status === "failed" && "bg-red-500",
          )}
        />
      )}
      {STATUS_LABELS[status]}
    </UI.Badge>
  )
}


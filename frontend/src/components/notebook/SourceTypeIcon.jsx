import { MdDescription, MdInsertDriveFile, MdNotes } from "react-icons/md"
import { cn } from "@/utils/cn"

export const SOURCE_TYPE_META = {
  pdf: { icon: MdDescription, label: "PDF" },
  docx: { icon: MdInsertDriveFile, label: "DOCX" },
  txt: { icon: MdNotes, label: "TXT" },
}

export function SourceTypeIcon({ type, className }) {
  const { icon: Icon } = SOURCE_TYPE_META[type]
  return (
    <span className={cn("text-white", className)}>
      <Icon className="size-4" />
    </span>
  )
}


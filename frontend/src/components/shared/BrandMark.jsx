import { MdAutoStories } from "react-icons/md"
import { cn } from "@/utils/cn"

export function BrandMark({ className }) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-sm",
        className,
      )}
    >
      <MdAutoStories className="size-4" />
    </div>
  )
}


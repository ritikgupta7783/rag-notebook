import { cn } from "@/utils/cn"

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#262a30]", className)}
      {...props}
    />
  )
}

export { Skeleton }

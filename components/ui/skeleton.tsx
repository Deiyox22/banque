import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#1a1122]/50 border border-white/[0.08]", className)}
      {...props}
    />
  )
}

export { Skeleton }

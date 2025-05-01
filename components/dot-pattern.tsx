import { cn } from "@/lib/utils"

interface DotPatternProps {
  className?: string
}

export function DotPattern({ className }: DotPatternProps) {
  return (
    <div className={cn("w-full h-full", className)}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <defs>
          <pattern id="dotPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#0070F3" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>
  )
}

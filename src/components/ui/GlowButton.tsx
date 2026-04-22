import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

const GlowButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
          variant === 'primary' && "bg-linear-to-r from-[#F97316] to-[#8B5CF6] text-white shadow-lg hover:shadow-[#F97316]/50 hover:-translate-y-0.5",
          variant === 'ghost' && "bg-transparent text-color-base-content hover:bg-white/5 border border-transparent hover:border-white/10",
          className
        )}
        {...props}
      />
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton }

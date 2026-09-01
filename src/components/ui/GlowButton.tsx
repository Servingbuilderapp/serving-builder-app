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
          "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variant === 'primary' && "bg-color-primary text-white border border-color-primary shadow-[0_1px_2px_rgba(11,42,74,0.08),0_8px_20px_-10px_rgba(29,78,216,0.45)] hover:bg-[#1841B8] hover:border-[#1841B8] hover:shadow-[0_2px_4px_rgba(11,42,74,0.10),0_12px_26px_-12px_rgba(29,78,216,0.55)]",
          variant === 'ghost' && "bg-white text-color-base-content border border-color-base-300 hover:bg-[#F4F7FC] hover:border-color-primary/40",
          className
        )}
        {...props}
      />
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton }

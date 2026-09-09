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
          variant === 'primary' && "bg-gradient-to-b from-[#C39F68] to-[#A8804B] text-[#3A1420] border border-[#8A6636] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-10px_rgba(0,0,0,0.5)] hover:from-[#CDAC79] hover:to-[#B08D57]",
          variant === 'ghost' && "bg-transparent text-color-base-content border border-[rgba(243,231,220,0.4)] hover:bg-[rgba(243,231,220,0.08)] hover:border-color-primary/50",
          className
        )}
        {...props}
      />
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton }

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
          "relative inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold uppercase tracking-widest text-[10px] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variant === 'primary' && "bg-linear-to-tr from-[#F97316] via-[#EC4899] to-[#8B5CF6] text-white shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.5)] hover:-translate-y-1 border border-white/20",
          variant === 'ghost' && "bg-color-base-content/5 text-color-base-content/60 hover:bg-color-base-content/10 border border-color-base-content/10 hover:border-color-base-content/20 hover:text-color-base-content",
          className
        )}
        {...props}
      />
    )
  }
)
GlowButton.displayName = "GlowButton"

export { GlowButton }

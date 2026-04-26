import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-color-base-content/50">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg bg-color-base-100 border border-color-base-content/20 px-3 py-2 text-sm text-color-base-content placeholder:text-color-base-content/40 focus:outline-none focus:ring-2 focus:ring-color-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-inner",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props do componente Input
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Componente Input
 * Campo de entrada de texto reutilizável e estilizado
 *
 * @example
 * ```tsx
 * <Input
 *   type="email"
 *   placeholder="seu@email.com"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

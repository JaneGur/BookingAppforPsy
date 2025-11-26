import * as React from "react";
import {cn} from "../../lib/utils/cn";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Стиль из Streamlit: светлый инпут с зеленой обводкой при фокусе
                    "flex h-12 w-full rounded-xl border-2 border-primary-200/50 bg-white/95 backdrop-blur-sm px-4 py-3 text-base transition-all",
                    "placeholder:text-gray-400",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-400/20 focus-visible:border-primary-400",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
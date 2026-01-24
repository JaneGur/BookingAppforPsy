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
                    // Современный стиль с плавными переходами
                    "flex h-12 w-full rounded-2xl border-2 border-primary-200/40 bg-white/98 backdrop-blur-sm px-5 py-3 text-base transition-all duration-300 shadow-sm",
                    "placeholder:text-gray-400 placeholder:font-normal",
                    "hover:border-primary-300/50 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/20 focus-visible:border-primary-500/70 focus-visible:shadow-lg focus-visible:scale-[1.01]",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-primary-200/40",
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
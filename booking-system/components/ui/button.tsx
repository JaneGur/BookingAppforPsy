import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {cn} from "../../lib/utils/cn";


const buttonVariants = cva(
    // Базовые стили (как в Streamlit)
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                // Основная кнопка (как в Streamlit primary)
                default:
                    "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:scale-98 active:bg-gradient-to-r active:from-primary-400 active:to-primary-500 active:text-white disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed",

                // Вторичная кнопка
                secondary:
                    "bg-white text-primary-600 border border-primary-200/40 hover:bg-primary-50/80 hover:border-primary-300/50 active:bg-primary-50 active:text-primary-600 active:border-primary-300/50 shadow-sm hover:shadow-md",

                // Деструктивная
                destructive:
                    "bg-error-DEFAULT text-white hover:bg-error-dark",

                // Призрачная
                ghost:
                    "hover:bg-primary-50 hover:text-primary-600",

                // Только текст
                link:
                    "text-primary-500 underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-3 text-base",
                sm: "h-10 px-4 py-2 text-sm",
                lg: "h-14 px-8 py-4 text-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, onMouseDown, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        
        const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
            // Предотвращаем дефолтное поведение браузера, которое делает кнопку белой
            e.preventDefault();
            onMouseDown?.(e);
        };
        
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                data-button-variant={variant || 'default'}
                onMouseDown={handleMouseDown}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
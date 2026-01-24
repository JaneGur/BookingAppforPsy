import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {cn} from "../../lib/utils/cn";


const buttonVariants = cva(
    // Базовые стили - современный дизайн с плавными переходами
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none relative overflow-hidden",
    {
        variants: {
            variant: {
                // Основная кнопка с градиентом и эффектами
                default:
                    "bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 active:shadow-md disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-400 disabled:text-white disabled:opacity-60 disabled:shadow-sm disabled:cursor-not-allowed before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",

                // Вторичная кнопка - стильная белая
                secondary:
                    "bg-white text-primary-700 border-2 border-primary-200/60 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white hover:border-primary-300 active:bg-primary-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed",

                // Деструктивная
                destructive:
                    "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-1 active:scale-95",

                // Призрачная
                ghost:
                    "hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100",

                // Только текст
                link:
                    "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
            },
            size: {
                default: "h-12 px-6 py-3 text-base",
                sm: "h-10 px-4 py-2 text-sm rounded-xl",
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
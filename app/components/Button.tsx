"use client"

import React, { ButtonHTMLAttributes, ReactNode } from "react"
import classNames from "classnames"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: "primary" | "secondary" | "danger" | "outline"
 size?: "small" | "medium" | "large"
 isLoading?: boolean
 leftIcon?: ReactNode
 rightIcon?: ReactNode
 children: ReactNode
}

const Button: React.FC<ButtonProps> = ({
 variant = "primary",
 size = "medium",
 isLoading = false,
 leftIcon,
 rightIcon,
 children,
 className,
 ...props
}) => {
 return (
  <button
   {...props}
   className={classNames(
    "flex items-center justify-center font-medium transition duration-150 ease-in-out rounded focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
     // Color variants
     "bg-primary text-white hover:bg-primary-dark focus:ring-primary":
      variant === "primary",
     "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary":
      variant === "secondary",
     "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
      variant === "danger",
     "border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-300":
      variant === "outline",

     // Size adjustments
     "px-2 py-1 text-xs": size === "small", // Smaller size adjustments
     "px-4 py-2 text-sm": size === "medium",
     "px-6 py-3 text-lg": size === "large",

     // Disabled and loading states
     "opacity-50 cursor-not-allowed": props.disabled || isLoading,
    },
    className
   )}
   disabled={props.disabled || isLoading}
  >
   {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
   {isLoading ? <span className="loader mr-2"></span> : children}
   {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
  </button>
 )
}

export default Button

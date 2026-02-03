import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = ({
  className,
  variant = "primary",
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      variant === "primary"
        ? "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600"
        : variant === "secondary"
        ? "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-slate-300"
        : "bg-transparent text-slate-600 hover:text-slate-900",
      props.disabled && "cursor-not-allowed opacity-60",
      className
    )}
    {...props}
  />
);

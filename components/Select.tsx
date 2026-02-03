import React from "react";
import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = ({ className, error, children, ...props }: SelectProps) => (
  <div className="space-y-1">
    <select
      className={clsx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200",
        error && "border-rose-400 focus:border-rose-500 focus:ring-rose-200",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error ? <p className="text-xs text-rose-600">{error}</p> : null}
  </div>
);

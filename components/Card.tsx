import React from "react";
import clsx from "clsx";

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={clsx("rounded-2xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
    {children}
  </div>
);

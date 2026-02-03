import React from "react";
import { Input } from "@/components/Input";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const CurrencyInput = ({
  value,
  onChange,
  error,
  placeholder,
}: CurrencyInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = event.target.value.replace(/[^\d.]/g, "");
    onChange(sanitized);
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400">
        ₺
      </span>
      <Input
        value={value}
        onChange={handleChange}
        error={error}
        placeholder={placeholder ?? "0.00"}
        className="pl-7"
        inputMode="decimal"
      />
    </div>
  );
};

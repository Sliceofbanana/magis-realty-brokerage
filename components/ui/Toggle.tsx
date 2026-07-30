"use client";

import { useState } from "react";

export function Toggle({
  defaultChecked = false,
  checked,
  onChange,
  disabled = false,
  label,
}: {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;

  function handleClick() {
    if (disabled) return;
    if (onChange) {
      onChange(!isOn);
    } else {
      setInternal((v) => !v);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        isOn ? "bg-gold-500" : "bg-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          isOn ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

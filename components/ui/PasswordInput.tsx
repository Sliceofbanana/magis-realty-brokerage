"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useId, useState } from "react";

/**
 * Drop-in replacement for `<input type="password">` with a show/hide toggle.
 * Same styling contract as the app's plain text inputs — pass the usual
 * `className` and it's applied to the `<input>` itself (a little extra
 * right-padding is added automatically so text doesn't run under the icon).
 */
export function PasswordInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const inputId = props.id ?? reactId;

  return (
    <div className="relative">
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-navy-900"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

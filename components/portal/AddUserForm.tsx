"use client";

import { useState } from "react";
import { Copy, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createUserAction, type AdminUserRow, type CreateUserResult } from "@/lib/actions/users";

const roles: { value: AdminUserRow["role"]; label: string }[] = [
  { value: "AGENT", label: "Agent" },
  { value: "BROKER", label: "Broker" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ADMINISTRATOR", label: "Administrator" },
];

const inputClass =
  "w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900";

export function AddUserForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AdminUserRow["role"]>("AGENT");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreateUserResult | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("AGENT");
    setError("");
    setCreated(null);
    setCopied(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await createUserAction({ name, email, phone, role });
      if (result.error) {
        setError(result.error);
        return;
      }
      setCreated(result);
      onCreated();
    } catch {
      setError("Couldn't create the account. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!created?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(created.inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus size={14} /> Add User
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-user-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="add-user-title" className="font-serif text-lg font-bold text-navy-900">
                Add User
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="text-gray-400 hover:text-navy-900">
                <X size={20} />
              </button>
            </div>

            {created ? (
              <div className="space-y-4 px-6 py-5 text-sm text-navy-900">
                <p>
                  <strong>{name}</strong>&apos;s account is created and active.
                </p>
                {created.emailed ? (
                  <p className="text-gray-600">
                    An invite was emailed to {email.trim().toLowerCase()} so they can choose a password. The link is
                    valid for 7 days.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      The invite email couldn&apos;t be sent. Share this link with them so they can choose a password
                      (valid for 7 days, single use):
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={created.inviteLink ?? ""}
                        onFocus={(e) => e.currentTarget.select()}
                        className={`${inputClass} font-mono text-xs`}
                        aria-label="Set-password link"
                      />
                      <Button type="button" size="sm" variant="outline" onClick={copyLink}>
                        <Copy size={14} /> {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={reset}>
                    Add Another
                  </Button>
                  <Button type="button" className="flex-1" onClick={close}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <div>
                  <label htmlFor="addUserName" className={labelClass}>
                    Full Name
                  </label>
                  <input
                    id="addUserName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    required
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="addUserEmail" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="addUserEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@example.com"
                    required
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="addUserPhone" className={labelClass}>
                    Phone <span className="font-normal normal-case text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="addUserPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="addUserRole" className={labelClass}>
                    Role
                  </label>
                  <select
                    id="addUserRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value as AdminUserRow["role"])}
                    className={inputClass}
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-gray-500">
                  The account is active right away. They&apos;ll get an email to choose their own password.
                </p>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Creating…" : "Create Account"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

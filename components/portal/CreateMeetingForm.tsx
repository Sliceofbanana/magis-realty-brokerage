"use client";

import { useActionState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createMeetingAction, type CreateMeetingResult } from "@/lib/actions/attendance";

type ActiveUserOption = { id: string; name: string; photo: string | null; role: string };

export function CreateMeetingForm({ activeUsers }: { activeUsers: ActiveUserOption[] }) {
  const [state, formAction, pending] = useActionState<CreateMeetingResult, FormData>(
    createMeetingAction,
    null as unknown as CreateMeetingResult
  );

  return (
    <form action={formAction} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-lg font-bold text-navy-900">Create Meeting</h2>
      <p className="mt-1 text-sm text-gray-500">
        Schedule a meeting or PKS session and choose who&rsquo;s expected to attend.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
            Title
          </label>
          <input
            id="title"
            name="title"
            placeholder="Weekly Sales Alignment"
            className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue="MEETING"
            className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="MEETING">Meeting</option>
            <option value="PKS">PKS Session</option>
          </select>
        </div>
        <div>
          <label htmlFor="checkInMode" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
            Check-in Mode
          </label>
          <select
            id="checkInMode"
            name="checkInMode"
            defaultValue="BUTTON"
            className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="BUTTON">Button (agents self-check-in in the portal)</option>
            <option value="QR">QR Code (display at the meeting, agents scan)</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-900">
          Attendees
        </p>
        {activeUsers.length === 0 ? (
          <p className="text-sm text-gray-400">No active users to invite.</p>
        ) : (
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-black/10 p-3 sm:grid-cols-2">
            {activeUsers.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-navy-900 hover:bg-offwhite"
              >
                <input
                  type="checkbox"
                  name="attendeeIds"
                  value={u.id}
                  className="h-4 w-4 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                />
                <Avatar src={u.photo ?? undefined} name={u.name} size={24} />
                <span className="truncate">{u.name}</span>
                <span className="ml-auto shrink-0 text-[10px] uppercase text-gray-400">{u.role}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-3 text-sm text-emerald-600">Meeting created.</p>}

      <Button type="submit" disabled={pending} className="mt-5">
        {pending ? "Creating…" : "Create Meeting"}
      </Button>
    </form>
  );
}

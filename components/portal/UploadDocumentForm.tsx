"use client";

import { useActionState, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createDocumentAction, type DocumentActionResult } from "@/lib/actions/documents";

type PropertyOption = { id: string; title: string };

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const folderOptions = [
  { value: "PERSONAL", label: "Personal Documents" },
  { value: "PROPERTY", label: "Property Documents" },
  { value: "CONTRACT_TEMPLATE", label: "Contract Templates" },
  { value: "ARCHIVE", label: "Archive" },
];

export function UploadDocumentForm({ properties }: { properties: PropertyOption[] }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("PERSONAL");
  const [clientError, setClientError] = useState("");
  const [state, formAction, pending] = useActionState<DocumentActionResult, FormData>(
    createDocumentAction,
    null as unknown as DocumentActionResult
  );

  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setOpen(false);
      setCategory("PERSONAL");
      setClientError("");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_FILE_BYTES) {
      setClientError("File is larger than 10MB.");
    } else {
      setClientError("");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload size={16} /> Upload New Document
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-document-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="upload-document-title" className="font-serif text-lg font-bold text-navy-900">
                Upload New Document
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-navy-900"
              >
                <X size={20} />
              </button>
            </div>

            <form action={formAction} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Folder
                </label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                >
                  {folderOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {category === "PROPERTY" && (
                <div>
                  <label htmlFor="propertyId" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Property
                  </label>
                  <select
                    id="propertyId"
                    name="propertyId"
                    defaultValue=""
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select a property
                    </option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="file" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  File
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
                  required
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
                <p className="mt-1 text-xs text-gray-400">PDF, DOCX, XLSX, JPG, or PNG — up to 10MB.</p>
              </div>

              {clientError && <p className="text-sm text-red-600">{clientError}</p>}
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending || !!clientError} className="w-full">
                {pending ? "Uploading…" : "Upload Document"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createBlogPostAction, type CreateBlogPostResult } from "@/lib/actions/blog";

export function CreateBlogPostForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CreateBlogPostResult, FormData>(
    createBlogPostAction,
    null as unknown as CreateBlogPostResult
  );

  // Closes the modal the moment a submission succeeds. Comparing against
  // the previous state reference (rather than reacting in an effect) is
  // the React-recommended way to adjust state from a changed value — it
  // also avoids re-closing the modal on every render after success if the
  // admin reopens it to publish another post.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add New Blog</Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-blog-title"
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/70 p-4"
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 id="create-blog-title" className="font-serif text-lg font-bold text-navy-900">
                Add New Blog
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
                <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="excerpt" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={2}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    placeholder="Market Analysis"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="readTime" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                    Read Time
                  </label>
                  <input
                    id="readTime"
                    name="readTime"
                    placeholder="5 min read"
                    className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="content" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Content (separate paragraphs with a blank line)
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={6}
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="pullQuote" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Pull Quote (optional)
                </label>
                <input
                  id="pullQuote"
                  name="pullQuote"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="tags" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  name="tags"
                  placeholder="Investment, Architecture"
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="image" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-900">
                  Cover Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  placeholder="/images/..."
                  className="w-full rounded-lg border border-black/10 bg-gray-50 px-4 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                />
              </div>

              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Publishing…" : "Publish"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

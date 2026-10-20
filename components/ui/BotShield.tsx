"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Drop inside any public <form>. Adds an invisible honeypot field and, whenever
 * the form's data is read (native submit or `new FormData(form)`), attaches how
 * long the form was open (`_t`) and the Turnstile token (`_cf`, only when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set). Server side: lib/botGuard.ts.
 */
export function BotShield() {
  const trapRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = trapRef.current?.form;
    if (!form) return;
    const openedAt = performance.now();
    let token = "";
    let widgetId: string | undefined;
    let cancelled = false;

    function onFormData(e: FormDataEvent) {
      e.formData.set("_t", String(Math.round(performance.now() - openedAt)));
      e.formData.set("_cf", token);
      // Turnstile tokens are single-use: fetch a fresh one for any resubmit.
      if (widgetId) {
        const id = widgetId;
        token = "";
        setTimeout(() => window.turnstile?.reset(id), 0);
      }
    }
    form.addEventListener("formdata", onFormData);

    if (SITE_KEY && widgetRef.current) {
      loadTurnstile()
        .then(() => {
          if (cancelled || !widgetRef.current || !window.turnstile) return;
          widgetId = window.turnstile.render(widgetRef.current, {
            sitekey: SITE_KEY,
            callback: (t: string) => {
              token = t;
            },
            "expired-callback": () => {
              token = "";
            },
            "error-callback": () => {
              token = "";
            },
          });
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      form.removeEventListener("formdata", onFormData);
    };
  }, []);

  return (
    <>
      {/* Honeypot: invisible to people and assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input ref={trapRef} type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {SITE_KEY && <div ref={widgetRef} className="min-h-[65px] sm:col-span-2" />}
    </>
  );
}

"use client";

import { ReactNode, useState } from "react";

export type TabDef = { id: string; label: string; icon?: ReactNode };

export function Tabs({
  tabs,
  defaultTab,
  children,
}: {
  tabs: TabDef[];
  defaultTab?: string;
  children: (activeId: string) => ReactNode;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-6 overflow-x-auto border-b border-black/10"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              active === tab.id
                ? "border-gold-500 text-navy-900"
                : "border-transparent text-gray-500 hover:text-navy-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{children(active)}</div>
    </div>
  );
}

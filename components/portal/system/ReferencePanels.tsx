"use client";

import Image from "next/image";
import { Building2, ListChecks } from "lucide-react";
import { getReferenceDataAction } from "@/lib/actions/systemInsights";
import { Card, LoaderGate, Notice, Rows, useLoader } from "./ui";

export function GeneralPanel() {
  const loader = useLoader(getReferenceDataAction);
  return (
    <LoaderGate loader={loader}>
      {(data) => (
        <>
          <Notice>
            These defaults are set in the code, not in the database, so they&rsquo;re shown here for reference. Changing one
            takes a code change and a deploy.
          </Notice>
          <Card icon={<Building2 size={18} />} title="Identity and regional defaults" description="How the portal names itself and formats what it shows.">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex items-center justify-center rounded-xl bg-navy-950 p-6">
                <Image
                  src="/images/footer-logo.png"
                  alt={`${data.general[0]?.value ?? "Company"} logo`}
                  width={1200}
                  height={542}
                  className="h-20 w-auto object-contain"
                />
              </div>
              <Rows rows={data.general} />
            </div>
          </Card>
        </>
      )}
    </LoaderGate>
  );
}

export function WorkflowPanel() {
  const loader = useLoader(getReferenceDataAction);
  return (
    <LoaderGate loader={loader}>
      {(data) => (
        <>
          <Notice>
            These are the options the portal&rsquo;s modules share. They&rsquo;re built into the database schema, so adding or
            renaming one takes a code change and a migration, not a setting.
          </Notice>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {data.groups.map((group) => (
              <Card key={group.title} icon={<ListChecks size={18} />} title={group.title} description={group.note}>
                <ul className="flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <li key={value} className="rounded-full bg-offwhite px-3 py-1.5 text-xs font-semibold text-navy-900">
                      {value}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}
    </LoaderGate>
  );
}

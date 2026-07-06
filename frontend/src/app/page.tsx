"use client";

import { useState } from "react";
import NdaForm from "@/components/NdaForm";
import NdaDocument from "@/components/NdaDocument";
import NdaPdfDownload from "@/components/NdaPdfDownload";
import { defaultFormData, NdaFormData } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<NdaFormData>(defaultFormData);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Mutual NDA Creator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Fill in the details below to generate a Common Paper Mutual NDA.
        </p>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-8 p-6 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Details
          </h2>
          <NdaForm data={data} onChange={setData} />
        </section>

        <section className="flex flex-col rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Preview
            </h2>
            <NdaPdfDownload data={data} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <NdaDocument data={data} />
          </div>
        </section>
      </main>
    </div>
  );
}

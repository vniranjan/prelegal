"use client";

import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import NdaPdfDocument from "./NdaPdfDocument";
import { NdaFormData } from "@/lib/types";

export default function NdaPdfDownload({ data }: { data: NdaFormData }) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const blob = await pdf(<NdaPdfDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mutual-nda.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
    >
      {isGenerating ? "Generating PDF…" : "Download PDF"}
    </button>
  );
}

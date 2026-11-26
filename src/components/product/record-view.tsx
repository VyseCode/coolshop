"use client";

import { useEffect } from "react";

import { recordRecentView } from "@/lib/actions/recent";

export function RecordView({ slug }: { slug: string }) {
  useEffect(() => {
    void recordRecentView(slug);
  }, [slug]);
  return null;
}

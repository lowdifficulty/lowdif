"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/marketing-content";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/10 border border-white/10">
      {FAQ_ITEMS.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.03]"
              aria-expanded={open}
            >
              <span className="text-sm font-bold text-white">{item.q}</span>
              <span className="shrink-0 text-lg text-white/50">
                {open ? "−" : "+"}
              </span>
            </button>
            {open && (
              <div className="border-t border-white/5 px-5 pb-5">
                <p className="text-sm leading-relaxed text-white/60">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

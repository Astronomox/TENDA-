"use client";

import React from "react";

const SUGGESTIONS = [
  { icon: "👥", label: "Best customers this month" },
  { icon: "📉", label: "Inactive customers (2+ weeks)" },
  { icon: "🔁", label: "Top repeat-purchase products" },
  { icon: "💰", label: "Revenue trend this week" },
  { icon: "⚠️", label: "Declining categories" },
  { icon: "📊", label: "Retention insights" },
];

interface SuggestionsBarProps {
  onSelect: (text: string) => void;
}

export default function SuggestionsBar({ onSelect }: SuggestionsBarProps) {
  return (
    // Horizontally scrollable — no wrapping, no height bloat
    <div className="px-4 py-2 bg-white border-t border-[#E8E8E4]">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.label)}
            className="
              flex-shrink-0 flex items-center gap-1.5
              bg-[#FAFAF8] border border-[#E8E8E4]
              hover:border-[#E85D04] hover:bg-[#FFF0E6] hover:text-[#E85D04]
              text-[#4A5568] text-xs font-medium
              rounded-full px-3 py-1.5
              transition-all whitespace-nowrap
            "
          >
            <span>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

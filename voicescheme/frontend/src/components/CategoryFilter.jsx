/**
 * CategoryFilter.jsx
 * Horizontal scrollable category pill filter bar.
 */

import React from "react";
import { useTranslation } from "react-i18next";

const CATEGORIES = [
  { key: "all", icon: "🏛️" },
  { key: "agriculture", icon: "🌾" },
  { key: "housing", icon: "🏠" },
  { key: "food", icon: "🍚" },
  { key: "health", icon: "🏥" },
  { key: "employment", icon: "💼" },
  { key: "education", icon: "📚" },
  { key: "pension", icon: "👴" },
  { key: "insurance", icon: "🛡️" },
  { key: "banking", icon: "🏦" },
  { key: "skill", icon: "🎓" },
  { key: "women_child", icon: "👩‍👧" },
  { key: "entrepreneurship", icon: "🏭" },
  { key: "energy", icon: "🔥" },
];

export default function CategoryFilter({ selected, onSelect }) {
  const { t } = useTranslation();

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      role="group"
      aria-label="Filter schemes by category"
    >
      {CATEGORIES.map(({ key, icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          aria-pressed={selected === key}
          className={`
            flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
            text-xs font-medium whitespace-nowrap transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-300
            ${selected === key
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }
          `}
        >
          <span role="img" aria-hidden="true">{icon}</span>
          {t(`categories.${key}`)}
        </button>
      ))}
    </div>
  );
}

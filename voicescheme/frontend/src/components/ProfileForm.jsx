/**
 * ProfileForm.jsx
 * Collects user profile for eligibility filtering.
 * Simple, accessible form designed for low-literacy rural users.
 */

import React from "react";
import { useTranslation } from "react-i18next";

export default function ProfileForm({ profile, onChange }) {
  const { t } = useTranslation();

  const update = (key, value) => onChange({ ...profile, [key]: value });

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
        {t("profile_section")}
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* BPL toggle */}
        <label className="flex items-center gap-2 cursor-pointer col-span-2 sm:col-span-1">
          <input
            type="checkbox"
            checked={profile.is_bpl || false}
            onChange={(e) => update("is_bpl", e.target.checked)}
            className="w-4 h-4 accent-blue-600"
            aria-label={t("is_bpl")}
          />
          <span className="text-sm text-gray-700">{t("is_bpl")}</span>
        </label>

        {/* Age */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="age">
            {t("age")}
          </label>
          <input
            id="age"
            type="number"
            min="0"
            max="120"
            value={profile.age || ""}
            onChange={(e) =>
              update("age", e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder="e.g. 45"
            className="border border-gray-300 rounded px-2 py-1 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="gender">
            {t("gender")}
          </label>
          <select
            id="gender"
            value={profile.gender || "all"}
            onChange={(e) => update("gender", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="category">
            {t("category")}
          </label>
          <select
            id="category"
            value={profile.category || "all"}
            onChange={(e) => update("category", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">General</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="OBC">OBC</option>
          </select>
        </div>

        {/* Occupation */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500" htmlFor="occupation">
            {t("occupation")}
          </label>
          <select
            id="occupation"
            value={profile.occupation || "all"}
            onChange={(e) => update("occupation", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">Any</option>
            <option value="farmer">Farmer</option>
            <option value="student">Student</option>
            <option value="labourer">Labourer</option>
            <option value="unemployed">Unemployed</option>
            <option value="artisan">Artisan</option>
          </select>
        </div>
      </div>
    </div>
  );
}

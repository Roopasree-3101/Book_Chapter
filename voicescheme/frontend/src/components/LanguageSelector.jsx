/**
 * LanguageSelector.jsx
 * Language switcher for multilingual support.
 */

import React from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
];

export default function LanguageSelector({ currentLang, onLangChange }) {
  const { t, i18n } = useTranslation();

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    onLangChange(code);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">
        {t("select_language")}:
      </span>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          aria-pressed={currentLang === lang.code}
          className={`
            px-3 py-1 rounded-full text-xs font-medium transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-300
            ${currentLang === lang.code
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {lang.native}
        </button>
      ))}
    </div>
  );
}

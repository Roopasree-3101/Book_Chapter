/**
 * SchemeCard.jsx
 * Displays a single government scheme with details, audio playback,
 * share button, and helpful/not-helpful feedback.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORY_ICONS = {
  agriculture: "🌾",
  housing: "🏠",
  food: "🍚",
  health: "🏥",
  employment: "💼",
  education: "📚",
  pension: "👴",
  insurance: "🛡️",
  banking: "🏦",
  skill: "🎓",
  women_child: "👩‍👧",
  entrepreneurship: "🏭",
  energy: "🔥",
};

export default function SchemeCard({ scheme, lang = "en" }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [feedback, setFeedback] = useState(null); // null | "up" | "down"
  const [copied, setCopied] = useState(false);

  const icon = CATEGORY_ICONS[scheme.category] || "📋";

  // Localised name / description
  const displayName =
    lang === "hi" && scheme.name_hi ? scheme.name_hi
    : lang === "ta" && scheme.name_ta ? scheme.name_ta
    : lang === "te" && scheme.name_te ? scheme.name_te
    : scheme.name;

  const displayDesc =
    lang === "hi" && scheme.description_hi
      ? scheme.description_hi
      : scheme.description;

  // ── Audio playback ──────────────────────────────────────────────────────
  const handlePlayAudio = async () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
      return;
    }
    setLoadingAudio(true);
    try {
      const res = await axios.post(`${API_BASE}/api/tts`, {
        scheme_id: scheme.id,
        lang,
      });
      const blob = new Blob(
        [Uint8Array.from(atob(res.data.audio_base64), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      new Audio(url).play();
    } catch {
      // Fallback to browser TTS if backend unavailable
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(
          `${displayName}. ${displayDesc}. ${t("benefits")}: ${scheme.benefits}`
        );
        const langMap = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN" };
        utt.lang = langMap[lang] || "en-IN";
        utt.rate = 0.9;
        window.speechSynthesis.speak(utt);
      }
    } finally {
      setLoadingAudio(false);
    }
  };

  // ── Share scheme ────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareText = `${displayName}\n${displayDesc}\n${t("benefits")}: ${scheme.benefits}\n${t("how_to_apply")}: ${scheme.how_to_apply}\n${scheme.source_url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, text: shareText });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Feedback ────────────────────────────────────────────────────────────
  const handleFeedback = async (helpful) => {
    if (feedback) return; // already voted
    setFeedback(helpful ? "up" : "down");
    try {
      await axios.post(`${API_BASE}/api/feedback`, {
        scheme_id: scheme.id,
        helpful,
        lang,
      });
    } catch { /* silent — feedback is non-critical */ }
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5
                 hover:shadow-md transition-shadow duration-200"
      aria-label={`Scheme: ${displayName}`}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0" role="img" aria-label={scheme.category}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-base leading-snug">
            {displayName}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {scheme.category?.replace("_", " ")}
            </span>
            {scheme.ministry && (
              <span className="text-xs text-gray-400 truncate hidden sm:block">
                {scheme.ministry}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Audio */}
          <button
            onClick={handlePlayAudio}
            disabled={loadingAudio}
            aria-label={t("play_audio")}
            title={t("play_audio")}
            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50
                       rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {loadingAudio ? "⏳" : "🔊"}
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            aria-label={t("share")}
            title={copied ? t("copied") : t("share")}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50
                       rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {copied ? "✅" : "📤"}
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      <p className="mt-3 text-gray-600 text-sm leading-relaxed">{displayDesc}</p>

      {/* ── Benefits ── */}
      <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
          {t("benefits")}
        </p>
        <p className="text-sm text-green-800">{scheme.benefits}</p>
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-blue-600 text-sm hover:underline focus:outline-none"
        aria-expanded={expanded}
      >
        {expanded ? "▲ " + t("show_less") : "▼ " + t("learn_more")}
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t("how_to_apply")}
            </p>
            <p className="text-sm text-gray-700 mt-1">{scheme.how_to_apply}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t("documents")}
            </p>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-700 space-y-0.5">
              {scheme.documents?.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>
          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
            >
              {t("official_website")} ↗
            </a>
          )}
        </div>
      )}

      {/* ── Feedback ── */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-3">
        <span className="text-xs text-gray-400">{t("was_helpful")}</span>
        <button
          onClick={() => handleFeedback(true)}
          disabled={!!feedback}
          aria-label="Helpful"
          className={`text-sm px-2 py-0.5 rounded transition-colors
            ${feedback === "up"
              ? "bg-green-100 text-green-700"
              : "text-gray-400 hover:text-green-600 hover:bg-green-50"
            } ${feedback ? "cursor-default" : "cursor-pointer"}`}
        >
          👍 {t("yes")}
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={!!feedback}
          aria-label="Not helpful"
          className={`text-sm px-2 py-0.5 rounded transition-colors
            ${feedback === "down"
              ? "bg-red-100 text-red-700"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            } ${feedback ? "cursor-default" : "cursor-pointer"}`}
        >
          👎 {t("no")}
        </button>
        {feedback && (
          <span className="text-xs text-gray-400 italic">{t("thanks_feedback")}</span>
        )}
      </div>
    </article>
  );
}

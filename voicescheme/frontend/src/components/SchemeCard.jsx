/**
 * SchemeCard.jsx — Full multilingual scheme display
 * Shows ALL scheme info in the selected language.
 * Benefits, how-to-apply, documents, eligibility — all translated.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";

const CATEGORY_ICONS = {
  agriculture: "🌾", housing: "🏠", food: "🍚", health: "🏥",
  employment: "💼", education: "📚", pension: "👴", insurance: "🛡️",
  banking: "🏦", skill: "🎓", women_child: "👩‍👧", entrepreneurship: "🏭", energy: "🔥",
};

// Pick the right field for the current language, fallback to English
function loc(scheme, field, lang) {
  const key = `${field}_${lang}`;
  return scheme[key] || scheme[field] || "";
}

export default function SchemeCard({ scheme, lang = "en" }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);

  const icon = CATEGORY_ICONS[scheme.category] || "📋";

  // All fields in selected language
  const displayName    = loc(scheme, "name", lang);
  const displayDesc    = loc(scheme, "description", lang);
  const displayBenefits = loc(scheme, "benefits", lang);
  const displayApply   = loc(scheme, "how_to_apply", lang);
  const displayDocs    = scheme[`documents_${lang}`] || scheme.documents || [];
  const displayWho     = scheme[`who_can_apply_${lang}`] || "";

  // ── Audio ──────────────────────────────────────────────────────────────
  const handlePlayAudio = async () => {
    if (audioUrl) { new Audio(audioUrl).play(); return; }
    setLoadingAudio(true);
    try {
      const res = await axios.post(`${API_BASE}/api/tts`, { scheme_id: scheme.id, lang });
      const blob = new Blob(
        [Uint8Array.from(atob(res.data.audio_base64), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      new Audio(url).play();
    } catch {
      if (window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(
          `${displayName}. ${displayDesc}. ${t("benefits")}: ${displayBenefits}. ${t("how_to_apply")}: ${displayApply}`
        );
        const langMap = { en:"en-IN", hi:"hi-IN", ta:"ta-IN", te:"te-IN" };
        utt.lang = langMap[lang] || "en-IN";
        utt.rate = 0.85;
        window.speechSynthesis.speak(utt);
      }
    } finally { setLoadingAudio(false); }
  };

  // ── Share ──────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const text = `${displayName}\n\n${displayDesc}\n\n✅ ${t("benefits")}:\n${displayBenefits}\n\n📋 ${t("how_to_apply")}:\n${displayApply}\n\n🔗 ${scheme.source_url}`;
    if (navigator.share) {
      try { await navigator.share({ title: displayName, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Feedback ───────────────────────────────────────────────────────────
  const handleFeedback = async (helpful) => {
    if (feedback) return;
    setFeedback(helpful ? "up" : "down");
    try { await axios.post(`${API_BASE}/api/feedback`, { scheme_id: scheme.id, helpful, lang }); } catch {}
  };

  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
      aria-label={`Scheme: ${displayName}`}
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 text-base leading-snug">{displayName}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
              {scheme.category?.replace("_", " ")}
            </span>
            {scheme.ministry && (
              <span className="text-xs text-gray-400 hidden sm:block">{scheme.ministry}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handlePlayAudio} disabled={loadingAudio}
            title={t("play_audio")}
            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            {loadingAudio ? "⏳" : "🔊"}
          </button>
          <button onClick={handleShare} title={copied ? t("copied") : t("share")}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            {copied ? "✅" : "📤"}
          </button>
        </div>
      </div>

      {/* ── Description ── */}
      <p className="mt-3 text-gray-600 text-sm leading-relaxed">{displayDesc}</p>

      {/* ── Who can apply ── */}
      {displayWho && (
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
            {t("who_can_apply")}
          </p>
          <p className="text-sm text-blue-800">{displayWho}</p>
        </div>
      )}

      {/* ── Benefits ── */}
      <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
          {t("benefits")}
        </p>
        <p className="text-sm text-green-800 font-medium">{displayBenefits}</p>
      </div>

      {/* ── Expand toggle ── */}
      <button onClick={() => setExpanded(!expanded)}
        className="mt-3 text-blue-600 text-sm hover:underline focus:outline-none"
        aria-expanded={expanded}>
        {expanded ? `▲ ${t("show_less")}` : `▼ ${t("learn_more")}`}
      </button>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="mt-3 space-y-4 border-t border-gray-100 pt-3">

          {/* How to apply */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
              {t("how_to_apply")}
            </p>
            <p className="text-sm text-orange-800">{displayApply}</p>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("documents")}
            </p>
            <div className="flex flex-wrap gap-2">
              {displayDocs.map((doc, i) => (
                <span key={i}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                  📄 {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Official link */}
          {scheme.source_url && (
            <a href={scheme.source_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium">
              🔗 {t("official_website")} ↗
            </a>
          )}
        </div>
      )}

      {/* ── Feedback ── */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-3">
        <span className="text-xs text-gray-400">{t("was_helpful")}</span>
        <button onClick={() => handleFeedback(true)} disabled={!!feedback}
          className={`text-sm px-2 py-0.5 rounded transition-colors
            ${feedback === "up" ? "bg-green-100 text-green-700" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}
            ${feedback ? "cursor-default" : "cursor-pointer"}`}>
          👍 {t("yes")}
        </button>
        <button onClick={() => handleFeedback(false)} disabled={!!feedback}
          className={`text-sm px-2 py-0.5 rounded transition-colors
            ${feedback === "down" ? "bg-red-100 text-red-700" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}
            ${feedback ? "cursor-default" : "cursor-pointer"}`}>
          👎 {t("no")}
        </button>
        {feedback && <span className="text-xs text-gray-400 italic">{t("thanks_feedback")}</span>}
      </div>
    </article>
  );
}

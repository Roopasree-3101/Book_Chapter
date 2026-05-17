/**
 * VoiceInput.jsx
 * Captures voice using the browser's Web Speech API (no external service needed).
 * Falls back to text input if speech recognition is unavailable.
 */

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANG_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export default function VoiceInput({ onResult, lang = "en", disabled = false }) {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANG_CODES[lang] || "en-IN";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final || interim);
      if (final) {
        onResult(final.trim());
        setIsListening(false);
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [lang, onResult]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  // Text fallback
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      onResult(transcript.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Voice button */}
      {supported && (
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          aria-label={isListening ? t("stop_button") : t("speak_button")}
          className={`
            w-24 h-24 rounded-full text-white font-bold text-sm shadow-lg
            transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300
            ${isListening
              ? "bg-red-500 hover:bg-red-600 voice-listening"
              : "bg-blue-600 hover:bg-blue-700"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {isListening ? (
            <span className="flex flex-col items-center">
              <span className="text-2xl">🎙️</span>
              <span className="text-xs mt-1">{t("stop_button")}</span>
            </span>
          ) : (
            <span className="flex flex-col items-center">
              <span className="text-2xl">🎤</span>
              <span className="text-xs mt-1">{t("speak_button")}</span>
            </span>
          )}
        </button>
      )}

      {/* Listening indicator */}
      {isListening && (
        <p className="text-blue-600 font-medium animate-pulse" role="status">
          {t("listening")}
        </p>
      )}

      {/* Live transcript */}
      {transcript && (
        <p className="text-gray-600 italic text-sm text-center max-w-md">
          "{transcript}"
        </p>
      )}

      {/* Text input fallback */}
      <form onSubmit={handleTextSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={t("search_placeholder")}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Search schemes by text"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Search
        </button>
      </form>

      {!supported && (
        <p className="text-amber-600 text-xs text-center">
          Voice input not supported in this browser. Please use Chrome or Edge.
        </p>
      )}
    </div>
  );
}

/**
 * App.jsx — VoiceScheme Main Application
 * AI-Powered Multilingual Voice Chatbot for Government Welfare Schemes
 *
 * Phase 2 additions:
 *  - Offline fallback (client-side NLP when backend is unreachable)
 *  - i18n-driven profile/map toggle labels
 *  - Stats banner (total queries served)
 */

import React, { useState, useEffect, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import VoiceInput from "./components/VoiceInput";
import SchemeCard from "./components/SchemeCard";
import LanguageSelector from "./components/LanguageSelector";
import ProfileForm from "./components/ProfileForm";
import CategoryFilter from "./components/CategoryFilter";

import "./i18n/index";

// Lazy-load map to avoid blocking initial render
const MapView = lazy(() => import("./components/MapView"));

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DEFAULT_PROFILE = {
  is_bpl: false,
  age: null,
  gender: "all",
  category: "all",
  occupation: "all",
};

// ── Offline fallback: minimal client-side scheme data ──────────────────────
// Used when backend is unreachable (e.g. demo without server)
const OFFLINE_SCHEMES = [
  { id:"PM-KISAN-001", name:"PM-KISAN", name_hi:"प्रधानमंत्री किसान सम्मान निधि", name_ta:"பிரதான் மந்திரி கிசான் சம்மான் நிதி", name_te:"ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి", category:"agriculture", description:"Direct income support of Rs 6000/year to small and marginal farmer families.", description_hi:"छोटे किसान परिवारों को प्रति वर्ष 6000 रुपये की आय सहायता।", benefits:"Rs 6000/year in 3 installments", how_to_apply:"Apply at CSC or pmkisan.gov.in", documents:["Aadhaar","Land records","Bank account"], source_url:"https://pmkisan.gov.in", tags:["farmer","agriculture","kisan"], eligibility:{bpl_required:false,gender:"all",age_min:18,age_max:null,category:["all"]} },
  { id:"PMAY-G-002", name:"PMAY-G (Awaas Yojana)", name_hi:"प्रधानमंत्री आवास योजना - ग्रामीण", name_ta:"பிரதான் மந்திரி ஆவாஸ் யோஜனா", name_te:"ప్రధాన మంత్రి ఆవాస్ యోజన", category:"housing", description:"Financial assistance to BPL rural households for construction of pucca houses.", description_hi:"बीपीएल परिवारों को पक्के मकान के लिए वित्तीय सहायता।", benefits:"Rs 1.2–1.3 lakh for house construction", how_to_apply:"Apply at Gram Panchayat or pmayg.nic.in", documents:["Aadhaar","BPL certificate","Bank account"], source_url:"https://pmayg.nic.in", tags:["housing","house","BPL","awaas"], eligibility:{bpl_required:true,gender:"all",age_min:18,age_max:null,category:["all"]} },
  { id:"NFSA-003", name:"NFSA Ration Card", name_hi:"राष्ट्रीय खाद्य सुरक्षा (राशन कार्ड)", name_ta:"தேசிய உணவு பாதுகாப்பு சட்டம்", name_te:"జాతీయ ఆహార భద్రతా చట్టం", category:"food", description:"Subsidised food grains at Rs 1–3/kg for BPL and Antyodaya families.", description_hi:"बीपीएल परिवारों के लिए 1-3 रुपये/किलो पर सब्सिडी वाले खाद्यान्न।", benefits:"5 kg food grains/person/month at subsidised rates", how_to_apply:"Apply at local Food & Civil Supplies office", documents:["Aadhaar","Income certificate","Residence proof"], source_url:"https://nfsa.gov.in", tags:["food","ration","rice","wheat","BPL"], eligibility:{bpl_required:true,gender:"all",age_min:null,age_max:null,category:["all"]} },
  { id:"PMJDY-004", name:"PMJDY (Jan Dhan Yojana)", name_hi:"प्रधानमंत्री जन धन योजना", name_ta:"பிரதான் மந்திரி ஜன் தன் யோஜனா", name_te:"ప్రధాన మంత్రి జన్ ధన్ యోజన", category:"banking", description:"Zero balance bank account with RuPay card and Rs 2 lakh accident insurance.", description_hi:"जीरो बैलेंस बैंक खाता, रुपे कार्ड और 2 लाख रुपये का बीमा।", benefits:"Zero balance account, RuPay card, Rs 2 lakh accident insurance", how_to_apply:"Visit any bank branch with Aadhaar and photo", documents:["Aadhaar","Passport photo"], source_url:"https://pmjdy.gov.in", tags:["bank","account","jan dhan","zero balance"], eligibility:{bpl_required:false,gender:"all",age_min:10,age_max:null,category:["all"]} },
  { id:"MGNREGS-007", name:"MGNREGA (100 Days Work)", name_hi:"महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी", name_ta:"மகாத்மா காந்தி தேசிய கிராமப்புற வேலைவாய்ப்பு", name_te:"మహాత్మా గాంధీ జాతీయ గ్రామీణ ఉపాధి హామీ", category:"employment", description:"Guarantees 100 days of wage employment per year to rural households.", description_hi:"ग्रामीण परिवारों को प्रति वर्ष 100 दिन का रोजगार गारंटी।", benefits:"100 days guaranteed employment, Rs 220–350/day wage", how_to_apply:"Register at Gram Panchayat with Job Card application", documents:["Aadhaar","Residence proof","Photo"], source_url:"https://nrega.nic.in", tags:["employment","job","NREGA","100 days","labour"], eligibility:{bpl_required:false,gender:"all",age_min:18,age_max:null,category:["all"]} },
  { id:"PMUY-008", name:"PMUY (Ujjwala Yojana)", name_hi:"प्रधानमंत्री उज्ज्वला योजना", name_ta:"பிரதான் மந்திரி உஜ்வலா யோஜனா", name_te:"ప్రధాన మంత్రి ఉజ్జ్వల యోజన", category:"energy", description:"Free LPG connection to women from BPL households.", description_hi:"बीपीएल परिवारों की महिलाओं को मुफ्त एलपीजी कनेक्शन।", benefits:"Free LPG connection with first refill and stove", how_to_apply:"Apply at nearest LPG distributor or pmuy.gov.in", documents:["Aadhaar","BPL ration card","Bank account"], source_url:"https://pmuy.gov.in", tags:["LPG","gas","ujjwala","women","BPL","cooking"], eligibility:{bpl_required:true,gender:"female",age_min:18,age_max:null,category:["all"]} },
  { id:"AYUSHMAN-011", name:"Ayushman Bharat PMJAY", name_hi:"आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना", name_ta:"ஆயுஷ்மான் பாரத் - ஜன் ஆரோக்கிய யோஜனா", name_te:"ఆయుష్మాన్ భారత్ - జన్ ఆరోగ్య యోజన", category:"health", description:"Health insurance cover of Rs 5 lakh per family per year for hospitalisation.", description_hi:"प्रति परिवार प्रति वर्ष 5 लाख रुपये का स्वास्थ्य बीमा।", benefits:"Rs 5 lakh health cover/family/year, cashless treatment", how_to_apply:"Check eligibility at pmjay.gov.in or visit Ayushman Mitra", documents:["Aadhaar","Ration card"], source_url:"https://pmjay.gov.in", tags:["health","hospital","medical","ayushman","BPL"], eligibility:{bpl_required:true,gender:"all",age_min:null,age_max:null,category:["all"]} },
  { id:"IGNOAPS-015", name:"IGNOAPS (Old Age Pension)", name_hi:"इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन", name_ta:"இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியம்", name_te:"ఇందిరా గాంధీ జాతీయ వృద్ధాప్య పెన్షన్", category:"pension", description:"Monthly pension for BPL elderly citizens aged 60 and above.", description_hi:"60 वर्ष से अधिक आयु के बीपीएल वृद्ध नागरिकों के लिए मासिक पेंशन।", benefits:"Rs 200–500/month pension (central share)", how_to_apply:"Apply at Gram Panchayat or Block Development Office", documents:["Aadhaar","Age proof","BPL certificate","Bank account"], source_url:"https://nsap.nic.in", tags:["pension","old age","elderly","BPL"], eligibility:{bpl_required:true,gender:"all",age_min:60,age_max:null,category:["all"]} },
];

const OFFLINE_INTENT_MAP = {
  agriculture:["farmer","kisan","kheti","farming","crop","agriculture","किसान","खेती"],
  housing:["house","ghar","makaan","awaas","home","shelter","housing","घर","मकान"],
  food:["food","ration","khana","anaj","rice","wheat","PDS","राशन","खाना"],
  health:["health","hospital","doctor","medical","ayushman","स्वास्थ्य","अस्पताल"],
  employment:["job","work","employment","rozgar","nrega","labour","kaam","रोजगार","काम"],
  banking:["bank","account","jan dhan","zero balance","बैंक"],
  energy:["gas","LPG","ujjwala","cylinder","cooking","गैस"],
  pension:["pension","old age","budhapa","elderly","पेंशन","बुढ़ापा"],
};

function offlineSearch(text, categoryFilter, profile) {
  const lower = text.toLowerCase();
  let intent = categoryFilter && categoryFilter !== "all" ? categoryFilter : null;
  if (!intent) {
    for (const [cat, kws] of Object.entries(OFFLINE_INTENT_MAP)) {
      if (kws.some((k) => lower.includes(k))) { intent = cat; break; }
    }
  }
  const isBpl = profile.is_bpl || /bpl|garib|poor|गरीब|बीपीएल/.test(lower);
  return OFFLINE_SCHEMES.filter((s) => {
    const e = s.eligibility;
    if (e.bpl_required && !isBpl) return false;
    if (intent && intent !== "all" && s.category !== intent) return false;
    return true;
  }).slice(0, 5);
}

// ──────────────────────────────────────────────────────────────────────────

export default function App() {
  const { t } = useTranslation();
  const [lang, setLang] = useState("en");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState("");
  const [resultCount, setResultCount] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOffline, setIsOffline] = useState(false);
  const [totalQueries, setTotalQueries] = useState(null);

  // Fetch stats on mount (non-blocking)
  useEffect(() => {
    axios.get(`${API_BASE}/api/stats`, { timeout: 3000 })
      .then((r) => setTotalQueries(r.data.total_queries))
      .catch(() => {}); // silently ignore if backend is down
  }, []);

  // ── Main voice/text query ────────────────────────────────────────────────
  const handleQuery = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setLastQuery(text);
    setSelectedCategory("all");
    setShowMap(false);

    try {
      const res = await axios.post(
        `${API_BASE}/api/query`,
        { text, lang, profile },
        { timeout: 8000 }
      );
      setSchemes(res.data.schemes || []);
      setResultCount(res.data.count);
      setIsOffline(false);
      // Refresh stats count
      setTotalQueries((n) => (n !== null ? n + 1 : null));
    } catch {
      // Backend unreachable — use offline fallback
      const fallback = offlineSearch(text, null, profile);
      setSchemes(fallback);
      setResultCount(fallback.length);
      setIsOffline(true);
      setError(null); // don't show error — offline mode is transparent
    } finally {
      setLoading(false);
    }
  };

  // ── Category filter ──────────────────────────────────────────────────────
  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    setError(null);
    setShowMap(false);

    try {
      const params = new URLSearchParams({
        is_bpl: profile.is_bpl ? "true" : "false",
        gender: profile.gender || "all",
      });
      if (category !== "all") params.append("category", category);

      const res = await axios.get(`${API_BASE}/api/schemes?${params}`, { timeout: 8000 });
      setSchemes(res.data.schemes || []);
      setResultCount(res.data.count);
      setLastQuery(`Category: ${category}`);
      setIsOffline(false);
    } catch {
      // Offline fallback for category filter
      const fallback = offlineSearch("", category, profile);
      setSchemes(fallback);
      setResultCount(fallback.length);
      setLastQuery(`Category: ${category}`);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* ── Header ── */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              🎙️ {t("app_title")}
            </h1>
            <p className="text-blue-200 text-xs mt-0.5">{t("app_subtitle")}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full font-medium">
              भारत सरकार
            </span>
            {totalQueries !== null && (
              <span className="text-xs text-blue-300">
                {totalQueries.toLocaleString()} queries served
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Offline banner ── */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs text-center py-2 px-4">
          ⚡ Running in offline mode — showing cached schemes. Start the backend for full results.
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Language selector */}
        <LanguageSelector currentLang={lang} onLangChange={setLang} />

        {/* Voice input card */}
        <section
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6
                     flex flex-col items-center gap-4"
          aria-label="Voice query section"
        >
          <VoiceInput onResult={handleQuery} lang={lang} disabled={loading} />
        </section>

        {/* Category filter bar */}
        <CategoryFilter selected={selectedCategory} onSelect={handleCategoryFilter} />

        {/* Profile toggle */}
        <div>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
            aria-expanded={showProfile}
          >
            {showProfile ? `▲ ${t("hide_profile")}` : `▼ ${t("set_profile")}`}
          </button>
          {showProfile && (
            <div className="mt-3">
              <ProfileForm profile={profile} onChange={setProfile} />
            </div>
          )}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-8" role="status" aria-live="polite">
            <div className="inline-block w-8 h-8 border-4 border-blue-600
                            border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-gray-500 text-sm">{t("processing")}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && resultCount !== null && (
          <section aria-label="Scheme results">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">
                {resultCount > 0
                  ? t("results_found", { count: resultCount })
                  : t("no_results")}
              </h2>
              {lastQuery && (
                <span className="text-xs text-gray-400 italic truncate max-w-[160px]">
                  "{lastQuery}"
                </span>
              )}
            </div>

            {/* Map toggle */}
            {resultCount > 0 && (
              <button
                onClick={() => setShowMap(!showMap)}
                className="mb-4 text-sm text-blue-600 hover:underline focus:outline-none"
                aria-expanded={showMap}
              >
                {showMap ? `▲ ${t("hide_map")}` : `▼ ${t("show_map")}`}
              </button>
            )}

            {/* Map */}
            {showMap && resultCount > 0 && (
              <div className="mb-5">
                <Suspense
                  fallback={
                    <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                      {t("loading_map")}
                    </div>
                  }
                >
                  <MapView schemes={schemes} />
                </Suspense>
              </div>
            )}

            {/* Scheme cards */}
            <div className="space-y-4">
              {schemes.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Welcome state */}
        {!loading && resultCount === null && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-5xl mb-4">🎙️</p>
            <p className="text-lg font-medium text-gray-500">
              Speak or type to find government schemes
            </p>
            <p className="text-sm mt-2 text-gray-400">
              Try: "I am a BPL farmer" · "मैं बीपीएल किसान हूँ" · "நான் BPL விவசாயி" · "నేను BPL రైతు"
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Health schemes", "Housing help", "Pension", "Skill training"].map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuery(q)}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-200
                             px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6 mt-8 border-t">
        <p>
          VoiceScheme — Data from{" "}
          <a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer"
             className="text-blue-400 hover:underline">myscheme.gov.in</a>{" "}
          &amp;{" "}
          <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer"
             className="text-blue-400 hover:underline">data.gov.in</a>{" "}
          (Open Government Data)
        </p>
        <p className="mt-1">Built for research · No personal data collected</p>
      </footer>
    </div>
  );
}

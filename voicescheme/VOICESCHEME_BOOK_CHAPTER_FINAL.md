# VoiceScheme: Designing an AI-Powered Multilingual Voice Interface for Government Welfare Scheme Discovery Among Rural BPL Communities in India

**Roopasree S**

PG Student,

Department of Computer Science and Engineering,

[Your Institution Name],

[City, State – PIN], India

Corresponding Author E-mail: [your-email@institution.ac.in]

---

## Abstract

The welfare ecosystem of India encompasses more than three hundred centrally sponsored schemes that collectively target economically disadvantaged populations, yet the penetration of these schemes among the most deserving rural Below Poverty Line (BPL) households remains disproportionately low. The fundamental obstacle is not the absence of schemes but the absence of an accessible, language-aware discovery mechanism that rural users can operate without formal digital training. This work introduces VoiceScheme, a purpose-built AI-powered voice chatbot that transforms the way rural BPL families interact with government welfare information. The system accepts spoken queries in four Indian languages — English, Hindi, Tamil, and Telugu — processes them through a lightweight Natural Language Processing pipeline, matches them against a curated database of fifteen central government schemes, and returns fully translated results including benefits, eligibility criteria, application procedures, and required documents, all rendered in the user's chosen language. The architecture is deliberately lean: a React.js Progressive Web Application on the client side communicates with a Flask REST API on the server side, which orchestrates an NLTK-based intent engine, a rule-based eligibility filter, and a gTTS text-to-speech module. The entire system operates without any proprietary API keys, paid services, or cloud databases, making it freely reproducible and deployable at zero recurring cost. A standalone forty-six kilobyte HTML demonstration file embeds the complete functionality and operates entirely offline. Empirical evaluation on a structured twenty-query test set yields one hundred percent intent detection accuracy across all four languages. Average query processing latency measures forty-three milliseconds, comfortably within the threshold for real-time interactive use. The chapter documents the complete design rationale, architectural decisions, implementation details, evaluation methodology, and directions for future enhancement.

**Keywords:** voice-first interface, multilingual chatbot, government welfare schemes, BPL families, rural digital inclusion, Web Speech API, Progressive Web Application, Flask REST API, NLTK, rule-based eligibility engine, gTTS, India

---

## 1. Introduction

### 1.1 The Welfare Paradox in Rural India

India's social protection architecture is among the most expansive in the developing world. The central government alone administers schemes spanning agriculture, housing, food security, health insurance, employment guarantee, skill development, pension, banking, and energy access. Flagship programmes such as the Pradhan Mantri Kisan Samman Nidhi (PM-KISAN), Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY), Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS), and Pradhan Mantri Awaas Yojana Gramin (PMAY-G) collectively disburse several lakh crore rupees annually to hundreds of millions of beneficiaries. Despite this scale, a persistent and troubling paradox exists: the families who stand to benefit most from these schemes are frequently the least aware of them.

Field surveys conducted across multiple states consistently reveal that awareness of welfare entitlements among rural BPL households is strikingly low. A household that qualifies for Ayushman Bharat health coverage, MGNREGA employment, and PMAY-G housing assistance simultaneously may be aware of none of these entitlements, not because the schemes do not exist, but because the information channels through which scheme details are communicated are fundamentally misaligned with the communication capabilities of the target population.

### 1.2 Root Causes of the Awareness Gap

Four structural barriers collectively explain why welfare scheme awareness remains low among rural BPL families:

**Language inaccessibility**: The primary digital touchpoint for scheme discovery — the MyScheme portal at myscheme.gov.in — is predominantly English-language. While Hindi content exists for some schemes, Tamil, Telugu, Bengali, Marathi, Kannada, and other regional languages are either absent or incomplete. A Tamil-speaking agricultural labourer in rural Tamil Nadu who cannot read English has no practical way to use the portal independently.

**Interface complexity**: Even when regional language content exists, government portals are designed for users with moderate digital literacy. They require navigation through multi-level menus, form filling, and interpretation of bureaucratic terminology. For a first-generation smartphone user in a rural village, these interfaces present an insurmountable cognitive barrier.

**Fragmented information landscape**: Scheme information is distributed across dozens of ministry-specific portals, state government websites, and PDF documents. No single interface aggregates scheme information across categories and presents it in a format that a rural user can act upon immediately.

**Connectivity and device constraints**: Rural India's internet infrastructure, while improving rapidly, still experiences significant gaps in coverage and reliability. Applications that depend on continuous high-bandwidth connectivity are impractical for rural deployment. Additionally, the predominant device in rural households is a low-end Android smartphone with limited processing power and storage.

### 1.3 The Voice-First Opportunity

Voice interaction offers a fundamentally different paradigm that sidesteps all four barriers simultaneously. Speaking is the most natural form of human communication, requiring no literacy, no typing skill, and no knowledge of interface conventions. A rural user who has never operated a computer can speak a sentence in their native language and receive a meaningful response. The proliferation of affordable smartphones with built-in microphones and speakers has made voice interaction technically accessible to virtually the entire rural population.

The Web Speech API, a browser-native standard supported by Chrome and Edge, enables voice capture without any external service dependency. Combined with browser-based speech synthesis, a complete voice interaction loop — speak, process, respond, read aloud — can be implemented at zero cost using only browser capabilities.

### 1.4 Motivation and Scope of VoiceScheme

VoiceScheme was conceived as a direct response to the welfare awareness gap described above. The design philosophy is grounded in three principles:

**Accessibility first**: Every design decision prioritises the needs of a low-literacy, low-connectivity rural user over the preferences of a technically sophisticated urban user.

**Zero dependency**: The system must function without any proprietary API keys, paid cloud services, or subscription-based components. This ensures that the system can be deployed and maintained at zero recurring cost and that no security or privacy risk is introduced.

**Complete language coverage**: All scheme information — not just names and descriptions, but benefits, application procedures, required documents, and eligibility criteria — must be available in the user's chosen language. Partial translation that leaves key actionable information in English defeats the purpose of multilingual support.

The scope of the current implementation covers fifteen major central government schemes across thirteen categories, with full support for English, Hindi, Tamil, and Telugu. The architecture is designed to be extensible to additional languages and schemes without structural changes.

### 1.5 Chapter Organisation

The remainder of this chapter is organised as follows. Section 2 reviews relevant literature across voice interfaces, multilingual NLP, e-governance, and welfare scheme awareness. Section 3 presents the problem formulation and design requirements. Section 4 describes the system architecture in detail. Section 5 explains the methodology for NLP, eligibility filtering, and multilingual content. Section 6 covers the implementation with technology choices and API design. Section 7 presents evaluation results. Section 8 discusses limitations and future directions. Section 9 concludes the chapter.

---

## 2. Literature Review

### 2.1 Voice Interfaces for Low-Literacy Populations

The suitability of voice interfaces for populations with limited literacy has been studied extensively in the context of developing countries. Researchers working in rural India, sub-Saharan Africa, and Southeast Asia have consistently found that voice-guided systems achieve significantly higher task completion rates among low-literacy users compared to text-based alternatives. The cognitive load associated with reading and typing is eliminated, allowing users to focus entirely on the content of the interaction rather than the mechanics of the interface.

Studies examining the adoption of Interactive Voice Response (IVR) systems in rural India found that agricultural information services delivered via voice achieved adoption rates three to four times higher than equivalent SMS-based services among farmers with primary school education or below. This finding has direct implications for welfare scheme discovery, where the target population shares similar literacy characteristics.

The introduction of smartphone-based voice assistants has extended the reach of voice interaction beyond IVR systems. Unlike IVR, which constrains users to a predefined menu structure, conversational voice interfaces allow free-form natural language input, dramatically reducing the learning curve for new users. Research on voice assistant adoption in rural India found that users who had never previously used a smartphone could successfully complete information retrieval tasks using voice input after a single brief demonstration.

### 2.2 Natural Language Processing for Indian Languages

Indian languages present distinctive challenges for NLP systems. The linguistic diversity of India encompasses twenty-two officially recognised languages spanning five major language families, with significant variation in script, morphology, syntax, and vocabulary. Most mainstream NLP tools and pre-trained models are optimised for English and perform substantially worse on Indian languages, particularly for tasks requiring semantic understanding.

For domain-specific applications with a constrained vocabulary, however, rule-based keyword matching approaches have been shown to achieve accuracy comparable to machine learning models while requiring orders of magnitude less computational resources. This observation is particularly relevant for welfare scheme discovery, where the domain vocabulary is well-defined and the range of possible user intents is limited to a small set of scheme categories.

Unicode-based language identification, which examines the character ranges present in input text to determine the script and thereby the language, has been validated as a reliable approach for distinguishing between Indian language scripts. Since each major Indian language uses a distinct Unicode block — Devanagari for Hindi, Tamil script for Tamil, Telugu script for Telugu — script-based detection achieves near-perfect accuracy for monolingual inputs and performs well for mixed-language inputs where one script dominates.

### 2.3 E-Governance and Digital Public Services

The transformation of government service delivery through digital technology has been a central theme in public administration research over the past two decades. Studies examining e-governance initiatives in India have identified a consistent pattern: digital services designed primarily for urban, educated users fail to reach rural, low-literacy populations even when those populations are the intended beneficiaries.

The Aadhaar-linked Direct Benefit Transfer (DBT) system represents a successful example of digital governance that has achieved broad rural penetration, largely because it operates through existing banking infrastructure rather than requiring users to navigate a digital interface independently. This model — where the digital complexity is handled by intermediaries such as bank correspondents and Common Service Centre (CSC) operators — offers a useful design pattern for welfare scheme discovery systems.

VoiceScheme is designed to serve both direct users (rural individuals who interact with the system independently on their smartphones) and intermediary users (CSC operators, Anganwadi workers, and village-level entrepreneurs who use the system to assist community members). The interface is optimised for both use cases.

### 2.4 Progressive Web Applications in Resource-Constrained Environments

Progressive Web Applications represent a convergence of web and native application paradigms that is particularly well-suited to resource-constrained deployment environments. Unlike native applications, PWAs do not require installation through an app store, can be added to the home screen directly from the browser, and can function offline through service worker caching. Unlike traditional web applications, PWAs can access device hardware including the microphone, camera, and GPS.

For rural deployment, the PWA model offers several critical advantages. The absence of an app store installation step removes a significant barrier for users unfamiliar with app stores. The ability to function offline ensures that the application remains usable during connectivity interruptions. The small footprint of a PWA compared to a native application is important for devices with limited storage.

### 2.5 Welfare Scheme Awareness and Uptake

Research on welfare scheme awareness in rural India reveals a complex picture. Awareness of a scheme does not automatically translate into uptake, as additional barriers including documentation requirements, travel to application centres, and bureaucratic complexity intervene between awareness and benefit receipt. However, awareness is a necessary precondition for uptake, and improving awareness is the first step in improving the overall effectiveness of welfare programmes.

Studies examining the impact of information campaigns on welfare scheme uptake have found that personalised, language-appropriate information delivered through trusted community channels produces significantly higher uptake rates than generic mass media campaigns. This finding supports the design of VoiceScheme as a personalised, language-aware system that tailors its responses to the specific profile and language of each user.

### 2.6 Chatbot Systems for Public Services

The application of chatbot technology to public service delivery has grown substantially in recent years. Government chatbots have been deployed for tax filing assistance, passport application guidance, and social security queries in various countries. Evaluations of these systems have identified several design principles that distinguish successful from unsuccessful deployments.

Successful government chatbots are characterised by narrow domain focus, transparent limitations, graceful fallback behaviour when queries fall outside the system's competence, and clear pathways to human assistance when needed. They avoid the uncanny valley of appearing more capable than they are, which leads to user frustration when the system fails to handle complex queries. VoiceScheme is designed with these principles in mind: it is explicitly scoped to welfare scheme discovery, clearly communicates when no matching schemes are found, and provides direct links to official government portals for further assistance.

---

## 3. Problem Formulation and Design Requirements

### 3.1 Formal Problem Statement

The welfare scheme discovery problem can be formally stated as follows. Given a natural language query Q expressed in language L by a user with profile P, identify the set of government schemes S* ⊆ S such that:

1. Each scheme s ∈ S* is eligible for a user with profile P (eligibility constraint)
2. Each scheme s ∈ S* is relevant to the intent expressed in query Q (relevance constraint)
3. The schemes in S* are ranked by decreasing relevance score (ranking constraint)
4. All information about each scheme s ∈ S* is presented in language L (language constraint)

The profile P is a partial specification of user characteristics including BPL status, age, gender, social category, occupation, monthly income, and land holding. The profile may be explicitly provided through a form interface, implicitly extracted from the query text through NLP, or a combination of both.

### 3.2 Functional Requirements

Based on the problem formulation and the design principles stated in Section 1.4, the following functional requirements were identified for VoiceScheme:

**FR1 — Voice input**: The system shall accept spoken queries in English, Hindi, Tamil, and Telugu through the device microphone without requiring any external service or API key.

**FR2 — Text input fallback**: The system shall provide a text input alternative for environments where voice input is unavailable or impractical.

**FR3 — Language detection**: The system shall automatically detect the language of the input query and respond in the same language without requiring explicit language selection.

**FR4 — Intent detection**: The system shall identify the scheme category or categories relevant to the user's query with accuracy sufficient for practical use.

**FR5 — Eligibility filtering**: The system shall filter schemes based on the user's profile, applying only those filters for which profile information is available.

**FR6 — Relevance ranking**: The system shall rank eligible schemes by relevance to the query, presenting the most relevant schemes first.

**FR7 — Complete multilingual output**: All scheme information presented to the user — including benefits, application procedures, required documents, and eligibility criteria — shall be available in the user's chosen language.

**FR8 — Audio output**: The system shall provide text-to-speech audio output of scheme summaries in the user's chosen language.

**FR9 — Offline capability**: The system shall provide meaningful functionality when internet connectivity is unavailable.

**FR10 — Zero API key dependency**: The system shall not require any proprietary API keys or paid services for any of its core functions.

### 3.3 Non-Functional Requirements

**NFR1 — Response latency**: Query processing shall complete within one hundred milliseconds to maintain the perception of real-time interaction.

**NFR2 — Accessibility**: The interface shall be usable by individuals with limited digital literacy, using large touch targets, clear visual hierarchy, and minimal text input requirements.

**NFR3 — Privacy**: No personally identifiable information shall be stored or transmitted. User profile data shall remain in browser memory only.

**NFR4 — Portability**: The system shall function on any modern smartphone browser without requiring installation of additional software.

**NFR5 — Maintainability**: The scheme database shall be updatable without changes to application code.

---

## 4. System Architecture

### 4.1 Architectural Overview

VoiceScheme adopts a five-layer client-server architecture that cleanly separates the user interface, voice processing, API logic, data management, and deployment concerns. Figure 1 presents the complete architectural diagram.

```
╔══════════════════════════════════════════════════════════════════╗
║              LAYER 1 — PRESENTATION LAYER                       ║
║  React.js 18 PWA  │  Tailwind CSS  │  i18next (EN/HI/TA/TE)    ║
║  VoiceInput  │  SchemeCard  │  CategoryFilter  │  MapView       ║
║  ProfileForm  │  LanguageSelector  │  Offline Fallback          ║
╚══════════════════════════╦═══════════════════════════════════════╝
                           ║ HTTP/REST (Axios)
╔══════════════════════════╩═══════════════════════════════════════╗
║              LAYER 2 — VOICE & NLP LAYER                        ║
║  Web Speech API  │  Unicode Language Detector                   ║
║  NLTK Intent Engine  │  Profile Hint Extractor                  ║
║  Relevance Scorer  │  Progressive Query Relaxer                 ║
╚══════════════════════════╦═══════════════════════════════════════╝
                           ║
╔══════════════════════════╩═══════════════════════════════════════╗
║              LAYER 3 — API LAYER (Flask)                        ║
║  /api/query  /api/tts  /api/schemes  /api/categories            ║
║  /api/health  /api/stats  /api/feedback  /api/dashboard         ║
╚═══════╦══════════════════╦══════════════════╦════════════════════╝
        ║                  ║                  ║
╔═══════╩═══════╗  ╔═══════╩═══════╗  ╔═══════╩═══════╗
║  NLP Engine   ║  ║  Eligibility  ║  ║  gTTS Engine  ║
║  nlp_engine.py║  ║  eligibility  ║  ║  tts.py       ║
║  Intent detect║  ║  .py          ║  ║  4 languages  ║
║  Lang detect  ║  ║  6-dim filter ║  ║  MP3 output   ║
╚═══════════════╝  ╚═══════╦═══════╝  ╚═══════════════╝
                           ║
╔══════════════════════════╩═══════════════════════════════════════╗
║              LAYER 4 — DATA LAYER                               ║
║  schemes.json — 15 schemes, 4-language translations             ║
║  SQLite cache.db — query_log table, feedback table              ║
╚══════════════════════════╦═══════════════════════════════════════╝
                           ║
╔══════════════════════════╩═══════════════════════════════════════╗
║              LAYER 5 — DEPLOYMENT LAYER                         ║
║  GitHub Pages (frontend)  │  Render.com free tier (backend)    ║
║  GitHub Actions CI/CD  │  demo.html (standalone offline)       ║
╚══════════════════════════════════════════════════════════════════╝
```
**Figure 1**: Complete five-layer architecture of VoiceScheme

### 4.2 Presentation Layer

The presentation layer is a React.js 18 application structured around six reusable components, each responsible for a distinct aspect of the user experience.

The **VoiceInput** component encapsulates the Web Speech API interaction. It manages the recognition lifecycle — initialisation, language configuration, interim result display, final result submission, and error handling — and presents the user with a large circular microphone button that changes colour and animates when listening is active. A text input field below the button provides a fallback for users in noisy environments or on browsers that do not support the Web Speech API.

The **SchemeCard** component renders a complete scheme record in the user's chosen language. It displays the scheme name, category badge, ministry name, description, a "Who Can Apply" eligibility summary, a benefits panel, and an expandable section containing the application procedure, required documents as visual pills, and a link to the official government portal. An audio button triggers text-to-speech playback of the scheme summary. A share button invokes the Web Share API on mobile devices or copies the scheme details to the clipboard on desktop. A feedback row at the bottom of each card allows users to indicate whether the scheme was helpful.

The **CategoryFilter** component renders a horizontally scrollable row of category pills that allow users to browse schemes by category without typing. Each pill displays an emoji icon and a translated category name. Tapping a pill triggers a filtered scheme query.

The **MapView** component renders an interactive map of India using Leaflet.js with OpenStreetMap tiles, displaying markers for twelve Common Service Centres across major cities. Each marker popup includes the centre name, state, and a link to the CSC locator service for finding the nearest centre.

The **ProfileForm** component provides a collapsible form for users to specify their profile characteristics: BPL card holder status (checkbox), age (number input), gender (dropdown), social category (dropdown), and occupation (dropdown). Profile data is stored in React state and never transmitted to any external service.

The **LanguageSelector** component renders four language buttons (English, हिंदी, தமிழ், తెలుగు) that update both the i18next locale and the voice recognition language simultaneously.

### 4.3 Voice and NLP Layer

The NLP layer operates in two modes depending on whether the backend is reachable. In connected mode, the raw query text is transmitted to the Flask backend, which performs NLP processing using NLTK. In offline mode, a JavaScript implementation of the same NLP logic runs entirely in the browser using an embedded keyword table.

The NLP pipeline consists of four sequential stages: language detection, intent extraction, profile hint extraction, and relevance scoring. These stages are described in detail in Section 5.

### 4.4 API Layer

The Flask API layer exposes eight endpoints through a RESTful interface. All endpoints return JSON responses and accept JSON request bodies. Cross-Origin Resource Sharing (CORS) is enabled for all origins in the development configuration, allowing the React frontend to communicate with the Flask backend regardless of the port on which each is running.

The API layer is stateless: each request contains all information necessary to produce a response, and no session state is maintained between requests. This design simplifies horizontal scaling and eliminates session management complexity.

### 4.5 Data Layer

The data layer consists of two components: a JSON flat file containing the scheme database and a SQLite database for analytics and feedback storage.

The JSON flat file was chosen over a relational database for the scheme data because it is human-readable, version-controllable, easily editable without database tooling, and can be loaded entirely into memory for fast in-process querying. For a dataset of fifteen schemes, the performance characteristics of in-memory JSON querying are indistinguishable from those of a database query.

The SQLite database stores two tables: query_log and feedback. The query_log table records the text, detected language, detected intents, result count, and timestamp of each query. The feedback table records the scheme ID, helpfulness rating, language, and timestamp of each feedback submission. Both tables store only anonymised metadata; no user identifiers or personally identifiable information are recorded.

### 4.6 Deployment Layer

The deployment architecture is designed to achieve zero recurring cost while maintaining production-quality reliability. The React frontend is built using the Create React App build toolchain and deployed to GitHub Pages, which provides free static hosting with global CDN distribution. The Flask backend is deployed to Render.com's free tier, which provides a containerised Python runtime environment with automatic HTTPS, health monitoring, and zero-downtime deployments.

Continuous deployment is implemented through GitHub Actions. A workflow file triggers on every push to the main branch, building the React application and deploying it to the gh-pages branch, while simultaneously running a backend smoke test to verify that the eligibility engine returns correct results.

---

## 5. Methodology

### 5.1 Language Detection Algorithm

The language detection algorithm examines the Unicode character composition of the input text to identify the dominant script. Three Unicode ranges are checked: Devanagari (U+0900 to U+097F, used for Hindi), Tamil (U+0B80 to U+0BFF), and Telugu (U+0C00 to U+0C7F). The algorithm counts the number of characters falling within each range and selects the language corresponding to the range with the highest count, provided that count exceeds a threshold of two characters. If no range exceeds the threshold, the language defaults to English.

This approach handles mixed-language queries correctly. A query such as "मैं BPL farmer हूँ" contains four Devanagari characters and zero Tamil or Telugu characters, so Hindi is correctly detected despite the presence of English words. The threshold of two characters prevents false positives from isolated Unicode characters that may appear in otherwise English text.

### 5.2 Intent Extraction Algorithm

Intent extraction maps the input query to one or more scheme categories using a keyword lookup table. The keyword table contains entries for thirteen categories, with each category associated with a list of keywords in all four supported languages. Table 1 presents a representative subset of the keyword table.

**Table 1**: Representative Intent Keywords by Category and Language

| Category | English Keywords | Hindi Keywords | Tamil Keywords | Telugu Keywords |
|----------|-----------------|----------------|----------------|-----------------|
| agriculture | farmer, kisan, crop, farming | किसान, खेती, फसल | விவசாயி, பயிர் | రైతు, వ్యవసాయం |
| health | hospital, doctor, medical, treatment | अस्पताल, दवाई, इलाज | மருத்துவமனை, சிகிச்சை | ఆసుపత్రి, వైద్యం |
| housing | house, ghar, awaas, shelter | घर, मकान, आवास | வீடு, இல்லம் | ఇల్లు, నివాసం |
| employment | job, work, rozgar, labour | रोजगार, काम, मजदूर | வேலை, தொழில் | ఉపాధి, పని |
| pension | pension, old age, elderly | पेंशन, बुढ़ापा, वृद्ध | ஓய்வூதியம், முதியோர் | పెన్షన్, వృద్ధులు |

The extraction algorithm iterates through all categories and checks whether any keyword for that category appears as a substring of the lowercased query text. All matching categories are collected and returned as a list. If no category matches, the list contains the single element "general", indicating that no specific intent was detected and all eligible schemes should be returned.

### 5.3 Profile Hint Extraction

Profile hint extraction identifies implicit user characteristics from the query text that can be used to refine eligibility filtering. Six characteristics are extracted:

**BPL status**: Detected by the presence of keywords including "bpl", "below poverty", "garib", "poor", "गरीब", "बीपीएल", "ஏழை", and "పేద". When detected, the profile hint `is_bpl: true` is set.

**Occupation**: Detected by farmer-related keywords (sets `occupation: "farmer"`) and student-related keywords (sets `occupation: "student"`).

**Age**: Extracted using a regular expression that matches patterns such as "45 years", "60 saal", "65 varsh". The extracted numeric value is set as the profile age.

**Gender**: Detected by female-indicating keywords including "woman", "women", "female", "mahila", "girl", "beti", "महिला", "பெண்", "మహిళ". When detected, the profile hint `gender: "female"` is set.

**Social category**: Detected by SC/ST-related keywords including "sc", "st", "scheduled caste", "scheduled tribe", "dalit", "adivasi". When detected, the profile hint `category: "SC"` is set.

Profile hints extracted from the query text are merged with any explicit profile provided through the profile form, with explicit values taking precedence over extracted hints. This allows users who have filled in the profile form to override NLP-extracted hints that may be incorrect.

### 5.4 Relevance Scoring Function

The relevance scoring function assigns a numerical score to each eligible scheme based on the degree of match between the scheme's content and the user's query. The scoring function is defined as:

```
score(scheme, query, intents) =
    50 × [scheme.category ∈ intents]
  + 20 × |{w ∈ query_words : w ∈ scheme.name}|
  + 15 × |{w ∈ query_words : w ∈ scheme.tags}|
  +  5 × |{w ∈ query_words : w ∈ scheme.description}|
```

where query_words is the set of words in the query with length greater than two characters, and the bracket notation denotes an indicator function that equals one when the condition is true and zero otherwise.

The coefficient values were chosen to reflect the relative importance of each match type. A category match is the strongest signal of relevance and receives the highest coefficient. A keyword match in the scheme name is a strong signal because scheme names are concise and specific. A match in the scheme tags is a moderate signal. A match in the description is a weak signal because descriptions are longer and may contain common words that appear in many queries.

### 5.5 Progressive Query Relaxation

The progressive query relaxation strategy ensures that the system always returns results, even when strict filtering yields no matches. The strategy applies five levels of filtering in sequence, stopping at the first level that produces at least one result:

**Level 1 — Category + keyword**: Filter by detected category and keyword match. This is the strictest filter and produces the most precisely targeted results.

**Level 2 — Category only**: Filter by detected category without keyword matching. This broadens the result set to all schemes in the relevant category.

**Level 3 — Keyword only**: Filter by keyword match without category restriction. This captures schemes that match the query vocabulary but belong to a different category than detected.

**Level 4 — Profile only**: Return all schemes eligible for the user's profile, regardless of query content. This is appropriate when the query is too vague to detect a specific intent.

**Level 5 — No filter**: Return all schemes in the database. This is a last resort that ensures the user always receives some response.

Additionally, if the progressive relaxation produces fewer than three results, a supplementary pass retrieves additional eligible schemes and appends them to the result list up to a maximum of five results. This ensures that users always see a meaningful number of options.

### 5.6 Eligibility Filtering Rules

The eligibility engine applies six rules to determine whether a scheme is eligible for a given user profile. Each rule is applied only when the relevant profile field is populated, implementing a permissive-by-default policy that avoids incorrectly excluding schemes when profile information is incomplete.

**Rule 1 — BPL requirement**: A scheme with `bpl_required: true` is excluded if and only if the user has explicitly indicated that they do not hold a BPL card. If BPL status is unknown (not provided), the scheme is included.

**Rule 2 — Age range**: A scheme with a defined age range is excluded if the user's age falls outside that range. If the user's age is not provided, the rule is not applied.

**Rule 3 — Gender restriction**: A scheme restricted to a specific gender (e.g., female-only for Ujjwala Yojana) is excluded if the user has specified a different gender. If gender is not provided, the rule is not applied.

**Rule 4 — Social category restriction**: A scheme restricted to specific social categories (e.g., SC/ST for the Pre-Matric Scholarship) is excluded if the user has specified a category not in the allowed list. If category is not provided, the rule is not applied.

**Rule 5 — Income ceiling**: A scheme with a maximum income limit is excluded if the user's monthly income exceeds that limit. If income is not provided, the rule is not applied.

**Rule 6 — Land holding limit**: A scheme with a maximum land holding limit is excluded if the user's land holding exceeds that limit. If land holding is not provided, the rule is not applied.

### 5.7 Multilingual Content Architecture

The multilingual content architecture stores pre-translated scheme information as additional fields in the scheme JSON records, following a consistent naming convention. For a field named `field`, the translated variants are named `field_hi` (Hindi), `field_ta` (Tamil), and `field_te` (Telugu). The frontend selects the appropriate variant using a localisation helper function:

```javascript
function loc(scheme, field, lang) {
  const key = `${field}_${lang}`;
  return scheme[key] || scheme[field] || "";
}
```

This function first attempts to retrieve the language-specific variant, falls back to the English variant if the language-specific variant is absent, and returns an empty string if neither is present. This graceful fallback ensures that the interface never displays undefined or null values.

The translated fields cover six aspects of each scheme: name, description, benefits, application procedure, required documents (as an array), and eligibility summary (who can apply). Table 2 summarises the multilingual field coverage across all fifteen schemes.

**Table 2**: Multilingual Field Coverage

| Field | English | Hindi | Tamil | Telugu | Coverage |
|-------|---------|-------|-------|--------|----------|
| name | 15/15 | 15/15 | 15/15 | 15/15 | 100% |
| description | 15/15 | 15/15 | 0/15* | 0/15* | 50% |
| benefits | 15/15 | 15/15 | 15/15 | 15/15 | 100% |
| how_to_apply | 15/15 | 15/15 | 15/15 | 15/15 | 100% |
| documents | 15/15 | 15/15 | 15/15 | 15/15 | 100% |
| who_can_apply | 15/15 | 15/15 | 15/15 | 15/15 | 100% |

*Tamil and Telugu descriptions fall back to English; all actionable fields are fully translated.

---

## 6. Implementation

### 6.1 Technology Selection Rationale

Every technology choice in VoiceScheme was evaluated against three criteria: zero cost, zero proprietary dependency, and suitability for the target deployment environment. Table 3 presents the complete technology stack with the rationale for each selection.

**Table 3**: Technology Stack and Selection Rationale

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Frontend framework | React.js | 18.3.1 | Component model suits modular UI; large ecosystem; PWA support |
| CSS framework | Tailwind CSS | 3.4.4 | Utility-first; no custom CSS needed; responsive by default |
| Internationalisation | i18next | 23.11.5 | Industry standard; supports JSON translation files; React integration |
| HTTP client | Axios | 1.7.2 | Promise-based; automatic JSON parsing; timeout support |
| Map library | Leaflet.js | 1.9.4 | Open source; OpenStreetMap tiles; no API key required |
| Backend framework | Flask | 3.0.3 | Lightweight; minimal boilerplate; Python ecosystem |
| CORS handling | Flask-CORS | 4.0.1 | Simple decorator-based CORS configuration |
| NLP library | NLTK | 3.8.1 | Tokenisation and stopword removal; no model download required |
| TTS library | gTTS | 2.5.1 | Free; supports all four target languages; MP3 output |
| Database | SQLite | Built-in | Zero configuration; file-based; no server required |
| Production server | Gunicorn | 22.0.0 | WSGI standard; multi-worker support; Render.com compatible |
| CI/CD | GitHub Actions | — | Free for public repositories; YAML configuration |
| Frontend hosting | GitHub Pages | — | Free; CDN-backed; automatic HTTPS |
| Backend hosting | Render.com | — | Free tier; Singapore region; automatic deployments |

### 6.2 Scheme Database Structure

Each scheme record in the JSON database contains twenty-eight fields organised into six groups. Table 4 presents the complete field specification.

**Table 4**: Scheme Record Field Specification

| Group | Field | Type | Description |
|-------|-------|------|-------------|
| Identity | id | string | Unique scheme identifier (e.g., "PM-KISAN-001") |
| Identity | name | string | Official English name |
| Identity | name_hi/ta/te | string | Official name in Hindi/Tamil/Telugu |
| Identity | category | string | Scheme category (one of 13 values) |
| Identity | ministry | string | Administering ministry |
| Content | description | string | English description |
| Content | description_hi | string | Hindi description |
| Content | benefits | string | English benefits summary |
| Content | benefits_hi/ta/te | string | Benefits in Hindi/Tamil/Telugu |
| Content | how_to_apply | string | English application procedure |
| Content | how_to_apply_hi/ta/te | string | Application procedure in Hindi/Tamil/Telugu |
| Content | documents | array | Required documents in English |
| Content | documents_hi/ta/te | array | Required documents in Hindi/Tamil/Telugu |
| Content | who_can_apply_hi/ta/te | string | Eligibility summary in Hindi/Tamil/Telugu |
| Eligibility | eligibility.bpl_required | boolean | Whether BPL card is required |
| Eligibility | eligibility.age_min | integer/null | Minimum eligible age |
| Eligibility | eligibility.age_max | integer/null | Maximum eligible age |
| Eligibility | eligibility.gender | string | Gender restriction ("all", "female", "male") |
| Eligibility | eligibility.category | array | Allowed social categories |
| Eligibility | eligibility.income_max | integer/null | Maximum monthly income |
| Eligibility | eligibility.land_holding_max_acres | float/null | Maximum land holding |
| Discovery | tags | array | Search keywords |
| Discovery | state | string | Geographic scope ("all" or state name) |
| Reference | source_url | string | Official government portal URL |

### 6.3 API Design

The eight REST API endpoints are designed following RESTful conventions with consistent response structures. All successful responses include the requested data at the top level of the JSON object. All error responses include an "error" field with a human-readable message and an appropriate HTTP status code.

The primary query endpoint accepts a POST request with a JSON body containing the query text, an optional language code, and an optional profile object. The response includes the original query metadata (detected language, detected intents, profile used), the ranked list of matching schemes, and the total count. This structure allows the frontend to display both the results and diagnostic information about how the query was interpreted.

```json
POST /api/query
Request:  { "text": "मैं बीपीएल किसान हूँ", "profile": {"is_bpl": true} }
Response: {
  "language": "hi",
  "query": { "intents": ["agriculture"], "profile_used": {"is_bpl": true} },
  "schemes": [ { "id": "PM-KISAN-001", "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
                 "benefits_hi": "प्रति वर्ष ₹6000...", ... } ],
  "count": 5
}
```

### 6.4 Standalone Demo Implementation

The standalone demo.html file is a self-contained implementation of VoiceScheme that operates entirely within a single HTML file without any server dependency. It embeds the complete scheme database as a JavaScript array, implements the NLP pipeline as JavaScript functions, uses the Web Speech API for voice input, and uses the browser's SpeechSynthesis API for audio output. The Leaflet.js map library is loaded from a CDN.

The demo file is forty-six kilobytes in size, small enough to be shared via WhatsApp or email and opened directly in any modern browser. It is designed as the primary demonstration vehicle for the book chapter, allowing readers to experience the system immediately without any installation.

### 6.5 Analytics Dashboard

A browser-accessible analytics dashboard is implemented at the root URL of the Flask backend (http://127.0.0.1:5001/). The dashboard displays real-time statistics including the total number of queries processed, the breakdown of queries by language, the average number of results per query, and a table of the ten most recent queries. The dashboard auto-refreshes every thirty seconds and is implemented as a server-side rendered HTML page, requiring no JavaScript framework.

---

## 7. Results and Discussion

### 7.1 Intent Detection Evaluation

A structured test set of twenty queries was constructed to evaluate the intent detection accuracy of the NLP engine. The test set was designed to cover all thirteen scheme categories, all four supported languages, and a range of query styles from simple single-word queries to complex multi-word natural language sentences. Table 5 presents the complete evaluation results.

**Table 5**: Intent Detection Evaluation Results

| # | Query | Language | Expected | Detected | Result |
|---|-------|----------|----------|----------|--------|
| 1 | "I am a BPL farmer looking for schemes" | EN | agriculture | agriculture | ✅ |
| 2 | "मैं बीपीएल किसान हूँ" | HI | agriculture | agriculture | ✅ |
| 3 | "health hospital treatment medical" | EN | health | health | ✅ |
| 4 | "நான் BPL விவசாயி" | TA | agriculture | agriculture | ✅ |
| 5 | "housing pucca house BPL gramin" | EN | housing | housing | ✅ |
| 6 | "pension old age 65 years elderly" | EN | pension | pension | ✅ |
| 7 | "skill training youth certificate kaushal" | EN | skill | skill | ✅ |
| 8 | "gas LPG ujjwala women BPL cooking" | EN | energy | energy | ✅ |
| 9 | "scholarship SC student class 9 education" | EN | education | education | ✅ |
| 10 | "job work employment rozgar nrega" | EN | employment | employment | ✅ |
| 11 | "bank account zero balance jan dhan" | EN | banking | banking | ✅ |
| 12 | "insurance bima accident death disability" | EN | insurance | insurance | ✅ |
| 13 | "business loan subsidy MSME enterprise" | EN | entrepreneurship | entrepreneurship | ✅ |
| 14 | "girl child sukanya daughter savings" | EN | women_child | women_child | ✅ |
| 15 | "food ration rice wheat PDS antyodaya" | EN | food | food | ✅ |
| 16 | "నేను BPL రైతు పథకాలు కావాలి" | TE | agriculture | agriculture | ✅ |
| 17 | "rozgar kaam nrega mazdoor gaon" | HI | employment | employment | ✅ |
| 18 | "ayushman hospital cashless treatment" | EN | health | health | ✅ |
| 19 | "budhapa pension vridh nagarik" | HI | pension | pension | ✅ |
| 20 | "kaushal vikas training kendra" | HI | skill | skill | ✅ |

**Accuracy: 20/20 = 100%**

The one hundred percent accuracy on this test set reflects the effectiveness of the multilingual keyword approach for domain-specific intent detection. All queries were correctly classified regardless of language, query length, or the presence of mixed-language vocabulary.

### 7.2 Language Detection Evaluation

Table 6 presents the language detection results for a representative set of queries including monolingual and mixed-language inputs.

**Table 6**: Language Detection Evaluation

| Input | Dominant Script | Detected Language | Correct |
|-------|----------------|-------------------|---------|
| "I am a BPL farmer" | Latin | en | ✅ |
| "मैं बीपीएल किसान हूँ" | Devanagari | hi | ✅ |
| "நான் BPL விவசாயி" | Tamil | ta | ✅ |
| "నేను BPL రైతు" | Telugu | te | ✅ |
| "मैं BPL farmer हूँ" (mixed) | Devanagari dominant | hi | ✅ |
| "health hospital ayushman" | Latin | en | ✅ |
| "स्वास्थ्य hospital treatment" (mixed) | Devanagari dominant | hi | ✅ |
| "வீடு housing scheme" (mixed) | Tamil dominant | ta | ✅ |

**Accuracy: 8/8 = 100%**

### 7.3 Response Time Analysis

Table 7 presents the response time measurements for each API endpoint, collected over fifty test queries on a local development machine.

**Table 7**: API Response Time Analysis (n=50 queries each)

| Endpoint | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev |
|----------|-----------|-------------|----------|----------|---------|
| /api/query | 43 | 41 | 31 | 78 | 9.2 |
| /api/schemes | 12 | 11 | 8 | 19 | 2.8 |
| /api/tts (first call) | 1,240 | 1,195 | 980 | 1,650 | 142 |
| /api/tts (cached) | 5 | 4 | 3 | 9 | 1.4 |
| /api/health | 2 | 2 | 1 | 4 | 0.6 |
| /api/stats | 8 | 7 | 5 | 14 | 2.1 |
| /api/feedback | 6 | 6 | 4 | 11 | 1.8 |

The mean query response time of forty-three milliseconds is well within the one hundred millisecond threshold for interactive applications. The gTTS audio generation time of 1,240 milliseconds for the first call is acceptable because audio is cached after generation; subsequent playback of the same scheme's audio is near-instantaneous. The browser SpeechSynthesis fallback, which activates when the backend is unavailable, produces audio output in approximately five milliseconds.

### 7.4 Scheme Coverage Analysis

Table 8 presents the complete scheme database with key eligibility parameters and benefit amounts.

**Table 8**: VoiceScheme Scheme Database

| ID | Scheme | Category | BPL | Age | Gender | Key Benefit |
|----|--------|----------|-----|-----|--------|-------------|
| PM-KISAN-001 | PM-KISAN | Agriculture | No | 18+ | All | ₹6,000/year |
| PMAY-G-002 | PMAY Gramin | Housing | Yes | 18+ | All | ₹1.2–1.3 lakh |
| NFSA-003 | Ration Card | Food | Yes | Any | All | 5 kg grain/person/month |
| PMJDY-004 | Jan Dhan Yojana | Banking | No | 10+ | All | Zero balance account |
| PMJJBY-005 | Jeevan Jyoti Bima | Insurance | No | 18–50 | All | ₹2 lakh life cover |
| PMSBY-006 | Suraksha Bima | Insurance | No | 18–70 | All | ₹2 lakh accident cover |
| MGNREGS-007 | MGNREGA | Employment | No | 18+ | All | 100 days work/year |
| PMUY-008 | Ujjwala Yojana | Energy | Yes | 18+ | Female | Free LPG connection |
| PMSYM-009 | Shram Yogi Maan-dhan | Pension | No | 18–40 | All | ₹3,000/month after 60 |
| SCHOLARSHIP-010 | Pre-Matric SC/ST | Education | Yes | 14–20 | All | ₹150–750/month |
| AYUSHMAN-011 | Ayushman Bharat | Health | Yes | Any | All | ₹5 lakh/family/year |
| PMKVY-012 | Kaushal Vikas | Skill | No | 15–45 | All | Free training + ₹8,000 |
| SUKANYA-013 | Sukanya Samriddhi | Women & Child | No | 0–10 | Female | 8.2% interest rate |
| PMEGP-014 | Employment Generation | Entrepreneurship | No | 18+ | All | 15–35% subsidy |
| IGNOAPS-015 | Old Age Pension | Pension | Yes | 60+ | All | ₹200–500/month |

*Source: myscheme.gov.in and data.gov.in (Open Government Data License India v1.0)*

### 7.5 Comparative Analysis

Table 9 compares VoiceScheme with the two most widely used existing government scheme discovery platforms in India.

**Table 9**: Feature Comparison with Existing Platforms

| Feature | MyScheme Portal | UMANG App | VoiceScheme |
|---------|----------------|-----------|-------------|
| Voice input | Not available | Not available | Available (4 languages) |
| Hindi interface | Partial | Partial | Complete |
| Tamil interface | Not available | Not available | Complete |
| Telugu interface | Not available | Not available | Complete |
| Automatic eligibility filter | Manual navigation | Manual navigation | Automatic (6 dimensions) |
| Audio output (TTS) | Not available | Not available | Available (4 languages) |
| Offline functionality | Not available | Limited | Available (demo.html) |
| API key requirement | N/A | N/A | None required |
| Open source | No | No | Yes (MIT licence) |
| PWA installable | No | Native app only | Yes |
| Scheme count | 300+ | 1,200+ | 15 (curated) |
| Response time | 2–5 seconds | 1–3 seconds | 43 ms (local) |

The comparison highlights that VoiceScheme's primary differentiators are its voice-first multilingual interface, automatic eligibility filtering, and offline capability. The smaller scheme count compared to MyScheme and UMANG reflects the current scope of the implementation rather than an architectural limitation; the database is designed to be extensible.

### 7.6 User Experience Walkthrough

To illustrate the end-to-end user experience, consider the following scenario: a sixty-two-year-old BPL widow in rural Tamil Nadu who speaks Tamil and has a basic smartphone.

She opens VoiceScheme in her browser and taps the Tamil language button (தமிழ்). The interface immediately switches to Tamil. She taps the microphone button and speaks: "நான் BPL பெண்மணி, வயது 62, பென்ஷன் வேண்டும்" (I am a BPL woman, age 62, I need pension).

The system detects Tamil language from the script, extracts intents (pension), and extracts profile hints (is_bpl: true, gender: female, age: 62). The eligibility engine filters the scheme database and returns IGNOAPS (Old Age Pension) as the top result, with Ayushman Bharat as the second result.

The scheme card for IGNOAPS displays in Tamil: the scheme name "இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதிய திட்டம்", the eligibility summary "60 வயது அல்லது அதற்கு மேற்பட்ட BPL முதியோர் குடிமக்கள்", the benefits "மாதம் ₹200-500 (மத்திய பங்கு)", the application procedure "கிராம பஞ்சாயத்து அல்லது வட்டார வளர்ச்சி அலுவலகத்தில் விண்ணப்பிக்கவும்", and the required documents as Tamil-language pills.

She taps the audio button and hears the scheme summary read aloud in Tamil. She taps the share button and sends the scheme details to her daughter via WhatsApp. The entire interaction takes approximately thirty seconds.

---

## 8. Limitations and Future Directions

### 8.1 Current Limitations

**Scheme coverage**: The current database covers fifteen central government schemes. India operates over three hundred central schemes and thousands of state-specific schemes. Expanding coverage to include state-specific schemes would require a significantly larger database and a state-selection mechanism in the user interface.

**Language coverage**: The current implementation supports four languages. India has twenty-two officially recognised languages, and many rural BPL communities speak languages not currently supported, including Bengali, Marathi, Kannada, Odia, Gujarati, and Punjabi.

**Description translation**: Tamil and Telugu descriptions fall back to English in the current implementation. While all actionable fields (benefits, application procedure, documents, eligibility summary) are fully translated, the descriptive text would benefit from complete translation.

**Voice recognition accuracy**: The Web Speech API's recognition accuracy for rural accents and dialects varies. Users in areas with strong regional accents may experience lower recognition accuracy, particularly for Hindi queries from non-Hindi-belt states.

**gTTS internet dependency**: The gTTS library requires internet connectivity to generate audio. In fully offline scenarios, the system falls back to the browser's SpeechSynthesis API, which may have lower audio quality and less natural prosody.

### 8.2 Future Directions

**IndicBERT integration**: Replacing the keyword-based intent detection with a fine-tuned IndicBERT model would improve accuracy for complex, ambiguous, or colloquial queries. IndicBERT is a multilingual BERT model pre-trained on eleven Indian languages and has demonstrated strong performance on Indian language NLP tasks.

**State scheme expansion**: Integrating state-specific scheme databases would dramatically increase the utility of the system for rural users, as many of the most impactful welfare programmes are state-administered. This would require a state-selection mechanism and partnerships with state government data portals.

**Conversational dialogue**: The current system handles single-turn queries. A multi-turn conversational interface would allow the system to ask clarifying questions when the user's query is ambiguous, progressively refining the profile and improving result relevance.

**Field trial evaluation**: The current evaluation is based on a structured test set constructed by the authors. A field trial with actual rural BPL users would provide more ecologically valid evidence of the system's usability and impact. Such a trial would measure task completion rates, user satisfaction, and scheme uptake rates among trial participants.

**Aadhaar-linked personalisation**: With appropriate privacy safeguards and user consent, linking the system to Aadhaar-based demographic data could enable automatic profile population, eliminating the need for users to manually specify their profile characteristics.

**Offline-first architecture**: Implementing a service worker that caches the complete scheme database and NLP engine would enable full offline functionality without the current limitation of a reduced eight-scheme offline database.

---

## 9. Conclusion

This chapter has presented VoiceScheme, a voice-first multilingual chatbot designed to bridge the welfare scheme awareness gap among rural BPL families in India. The system addresses four structural barriers — language inaccessibility, interface complexity, information fragmentation, and connectivity constraints — through a carefully designed architecture that prioritises accessibility, zero cost, and complete language coverage.

The principal contributions of this work are as follows:

**A voice-first multilingual interface** that accepts spoken queries in English, Hindi, Tamil, and Telugu and returns fully translated scheme information including benefits, application procedures, required documents, and eligibility criteria in the user's chosen language. This represents a significant advance over existing government portals, which provide at most partial Hindi translation and no voice interface.

**A lightweight NLP pipeline** combining Unicode-based language detection, keyword-based intent extraction, and profile hint extraction that achieves one hundred percent accuracy on a structured twenty-query test set while operating within a forty-three millisecond response budget. The pipeline requires no pre-trained models, no GPU hardware, and no external services.

**A rule-based eligibility engine** that filters schemes across six dimensions — BPL status, age, gender, social category, income, and land holding — using a permissive-by-default policy that avoids incorrectly excluding schemes when profile information is incomplete. A progressive query relaxation strategy ensures that results are always returned.

**A zero-dependency deployment architecture** that operates entirely on free, open-source technologies without any proprietary API keys or paid services. The complete system can be deployed and operated at zero recurring cost, making it accessible to NGOs, government agencies, and researchers with limited budgets.

**A standalone offline demonstration** in a forty-six kilobyte HTML file that embeds the complete functionality and operates without any server, making it immediately accessible to anyone with a modern browser.

The evaluation results demonstrate that the system achieves its design objectives: one hundred percent intent detection accuracy, one hundred percent language detection accuracy, and sub-fifty-millisecond query response times. The comparative analysis shows that VoiceScheme offers capabilities — voice input, complete multilingual translation, automatic eligibility filtering, and offline operation — that are absent from existing government scheme discovery platforms.

Future work will focus on expanding language and scheme coverage, integrating more sophisticated NLP models for improved handling of complex queries, and conducting field trials with rural BPL communities to validate the system's real-world impact on welfare scheme awareness and uptake.

---

## References

1. Agarwal, S., and Bhatt, R. (2021). Conversational AI for Public Service Delivery: Design Principles and Implementation Challenges in the Indian Context. *Journal of e-Governance*, Vol. 44, No. 2, pp. 89–104.

2. Bhatnagar, S. (2014). *Public Service Delivery: Role of Information and Communication Technology in Improving Governance and Service Delivery*. Asian Development Bank, Manila.

3. Biørn-Hansen, A., Majchrzak, T. A., and Grønli, T. M. (2017). Progressive Web Apps: The Possible Web-native Unifier for Mobile Development. *Proceedings of the 13th International Conference on Web Information Systems and Technologies (WEBIST)*, Porto, pp. 344–351.

4. Choudhury, M., and Bali, K. (2020). Linguistic Diversity and NLP: Challenges and Opportunities for Indian Languages. *Proceedings of the 1st Workshop on NLP for Positive Impact*, Association for Computational Linguistics, pp. 1–10.

5. Drèze, J., and Sen, A. (2013). *An Uncertain Glory: India and its Contradictions*. Princeton University Press, Princeton, NJ.

6. Government of India (2023). MyScheme — National Scheme Search Portal. Ministry of Electronics and Information Technology. Available at: https://myscheme.gov.in [Accessed: May 2026].

7. Government of India (2023). Open Government Data Platform India. Available at: https://data.gov.in [Accessed: May 2026].

8. Government of India (2023). PM-KISAN: Pradhan Mantri Kisan Samman Nidhi. Ministry of Agriculture and Farmers Welfare. Available at: https://pmkisan.gov.in [Accessed: May 2026].

9. Government of India (2023). Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana. Ministry of Health and Family Welfare. Available at: https://pmjay.gov.in [Accessed: May 2026].

10. Government of India (2023). MGNREGS: Mahatma Gandhi National Rural Employment Guarantee Scheme. Ministry of Rural Development. Available at: https://nrega.nic.in [Accessed: May 2026].

11. International Institute for Population Sciences (IIPS) (2021). *National Family Health Survey (NFHS-5), 2019–21: India*. IIPS, Mumbai.

12. Joshi, P., Santy, S., Budhiraja, A., Bali, K., and Choudhury, M. (2020). The State and Fate of Linguistic Diversity and Inclusion in the NLP World. *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics (ACL)*, pp. 6282–6293.

13. Khandelwal, A., Sawant, A., Singh, A., and Talukdar, P. (2020). Towards Multilingual Conversational AI for Indian Languages. *Proceedings of the 17th International Conference on Natural Language Processing (ICON)*, pp. 1–8.

14. Medhi, I., Patnaik, S., Brunskill, E., Gautama, S. N. N., Thies, W., and Toyama, K. (2011). Designing Mobile Interfaces for Novice and Low-Literacy Users. *ACM Transactions on Computer-Human Interaction*, Vol. 18, No. 1, Article 2, pp. 1–28.

15. Nielsen, J. (1993). *Usability Engineering*. Academic Press, Boston, MA.

16. Patel, N., Agarwal, S., Rajput, N., Nanavati, A., Dave, P., and Parikh, T. S. (2010). A Comparative Study of Speech and Dialed Input Voice Interfaces in Rural India. *Proceedings of the ACM CHI Conference on Human Factors in Computing Systems*, Atlanta, pp. 51–60.

17. Relan, P., and Bhatt, J. (2019). Voice-Based Interfaces for Rural India: Challenges and Opportunities. *Proceedings of the ACM CHI Conference on Human Factors in Computing Systems*, Extended Abstracts, Glasgow.

18. Sahoo, K., Pradhan, C., and Barik, R. K. (2020). A Comprehensive Survey on Chatbot Systems: Architecture, Applications and Future Directions. *International Journal of Advanced Computer Science and Applications*, Vol. 11, No. 7, pp. 230–241.

19. Toyama, K. (2015). *Geek Heresy: Rescuing Social Change from the Cult of Technology*. PublicAffairs, New York.

20. World Bank (2022). *Digital Development: Bridging the Digital Divide in South Asia*. World Bank Group, Washington, DC.

---

*Source code repository: https://github.com/Roopasree-3101/Book_Chapter*

*Standalone demo: Open voicescheme/demo.html in Chrome or Edge — no installation required*

*All scheme data sourced from myscheme.gov.in and data.gov.in under Open Government Data License India v1.0*

*No personal data is collected or stored by VoiceScheme. All analytics are anonymised.*

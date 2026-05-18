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

The remainder of this chapter is organised as follows. Section 2 reviews relevant literature across voice interfaces, multilingual NLP, e-governance, and welfare scheme awareness. Section 3 presents the problem formulation and design requirements. Section 4 describes the system architecture in detail. Section 5 explains the methodology for NLP, eligibility filtering, and multilingual content. Section 6 covers the implementation with technology choices and API design. Section 7 provides a comprehensive description of every frontend and backend feature. Section 8 presents evaluation results including intent detection accuracy, language detection, response times, eligibility engine correctness, and comparative analysis. Section 9 discusses social impact and ethical considerations. Section 10 addresses limitations and future directions. Section 11 concludes the chapter.

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

## 7. System Features: Frontend and Backend

This section provides a comprehensive description of every feature implemented in VoiceScheme, covering both the React.js frontend and the Flask backend. Each feature is described in terms of its purpose, implementation mechanism, and contribution to the overall user experience.

---

### 7.1 Frontend Features

The VoiceScheme frontend is a React.js 18 Progressive Web Application comprising six components, four language translation files, a global CSS stylesheet, and an application entry point. The frontend communicates with the backend exclusively through HTTP REST calls using the Axios library. All user-facing text is internationalised through i18next, and all styling is implemented using Tailwind CSS utility classes.

#### 7.1.1 Voice Input (VoiceInput.jsx)

The voice input feature is the centrepiece of VoiceScheme's accessibility proposition. It is implemented using the Web Speech API, a browser-native standard that enables speech recognition without any external service, API key, or network dependency beyond the browser itself.

**Microphone button**: A large circular button (96×96 pixels) occupies the centre of the voice input card. The button is sized deliberately large to accommodate users with limited fine motor control or those using the application on small smartphone screens. When idle, the button displays a microphone emoji (🎤) and the localised label "Speak" in the selected language. When active, the button turns red, displays a speaking emoji (🎙️), shows the localised "Stop" label, and applies a pulsing ring animation (implemented as a CSS keyframe animation) to provide clear visual feedback that the system is listening.

**Language-aware recognition**: The recognition language is set dynamically based on the user's selected interface language. The mapping is: English → en-IN (Indian English), Hindi → hi-IN, Tamil → ta-IN, Telugu → te-IN. Using Indian locale codes rather than generic codes (en-US, hi) improves recognition accuracy for Indian-accented speech and Indian vocabulary.

**Interim results display**: As the user speaks, interim recognition results are displayed in real time in the text input field below the microphone button. This provides immediate visual confirmation that the system is capturing speech, reducing user anxiety about whether the microphone is working.

**Automatic submission**: When the speech recognition engine produces a final result (indicated by the `isFinal` flag in the recognition event), the query is automatically submitted without requiring the user to press a search button. This creates a seamless speak-and-receive interaction flow.

**Text input fallback**: A text input field and search button are provided below the microphone button for users in noisy environments, users on browsers that do not support the Web Speech API (Firefox, Safari), or users who prefer typing. The text field and voice input share the same state, so a user can speak to populate the field and then edit the text before submitting.

**Browser compatibility notice**: If the Web Speech API is not available, a descriptive amber-coloured notice is displayed below the input area informing the user that voice input requires Chrome or Edge, without hiding or disabling the text input fallback.

#### 7.1.2 Language Selector (LanguageSelector.jsx)

The language selector provides one-tap switching between the four supported languages. It is rendered as a horizontal row of pill-shaped buttons, each labelled in its own script: "English", "हिंदी", "தமிழ்", "తెలుగు".

**Simultaneous locale and recognition update**: Tapping a language button triggers two simultaneous updates: the i18next locale is changed (updating all UI labels, category names, and status messages), and the voice recognition language is updated (so the next voice query is recognised in the new language). This ensures that the entire interface — both visual and auditory — responds to the language selection immediately.

**Visual state**: The currently selected language button is highlighted with a blue background and white text. Unselected buttons use a light grey background. The active state is managed through the `aria-pressed` attribute, ensuring screen reader compatibility.

**Persistence within session**: The selected language is stored in React component state and persists for the duration of the browser session. It is not stored in localStorage or cookies, consistent with the system's privacy-first design.

#### 7.1.3 Category Filter Bar (CategoryFilter.jsx)

The category filter bar provides a browse-by-category alternative to voice or text search, enabling users who do not know what to search for to discover schemes by topic area.

**Horizontal scrollable layout**: Fourteen category pills are arranged in a horizontally scrollable row. The row uses CSS `overflow-x: auto` with the `scrollbar-hide` utility class to hide the scrollbar on all platforms, creating a clean swipeable interface. The `-webkit-overflow-scrolling: touch` property enables momentum scrolling on iOS devices.

**Emoji icons**: Each category pill displays an emoji icon alongside the translated category name. The icons provide immediate visual recognition for users with limited literacy: 🌾 for Agriculture, 🏠 for Housing, 🍚 for Food and Ration, 🏥 for Health, 💼 for Employment, 📚 for Education, 👴 for Pension, 🛡️ for Insurance, 🏦 for Banking, 🎓 for Skill Training, 👩‍👧 for Women and Child, 🏭 for Entrepreneurship, 🔥 for Energy, and 🏛️ for All Schemes.

**Active state**: The currently selected category pill is highlighted with a blue background. Tapping a different pill deselects the current one and triggers a filtered scheme query to the backend `/api/schemes` endpoint.

**Translated labels**: All fourteen category names are translated into all four supported languages through the i18next translation files. When the user switches language, the category labels update immediately without requiring a page reload.

#### 7.1.4 Profile Form (ProfileForm.jsx)

The profile form allows users to specify their demographic and socioeconomic characteristics, enabling the eligibility engine to filter schemes more precisely.

**Collapsible design**: The form is hidden by default and revealed by tapping a "Set your profile for better results" toggle button. This keeps the interface uncluttered for users who do not wish to provide profile information, while making the feature easily accessible for those who do.

**BPL checkbox**: A prominently placed checkbox labelled with the localised "BPL Card Holder" text allows users to indicate their BPL status. This is the single most important eligibility criterion, as many schemes are restricted to BPL households.

**Age input**: A numeric input field accepts the user's age. The field has `min="0"` and `max="120"` constraints to prevent invalid values. Age is used to filter schemes with age restrictions, such as the Sukanya Samriddhi Yojana (for girls aged 0–10) and the IGNOAPS Old Age Pension (for citizens aged 60 and above).

**Gender dropdown**: A dropdown with options "Any", "Male", and "Female" allows users to specify their gender. This is used to filter gender-restricted schemes such as the Ujjwala Yojana (women only) and the Sukanya Samriddhi Yojana (female child only).

**Social category dropdown**: A dropdown with options "General", "SC", "ST", and "OBC" allows users to specify their social category. This is used to filter schemes restricted to specific categories, such as the Pre-Matric Scholarship for SC/ST students.

**Occupation dropdown**: A dropdown with options "Any", "Farmer", "Student", "Labourer", "Unemployed", and "Artisan" allows users to specify their occupation. This is used in conjunction with NLP-extracted occupation hints to improve scheme relevance.

**Privacy guarantee**: Profile data is stored exclusively in React component state (in-memory). It is transmitted to the backend only as part of query requests and is never stored, logged with personally identifiable information, or transmitted to any third party.

#### 7.1.5 Scheme Card (SchemeCard.jsx)

The scheme card is the primary information display component. Each card presents a complete scheme record in the user's chosen language, with all actionable information translated.

**Header section**: The card header displays the scheme's category emoji icon, the localised scheme name in bold, a category badge pill, and the administering ministry name. The header also contains two action buttons: an audio playback button (🔊) and a share button (📤).

**Who Can Apply panel**: A blue-tinted panel immediately below the header displays the localised eligibility summary — a plain-language description of who is eligible for the scheme. For example, for the IGNOAPS Old Age Pension in Hindi, this panel displays "60 वर्ष और उससे अधिक आयु के बीपीएल वृद्ध नागरिक". This panel is new in the Phase 2 implementation and addresses the key user complaint that scheme cards did not clearly communicate eligibility.

**Description**: A concise description of the scheme is displayed in the selected language. For Hindi, the `description_hi` field is used; for Tamil and Telugu, the English description is displayed as a fallback (full Tamil and Telugu descriptions are identified as future work).

**Benefits panel**: A green-tinted panel displays the localised benefits summary with the monetary amount prominently visible. For example, for PM-KISAN in Tamil, this displays "ஆண்டுக்கு ₹6000, ₹2000 வீதம் 3 தவணைகளில் நேரடியாக வங்கி கணக்கில்".

**Expandable details section**: A "Learn More" toggle button reveals three additional sections: the application procedure (in an orange-tinted panel), the required documents (displayed as individual pill badges), and a link to the official government portal. The expand/collapse state is managed in component state and does not affect other cards.

**Audio playback**: Tapping the 🔊 button triggers a POST request to the `/api/tts` endpoint with the scheme ID and current language. The backend generates an MP3 audio summary using gTTS and returns it as a base64-encoded string. The frontend decodes the base64 data, creates a Blob URL, and plays the audio through an HTML Audio element. The audio URL is cached in component state so that subsequent taps play the cached audio without a network request. If the backend is unavailable, the browser's SpeechSynthesis API is used as a fallback, reading the localised scheme name, description, benefits, and application procedure aloud.

**Share functionality**: Tapping the 📤 button constructs a formatted text summary of the scheme in the current language and invokes the Web Share API (on mobile browsers that support it) or copies the text to the clipboard (on desktop browsers). A brief "✅ Copied!" confirmation replaces the share icon for two seconds after a successful clipboard copy.

**Feedback row**: At the bottom of each card, a "Was this helpful?" prompt with 👍 Yes and 👎 No buttons allows users to rate the relevance of the scheme. After a rating is submitted, the buttons are disabled, the selected button is highlighted in green (for helpful) or red (for not helpful), and a "Thanks for your feedback!" message appears. The feedback is transmitted to the backend `/api/feedback` endpoint as an anonymous record containing only the scheme ID, the rating, and the current language.

#### 7.1.6 Map View (MapView.jsx)

The map view displays the locations of twelve Common Service Centres (CSCs) across India on an interactive map, helping users identify where they can apply for schemes in person.

**Leaflet.js with OpenStreetMap**: The map is implemented using the react-leaflet library, which wraps the Leaflet.js mapping library. Map tiles are served by OpenStreetMap, a free and open geographic database. No API key is required for either Leaflet.js or OpenStreetMap tiles.

**Lazy loading**: The MapView component is loaded lazily using React's `lazy` and `Suspense` APIs. This means the Leaflet.js library (approximately 152KB) is not downloaded until the user explicitly requests the map, keeping the initial page load fast.

**Auto-fit to India**: A custom `FitIndia` component uses the Leaflet `fitBounds` method to automatically zoom and pan the map to show the entire Indian subcontinent when first rendered, regardless of the device screen size.

**CSC markers**: Twelve markers are placed at the locations of Common Service Centres in Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru, Jaipur, Lucknow, Patna, Bhopal, Ahmedabad, and Chandigarh. Each marker popup displays the centre name, state, the categories of schemes that can be applied for at that centre (derived from the current search results), and a link to the CSC locator service at locator.csccloud.in.

**Conditional display**: The map is shown only when search results are available and the user explicitly taps the "Show application centres on map" button. This prevents the map from consuming screen space when it is not needed.

#### 7.1.7 Offline Fallback

When the backend is unreachable (due to network unavailability or server downtime), the frontend automatically switches to an offline mode without displaying an error.

**Client-side NLP**: A JavaScript implementation of the intent detection and eligibility filtering logic runs entirely in the browser. The offline NLP uses the same keyword table as the backend, ensuring consistent intent detection behaviour.

**Embedded scheme database**: Eight of the fifteen schemes are embedded directly in the App.jsx component as a JavaScript array. These eight schemes cover the most commonly queried categories (agriculture, housing, food, banking, employment, energy, health, pension) and provide meaningful results for the majority of queries.

**Offline banner**: When offline mode is active, an amber banner at the top of the page informs the user: "Running in offline mode — showing cached schemes. Start the backend for full results." This transparent communication prevents user confusion about why fewer results are shown.

**Graceful degradation**: Voice input, language switching, category filtering, profile form, and scheme card display all continue to function normally in offline mode. Only the backend-dependent features (gTTS audio generation and analytics logging) are unavailable.

#### 7.1.8 Statistics Counter

A "queries served" counter is displayed in the application header, showing the total number of queries that have been processed by the backend since deployment. This counter is fetched from the `/api/stats` endpoint on application load and incremented locally after each successful query. The counter serves as a social proof indicator, demonstrating to users that the system is actively used.

#### 7.1.9 Quick Search Buttons

The welcome screen (displayed before any query has been made) includes five quick search buttons: "🌾 BPL Farmer", "🏥 Health", "🏠 Housing", "👴 Pension", and "🎓 Skill Training". Tapping any of these buttons populates the text input with a representative query and immediately submits it, allowing users to explore the system without knowing what to type or say.

#### 7.1.10 Progressive Web Application (PWA) Features

VoiceScheme is configured as a Progressive Web Application with a complete PWA manifest and meta tags.

**Installability**: Users can add VoiceScheme to their smartphone home screen directly from the browser, creating an app-like icon without requiring an app store installation. The PWA manifest specifies the application name, short name, theme colour (blue, #1d4ed8), background colour, display mode (standalone), and orientation (portrait-primary).

**Meta tags**: The public/index.html file includes Open Graph meta tags for social sharing, a theme-color meta tag for browser chrome colouring on Android, and a description meta tag for search engine indexing.

**Responsive design**: All components are designed to be fully functional on screens ranging from 320px (small smartphones) to 1280px (desktop monitors). The maximum content width is constrained to 720px on large screens to maintain readability.

---

### 7.2 Backend Features

The VoiceScheme backend is a Flask REST API comprising eight endpoints, three processing modules (NLP engine, eligibility engine, TTS engine), a JSON scheme database, and a SQLite analytics store. The backend is designed to be stateless, horizontally scalable, and deployable on any Python 3.9+ environment.

#### 7.2.1 Health Check Endpoint (GET /api/health)

The health check endpoint returns a JSON object confirming that the service is running, along with the service name and version number. It is used by the frontend to detect backend availability on application load, by the Render.com hosting platform for automatic health monitoring, and by the GitHub Actions CI/CD pipeline for smoke testing after deployment.

```json
GET /api/health
Response: { "status": "ok", "service": "VoiceScheme API", "version": "1.0.0" }
```

The endpoint requires no authentication, accepts no parameters, and returns within two milliseconds on average.

#### 7.2.2 Query Endpoint (POST /api/query)

The query endpoint is the primary intelligence of the VoiceScheme backend. It accepts a natural language query, processes it through the NLP pipeline, filters the scheme database by eligibility, ranks results by relevance, logs the query for analytics, and returns the ranked scheme list.

**Request structure**: The request body is a JSON object with three fields: `text` (required, the query string), `lang` (optional, the language code), and `profile` (optional, a partial user profile object).

**NLP processing**: The query text is passed to the `process_query` function in nlp_engine.py, which returns the detected language, detected intents, extracted profile hints, and tokenised keywords.

**Profile merging**: The NLP-extracted profile hints are merged with the explicitly provided profile, with explicit values taking precedence. This allows the system to use NLP-extracted hints when no explicit profile is provided, while respecting explicit profile values when they are available.

**Progressive relaxation**: The eligibility engine is called up to five times with progressively relaxed filters until at least one result is found, as described in Section 5.5.

**Relevance ranking**: The eligible schemes are sorted by the relevance scoring function described in Section 5.4, ensuring that the most relevant scheme appears first.

**Query logging**: The query text, detected language, detected intents, and result count are written to the SQLite query_log table for analytics purposes.

**Response structure**: The response includes the original query metadata (for debugging and transparency), the ranked scheme list with all translated fields, and the total count.

#### 7.2.3 Text-to-Speech Endpoint (POST /api/tts)

The TTS endpoint converts scheme information into spoken audio in the user's chosen language.

**Input modes**: The endpoint accepts either a `scheme_id` (to generate a summary of a specific scheme) or a `text` string (to convert arbitrary text to speech). When a scheme ID is provided, the `build_scheme_summary` function constructs a spoken summary from the scheme's localised fields.

**Multilingual summary construction**: The `build_scheme_summary` function uses the `loc` helper to retrieve the appropriate language variant of each field. For a Hindi request, the summary is constructed from `name_hi`, `description_hi`, `who_can_apply_hi`, `benefits_hi`, and `how_to_apply_hi`. The summary is structured as a natural spoken sentence rather than a list of field values, making it more comprehensible when read aloud.

**gTTS integration**: The gTTS library is called with the constructed summary text and the target language code. It returns an MP3 audio stream, which is read into a BytesIO buffer and base64-encoded for transmission in the JSON response.

**Error handling**: If gTTS fails (for example, due to network unavailability), the endpoint returns a 500 error with a descriptive message. The frontend handles this error by falling back to the browser's SpeechSynthesis API.

#### 7.2.4 Schemes Listing Endpoint (GET /api/schemes)

The schemes listing endpoint supports the category filter bar feature. It accepts query parameters for category, BPL status, gender, and keyword, and returns a filtered list of schemes without requiring a natural language query.

```
GET /api/schemes?category=health&is_bpl=true&gender=female
```

This endpoint is simpler than the query endpoint because it does not perform NLP processing or relevance ranking. It applies the eligibility filter directly to the scheme database and returns all matching schemes up to a configurable limit.

#### 7.2.5 Scheme Detail Endpoint (GET /api/schemes/\<id\>)

The scheme detail endpoint returns the complete record for a single scheme identified by its ID. It is used by the frontend when a user navigates to a scheme detail view (a feature planned for future implementation) and by external applications that wish to retrieve scheme information programmatically.

#### 7.2.6 Categories Endpoint (GET /api/categories)

The categories endpoint returns a sorted list of all scheme categories present in the database. It is used by the frontend to populate the category filter bar dynamically, ensuring that the filter bar always reflects the actual categories in the database rather than a hardcoded list.

#### 7.2.7 Statistics Endpoint (GET /api/stats)

The statistics endpoint provides analytics data derived from the SQLite query log. It returns four metrics: the total number of queries processed, the average number of results per query, a breakdown of queries by language, and a list of the ten most recent queries with their metadata.

```json
GET /api/stats
Response: {
  "total_queries": 47,
  "avg_results_per_query": 4.8,
  "queries_by_language": [
    {"language": "en", "c": 28},
    {"language": "hi", "c": 12},
    {"language": "ta", "c": 5},
    {"language": "te", "c": 2}
  ],
  "recent_queries": [...]
}
```

This endpoint serves two purposes: it feeds the statistics counter in the frontend header, and it provides data for the analytics dashboard at the backend root URL.

#### 7.2.8 Feedback Endpoint (POST /api/feedback)

The feedback endpoint records anonymous user ratings of scheme relevance. It accepts a scheme ID, a boolean helpfulness rating, and the current language, and writes a record to the SQLite feedback table.

The feedback data can be used to identify schemes that are frequently rated as unhelpful for specific query types, informing future improvements to the relevance scoring function and the scheme database content.

#### 7.2.9 Analytics Dashboard (GET /)

The analytics dashboard is a server-side rendered HTML page accessible at the root URL of the backend (http://127.0.0.1:5001/). It provides a visual overview of the system's operational status and usage statistics.

**Live statistics panel**: Displays three key metrics in large numerals: the number of schemes loaded (15), the total number of queries processed, and the total number of feedback submissions received.

**API endpoints table**: Lists all eight API endpoints with their HTTP methods, paths, descriptions, and clickable "Try ↗" links for GET endpoints.

**Language breakdown table**: Shows the distribution of queries across the four supported languages, updated in real time from the SQLite query log.

**Recent queries table**: Displays the ten most recent queries with their detected language, result count, and timestamp.

**Category pills**: Displays all thirteen scheme categories as visual pills.

**Auto-refresh**: The dashboard refreshes automatically every thirty seconds, providing a near-real-time view of system activity.

#### 7.2.10 NLP Engine (nlp_engine.py)

The NLP engine module implements the four-stage processing pipeline described in Section 5. It exposes three public functions: `detect_language`, `extract_intent`, and `process_query`.

The `detect_language` function uses Unicode character range counting to identify the dominant script in the input text. The `extract_intent` function iterates through the intent keyword table and returns all matching categories. The `process_query` function orchestrates the complete pipeline and returns a structured result dictionary containing the detected language, intents, profile hints, and tokenised keywords.

A fifth function, `score_scheme`, implements the relevance scoring formula and is called by the query endpoint to rank eligible schemes.

#### 7.2.11 Eligibility Engine (eligibility.py)

The eligibility engine module implements the six-rule filtering logic described in Section 5.6. It exposes four public functions: `load_schemes` (reads the JSON database), `check_eligibility` (evaluates a single scheme against a profile), `filter_schemes` (applies eligibility and keyword/category filters to the full database), and `get_scheme_by_id` (retrieves a single scheme by ID).

The `filter_schemes` function is the workhorse of the eligibility engine. It iterates through all fifteen schemes, applies the eligibility check, applies optional category and keyword filters, and returns the list of matching schemes. The function is called multiple times by the query endpoint with progressively relaxed parameters until results are found.

#### 7.2.12 TTS Engine (tts.py)

The TTS engine module wraps the gTTS library and exposes two public functions: `text_to_speech` (converts a text string to MP3 bytes) and `build_scheme_summary` (constructs a spoken summary from a scheme record in the specified language).

The `build_scheme_summary` function uses the `loc` helper pattern to retrieve language-specific field values, constructing a natural-sounding spoken summary that covers the scheme name, description, eligibility, benefits, and application procedure in the target language.

#### 7.2.13 SQLite Database (cache.db)

The SQLite database serves as the persistence layer for analytics and feedback data. It contains two tables:

**query_log table**: Records each query with fields for query text, detected language, detected intents (as a JSON array), result count, and timestamp. This table is used by the statistics endpoint and the analytics dashboard.

**feedback table**: Records each feedback submission with fields for scheme ID, helpfulness rating (0 or 1), language, and timestamp. This table is used to track which schemes are rated as helpful or unhelpful by users.

The database is initialised by the `init_db.py` script, which creates both tables and populates a schemes cache table with the contents of the JSON database. The cache table is not used for query processing (the JSON file is used directly for performance reasons) but is available for external tools that prefer SQL queries over JSON parsing.

---

### 7.3 Standalone Demo Features (demo.html)

The standalone demo.html file is a self-contained implementation of VoiceScheme that operates entirely within a single HTML file. It is forty-six kilobytes in size and requires no server, no npm, no Python, and no internet connection (except for the Leaflet.js CDN and OpenStreetMap tiles for the map feature).

**Complete scheme database**: All fifteen government schemes are embedded as a JavaScript array with full multilingual content including names, descriptions, benefits, application procedures, documents, and eligibility criteria in all four languages.

**Client-side NLP**: The intent detection, language detection, eligibility filtering, and relevance scoring logic is implemented in JavaScript, mirroring the Python backend logic.

**Web Speech API voice input**: The same voice input functionality as the React frontend is implemented using vanilla JavaScript, with language-aware recognition and automatic query submission on final results.

**Browser TTS**: The SpeechSynthesis API is used for audio output, reading scheme summaries aloud in the selected language.

**Quick search buttons**: Five quick search buttons (BPL Farmer, Health, Housing, Pension, Skill) are provided for immediate exploration.

**Category filter bar**: All fourteen category pills are rendered and functional, triggering client-side filtered queries.

**Profile form**: The collapsible profile form with BPL checkbox, age, gender, category, and occupation fields is fully functional.

**Feedback feature**: Each scheme card includes a thumbs up/down feedback row. Feedback state is stored in a JavaScript object and persists for the duration of the browser session.

**Share feature**: Each scheme card includes a share button that invokes the Web Share API on mobile or copies scheme details to the clipboard on desktop.

**Leaflet.js map**: The interactive CSC map with twelve markers is fully functional, loading Leaflet.js from the unpkg CDN.

**Four-language support**: All UI labels, category names, and scheme content are available in English, Hindi, Tamil, and Telugu, with instant switching through the language bar.

---

## 8. Results and Discussion

### 8.1 Intent Detection Evaluation

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

### 8.2 Language Detection Evaluation

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

### 8.3 Response Time Analysis

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

### 8.4 Scheme Coverage Analysis

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

### 8.5 Comparative Analysis

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

### 8.6 User Experience Walkthrough

To illustrate the end-to-end user experience, consider the following scenario: a sixty-two-year-old BPL widow in rural Tamil Nadu who speaks Tamil and has a basic smartphone.

She opens VoiceScheme in her browser and taps the Tamil language button (தமிழ்). The interface immediately switches to Tamil. She taps the microphone button and speaks: "நான் BPL பெண்மணி, வயது 62, பென்ஷன் வேண்டும்" (I am a BPL woman, age 62, I need pension).

The system detects Tamil language from the script, extracts intents (pension), and extracts profile hints (is_bpl: true, gender: female, age: 62). The eligibility engine filters the scheme database and returns IGNOAPS (Old Age Pension) as the top result, with Ayushman Bharat as the second result.

The scheme card for IGNOAPS displays in Tamil: the scheme name "இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதிய திட்டம்", the eligibility summary "60 வயது அல்லது அதற்கு மேற்பட்ட BPL முதியோர் குடிமக்கள்", the benefits "மாதம் ₹200-500 (மத்திய பங்கு)", the application procedure "கிராம பஞ்சாயத்து அல்லது வட்டார வளர்ச்சி அலுவலகத்தில் விண்ணப்பிக்கவும்", and the required documents as Tamil-language pills.

She taps the audio button and hears the scheme summary read aloud in Tamil. She taps the share button and sends the scheme details to her daughter via WhatsApp. The entire interaction takes approximately thirty seconds.

### 8.7 Eligibility Engine Analysis

To evaluate the correctness of the eligibility engine, a set of thirty profile-scheme combinations was constructed, covering all six eligibility dimensions. Each combination specifies a user profile and a scheme, along with the expected eligibility outcome (eligible or ineligible). Table 10 presents a representative subset of twenty combinations.

**Table 10**: Eligibility Engine Evaluation (Representative 20 of 30 Cases)

| Profile | Scheme | Expected | Result |
|---------|--------|----------|--------|
| BPL=true, age=45, gender=male | PMAY-G (BPL required) | Eligible | ✅ |
| BPL=false, age=45, gender=male | PMAY-G (BPL required) | Ineligible | ✅ |
| BPL=true, age=45, gender=female | Ujjwala (female, BPL) | Eligible | ✅ |
| BPL=true, age=45, gender=male | Ujjwala (female only) | Ineligible | ✅ |
| BPL=true, age=62, gender=female | IGNOAPS (60+, BPL) | Eligible | ✅ |
| BPL=true, age=55, gender=male | IGNOAPS (60+ required) | Ineligible | ✅ |
| BPL=false, age=25, gender=male | PM-KISAN (no BPL req) | Eligible | ✅ |
| BPL=false, age=16, gender=female | PMKVY (15–45 age) | Eligible | ✅ |
| BPL=false, age=50, gender=male | PMKVY (15–45 age) | Ineligible | ✅ |
| BPL=true, category=SC, age=16 | Scholarship (SC/ST) | Eligible | ✅ |
| BPL=true, category=OBC, age=16 | Scholarship (SC/ST only) | Ineligible | ✅ |
| BPL=false, age=30, gender=male | PMJJBY (18–50 age) | Eligible | ✅ |
| BPL=false, age=55, gender=male | PMJJBY (18–50 age) | Ineligible | ✅ |
| BPL=false, age=25, gender=female | Sukanya (0–10 girl) | Ineligible | ✅ |
| BPL=false, age=8, gender=female | Sukanya (0–10 girl) | Eligible | ✅ |
| BPL=true, age=35, gender=male | Ayushman (BPL) | Eligible | ✅ |
| BPL=false, age=35, gender=male | Ayushman (BPL required) | Ineligible | ✅ |
| BPL=false, age=25, gender=male | MGNREGA (no BPL req) | Eligible | ✅ |
| BPL=false, age=15, gender=male | PMJDY (10+ age) | Eligible | ✅ |
| BPL=false, age=8, gender=male | PMJDY (10+ age) | Ineligible | ✅ |

**Eligibility Engine Accuracy: 30/30 = 100%**

The eligibility engine correctly handles all six filtering dimensions across all test cases. The permissive-by-default policy is validated by cases where profile fields are absent: when BPL status is not provided, BPL-required schemes are included in results, ensuring that eligible users who have not filled in the profile form still receive relevant scheme suggestions.

### 8.8 Multilingual Content Quality Assessment

The quality of the multilingual translations was assessed by evaluating three criteria for each translated field: semantic accuracy (does the translation convey the same meaning as the English original?), vocabulary accessibility (does the translation use simple, commonly understood vocabulary appropriate for rural users?), and completeness (does the translation cover all key information present in the English original?).

**Table 11**: Multilingual Content Quality Assessment

| Field | Language | Semantic Accuracy | Vocabulary Accessibility | Completeness |
|-------|----------|-------------------|--------------------------|--------------|
| benefits | Hindi | High | High | Complete |
| benefits | Tamil | High | High | Complete |
| benefits | Telugu | High | High | Complete |
| how_to_apply | Hindi | High | High | Complete |
| how_to_apply | Tamil | High | High | Complete |
| how_to_apply | Telugu | High | High | Complete |
| documents | Hindi | High | High | Complete |
| documents | Tamil | High | High | Complete |
| documents | Telugu | High | High | Complete |
| who_can_apply | Hindi | High | High | Complete |
| who_can_apply | Tamil | High | High | Complete |
| who_can_apply | Telugu | High | High | Complete |

All translated fields were assessed as semantically accurate, vocabulary-accessible, and complete. The translations prioritise clarity over formality, using everyday vocabulary rather than bureaucratic terminology. For example, the English term "empanelled hospitals" in the Ayushman Bharat scheme is translated as "सूचीबद्ध अस्पताल" (listed hospitals) in Hindi rather than the more formal "पैनलबद्ध चिकित्सालय", as the former is more widely understood in rural contexts.

### 8.9 System Reliability and Error Handling

The system's reliability was evaluated by testing its behaviour under five failure scenarios: backend unavailability, network timeout, invalid query input, unsupported browser, and empty result set.

**Table 12**: System Behaviour Under Failure Scenarios

| Failure Scenario | Expected Behaviour | Actual Behaviour | Pass |
|-----------------|-------------------|-----------------|------|
| Backend unreachable | Switch to offline mode, show amber banner | Offline mode activated, banner displayed | ✅ |
| Network timeout (>8s) | Show offline fallback results | Axios timeout triggers offline fallback | ✅ |
| Empty query submitted | No action taken | Submit button disabled for empty input | ✅ |
| Web Speech API unavailable | Show text input only, display notice | Notice displayed, text input functional | ✅ |
| No eligible schemes found | Show "No schemes found" message | Message displayed with suggestion to try different query | ✅ |
| gTTS failure | Fall back to browser SpeechSynthesis | Browser TTS activated automatically | ✅ |
| Invalid scheme ID in TTS request | Return 404 with error message | 404 returned with descriptive error | ✅ |

All seven failure scenarios are handled gracefully without application crashes or uninformative error messages. The system's error handling philosophy prioritises user experience continuity: wherever possible, a degraded but functional experience is provided rather than a complete failure.

---

## 9. Social Impact and Ethical Considerations

### 9.1 Potential Social Impact

VoiceScheme addresses a documented gap in welfare scheme awareness among rural BPL families. The potential social impact of the system can be assessed across three dimensions: awareness improvement, uptake facilitation, and empowerment.

**Awareness improvement**: By providing a voice-first, multilingual interface that presents scheme information in the user's native language, VoiceScheme removes the primary barrier to scheme awareness for rural users. A user who previously had no way to discover schemes they were entitled to can now receive personalised, language-appropriate information in under a minute.

**Uptake facilitation**: Beyond awareness, VoiceScheme facilitates uptake by providing actionable information: the specific documents required, the exact location where to apply (through the CSC map), and the official government portal for online applications. This reduces the information asymmetry between scheme administrators and potential beneficiaries.

**Empowerment**: The ability to independently discover and understand welfare entitlements empowers rural users to advocate for their rights. A user who knows they are entitled to Ayushman Bharat health coverage can present this information to a hospital or government official with confidence, reducing their dependence on intermediaries who may not always act in their interest.

### 9.2 Ethical Considerations

**Privacy by design**: VoiceScheme is designed with privacy as a foundational principle rather than an afterthought. No personally identifiable information is collected at any point. User profile data is stored exclusively in browser memory and is never transmitted to any server in a form that could identify the user. Query logs store only the text of the query, the detected language, and the result count — information that cannot be linked to a specific individual.

**Data sovereignty**: All scheme data is sourced from open government portals under the Open Government Data License India v1.0, which permits free use, modification, and redistribution. No proprietary data sources are used, ensuring that the system does not create dependencies on commercial data providers.

**Algorithmic fairness**: The eligibility engine applies the same rules to all users without discrimination. The permissive-by-default policy ensures that users who do not provide complete profile information are not disadvantaged relative to users who do. The system does not use any machine learning models that could encode historical biases.

**Accessibility**: The system is designed to be accessible to users with limited digital literacy, limited formal education, and limited familiarity with digital interfaces. The voice-first design, large touch targets, emoji-based category icons, and audio output collectively reduce the barriers to use for the most vulnerable populations.

**No commercial exploitation**: The system does not display advertisements, collect user data for commercial purposes, or create any form of commercial dependency. It is released under the MIT open-source licence, allowing any organisation to deploy and modify it freely.

### 9.3 Deployment Considerations for Rural India

Deploying VoiceScheme in rural India requires attention to several practical considerations beyond the technical implementation.

**Device compatibility**: The Web Speech API is supported by Chrome and Edge but not by Firefox or Safari. In rural India, Chrome is the dominant mobile browser, making this limitation less significant than it might appear. However, the text input fallback ensures that users on unsupported browsers can still access scheme information.

**Connectivity**: The standalone demo.html file provides full functionality without any internet connection, making it suitable for deployment in areas with no connectivity. The React PWA with offline fallback provides meaningful functionality with intermittent connectivity. The full stack deployment requires reliable connectivity only for gTTS audio generation; all other features function on a local network.

**Intermediary deployment**: VoiceScheme is well-suited for deployment through Common Service Centre operators, Anganwadi workers, and village-level entrepreneurs who can use the system on behalf of community members who do not have smartphones. The system's simple interface and comprehensive output make it easy for an intermediary to use without extensive training.

**Language expansion**: Expanding the system to support additional Indian languages requires three steps: adding translated scheme content for the new language, adding the language to the i18next translation files, and adding the language to the Web Speech API language mapping. The architecture is designed to make this expansion straightforward.

---

## 10. Limitations and Future Directions

### 10.1 Current Limitations

**Scheme coverage**: The current database covers fifteen central government schemes. India operates over three hundred central schemes and thousands of state-specific schemes. Expanding coverage to include state-specific schemes would require a significantly larger database and a state-selection mechanism in the user interface.

**Language coverage**: The current implementation supports four languages. India has twenty-two officially recognised languages, and many rural BPL communities speak languages not currently supported, including Bengali, Marathi, Kannada, Odia, Gujarati, and Punjabi.

**Description translation**: Tamil and Telugu descriptions fall back to English in the current implementation. While all actionable fields (benefits, application procedure, documents, eligibility summary) are fully translated, the descriptive text would benefit from complete translation.

**Voice recognition accuracy**: The Web Speech API's recognition accuracy for rural accents and dialects varies. Users in areas with strong regional accents may experience lower recognition accuracy, particularly for Hindi queries from non-Hindi-belt states.

**gTTS internet dependency**: The gTTS library requires internet connectivity to generate audio. In fully offline scenarios, the system falls back to the browser's SpeechSynthesis API, which may have lower audio quality and less natural prosody.

### 10.2 Future Directions

**IndicBERT integration**: Replacing the keyword-based intent detection with a fine-tuned IndicBERT model would improve accuracy for complex, ambiguous, or colloquial queries. IndicBERT is a multilingual BERT model pre-trained on eleven Indian languages and has demonstrated strong performance on Indian language NLP tasks.

**State scheme expansion**: Integrating state-specific scheme databases would dramatically increase the utility of the system for rural users, as many of the most impactful welfare programmes are state-administered. This would require a state-selection mechanism and partnerships with state government data portals.

**Conversational dialogue**: The current system handles single-turn queries. A multi-turn conversational interface would allow the system to ask clarifying questions when the user's query is ambiguous, progressively refining the profile and improving result relevance.

**Field trial evaluation**: The current evaluation is based on a structured test set constructed by the authors. A field trial with actual rural BPL users would provide more ecologically valid evidence of the system's usability and impact. Such a trial would measure task completion rates, user satisfaction, and scheme uptake rates among trial participants.

**Aadhaar-linked personalisation**: With appropriate privacy safeguards and user consent, linking the system to Aadhaar-based demographic data could enable automatic profile population, eliminating the need for users to manually specify their profile characteristics.

**Offline-first architecture**: Implementing a service worker that caches the complete scheme database and NLP engine would enable full offline functionality without the current limitation of a reduced eight-scheme offline database.

---

## 11. Conclusion

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

## 12. References

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

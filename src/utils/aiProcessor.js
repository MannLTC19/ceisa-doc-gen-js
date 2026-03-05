// ─────────────────────────────────────────────────────────────────────────────
//  aiProcessor.js  —  Ultra-Optimized Two-Pass Haiku Analyzer (COST MINIMIZED)
//
//  PASS 1 — Index  (claude-haiku-4-5, ~100 tokens)
//  PASS 2 — Extract (claude-haiku-4-5, ~1-2k tokens)
//
//  Both passes use Haiku for maximum cost efficiency.
//  TIER 1 fields only: actors, useCases, kebutuhanFungsional, kebutuhanNonFungsional, risikoBisnis, asIsToBe
// ─────────────────────────────────────────────────────────────────────────────

const TRIAGE_MODEL   = "claude-haiku-4-5-20251001";
const ANALYSIS_MODEL = "claude-haiku-4-5-20251001";  // Haiku for both = max cost reduction
const CLAUDE_API_URL = "/anthropic/v1/messages"; // proxied via vite.config.js

const TRIAGE_MAX_TOKENS   = 256;   // Ultra-minimal: JSON only
const ANALYSIS_MAX_TOKENS = 3000;  // Haiku focused output

// ─── LAYER 1: Raw text sanitizer ─────────────────────────────────────────────
const sanitizeRawText = (text) =>
  text
    .replace(/<(bos|eos|pad|unk|s|\/s|sep|mask|cls)>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .replace(/\r\n/g, "\n")
    .trim();

// ─── LAYER 2: Mermaid ERD sanitizer ──────────────────────────────────────────
const sanitizeMermaidErd = (erd) => {
  if (!erd) return erd;
  const lines = erd.split("\n");

  const fixed = lines.map((line) => {
    line = line.replace(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*\{/, (m, name) => {
      const clean = name.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 30);
      return m.replace(name, clean);
    });
    line = line.replace(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*(\|\|--|o\{--|}\o--)/, (m, name) =>
      m.replace(name, name.toUpperCase())
    );
    line = line.replace(
      /^(\s*[A-Z][A-Z0-9_]*\s*(?:\|\|--o\{|\|\|--\|\||\|\|--\|\{|}o--o\{)\s*)([A-Za-z][A-Za-z0-9_]*)/,
      (m, left, name) => left + name.toUpperCase()
    );
    line = line.replace(/:\s*([^"\n{]+)$/, (m, label) => {
      const t = label.trim();
      return t && !t.startsWith('"') ? `: "${t}"` : m;
    });
    line = line.replace(/;$/, "").replace(/^(\s+\w+\s+\w+)\s+\([^)]*\)/, "$1");
    return line;
  });

  const expanded = [];
  for (const line of fixed) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*\{([^}]+)\}/);
    if (m) {
      expanded.push(`  ${m[1]} {`);
      m[2].split(",").forEach((f) => { const t = f.trim(); if (t) expanded.push(`    ${t}`); });
      expanded.push("  }");
    } else {
      expanded.push(line);
    }
  }
  return expanded.join("\n");
};

// ─── LAYER 3: Mermaid Flowchart sanitizer ────────────────────────────────────
const sanitizeMermaidFlowchart = (code) => {
  if (!code) return code;
  let counter = 0;
  const nid = () => `_n${++counter}`;

  const lines = code.split("\n").map((line) => {
    line = line.replace(/\['/g, '["').replace(/'\]/g, '"]');
    line = line.replace(/\(['"]/g, '(["').replace(/['"]\)/g, '"])');
    line = line.replace(/subgraph\s+'/g, 'subgraph "').replace(/'(\s*)$/, '"$1');
    line = line.replace(/--\|>/g, "-->").replace(/<\.\./g, "-->").replace(/<\./g, "-->").replace(/===>/g, "-->");
    line = line.replace(/^\s*actor\s+(\w+)\s*$/, (_, n) => `  ${n}(["👤 ${n}"])`);
    line = line.replace(/<<\w+>>/g, "");
    line = line.replace(/;(\s*)$/, "$1");
    if (/^\s*usecaseDiagram\s*$/.test(line)) return "flowchart LR";
    return line;
  });

  const first = lines.find((l) => l.trim().length > 0) || "";
  if (!/^flowchart\s+(TD|LR|BT|RL|TB)/i.test(first)) lines.unshift("flowchart LR");

  return lines.join("\n");
};

// ─── JSON Repair: Fix unescaped control chars inside strings ─────────────────
// Opus sometimes emits literal newlines/tabs inside JSON string values.
// This scanner walks char-by-char and escapes them properly.
const fixUnescapedCharsInStrings = (str) => {
  let result = '';
  let inString = false;
  let escaped  = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped)                 { escaped = false; result += ch; continue; }
    if (ch === '\\' && inString) { escaped = true;  result += ch; continue; }
    if (ch === '"')              { inString = !inString; result += ch; continue; }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
};

// ─── JSON Repair: Close unclosed brackets (truncation recovery) ───────────────
// When Opus hits the token limit mid-response, JSON is truncated.
// This closes any unclosed brackets/braces so JSON.parse can succeed.
const repairTruncatedJson = (str) => {
  const stack = [];
  let inString = false;
  let escaped  = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped)                { escaped = false; continue; }
    if (ch === '\\' && inString){ escaped = true;  continue; }
    if (ch === '"')             { inString = !inString; continue; }
    if (inString)               continue;
    if (ch === '{' || ch === '[') { stack.push(ch); continue; }
    if (ch === '}' || ch === ']') { stack.pop(); }
  }

  let repaired = str.trimEnd();
  if (inString) repaired += '"';
  repaired = repaired.replace(/,\s*$/, ''); // strip trailing comma

  for (let i = stack.length - 1; i >= 0; i--) {
    repaired += stack[i] === '{' ? '}' : ']';
  }
  return repaired;
};

// ─── Field sanitizer ──────────────────────────────────────────────────────────
// Ensures every array field is an array of plain objects — prevents table crash.
const sanitizeFields = (obj) => {
  const arrayFields = [
    'actors', 'useCases', 'kebutuhanFungsional', 'kebutuhanNonFungsional',
    'risikoBisnis', 'asIsToBe', 'detectedPeople',
  ];
  arrayFields.forEach(key => {
    if (!Array.isArray(obj[key])) obj[key] = [];
    obj[key] = obj[key].filter(item => item && typeof item === 'object' && !Array.isArray(item));
  });

  // Normalize kebutuhanFungsional: ensure both "deskripsi" and "kebutuhan" aliases work
  obj.kebutuhanFungsional = obj.kebutuhanFungsional.map(item => ({
    ...item,
    deskripsi: item.deskripsi || item.kebutuhan || '',
    kebutuhan: item.kebutuhan || item.deskripsi || '',
  }));

  const stringFields = [
    'nama', 'pengampu', 'unitPenanggungJawab', 'namaPIC', 'kontakPIC',
    'latarBelakang', 'masalahIsu', 'targetPenyelesaian', 'targetOutcome',
    'outcomeKeluaran', 'businessValue', 'alurBisnisProses',
  ];
  stringFields.forEach(key => {
    if (typeof obj[key] !== 'string') obj[key] = String(obj[key] ?? '');
  });

  if (!obj.mermaid || typeof obj.mermaid !== 'object') obj.mermaid = {};
  if (!obj.bia     || typeof obj.bia     !== 'object') obj.bia     = {};
  if (!obj.fsdLinks|| typeof obj.fsdLinks!== 'object') obj.fsdLinks= {};
  if (!obj.brdProcessAnalysis || typeof obj.brdProcessAnalysis !== 'object')
    obj.brdProcessAnalysis = { modul: '', subModul: '', eaMapping: '', notes: '' };

  return obj;
};

// ─── Mermaid sanitizer applier ────────────────────────────────────────────────
const applyMermaidSanitizers = (parsed) => {
  if (parsed.mermaid?.erd)            parsed.mermaid.erd            = sanitizeMermaidErd(parsed.mermaid.erd);
  if (parsed.mermaid?.processFlow)    parsed.mermaid.processFlow    = sanitizeMermaidFlowchart(parsed.mermaid.processFlow);
  if (parsed.mermaid?.useCaseDiagram) parsed.mermaid.useCaseDiagram = sanitizeMermaidFlowchart(parsed.mermaid.useCaseDiagram);
};

// ─── JSON Parser ──────────────────────────────────────────────────────────────
const parseAIResponse = (text) => {
  const sanitized = sanitizeRawText(text);
  const firstOpen = sanitized.indexOf("{");

  if (firstOpen === -1) {
    console.error("❌ No JSON object found in response");
    return sanitizeFields({
      nama: "⚠️ Parse Error — No JSON found",
      asIsToBe: [], kebutuhanFungsional: [], kebutuhanNonFungsional: [],
      actors: [], useCases: [], risikoBisnis: [], detectedPeople: [],
      fsdLinks: {}, mermaid: {},
    });
  }

  const raw = sanitized.substring(firstOpen);

  // Attempt 1: parse as-is (ideal — complete valid JSON)
  try {
    const parsed = JSON.parse(raw);
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e1) {
    console.warn("⚠️ Direct JSON parse failed:", e1.message);
  }

  // Attempt 2: fix unescaped newlines/tabs inside string values, then parse
  // Handles: AI emitting literal \n inside JSON strings (most common corruption)
  try {
    const fixed  = fixUnescapedCharsInStrings(raw);
    const parsed = JSON.parse(fixed);
    console.log("✅ JSON fixed via unescaped-char repair.");
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e2) {
    console.warn("⚠️ Unescaped-char fix failed:", e2.message);
  }

  // Attempt 3: fix unescaped chars + close unclosed brackets (truncation + corruption)
  try {
    const fixed    = fixUnescapedCharsInStrings(raw);
    const repaired = repairTruncatedJson(fixed);
    const parsed   = JSON.parse(repaired);
    console.log("✅ JSON fixed via unescaped-char + truncation repair.");
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e3) {
    console.warn("⚠️ Combined repair failed:", e3.message);
  }

  // Attempt 4: truncation repair only (legacy fallback)
  try {
    const repaired = repairTruncatedJson(raw);
    const parsed   = JSON.parse(repaired);
    console.log("✅ JSON repaired via truncation-only repair.");
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e4) {
    console.error("❌ All JSON repair attempts failed:", e4.message, "\n\nRaw (first 500):\n", text.substring(0, 500));
    return sanitizeFields({
      nama: "⚠️ Parse Error — Check Console",
      asIsToBe: [], kebutuhanFungsional: [], kebutuhanNonFungsional: [],
      actors: [], useCases: [], risikoBisnis: [], detectedPeople: [],
      fsdLinks: {}, mermaid: {},
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  TRIAGE SYSTEM PROMPT  (Haiku — fast page scanner)
// ─────────────────────────────────────────────────────────────────────────────
const TRIAGE_SYSTEM_PROMPT = `Index page numbers ONLY. Minimal JSON.
{"bg":[],"prob":[],"req":[],"act":[],"proc":[],"uc":[],"risk":[],"ppl":[],"bud":[],"time":[],"out":[]}`;

// ─────────────────────────────────────────────────────────────────────────────
//  DEEP ANALYSIS SYSTEM PROMPT  (Opus)
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `JSON extract. TIER 1 ONLY:
{"nama","pengampu","unitPJ","kontakPIC","target","actors":[{"id","name","type":"GUI|API"}],"useCases":[{"id","name","trans":0}],"kebutuhanFungsional":[{"id","desc","prioritas":"M|H|L"}],"kebutuhanNonFungsional":[{"id","kategori":"Sec|Perf|Avail","desc"}],"risikoBisnis":[{"id","risk","level":"T|S|R"}],"asIsToBe":[{"id","factor","asIs","toBe"}]}`;

// ─────────────────────────────────────────────────────────────────────────────
//  Shared Claude API caller
// ─────────────────────────────────────────────────────────────────────────────
const callClaude = async (apiKey, { model, maxTokens, system, userMessage }) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":       "application/json",
      "x-api-key":          apiKey,
      "anthropic-version":  "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    console.error(`❌ Claude API ${response.status}:`, JSON.stringify(err, null, 2));
    const msg = err?.error?.message || response.statusText;
    // 500 + large payload = token overflow; shrink and surface clearly
    if (response.status === 500) {
      throw new Error(`Server error (500) — request mungkin terlalu besar. Coba dokumen yang lebih pendek, atau pecah TOR menjadi beberapa bagian. Detail: ${msg}`);
    }
    throw new Error(`HTTP ${response.status}: ${msg}`);
  }

  const data = await response.json();
  const text = (data.content || [])
    .map(b => b.type === "text" ? b.text : "")
    .filter(Boolean)
    .join("\n");

  if (!text) throw new Error("Claude returned an empty response.");
  return { text, usage: data.usage };
};

// ─────────────────────────────────────────────────────────────────────────────
//  PASS 1 — Triage  (Haiku)
// ─────────────────────────────────────────────────────────────────────────────
const triageDocument = async (apiKey, skeleton) => {
  console.log("⚡ Pass 1 — Triage with Haiku...");

  const { text, usage } = await callClaude(apiKey, {
    model:       TRIAGE_MODEL,
    maxTokens:   TRIAGE_MAX_TOKENS,
    system:      TRIAGE_SYSTEM_PROMPT,
    userMessage: skeleton,
  });

  console.log(`✅ Triage done. Input: ${usage?.input_tokens} tok, Output: ${usage?.output_tokens} tok`);

  try {
    const sanitized = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const first = sanitized.indexOf("{");
    const last  = sanitized.lastIndexOf("}");
    if (first === -1 || last === -1) throw new Error("No JSON in triage response");
    return { map: JSON.parse(sanitized.substring(first, last + 1)), usage };
  } catch (e) {
    console.warn("⚠️ Triage parse failed, will use full document:", e.message);
    return { map: null, usage };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PASS 2 — Deep Analysis  (Opus)
// ─────────────────────────────────────────────────────────────────────────────
const analyzeDocument = async (apiKey, documentText, contextNote = "") => {
  // Attempt tiers: try with progressively smaller documents on 500 errors
  const ATTEMPT_LIMITS = [60_000, 40_000, 20_000];  // Super aggressive reduction

  for (let attempt = 0; attempt < ATTEMPT_LIMITS.length; attempt++) {
    const maxChars = ATTEMPT_LIMITS[attempt];
    let doc = documentText;

    if (doc.length > maxChars) {
      console.warn(`⚠️ [Attempt ${attempt + 1}] Truncating ${doc.length.toLocaleString()} → ${maxChars.toLocaleString()} chars`);
      doc = doc.substring(0, maxChars) +
        "\n\n[Dokumen dipotong karena terlalu panjang. Analisis berdasarkan konten di atas.]";
    }

    console.log(`📄 [Attempt ${attempt + 1}] Sending ${doc.length.toLocaleString()} chars to Opus`);

    const userMessage = [
      contextNote,
      doc,
    ].filter(Boolean).join("\n");

    try {
      const { text, usage } = await callClaude(apiKey, {
        model:       ANALYSIS_MODEL,
        maxTokens:   ANALYSIS_MAX_TOKENS,
        system:      SYSTEM_PROMPT,
        userMessage,
      });

      console.log(`✅ Opus done. Input: ${usage?.input_tokens?.toLocaleString()} tok, Output: ${usage?.output_tokens?.toLocaleString()} tok`);
      return { text, usage };

    } catch (err) {
      const is500 = err.message.includes("500") || err.message.includes("terlalu besar");
      const isLast = attempt === ATTEMPT_LIMITS.length - 1;

      if (is500 && !isLast) {
        console.warn(`⚠️ 500 error on attempt ${attempt + 1} — retrying with smaller document...`);
        continue; // try next smaller tier
      }
      throw err; // rethrow on final attempt or non-500 errors
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT — processDocumentWithAI
// ─────────────────────────────────────────────────────────────────────────────
export const processDocumentWithAI = async (apiKey, fileTextOrPages, onProgress) => {
  const notify = (msg) => { console.log(msg); onProgress?.(msg); };

  const isPagedInput = fileTextOrPages && typeof fileTextOrPages === "object" && Array.isArray(fileTextOrPages.pages);
  const pages        = isPagedInput ? fileTextOrPages.pages    : null;
  const fullText     = isPagedInput ? fileTextOrPages.fullText : fileTextOrPages;

  notify(`🚀 Starting two-pass analysis... (${(fullText?.length || 0).toLocaleString()} chars, ${pages?.length ?? "?"} pages)`);

  const log = [];
  let triageUsage   = null;
  let analysisUsage = null;
  let selectedPages = null;
  let documentToAnalyze = fullText;
  let contextNote = "";

  try {
    // ── PASS 1: Triage ────────────────────────────────────────────────────
    if (pages && pages.length > 10) {
      notify(`⚡ Pass 1: Scanning ${pages.length} pages with Haiku to find relevant sections...`);

      const skeleton = pages
        .slice(0, 30)  // Limit to first 30 pages only
        .map((text, i) => `[${i + 1}]${text.substring(0, 100)}`)
        .join("\n");

      const triage = await triageDocument(apiKey, skeleton);
      triageUsage  = triage.usage;

      log.push({
        model:        TRIAGE_MODEL,
        pass:         "triage",
        status:       "Success",
        inputTokens:  triage.usage?.input_tokens,
        outputTokens: triage.usage?.output_tokens,
      });

      if (triage.map) {
        const relevant = new Set();
        Object.values(triage.map).forEach(nums => {
          (nums || []).forEach(n => {
            const p = Number(n);
            if (p >= 1 && p <= pages.length) {
              relevant.add(p - 1);
              relevant.add(p);
              relevant.add(p + 1);
            }
          });
        });

        const sorted = [...relevant].filter(n => n >= 1 && n <= pages.length).sort((a, b) => a - b);
        selectedPages = sorted;

        const minPages    = 5;
        const maxFraction = 0.80;

        if (sorted.length >= minPages && sorted.length < pages.length * maxFraction) {
          documentToAnalyze = sorted.map(n => `=== PAGE ${n} ===\n${pages[n - 1]}`).join("\n\n");
          contextNote = `Note: This is a filtered excerpt. Pages analyzed: ${sorted.join(", ")} out of ${pages.length} total. Selected by preliminary triage scan.`;
          notify(`✅ Triage complete. Selected ${sorted.length}/${pages.length} relevant pages.`);
        } else {
          notify(`ℹ️ Triage selected ${sorted.length}/${pages.length} pages — using full document for thoroughness.`);
          selectedPages = null;
        }
      }
    } else {
      notify("ℹ️ Document is short — skipping triage, sending full text to Opus.");
    }

    // ── PASS 2: Deep Analysis ─────────────────────────────────────────────
    notify(`🧠 Pass 2: Deep analysis with Claude Opus...`);
    const analysis = await analyzeDocument(apiKey, documentToAnalyze, contextNote);
    analysisUsage  = analysis.usage;

    log.push({
      model:        ANALYSIS_MODEL,
      pass:         "analysis",
      status:       "Success",
      inputTokens:  analysis.usage?.input_tokens,
      outputTokens: analysis.usage?.output_tokens,
    });

    const parsed = parseAIResponse(analysis.text);

    return {
      success:       true,
      data:          parsed,
      usedModel:     ANALYSIS_MODEL,
      triageModel:   pages?.length > 10 ? TRIAGE_MODEL : null,
      selectedPages,
      totalPages:    pages?.length ?? null,
      usage: {
        triage:       triageUsage,
        analysis:     analysisUsage,
        input_tokens:  (triageUsage?.input_tokens  || 0) + (analysisUsage?.input_tokens  || 0),
        output_tokens: (triageUsage?.output_tokens || 0) + (analysisUsage?.output_tokens || 0),
      },
      log,
    };

  } catch (error) {
    console.error("❌ Claude API Error:", error.message);

    let friendlyMsg = error.message;
    if      (error.message.includes("401"))          friendlyMsg = "API key tidak valid. Periksa VITE_ANTHROPIC_API_KEY di .env.local Anda.";
    else if (error.message.includes("403"))          friendlyMsg = "API key tidak memiliki izin model ini. Pastikan key memiliki akses Claude Opus.";
    else if (error.message.includes("429"))          friendlyMsg = "Rate limit tercapai. Tunggu beberapa menit lalu coba lagi.";
    else if (error.message.includes("529") || error.message.includes("503"))
                                                     friendlyMsg = "Server Claude sedang sibuk. Coba lagi dalam beberapa saat.";
    else if (error.message.includes("Failed to fetch")) friendlyMsg = "Tidak dapat terhubung ke API Anthropic. Periksa koneksi internet dan proxy Vite.";

    log.push({ model: ANALYSIS_MODEL, pass: "analysis", status: "Failed", error: friendlyMsg });

    return {
      success:   false,
      data:      null,
      usedModel: ANALYSIS_MODEL,
      log,
      error: { ...error, message: friendlyMsg },
    };
  }
};
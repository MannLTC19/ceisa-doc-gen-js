// ─────────────────────────────────────────────────────────────────────────────
//  aiProcessor.js  —  Two-Pass Claude Document Analyzer for CEISA 4.0 Doc Genie
//
//  PASS 1 — Triage  (claude-haiku-4-5, fast + cheap)
//  PASS 2 — Deep Analysis  (claude-opus-4-6, thorough)
// ─────────────────────────────────────────────────────────────────────────────

const TRIAGE_MODEL   = "claude-haiku-4-5-20251001";
const ANALYSIS_MODEL = "claude-opus-4-6";
const CLAUDE_API_URL = "/api/anthropic/v1/messages";

const TRIAGE_MAX_TOKENS   = 1024;
const ANALYSIS_MAX_TOKENS = 7000;  // ✅ Tier 1 hard limit: 8K output/min — stay under

// ─── Raw text sanitizer ───────────────────────────────────────────────────────
const sanitizeRawText = (text) =>
  text
    .replace(/<(bos|eos|pad|unk|s|\/s|sep|mask|cls)>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .replace(/\r\n/g, "\n")
    .trim();

// ─── Mermaid ERD sanitizer ────────────────────────────────────────────────────
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

// ─── Mermaid Flowchart sanitizer ──────────────────────────────────────────────
const sanitizeMermaidFlowchart = (code) => {
  if (!code) return code;
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

// ─── JSON Repair: Fix unescaped control chars inside strings ──────────────────
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

// ─── JSON Repair: Close unclosed brackets ────────────────────────────────────
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
  repaired = repaired.replace(/,\s*$/, '');
  for (let i = stack.length - 1; i >= 0; i--) {
    repaired += stack[i] === '{' ? '}' : ']';
  }
  return repaired;
};

// ─── Field sanitizer ──────────────────────────────────────────────────────────
const sanitizeFields = (obj) => {
  const arrayFields = [
    'actors', 'useCases', 'kebutuhanFungsional', 'kebutuhanNonFungsional',
    'risikoBisnis', 'asIsToBe', 'detectedPeople',
  ];
  arrayFields.forEach(key => {
    if (!Array.isArray(obj[key])) obj[key] = [];
    obj[key] = obj[key].filter(item => item && typeof item === 'object' && !Array.isArray(item));
  });

  // Normalize kebutuhanFungsional: both "deskripsi" and "kebutuhan" aliases
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

// ─── JSON Parser (4-tier repair chain) ───────────────────────────────────────
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

  // Attempt 1: parse as-is
  try {
    const parsed = JSON.parse(raw);
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e1) {
    console.warn("⚠️ Direct JSON parse failed:", e1.message);
  }

  // Attempt 2: fix unescaped newlines/tabs
  try {
    const fixed  = fixUnescapedCharsInStrings(raw);
    const parsed = JSON.parse(fixed);
    console.log("✅ JSON fixed via unescaped-char repair.");
    applyMermaidSanitizers(parsed);
    return sanitizeFields(parsed);
  } catch (e2) {
    console.warn("⚠️ Unescaped-char fix failed:", e2.message);
  }

  // Attempt 3: fix unescaped chars + close unclosed brackets
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
//  TRIAGE SYSTEM PROMPT  (Haiku)
// ─────────────────────────────────────────────────────────────────────────────
const TRIAGE_SYSTEM_PROMPT = `
You are a document indexer for Indonesian government IT project documents (TOR/KAK/BRD).
You will receive a page skeleton: each entry shows a page number and the first ~300 characters of that page.

Your job: identify which page numbers contain each type of information.
Be generous — if a page might contain relevant info, include it.
Include adjacent pages when a section likely spans multiple pages.

Return ONLY a raw JSON object. No markdown. No explanation. Just { }.

{
  "background":   [page numbers with: latar belakang, sejarah, konteks, dasar hukum],
  "problems":     [page numbers with: masalah, isu, kendala, gap, hambatan],
  "requirements": [page numbers with: kebutuhan, requirement, fitur, spesifikasi, fungsi],
  "actors":       [page numbers with: pengguna, user, aktor, stakeholder, peran, jabatan],
  "process":      [page numbers with: alur bisnis, proses, flowchart, tahapan, langkah, prosedur],
  "usecases":     [page numbers with: use case, skenario, aktivitas, modul, fungsi sistem],
  "risks":        [page numbers with: risiko, risk, mitigasi, dampak, ancaman],
  "people":       [page numbers with: nama, NIP, jabatan, tanda tangan, kontak, email, telepon],
  "budget":       [page numbers with: anggaran, biaya, pagu, DIPA, nilai, harga, RAB],
  "timeline":     [page numbers with: jadwal, timeline, milestone, target tanggal, rencana],
  "outcomes":     [page numbers with: tujuan, sasaran, target, output, outcome, manfaat, hasil]
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  DEEP ANALYSIS SYSTEM PROMPT  (Opus)
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a Senior IT System Analyst for Direktorat Jenderal Bea dan Cukai (DJBC) Indonesia.
Analyze the document and extract structured project data for CEISA 4.0 IT procurement documentation.

OUTPUT PRIORITY — write in this exact order, stop cleanly if token limit is near:
TIER 1 (CRITICAL — always complete ALL of these first, never skip any):
  nama, latarBelakang, masalahIsu, asIsToBe, kebutuhanFungsional, kebutuhanNonFungsional, actors, useCases, risikoBisnis
TIER 2 (IMPORTANT — write after Tier 1):
  pengampu, unitPenanggungJawab, namaPIC, kontakPIC, targetPenyelesaian, targetOutcome, bia, detectedPeople
TIER 3 (OPTIONAL — only if tokens remain):
  outcomeKeluaran, businessValue, alurBisnisProses, brdProcessAnalysis, fsdLinks, mermaid

EXTRACTION RULES:
- nama: the full official title of the document or project. Look for: judul dokumen, nama proyek, nama kegiatan,
  nama modul, nama sistem — typically found in the document header, cover page, or first paragraph.
  If multiple titles found, use the most specific/complete one. NEVER leave empty.
- latarBelakang: summarize the background and urgency in MAX 2 sentences. Be concise.
  Look for: latar belakang, pendahuluan, dasar hukum, konteks, sejarah, urgensi.
  If not explicitly labeled, infer from the opening paragraphs. NEVER leave empty.
- masalahIsu: summarize the core problems or pain points in MAX 2 sentences. Be concise.
  Look for: masalah, isu, kendala, gap, permasalahan, hambatan, tantangan.
  If not explicitly labeled, infer from context. NEVER leave empty.
- asIsToBe: min 5 items comparing current state vs proposed state.
  IMPORTANT: if the document does not have an explicit As-Is/To-Be section, INFER it from:
  (a) problems described → those are the As-Is conditions
  (b) goals/requirements stated → those are the To-Be conditions
  (c) any mention of manual processes → As-Is; automated system → To-Be
  ALWAYS produce at least 5 items by inferring. NEVER return an empty array.
- actors: 7-10 items — every human role, system, external service interacting with the system
  type: GUI=human via browser, Protocol=system-to-system, API=internal service
- useCases: 8-10 items only — top use cases; name as "Verb Noun" in Indonesian
  transactions: Simple=1-3 steps, Average=4-7, Complex=8+
- kebutuhanFungsional: 8-10 items only, format "Sistem harus mampu [aksi] [objek] [kualifikasi]"
  prioritas: Mandatory|High|Medium|Low
- kebutuhanNonFungsional: 5 items — Security, Performance, Availability, Scalability, Compliance
- risikoBisnis: min 5 items; integration points, manual processes, regulatory items each = 1 risk
- bia: Critical→RTO:1h RPO:1h, High→RTO:4h RPO:4h, Medium→RTO:8h RPO:24h, Low→RTO:24h RPO:48h
- mermaid: max 12 nodes total per diagram, double quotes only, no semicolons
  processFlow=flowchart TD top 8 steps, useCaseDiagram=flowchart LR top 8 UCs, erd=top 5 entities
  JSON-encode: newlines as \n, inner quotes as \"

MINIMUMS: actors≥7, useCases≥8, kebutuhanFungsional≥8, kebutuhanNonFungsional≥5, risikoBisnis≥5, asIsToBe≥5

OUTPUT RULES:
1. Return ONLY pure JSON — no markdown, no backticks, start { end }
2. All strings properly JSON-escaped
3. Arrays never null — use []
4. TIER 1 fields MUST appear first in the JSON output

OUTPUT SCHEMA (in output order):
{
  "nama": "string — full official project/document title, NEVER empty",
  "latarBelakang": "string — max 2 sentences, concise background summary, NEVER empty",
  "masalahIsu": "string — max 2 sentences, concise problem summary, NEVER empty",
  "asIsToBe": [ { "id": "1", "factor": "string", "asIs": "string", "toBe": "string" } ],
  "kebutuhanFungsional": [ { "id": "FR-01", "deskripsi": "Sistem harus mampu ...", "prioritas": "Mandatory|High|Medium|Low" } ],
  "kebutuhanNonFungsional": [ { "id": "NFR-01", "kategori": "Security|Performance|Availability|Scalability|Compliance|Usability|Maintainability", "deskripsi": "string" } ],
  "actors": [ { "id": "1", "name": "string", "type": "GUI|Protocol|API", "desc": "string" } ],
  "useCases": [ { "id": "1", "subSystem": "string", "name": "string", "transactions": 5, "actorRef": "string", "preCond": "string", "postCond": "string" } ],
  "risikoBisnis": [ { "id": "R-01", "risk": "string", "impact": "string", "mitigasi": "string", "level": "Tinggi|Sedang|Rendah" } ],
  "pengampu": "string",
  "unitPenanggungJawab": "string",
  "namaPIC": "string",
  "kontakPIC": "string",
  "targetPenyelesaian": "YYYY-MM-DD or empty",
  "targetOutcome": "string",
  "bia": { "operasional": "Critical|High|Medium|Low", "finansial": "Critical|High|Medium|Low", "reputasi": "Critical|High|Medium|Low", "hukum": "Critical|High|Medium|Low", "rto": "string", "rpo": "string" },
  "detectedPeople": [ { "name": "string", "role": "string" } ],
  "brdProcessAnalysis": { "modul": "string", "subModul": "string", "eaMapping": "string", "notes": "string" },
  "fsdLinks": { "diagrams": "URL or null", "mockups": "URL or null", "repo": "URL or null" },
  "outcomeKeluaran": "string",
  "businessValue": "string",
  "alurBisnisProses": "string",
  "mermaid": { "processFlow": "string", "useCaseDiagram": "string", "erd": "string" }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  Shared Claude API caller
// ─────────────────────────────────────────────────────────────────────────────
const callClaude = async ({ model, maxTokens, system, userMessage }) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    if (response.status === 500) {
      throw new Error(`Server error (500) — request mungkin terlalu besar. Detail: ${msg}`);
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
const triageDocument = async (skeleton) => {
  console.log("⚡ Pass 1 — Triage with Haiku...");

  const { text, usage } = await callClaude({
    model:       TRIAGE_MODEL,
    maxTokens:   TRIAGE_MAX_TOKENS,
    system:      TRIAGE_SYSTEM_PROMPT,
    userMessage: `Identify relevant pages in this document skeleton:\n\n${skeleton}`,
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
const analyzeDocument = async (documentText, contextNote = "") => {
  // ✅ Tier 1: 30K input TPM (~120K chars). Retry with smaller doc on 500.
  const ATTEMPT_LIMITS = [80_000, 50_000, 30_000];

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
      "Analyze the following document content thoroughly.",
      "Extract ALL information into the JSON structure defined in your instructions.",
      "Be exhaustive — infer anything not explicitly stated but reasonably derivable from context.",
      contextNote,
      "\n\nDOCUMENT CONTENT:\n\n",
      doc,
    ].filter(Boolean).join("\n");

    try {
      const { text, usage } = await callClaude({
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
        console.warn(`⚠️ 500 on attempt ${attempt + 1} — retrying with smaller document...`);
        continue;
      }
      throw err;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN EXPORT — processDocumentWithAI
// ─────────────────────────────────────────────────────────────────────────────
export const processDocumentWithAI = async (fileTextOrPages, onProgress) => {
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
      notify(`⚡ Pass 1: Scanning ${pages.length} pages with Haiku...`);

      const skeleton = pages
        .map((text, i) => `[Page ${i + 1}]\n${text.substring(0, 300)}`)
        .join("\n\n---\n\n");

      const triage = await triageDocument(skeleton);
      triageUsage  = triage.usage;

      log.push({
        model: TRIAGE_MODEL, pass: "triage", status: "Success",
        inputTokens: triage.usage?.input_tokens, outputTokens: triage.usage?.output_tokens,
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

        if (sorted.length >= 5 && sorted.length < pages.length * 0.80) {
          documentToAnalyze = sorted.map(n => `=== PAGE ${n} ===\n${pages[n - 1]}`).join("\n\n");
          contextNote = `Note: Filtered excerpt. Pages analyzed: ${sorted.join(", ")} of ${pages.length} total.`;
          notify(`✅ Triage complete. Selected ${sorted.length}/${pages.length} relevant pages.`);
        } else {
          notify(`ℹ️ Triage selected ${sorted.length}/${pages.length} pages — using full document.`);
          selectedPages = null;
        }
      }
    } else {
      notify("ℹ️ Document is short — skipping triage, sending full text to Opus.");
    }

    // ── PASS 2: Deep Analysis ─────────────────────────────────────────────
    notify(`🧠 Pass 2: Deep analysis with Claude Opus...`);
    const analysis = await analyzeDocument(documentToAnalyze, contextNote);
    analysisUsage  = analysis.usage;

    log.push({
      model: ANALYSIS_MODEL, pass: "analysis", status: "Success",
      inputTokens: analysis.usage?.input_tokens, outputTokens: analysis.usage?.output_tokens,
    });

    const parsed = parseAIResponse(analysis.text);

    return {
      success: true, data: parsed,
      usedModel: ANALYSIS_MODEL,
      triageModel: pages?.length > 10 ? TRIAGE_MODEL : null,
      selectedPages, totalPages: pages?.length ?? null,
      usage: {
        triage: triageUsage, analysis: analysisUsage,
        input_tokens:  (triageUsage?.input_tokens  || 0) + (analysisUsage?.input_tokens  || 0),
        output_tokens: (triageUsage?.output_tokens || 0) + (analysisUsage?.output_tokens || 0),
      },
      log,
    };

  } catch (error) {
    console.error("❌ Claude API Error:", error.message);

    let friendlyMsg = error.message;
    if      (error.message.includes("401"))          friendlyMsg = "Backend API key tidak valid. Periksa ANTHROPIC_API_KEY di environment backend.";
    else if (error.message.includes("403"))          friendlyMsg = "API key tidak memiliki izin model ini.";
    else if (error.message.includes("429"))          friendlyMsg = "Rate limit tercapai. Tunggu beberapa menit lalu coba lagi.";
    else if (error.message.includes("529") || error.message.includes("503"))
                                                     friendlyMsg = "Server Claude sedang sibuk. Coba lagi dalam beberapa saat.";
    else if (error.message.includes("Failed to fetch")) friendlyMsg = "Tidak dapat terhubung ke API Anthropic. Periksa koneksi internet dan proxy Vite.";

    log.push({ model: ANALYSIS_MODEL, pass: "analysis", status: "Failed", error: friendlyMsg });

    return {
      success: false, data: null,
      usedModel: ANALYSIS_MODEL, log,
      error: { ...error, message: friendlyMsg },
    };
  }
};
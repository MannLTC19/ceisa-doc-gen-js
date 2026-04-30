// ─────────────────────────────────────────────────────────────────────────────
//  aiProcessor.js  —  Three-Pass Claude Document Analyzer for CEISA 4.0 Doc Genie
//
//  PASS 1 — Triage      (claude-haiku-4-5,    fast + cheap)
//  PASS 2 — Deep Analysis (claude-opus-4-6,   critical arrays only)
//  PASS 3 — Fill & Enrich (claude-sonnet-4-6, remaining fields + mermaid)
// ─────────────────────────────────────────────────────────────────────────────

const TRIAGE_MODEL  = "claude-haiku-4-5-20251001";
const ANALYSIS_MODEL = "claude-opus-4-6";
const ENRICH_MODEL   = "claude-sonnet-4-6";
const CLAUDE_API_URL = "/anthropic/v1/messages"; // proxied via vite.config.js

const TRIAGE_MAX_TOKENS   = 1024;
const ANALYSIS_MAX_TOKENS = 5000;  
const ENRICH_MAX_TOKENS   = 5000;  

// ─── Sanitization Utilities & JSON Repair ─────────────────────────────────────
const sanitizeRawText = (text) => {
  let clean = text.replace(/<(bos|eos|pad|unk|s|\/s|sep|mask|cls)>/gi, "");
  clean = clean.replace(/```json/gi, "");
  clean = clean.replace(/```/g, "");
  // Strip illegal control characters that break JSON, but preserve newlines
  clean = clean.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F]+/g, "");
  return clean.trim();
};

const sanitizeMermaidErd = (erd) => {
  if (!erd) return erd;
  return erd.split("\n").map(line => {
    line = line.replace(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*\{/, (m, name) => m.replace(name, name.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 30)));
    line = line.replace(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*(\|\|--|o\{--|}\o--)/, (m, name) => m.replace(name, name.toUpperCase()));
    line = line.replace(/^(\s*[A-Z][A-Z0-9_]*\s*(?:\|\|--o\{|\|\|--\|\||\|\|--\|\{|}o--o\{)\s*)([A-Za-z][A-Za-z0-9_]*)/, (m, left, name) => left + name.toUpperCase());
    line = line.replace(/:\s*([^"\n{]+)$/, (m, label) => { const t = label.trim(); return t && !t.startsWith('"') ? `: "${t}"` : m; });
    return line.replace(/;$/, "").replace(/^(\s+\w+\s+\w+)\s+\([^)]*\)/, "$1");
  }).join("\n");
};

const sanitizeMermaidFlowchart = (code) => {
  if (!code) return code;
  const lines = code.split("\n").map(line => {
    line = line.replace(/\['/g, '["').replace(/'\]/g, '"]');
    line = line.replace(/\(['"]/g, '(["').replace(/['"]\)/g, '"])');
    line = line.replace(/subgraph\s+'/g, 'subgraph "').replace(/'(\s*)$/, '"$1');
    line = line.replace(/--\|>/g, "-->").replace(/<\.\./g, "-->").replace(/<\./g, "-->").replace(/===>/g, "-->");
    line = line.replace(/^\s*actor\s+(\w+)\s*$/, (_, n) => `  ${n}(["👤 ${n}"])`);
    line = line.replace(/<<\w+>>/g, "").replace(/\\n/g, "<br/>").replace(/\\"/g, "'").replace(/;(\s*)$/, "$1");
    return /^\s*usecaseDiagram\s*$/.test(line) ? "flowchart LR" : line;
  });
  if (!/^flowchart\s+(TD|LR|BT|RL|TB)/i.test(lines.find(l => l.trim().length > 0) || "")) lines.unshift("flowchart LR");
  return lines.join("\n");
};

const sanitizeFields = (obj) => {
  const arrayFields = ['actors', 'useCases', 'kebutuhanFungsional', 'kebutuhanNonFungsional', 'risikoBisnis', 'asIsToBe', 'detectedPeople'];
  arrayFields.forEach(key => {
    if (!Array.isArray(obj[key])) obj[key] = [];
    obj[key] = obj[key].filter(item => item && typeof item === 'object');
  });

  if (!obj.mermaid || typeof obj.mermaid !== 'object') obj.mermaid = {};
  if (!obj.bia || typeof obj.bia !== 'object') obj.bia = {};
  if (!obj.brdProcessAnalysis || typeof obj.brdProcessAnalysis !== 'object') obj.brdProcessAnalysis = { modul: '', subModul: '', eaMapping: '', notes: '' };

  if (obj.mermaid.erd) obj.mermaid.erd = sanitizeMermaidErd(obj.mermaid.erd);
  if (obj.mermaid.processFlow) obj.mermaid.processFlow = sanitizeMermaidFlowchart(obj.mermaid.processFlow);
  if (obj.mermaid.useCaseDiagram) obj.mermaid.useCaseDiagram = sanitizeMermaidFlowchart(obj.mermaid.useCaseDiagram);

  return obj;
};

// --- JSON Fallback Mechanisms ---
const fixUnescapedCharsInStrings = (str) => {
  let result = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; result += ch; continue; }
    if (ch === '\\' && inString) { escaped = true; result += ch; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
};

const repairTruncatedJson = (str) => {
  const stack = [];
  let inString = false;
  let escaped = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
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

// --- Multi-Tier JSON Parser ---
const parseAIResponse = (text) => {
  const sanitized = sanitizeRawText(text);
  const firstOpen = sanitized.indexOf("{");
  const lastClose = sanitized.lastIndexOf("}");
  
  if (firstOpen === -1) {
    console.error("❌ No JSON object found in response");
    return sanitizeFields({});
  }

  // Slice perfectly from { to } if possible, otherwise just start from {
  const raw = lastClose > firstOpen 
    ? sanitized.substring(firstOpen, lastClose + 1) 
    : sanitized.substring(firstOpen);

  try {
    return sanitizeFields(JSON.parse(raw));
  } catch (e1) {
    console.warn("⚠️ Pass 1 JSON parse failed, attempting unescaped char fix...");
    try {
      return sanitizeFields(JSON.parse(fixUnescapedCharsInStrings(raw)));
    } catch (e2) {
      console.warn("⚠️ Pass 2 JSON parse failed, attempting truncation fix...");
      try {
        return sanitizeFields(JSON.parse(repairTruncatedJson(fixUnescapedCharsInStrings(raw))));
      } catch (e3) {
        console.warn("⚠️ Pass 3 JSON parse failed, attempting strict truncation fix...");
        try {
          return sanitizeFields(JSON.parse(repairTruncatedJson(raw)));
        } catch (e4) {
          console.error("❌ All JSON repair attempts failed. Last error:", e4);
          return sanitizeFields({});
        }
      }
    }
  }
};

// ─── API Caller ───────────────────────────────────────────────────────────────
const callClaude = async (apiKey, { model, maxTokens, system, userMessage }) => {
  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: userMessage }] }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.error?.message || response.statusText);
  }

  const data = await response.json();
  const text = (data.content || []).map(b => b.type === "text" ? b.text : "").filter(Boolean).join("\n");
  return { text, usage: data.usage };
};

// ─── Prompts ──────────────────────────────────────────────────────────────────
const TRIAGE_SYSTEM_PROMPT = `
You are a document indexer. Identify which page numbers contain each type of information. Include adjacent pages.
Return ONLY a raw JSON object:
{
  "background":   [numbers], "problems":     [numbers], "requirements": [numbers],
  "actors":       [numbers], "process":      [numbers], "usecases":     [numbers],
  "risks":        [numbers], "people":       [numbers], "outcomes":     [numbers]
}
`;

const SYSTEM_PROMPT = `
You are a Senior IT System Analyst. Extract ONLY the critical structured arrays from this IT project document.
FOCUS: nama, asIsToBe, kebutuhanFungsional, kebutuhanNonFungsional, actors, useCases.

EXTRACTION RULES:
- nama: full project/document title.
- asIsToBe: exactly 5 items. Keys: "factor", "asIs", "toBe"
- kebutuhanFungsional: exactly 8 items. Format: "Sistem harus mampu [aksi] [objek]". Keys: "kebutuhan", "detailFungsi", "prioritas" (Mandatory|High|Medium|Low)
- kebutuhanNonFungsional: exactly 5 items. Keys: "fungsi" (extract the functional category or label), "deskripsi". (DO NOT extract 'alasan' or 'kategori').
- actors: exactly 7 items. Keys: "name", "type" (GUI|Protocol|API), "desc"
- useCases: Keys: "deskripsi" (name as Verb+Noun), "transactions" (int 3, 5, or 8), "actorRef", "preCond", "postCond", "mainFlow", "altFlow", "catatan" (extract "Acceptance Criteria" into the "catatan" field!).

OUTPUT RULES: Return ONLY pure JSON. Array NEVER null, use [].
`;

const ENRICH_SYSTEM_PROMPT = `
You are a Senior IT System Analyst. Extract the REMAINING fields only based on the document text.
FOCUS: latarBelakang, tujuan, gambaranKondisiSaatIni, masalahIsu, pengampu, unitPenanggungJawab, namaPIC, kontakPIC, targetPenyelesaian, targetOutcome, outcomeKeluaran, businessValue, alurBisnisProses, tautanMockup, integrasiSSO, kasusBisnis, sasaran, faktorPenentu, bia, risikoBisnis, brdProcessAnalysis, mermaid, bvEffort.

EXTRACTION RULES:
- Text fields: Max 3 sentences. (latarBelakang, tujuan, gambaranKondisiSaatIni, masalahIsu, businessValue, dll).
- tujuan: Project goals/objectives.
- tautanMockup: scan for Mockup or Figma links.
- integrasiSSO: scan for SSO integration details (e.g., CEISA 4.0 SSO).
- bvEffort: Extract exact scores for BV (efisiensi, penggunaLayanan, dasarKebutuhan, scoringBIA) and Effort (targetPenyelesaian, kesiapanRegulasi, sistemTerkait, kerahasiaanInformasi).
- bia: Business Impact Analysis. Keys: operasional, finansial, reputasi, hukum (Critical|High|Medium|Low), rto, rpo.
- risikoBisnis: 5 items. Keys: "risk", "impact", "mitigasi", "level" (Tinggi|Sedang|Rendah).
- brdProcessAnalysis: Keys: modul, subModul, eaMapping, notes.
- mermaid: 3 diagrams. Keys: processFlow (flowchart TD), useCaseDiagram (flowchart LR), erd (erDiagram). Double quotes only.

OUTPUT RULES: Return ONLY pure JSON.
`;

// ─── Triage Function ──────────────────────────────────────────────────────────
const triageDocument = async (apiKey, skeleton) => {
  const { text, usage } = await callClaude(apiKey, { model: TRIAGE_MODEL, maxTokens: TRIAGE_MAX_TOKENS, system: TRIAGE_SYSTEM_PROMPT, userMessage: `Identify pages:\n\n${skeleton}` });
  try {
    const sanitized = sanitizeRawText(text);
    return { data: JSON.parse(sanitized.substring(sanitized.indexOf("{"))), usage };
  } catch (error) {
    return { data: {}, usage };
  }
};

// ─── Main Orchestrator ────────────────────────────────────────────────────────
const processDocumentWithAI = async (apiKey, documentData, onProgress) => {
  try {
    const { pages, totalPages } = documentData;
    
    // PASS 1: Triage
    onProgress?.('⚡ Triage dokumen (Haiku)...');
    const skeleton = pages.map((p, i) => `[PAGE ${i+1}]\n${p.substring(0, 300)}...`).join('\n\n');
    const { data: triageData, usage: triageUsage } = await triageDocument(apiKey, skeleton);

    const getPages = (keys) => {
      const set = new Set();
      keys.forEach(k => { if (Array.isArray(triageData[k])) triageData[k].forEach(p => set.add(parseInt(p))); });
      return Array.from(set).filter(p => !isNaN(p) && p > 0 && p <= totalPages);
    };

    // PASS 2: Deep Analysis (Opus)
    onProgress?.('🧠 Analisis array kritikal (Opus)...');
    const pass2Nums = getPages(["requirements", "usecases", "actors", "process"]);
    if (pass2Nums.length === 0) pass2Nums.push(...[1, 2, 3, 4, 5].filter(p => p <= totalPages));
    const pass2Text = pass2Nums.map(n => `--- PAGE ${n} ---\n${pages[n-1]}`).join('\n\n');
    
    const pass2Res = await callClaude(apiKey, { model: ANALYSIS_MODEL, maxTokens: ANALYSIS_MAX_TOKENS, system: SYSTEM_PROMPT, userMessage: `TEXT:\n\n${pass2Text}` });
    const parsedPass2 = parseAIResponse(pass2Res.text);

    // PASS 3: Enrich Data & Mermaid (Sonnet)
    onProgress?.('✨ Melengkapi data & Diagram (Sonnet)...');
    const pass3Nums = getPages(["background", "problems", "risks", "people", "outcomes"]);
    if (pass3Nums.length === 0) pass3Nums.push(...[1, 2, 3, 4, 5].filter(p => p <= totalPages));
    const pass3Text = pass3Nums.map(n => `--- PAGE ${n} ---\n${pages[n-1]}`).join('\n\n');

    const pass3Res = await callClaude(apiKey, { model: ENRICH_MODEL, maxTokens: ENRICH_MAX_TOKENS, system: ENRICH_SYSTEM_PROMPT, userMessage: `CRITICAL JSON EXTRACTED SO FAR:\n${JSON.stringify(parsedPass2, null, 2)}\n\nDOCUMENT TEXT:\n\n${pass3Text}` });
    const parsedPass3 = parseAIResponse(pass3Res.text);

    // MERGE results safely
 // MERGE results safely
    // 🔥 FIX: Explicitly preserve Pass 2's critical arrays so Pass 3's empty arrays don't overwrite them
    const mergedData = {
      ...parsedPass2,
      ...parsedPass3,
      
      // Protect Pass 2 data
      nama:                   parsedPass2.nama                   || parsedPass3.nama,
      asIsToBe:               parsedPass2.asIsToBe?.length               ? parsedPass2.asIsToBe               : parsedPass3.asIsToBe,
      kebutuhanFungsional:    parsedPass2.kebutuhanFungsional?.length    ? parsedPass2.kebutuhanFungsional    : parsedPass3.kebutuhanFungsional,
      kebutuhanNonFungsional: parsedPass2.kebutuhanNonFungsional?.length ? parsedPass2.kebutuhanNonFungsional : parsedPass3.kebutuhanNonFungsional,
      actors:                 parsedPass2.actors?.length                 ? parsedPass2.actors                 : parsedPass3.actors,
      useCases:               parsedPass2.useCases?.length               ? parsedPass2.useCases               : parsedPass3.useCases,
      
      // Deep merge nested objects
      mermaid: { ...(parsedPass2.mermaid || {}), ...(parsedPass3.mermaid || {}) },
      bia:     { ...(parsedPass2.bia || {}),     ...(parsedPass3.bia || {}) },
      brdProcessAnalysis: { ...(parsedPass2.brdProcessAnalysis || {}), ...(parsedPass3.brdProcessAnalysis || {}) }
    };
    
    return {
      success: true,
      data: mergedData,
      usedModel: ANALYSIS_MODEL,
      enrichModel: ENRICH_MODEL,
      triageModel: TRIAGE_MODEL,
      usage: { triage: triageUsage, analysis: pass2Res.usage, enrich: pass3Res.usage },
      selectedPages: [...new Set([...pass2Nums, ...pass3Nums])].sort((a,b)=>a-b),
      totalPages
    };

  } catch (error) {
    console.error("❌ Pipeline failed:", error);
    return { success: false, error };
  }
};

export { processDocumentWithAI };
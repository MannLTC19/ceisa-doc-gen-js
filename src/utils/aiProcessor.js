import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── LAYER 1: Raw text sanitizer ─────────────────────────────────────────────
// Runs on the raw AI response string BEFORE JSON parsing.
// Removes model artifacts that corrupt JSON and Mermaid syntax.
const sanitizeRawText = (text) => {
    return text
        // Strip model boundary tokens (e.g. <bos>, <eos>, <pad>, <unk>, <s>, </s>)
        .replace(/<(bos|eos|pad|unk|s|\/s|sep|mask|cls)>/gi, '')
        // Strip any other lone <word> tokens that aren't valid HTML/XML we care about
        .replace(/<[a-z_]{1,10}>/gi, '')
        // Strip markdown code fences if model wrapped JSON anyway
        .replace(/```(?:json)?/gi, '')
        // Normalize Windows line endings
        .replace(/\r\n/g, '\n');
};

// ─── LAYER 2: Mermaid ERD post-processor ─────────────────────────────────────
// Runs on extracted Mermaid strings AFTER JSON parsing.
// Fixes the most common ERD-specific AI mistakes programmatically.
const sanitizeMermaidErd = (erd) => {
    if (!erd) return erd;

    const lines = erd.split('\n');

    // Collect all declared entity names (uppercase, clean ones)
    const declaredEntities = new Set();
    lines.forEach(line => {
        const entityMatch = line.match(/^\s*([A-Z][A-Z0-9_]{1,29})\s*\{/);
        if (entityMatch) declaredEntities.add(entityMatch[1]);
    });

    const fixed = lines.map(line => {
        // Fix 1: Uppercase + clean entity definition names
        line = line.replace(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*\{/, (match, name) => {
            const clean = name.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 30);
            return match.replace(name, clean);
        });

        // Fix 2: Uppercase left-hand entity name in relationship lines
        const relMatch = line.match(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*(\|\|--|o\{--|}\o--)\s*/);
        if (relMatch) {
            line = line.replace(relMatch[1], relMatch[1].toUpperCase());
        }

        // Fix 2b: Uppercase right-hand entity name in relationship lines
        line = line.replace(
            /^(\s*[A-Z][A-Z0-9_]*\s*(?:\|\|--o\{|\|\|--\|\||\|\|--\|\{|}\o--o\{)\s*)([A-Za-z][A-Za-z0-9_]*)/,
            (match, left, name) => left + name.toUpperCase()
        );

        // Fix 3: Relationship label missing quotes → add them
        line = line.replace(/:\s*([^"\n{]+)$/, (match, label) => {
            const trimmed = label.trim();
            if (trimmed && !trimmed.startsWith('"')) return `: "${trimmed}"`;
            return match;
        });

        // Fix 5: Strip semicolons
        line = line.replace(/;$/, '');

        // Fix 6: Field values with parenthetical descriptions → strip parens
        line = line.replace(/^(\s+\w+\s+\w+)\s+\([^)]*\)/, '$1');

        return line;
    });

    // Fix 4 (block level): Inline entity fields → expand to multiline
    const expanded = [];
    for (const line of fixed) {
        const inlineMatch = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*\{([^}]+)\}/);
        if (inlineMatch) {
            const [, name, fields] = inlineMatch;
            expanded.push(`  ${name} {`);
            fields.split(',').forEach(f => {
                const trimmed = f.trim();
                if (trimmed) expanded.push(`    ${trimmed}`);
            });
            expanded.push('  }');
        } else {
            expanded.push(line);
        }
    }

    return expanded.join('\n');
};

// ─── LAYER 3: Mermaid Flowchart post-processor ───────────────────────────────
// Fixes common AI mistakes in flowchart TD/LR diagrams (processFlow + useCaseDiagram).
const sanitizeMermaidFlowchart = (code) => {
    if (!code) return code;

    let autoIdCounter = 0;
    const nextId = () => `_n${++autoIdCounter}`;

    const lines = code.split('\n').map(line => {
        // Fix 1: Single quotes on labels → double quotes
        line = line.replace(/\['/g, '["').replace(/'\]/g, '"]');
        line = line.replace(/\([']/g, '(["').replace(/'\]\)/g, '"])');
        line = line.replace(/subgraph\s+'/g, 'subgraph "').replace(/'\s*$/, '"');

        // Fix 2: Forbidden arrow types → plain arrow
        line = line.replace(/--\|>/g, '-->');
        line = line.replace(/<\.\./g, '-->');
        line = line.replace(/<\./g, '-->');
        line = line.replace(/===>/g, '-->');

        // Fix 3: "actor" keyword → proper stadium shape
        line = line.replace(/^\s*actor\s+(\w+)\s*$/, (_, name) => `  ${name}(["👤 ${name}"])`);

        // Fix 4: UML stereotypes <<uses>> etc → strip
        line = line.replace(/<<\w+>>/g, '');

        // Fix 5: Nodes missing an ID (bare label shapes)
        line = line.replace(/(^|\s|-->|&)\s*(\["|{"|(\(\["))/g, (match, pre, shape) => {
            return `${pre} ${nextId()}${shape}`;
        });

        // Fix 6: Trailing semicolons
        line = line.replace(/;(\s*)$/, '$1');

        // Fix 7: usecaseDiagram keyword → valid declaration
        if (/^\s*usecaseDiagram\s*$/.test(line)) return 'flowchart LR';

        return line;
    });

    // Fix 8: Ensure diagram starts with a valid flowchart declaration
    const firstMeaningfulLine = lines.find(l => l.trim().length > 0) || '';
    if (!/^flowchart\s+(TD|LR|BT|RL|TB)/i.test(firstMeaningfulLine)) {
        lines.unshift('flowchart LR');
    }

    return lines.join('\n');
};

/**
 * Clean and parse AI response to ensure valid JSON
 */
const parseAIResponse = (text) => {
    try {
        // Layer 1: sanitize raw text before extracting JSON
        const sanitized = sanitizeRawText(text);

        const firstOpen = sanitized.indexOf('{');
        const lastClose = sanitized.lastIndexOf('}');
        if (firstOpen === -1 || lastClose === -1) throw new Error("No JSON found");

        const cleanJson = sanitized.substring(firstOpen, lastClose + 1);
        const parsed = JSON.parse(cleanJson);

        // Layers 2 & 3: sanitize all three Mermaid diagram types
        if (parsed.mermaid?.erd)            parsed.mermaid.erd            = sanitizeMermaidErd(parsed.mermaid.erd);
        if (parsed.mermaid?.processFlow)    parsed.mermaid.processFlow    = sanitizeMermaidFlowchart(parsed.mermaid.processFlow);
        if (parsed.mermaid?.useCaseDiagram) parsed.mermaid.useCaseDiagram = sanitizeMermaidFlowchart(parsed.mermaid.useCaseDiagram);

        return parsed;
    } catch (e) {
        console.error("AI Response Parsing Failed:", e, text);
        return {
            nama: "Parsing Error",
            asIsToBe: [], kebutuhanFungsional: [], kebutuhanNonFungsional: [],
            actors: [], useCases: [], risikoBisnis: [], detectedPeople: [],
            fsdLinks: {}, mermaid: {}
        };
    }
};

// ─── MASTER PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a Senior IT System Analyst for Indonesian Customs (Direktorat Jenderal Bea dan Cukai).
You are an expert at reading ANY type of business or government document and extracting structured IT project documentation from it.
Context: All outputs feed into CEISA 4.0 IT project planning.

═══════════════════════════════════════════════════════════════
DOCUMENT TYPES YOU CAN READ (not limited to these)
═══════════════════════════════════════════════════════════════
  - TOR / KAK (Kerangka Acuan Kerja)
  - Renstra / Rencana Strategis
  - SOP / Prosedur Operasional Standar
  - Laporan Kinerja / Progress Report
  - Nota Dinas / Memorandum Internal
  - Peraturan / Regulasi (PMK, PP, UU, Perdirjen)
  - Spesifikasi Teknis / Technical Brief
  - Proposal Proyek / Feasibility Study
  - Notulen Rapat / Meeting Minutes
  - Business Process Documentation / Flow Chart Description
  - User Story / Backlog Document
  - ANY document that contains goals, processes, stakeholders, or problems

═══════════════════════════════════════════════════════════════
EXTRACTION PHILOSOPHY — MAXIMIZE WHAT YOU FIND
═══════════════════════════════════════════════════════════════

NEVER leave a field empty if you can extract OR infer it. Use every signal:

  "tujuan" / "sasaran" / "target"        → targetOutcome, businessValue
  "kegiatan" / "aktivitas" / "langkah"   → alurBisnisProses, useCases
  "unit" / "direktorat" / "seksi"        → pengampu, actors
  "masalah" / "kendala" / "gap" / "isu"  → masalahIsu, risikoBisnis
  "manfaat" / "dampak" / "output"        → businessValue, outcomeKeluaran
  "tanggal" / "deadline" / "jadwal"      → targetPenyelesaian, charter.timeline
  "nama" / "jabatan" / "NIP" / "kontak"  → detectedPeople
  "sistem" / "aplikasi" / "modul"        → actors, useCases, kebutuhanFungsional
  "keamanan" / "performa" / "kapasitas"  → kebutuhanNonFungsional
  "anggaran" / "biaya" / "pagu"          → businessValue (include figures)
  "kondisi saat ini" / "eksisting"       → asIsToBe[].asIs
  "kondisi diharapkan" / "to-be"         → asIsToBe[].toBe
  Regulation citations (PMK/PP/UU)       → kebutuhanNonFungsional, brdProcessAnalysis.notes

INFERENCE RULES — when nothing is explicit, INFER from context:
  No RTO/RPO stated?          → estimate based on operational criticality described
  No PIC name?                → use the issuing unit/jabatan as the PIC
  No use cases listed?        → derive from every business process step described
  No actors listed?           → derive from every role/unit that participates in a process
  No risks stated?            → infer from "kendala", "tantangan", or process complexity
  No functional reqs listed?  → derive one requirement per business process step
  No as-is/to-be stated?      → derive from contrast between current problems and stated goals

MINIMUM OUTPUT GUARANTEE — always produce at least:
  - 3 actors (infer from roles if needed)
  - 5 use cases (derive from process steps if needed)
  - 5 functional requirements (derive from goals/processes if needed)
  - 2 non-functional requirements (security + performance at minimum)
  - 2 risks (infer from kendala or process complexity)
  - 3 as-is/to-be rows (infer from problems vs goals)

═══════════════════════════════════════════════════════════════
CRITICAL OUTPUT RULES
═══════════════════════════════════════════════════════════════
1. Return ONLY pure JSON. No markdown. No backticks. No code fences. Just raw JSON.
2. EXHAUSTIVE: Extract EVERY actor, use case, person, risk, requirement you can find or infer.
3. PEOPLE: Scan for ANY name, jabatan, NIP, email, or phone number in the entire document.
4. COMPLETENESS: A reasonable inference is always better than an empty field.

═══════════════════════════════════════════════════════════════
MERMAID GENERATION — READ EVERY RULE CAREFULLY
═══════════════════════════════════════════════════════════════

━━━ RULE 1: QUOTES — THE #1 MISTAKE ━━━
  ALWAYS use DOUBLE QUOTES for ALL labels. Never single quotes.
  ✅ CORRECT:   A["Label text here"]
  ✅ CORRECT:   A(["👤 Actor Name"])
  ❌ WRONG:     A['Label text here']
  ❌ WRONG:     A(['Actor Name'])
  This rule has NO exceptions. Every label, every node, every subgraph.

━━━ RULE 2: NODE IDs — REQUIRED ON EVERY NODE ━━━
  Every node MUST have a unique ID before the shape bracket.
  ✅ CORRECT:   A["Task Label"] --> B["Next Task"]
  ❌ WRONG:     ["Task Label"] --> ["Next Task"]
  IDs must be: letters/numbers only, no spaces, unique across the diagram.

━━━ RULE 3: NODE SHAPES ━━━
  Process Task  →  ID["Label"]
  Decision      →  ID{"Label"}
  Actor         →  ID(["👤 Actor Name"])
  Start Event   →  ID(["🟢 Mulai"])
  End Event     →  ID(["🔴 Selesai"])

━━━ RULE 4: ARROWS ━━━
  Plain arrow           →  A --> B
  Labeled arrow         →  A -->|"Yes"| B   or   A -->|"No"| B
  Multi-connect         →  A --> B & C & D
  ❌ FORBIDDEN arrows: --|>  <..  <.  --  (these are invalid in Mermaid)

━━━ RULE 5: SPECIAL CHARACTERS IN LABELS ━━━
  If a label contains any of:  ( )  /  :  .  '  <  >
  It MUST be wrapped in double quotes.
  ✅ CORRECT:   A["Penyelesaian Kewajiban (Ekspor / Lainnya)"]
  ❌ WRONG:     A[Penyelesaian Kewajiban (Ekspor / Lainnya)]
  Use \\n inside a label to break long text (over 35 characters).

━━━ RULE 6: SUBGRAPH NAMES ━━━
  Names with spaces MUST use double quotes.
  ✅ CORRECT:   subgraph "Proses Bisnis Utama"
  ❌ WRONG:     subgraph 'Proses Bisnis Utama'
  ❌ WRONG:     subgraph Proses Bisnis Utama

━━━ RULE 7: NO SEMICOLONS ━━━
  Never end a line with semicolon.

━━━ RULE 8: FORBIDDEN KEYWORDS IN FLOWCHART ━━━
  ❌  actor           → define as: ID(["👤 Name"])
  ❌  usecaseDiagram  → use: flowchart LR
  ❌  <<uses>>        → use plain arrows
  ❌  <<integrates>>  → use plain arrows

━━━ RULE 9: ERD — ENTITY DEFINITIONS ━━━
  Each field on its own line. Entity names: UPPERCASE, underscores only, max 30 chars.
  ✅ CORRECT:
    ENTITY_NAME {
      int id PK
      string name
      string email
    }
  ❌ WRONG: ENTITY { int id PK, string name }
  ❌ WRONG: string FIELD (description here)

━━━ RULE 10: ERD — RELATIONSHIPS ━━━
  All entity definitions FIRST, then all relationships after.
  Always wrap relationship labels in double quotes: : "label"
  Cardinality: ||--||  ||--o{  }o--o{  ||--|{

━━━ VALIDATION CHECKLIST ━━━
  [ ] Every node has a unique ID
  [ ] Every label uses double quotes, never single quotes
  [ ] No semicolons at end of lines
  [ ] No "actor" keyword in flowchart
  [ ] No single-quoted subgraph names
  [ ] ERD fields each on own line, entity names UPPERCASE
  [ ] No --|>  <..  <.  arrows
  [ ] All ERD relationship labels in double quotes

═══════════════════════════════════════════════════════════════
UAW & UUCW Classification
═══════════════════════════════════════════════════════════════
  Actors ("type"): "API" (Simple) | "Protocol" (Average) | "GUI" (Complex)
  Use Cases ("transactions"): Simple 1-3 | Average 4-7 | Complex 8+

═══════════════════════════════════════════════════════════════
MERMAID OUTPUT FORMAT IN JSON
═══════════════════════════════════════════════════════════════
  Escape newlines as \\n and inner double quotes as \\"
  "processFlow": "flowchart TD\\nStart([\\"🟢 Mulai\\"]) --> T1[\\"Task 1\\"] --> End([\\"🔴 Selesai\\"])"

JSON Structure — fill EVERY field, infer if not explicit:
{
  "nama": "Project/Document Name — infer from title or subject",
  "pengampu": "Unit pengampu bisnis proses (Es. II) — extract or infer",
  "unitPenanggungJawab": "Unit TIK penanggung jawab (Es. III/IV)",
  "namaPIC": "PIC name — from signatory, author, or issuing officer",
  "kontakPIC": "Phone / email — extract if present, else empty string",
  "latarBelakang": "Full background narrative — extract all relevant context paragraphs",
  "masalahIsu": "All problems, gaps, obstacles, pain points — be exhaustive",
  "targetPenyelesaian": "Completion date YYYY-MM-DD — extract or estimate from document date + typical project duration",
  "targetOutcome": "Primary goal/outcome statement",
  "outcomeKeluaran": "All deliverables and outputs listed or implied",
  "businessValue": "All value statements: efficiency gains, cost savings, compliance, user volume, budget figures",
  "alurBisnisProses": "Full narrative of the business process flow — describe all steps in sequence",
  "bia": {
    "operasional": "Critical|High|Medium|Low — infer from process criticality",
    "finansial": "Critical|High|Medium|Low",
    "reputasi": "Critical|High|Medium|Low",
    "hukum": "Critical|High|Medium|Low — set High or Critical if regulatory document",
    "rto": "e.g. 4h — infer from criticality",
    "rpo": "e.g. 24h"
  },

  "detectedPeople": [
    { "name": "Full name", "role": "Jabatan / role in project" }
  ],

  "fsdLinks": {
    "diagrams": "URL or null",
    "mockups": "URL or null",
    "repo": "URL or null"
  },

  "mermaid": {
    "processFlow": "flowchart TD — map the FULL business process from the document. Include all steps, decisions, and actors.",
    "useCaseDiagram": "flowchart LR — map ALL actors and ALL use cases found or inferred.",
    "erd": "erDiagram — model ALL data entities implied by the business process and use cases."
  },

  "risikoBisnis": [
    { "id": "1", "risk": "Risk description", "impact": "Business impact", "mitigasi": "Mitigation strategy", "level": "Tinggi|Sedang|Rendah" }
  ],

  "kebutuhanNonFungsional": [
    { "id": "NFR-1", "kategori": "Security|Performance|Availability|Scalability|Compliance|Usability", "deskripsi": "Requirement detail" }
  ],

  "brdProcessAnalysis": {
    "modul": "CEISA module name",
    "subModul": "Sub-module",
    "eaMapping": "Enterprise architecture layer",
    "notes": "Regulatory references, integration points, special constraints from the document"
  },

  "asIsToBe": [
    { "id": "1", "factor": "Aspect name e.g. Proses Perizinan", "asIs": "Current state description", "toBe": "Desired future state description" }
  ],

  "kebutuhanFungsional": [
    { "id": "FR-01", "deskripsi": "One functional requirement per process step or feature", "prioritas": "Mandatory|High|Medium|Low" }
  ],

  "actors": [
    { "id": "1", "name": "Actor name", "type": "GUI|Protocol|API", "desc": "Role and responsibility description" }
  ],

  "useCases": [
    { "id": "1", "subSystem": "Module/subsystem name", "name": "Use case name", "transactions": 5, "actorRef": "Primary actor name", "preCond": "Pre-condition", "postCond": "Post-condition" }
  ]
}
`;

// Ordered best-to-worst: complex system prompt needs capable model first
const MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite-001"
];

export const processDocumentWithAI = async (apiKey, fileText) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `${SYSTEM_PROMPT}\n\nDOCUMENT CONTENT:\n${fileText}`;

    let lastError = null;
    let attemptLog = [];

    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`🤖 Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log(`✅ Success with ${modelName}!`);

            return {
                success: true,
                data: parseAIResponse(text),
                usedModel: modelName,
                log: [...attemptLog, { model: modelName, status: "Success", error: null }]
            };

        } catch (error) {
            console.warn(`❌ Model ${modelName} failed:`, error.message);
            lastError = error;
            attemptLog.push({
                model: modelName,
                status: "Failed",
                error: error.message.includes("429") ? "Quota Exceeded" :
                       error.message.includes("503") ? "Server Busy" : "Error"
            });

            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return {
        success: false,
        data: null,
        usedModel: null,
        log: attemptLog,
        error: lastError
    };
};
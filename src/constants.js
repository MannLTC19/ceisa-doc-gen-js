// ─────────────────────────────────────────────────────────────────────────────
// constants.js — CEISA 4.0 Doc Genie
// Single source of truth for all calculation constants, lookup tables, and
// reference data used across the application.
// ─────────────────────────────────────────────────────────────────────────────


// ─── FORMATTER ───────────────────────────────────────────────────────────────

export const formatIDR = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Rp 0,00';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
    }).format(value);
};


// ─── UCP: ACTOR COMPLEXITY ───────────────────────────────────────────────────
// UAW (Unadjusted Actor Weight)
// Simple   = 1  → API / external system with defined protocol
// Average  = 2  → Protocol / batch interaction
// Complex  = 3  → GUI / human user via interface

const ACTOR_COMPLEXITY = {
    API:      { level: 'Simple',  weight: 1 },
    Protocol: { level: 'Average', weight: 2 },
    GUI:      { level: 'Complex', weight: 3 },
};

export const getActorComplexity = (type) => {
    return ACTOR_COMPLEXITY[type] || ACTOR_COMPLEXITY['GUI'];
};


// ─── UCP: USE CASE COMPLEXITY ─────────────────────────────────────────────────
// UUCW (Unadjusted Use Case Weight)
// Simple   = 5   → 1–3 transactions
// Average  = 10  → 4–7 transactions
// Complex  = 15  → 8+ transactions

export const getUseCaseComplexity = (transactions) => {
    const t = parseInt(transactions) || 1;
    if (t <= 3) return { level: 'Simple',  weight: 5  };
    if (t <= 7) return { level: 'Average', weight: 10 };
    return       { level: 'Complex', weight: 15 };
};


// ─── TCF FACTORS (Technical Complexity) ──────────────────────────────────────
export const TCF_FACTORS = [
    { id: 'T1',  name: 'Distributed System',          weight: 2.0 },
    { id: 'T2',  name: 'Response / Throughput',       weight: 1.0 },
    { id: 'T3',  name: 'End-User Efficiency',         weight: 1.0 },
    { id: 'T4',  name: 'Complex Internal Processing', weight: 1.0 },
    { id: 'T5',  name: 'Reusability',                 weight: 1.0 },
    { id: 'T6',  name: 'Easy Installation',           weight: 0.5 },
    { id: 'T7',  name: 'Easy Operational Use',        weight: 0.5 },
    { id: 'T8',  name: 'Portability',                 weight: 2.0 },
    { id: 'T9',  name: 'Easy to Change',              weight: 1.0 },
    { id: 'T10', name: 'Concurrency',                 weight: 1.0 },
    { id: 'T11', name: 'Special Security Features',   weight: 1.0 },
    { id: 'T12', name: 'Direct Access for 3rd Party', weight: 1.0 },
    { id: 'T13', name: 'Special User Training',       weight: 1.0 },
];

// ─── EF FACTORS (Environmental / Experience) ─────────────────────────────────
export const EF_FACTORS = [
    { id: 'E1', name: 'Familiar with UML',              weight: 1.5 },
    { id: 'E2', name: 'Part-Time Workers',              weight: -1.0 },
    { id: 'E3', name: 'Analyst Capability',             weight: 0.5 },
    { id: 'E4', name: 'Application Experience',         weight: 0.5 },
    { id: 'E5', name: 'OO Programming Experience',      weight: 1.0 },
    { id: 'E6', name: 'Motivation',                     weight: 1.0 },
    { id: 'E7', name: 'Difficult Programming Language', weight: -1.0 },
    { id: 'E8', name: 'Stable Requirements',            weight: 2.0 },
];


// ─── ROLE RATES — INKINDO 2023 ────────────────────────────────────────────────
// Sumber: Standar Biaya Inkindo 2023
// Nilai dalam Rupiah per Man-Month — TIDAK BOLEH DIUBAH

export const ROLE_RATES_2023 = {
    business_analyst:  21_950_000,
    system_analyst:    21_950_000,
    programmer:        21_950_000,
    project_manager:   28_150_000,
    config_manager:    25_050_000,
    technical_writer:  13_950_000,
    tester:            13_950_000,
};


// ─── PHASE DISTRIBUTION — KAK AKHIR TAHUN ────────────────────────────────────
// Sumber: Template resmi KAK Bea Cukai / Inkindo 2023
// Persentase, nama fase, role, dan rate TIDAK BOLEH DIUBAH

export const PHASE_DISTRIBUTION = [
    // ── Software Phase Development ────────────────────────────────────────────
    {
        id:       'phase-req',
        group:    'Software Phase Development',
        name:     'Needs Analysis (Requirement)',
        percent:  1.6,
        roleId:   'business_analyst',
        roleName: 'Business Analyst',
        rate:     ROLE_RATES_2023.business_analyst,
    },
    {
        id:       'phase-spec',
        group:    'Software Phase Development',
        name:     'Specification',
        percent:  7.5,
        roleId:   'system_analyst',
        roleName: 'System Analyst',
        rate:     ROLE_RATES_2023.system_analyst,
    },
    {
        id:       'phase-design',
        group:    'Software Phase Development',
        name:     'Design',
        percent:  6.0,
        roleId:   'system_analyst',
        roleName: 'System Analyst',
        rate:     ROLE_RATES_2023.system_analyst,
    },
    {
        id:       'phase-coding',
        group:    'Software Phase Development',
        name:     'Implementation (Coding)',
        percent:  52.0,
        roleId:   'programmer',
        roleName: 'Programmer',
        rate:     ROLE_RATES_2023.programmer,
    },
    {
        id:       'phase-accept',
        group:    'Software Phase Development',
        name:     'Acceptance & Installation',
        percent:  5.5,
        roleId:   'system_analyst',
        roleName: 'System Analyst',
        rate:     ROLE_RATES_2023.system_analyst,
    },

    // ── Ongoing Life-Cycle Activity ───────────────────────────────────────────
    {
        id:       'phase-pm',
        group:    'Ongoing life-cycle activity',
        name:     'Project Management',
        percent:  3.8,
        roleId:   'project_manager',
        roleName: 'Project Manager',
        rate:     ROLE_RATES_2023.project_manager,
    },
    {
        id:       'phase-config',
        group:    'Ongoing life-cycle activity',
        name:     'Configuration Management',
        percent:  4.3,
        roleId:   'config_manager',
        roleName: 'System Analyst',
        rate:     ROLE_RATES_2023.config_manager,
    },
    {
        id:       'phase-doc',
        group:    'Ongoing life-cycle activity',
        name:     'Documentation',
        percent:  8.4,
        roleId:   'technical_writer',
        roleName: 'Technical Writer',
        rate:     ROLE_RATES_2023.technical_writer,
    },
    {
        id:       'phase-training',
        group:    'Ongoing life-cycle activity',
        name:     'Training & Technical Support',
        percent:  1.0,
        roleId:   'technical_writer',
        roleName: 'Technical Writer',
        rate:     ROLE_RATES_2023.technical_writer,
    },

    // ── Quality and Testing Phases ────────────────────────────────────────────
    {
        id:       'phase-int-test',
        group:    'Quality and testing phases',
        name:     'Integrated Testing',
        percent:  7.0,
        roleId:   'tester',
        roleName: 'Tester',
        rate:     ROLE_RATES_2023.tester,
    },
    {
        id:       'phase-qa',
        group:    'Quality and testing phases',
        name:     'Quality Assurance',
        percent:  0.9,
        roleId:   'tester',
        roleName: 'Tester',
        rate:     ROLE_RATES_2023.tester,
    },
    {
        id:       'phase-eval',
        group:    'Quality and testing phases',
        name:     'Evaluation & Testing',
        percent:  2.0,
        roleId:   'tester',
        roleName: 'Tester',
        rate:     ROLE_RATES_2023.tester,
    },
    // Total: 100%
];


// ─── NEW: BUSINESS VALUE OPTIONS (PPS) ────────────────────────────────────────
// Used in Tab Penelitian section 3 — Business Value vs Effort matrix

export const BV_OPTIONS = {
    efficiency: [
        { label: 'BPR (Bisnis Proses Reengineering)', score: 4 },
        { label: 'Kapabilitas Baru',                  score: 3 },
        { label: 'Otomasi',                           score: 2 },
        { label: 'Penggunaan Aplikasi Existing',      score: 1 },
    ],
    users: [
        { label: 'Pengguna Jasa',         score: 4 },
        { label: 'Pegawai Bea Cukai',     score: 3 },
        { label: 'Pimpinan',              score: 2 },
        { label: 'Satuan Kerja Terbatas', score: 1 },
    ],
    regulatory: [
        { label: 'UU/ Instruksi Presiden',             score: 5 },
        { label: 'Peraturan Baru dan Mendesak',        score: 5 },
        { label: 'Berimplikasi Hukum (Temuan APH)',    score: 4 },
        { label: 'Rekomendasi APF',                    score: 4 },
        { label: 'Inisiatif Strategis (RBTK & TPRKC)', score: 3 },
        { label: 'Quick Win',                          score: 2 },
        { label: 'Permintaan AdHoc (Dirjen)',          score: 2 },
        { label: 'Reengineering',                      score: 1 },
        { label: 'Optimasi',                           score: 1 },
    ],
    bia: [
        { label: 'IKU DJBC',   score: 2 },
        { label: 'IKU Satker', score: 1 },
    ],
};


// ─── NEW: EFFORT OPTIONS (IKC) ────────────────────────────────────────────────
// Used in Tab Penelitian section 3 — Business Value vs Effort matrix
// Note: Duration score is inverted so longer timeline = higher effort score/risk

export const EFFORT_OPTIONS = {
    duration: [
        { label: '< 3 bulan',  score: 1 },
        { label: '3-6 bulan',  score: 2 },
        { label: '6-9 bulan',  score: 3 },
        { label: '9-12 bulan', score: 4 },
        { label: '> 12 bulan', score: 5 },
    ],
    technology: [
        { label: 'Teknologi Existing', score: 1 },
        { label: 'Teknologi Baru',     score: 2 },
    ],
    systems: [
        { label: 'Tidak ada',        score: 1 },
        { label: '1 Sistem Terkait', score: 2 },
        { label: '2-5 sistem',       score: 3 },
        { label: '> 5 sistem',       score: 4 },
    ],
    strategy: [
        { label: 'Insource',   score: 2 },
        { label: 'Outsource',  score: 1 },
        { label: 'Squad Team', score: 1 },
    ],
};
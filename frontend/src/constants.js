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
// Used only to initialise the tcfImpacts state shape in App.jsx.
// Actual TCF value is locked at 0.87 per IKC standard (see calc in App.jsx).

export const TCF_FACTORS = [
    { id: 'T1',  name: 'Distributed System'          },
    { id: 'T2',  name: 'Response / Throughput'       },
    { id: 'T3',  name: 'End-User Efficiency'         },
    { id: 'T4',  name: 'Complex Internal Processing' },
    { id: 'T5',  name: 'Reusability'                 },
    { id: 'T6',  name: 'Easy Installation'           },
    { id: 'T7',  name: 'Easy Operational Use'        },
    { id: 'T8',  name: 'Portability'                 },
    { id: 'T9',  name: 'Easy to Change'              },
    { id: 'T10', name: 'Concurrency'                 },
    { id: 'T11', name: 'Special Security Features'   },
    { id: 'T12', name: 'Direct Access for 3rd Party' },
    { id: 'T13', name: 'Special User Training'       },
];


// ─── EF FACTORS (Environmental / Experience) ─────────────────────────────────
// Used only to initialise the efImpacts state shape in App.jsx.
// Actual EF value is locked at 0.77 per IKC standard (see calc in App.jsx).

export const EF_FACTORS = [
    { id: 'E1', name: 'Familiar with UML'            },
    { id: 'E2', name: 'Application Experience'       },
    { id: 'E3', name: 'OO Programming Experience'    },
    { id: 'E4', name: 'Lead Analyst Capability'      },
    { id: 'E5', name: 'Motivation'                   },
    { id: 'E6', name: 'Stable Requirements'          },
    { id: 'E7', name: 'Part-time Workers'            },
    { id: 'E8', name: 'Difficult Programming Language'},
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


// ─── BUSINESS VALUE OPTIONS ───────────────────────────────────────────────────
// Used in Tab Penelitian section 6 — Business Value vs Effort matrix

export const BV_OPTIONS = {
    efficiency: [
        { label: 'Low',    score: 1 },
        { label: 'Med',    score: 3 },
        { label: 'High',   score: 5 },
    ],
    users: [
        { label: '<100',      score: 1 },
        { label: '100-500',   score: 3 },
        { label: '>500',      score: 5 },
    ],
    regulatory: [
        { label: 'None',        score: 1 },
        { label: 'Recommended', score: 3 },
        { label: 'Mandatory',   score: 5 },
    ],
    bia: [
        { label: 'Low',      score: 1 },
        { label: 'Med',      score: 3 },
        { label: 'Critical', score: 5 },
    ],
};


// ─── EFFORT OPTIONS ───────────────────────────────────────────────────────────
// Used in Tab Penelitian section 6 — Business Value vs Effort matrix

export const EFFORT_OPTIONS = {
    duration: [
        { label: '<3 Months',  score: 1 },
        { label: '3-6 Months', score: 3 },
        { label: '>6 Months',  score: 5 },
    ],
    technology: [
        { label: 'Existing', score: 1 },
        { label: 'Partial',  score: 3 },
        { label: 'New',      score: 5 },
    ],
    systems: [
        { label: 'None',     score: 1 },
        { label: '1-2',      score: 3 },
        { label: '3+',       score: 5 },
    ],
    strategy: [
        { label: 'High',   score: 1 },
        { label: 'Medium', score: 3 },
        { label: 'Low',    score: 5 },
    ],
};
import React, { useState, useMemo, useCallback } from 'react';
import {
  Bot, Download, FileText, Settings, Shield,
  Users, Zap, Loader2, ChevronRight, Upload,
  X, CheckCircle2, AlertCircle, Cpu, Sparkles,
} from 'lucide-react';
import { ConfigProvider, theme as antdTheme, Modal, message } from 'antd';

import LandingPageV2 from './components/LandingPageV2.jsx';
import TokenUsageDisplay from './components/TokenUsageDisplay.jsx';
import TokenBudgetMonitor from './components/TokenBudgetMonitor.jsx';
import AIModelMonitor from './components/AIModelMonitor.jsx';
import ThreeTierPipelineMonitor from './components/ThreeTierPipelineMonitor.jsx';
import SectionWithAIFill from './components/SectionWithAIFill.jsx';
import { TabKajian }     from './components/TabKajian.jsx';
import { TabPenelitian } from './components/TabPenelitian.jsx';
import { TabBRD }        from './components/TabBRD.jsx';
import { TabFSD }        from './components/TabFSD.jsx';
import { TabCharter }    from './components/TabCharter.jsx';

import { DualAICoordinator } from './utils/dualAIFiller';
import ThreeTierPipelineOrchestrator from './utils/threeTierOrchestrator';

import {
  ROLE_RATES_2023,
  PHASE_DISTRIBUTION,
  getUseCaseComplexity,
  getActorComplexity,
  TCF_FACTORS,
  EF_FACTORS,
} from './constants.js';

import { processDocumentWithAI }   from './utils/aiProcessor.js';
import { extractDocumentPages }    from './utils/fileHelpers.js';
import { generateExcelDocument }   from './utils/excelGenerator.js';
import { SectionAIGenerator, TokenBudgetTracker, SECTION_DEFINITIONS } from './utils/sectionAIFiller.js';
import beaCukaiTheme from './theme/antdTheme.js';

// ─── Config ──────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const TABS = [
  { id: 'kajian',     label: 'Kajian Kebutuhan', short: 'Kajian',     icon: FileText,  step: '01' },
  { id: 'penelitian', label: 'Penelitian (UCP)',  short: 'Penelitian', icon: Zap,       step: '02' },
  { id: 'brd',        label: 'BRD',               short: 'BRD',        icon: Users,     step: '03' },
  { id: 'fsd',        label: 'FSD',               short: 'FSD',        icon: Settings,  step: '04' },
  { id: 'charter',    label: 'Project Charter',   short: 'Charter',    icon: Shield,    step: '05' },
];

// ─── Initial project state factory ───────────────────────────────────────────
const makeInitialProject = () => ({
  nama:                'Pengembangan Modul Baru CEISA 4.0',
  pengampu:            'Direktorat Informasi Kepabeanan dan Cukai',
  unitPenanggungJawab: 'Subdirektorat Pengembangan Sistem Informasi',
  namaPIC:             '',
  kontakPIC:           '',
  latarBelakang:       '',
  masalahIsu:          '',
  targetPenyelesaian:  '',
  targetOutcome:       '',
  outcomeKeluaran:     '',
  businessValue:       '',
  alurBisnisProses:    '',
  phm: 20,

  actors:    [],
  useCases:  [],
  tcfImpacts: TCF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
  efImpacts:  EF_FACTORS.reduce((acc, f)  => ({ ...acc, [f.id]: 3 }), {}),

  bvEffort: {
    efficiency:  { label: 'Med',          score: 3 },
    users:       { label: '100-500',      score: 3 },
    regulatory:  { label: 'Recommended', score: 3 },
    bia:         { label: 'Med',          score: 3 },
    duration:    { label: '3-6 Months',   score: 3 },
    technology:  { label: 'Existing',     score: 1 },
    systems:     { label: 'None',         score: 1 },
    strategy:    { label: 'High',         score: 1 },
  },

  kakStructure: PHASE_DISTRIBUTION.map((p, i) => ({
    id: `phase-${i}`,
    ...p,
    rate: ROLE_RATES_2023[p.roleId] || 20_000_000,
  })),

  brdProcessAnalysis: { modul: '', subModul: '', eaMapping: '', notes: '' },
  asIsToBe:               [],
  kebutuhanFungsional:    [],
  kebutuhanNonFungsional: [],
  risikoBisnis:           [],

  bia: {
    operasional: 'Medium', finansial: 'Low',
    reputasi:    'Medium', hukum:     'Low',
    rto: '4h', rpo: '24h',
  },

  mermaid: {
    processFlow: `flowchart TD
    subgraph "Proses Bisnis Impor Sementara"
        A["Permohonan Izin Impor Sementara"] --> B{"Proses Perizinan"}
        B --> C["Pemberitahuan Pabean Impor"]
        C --> D["Pembayaran Pungutan Negara"]
        D --> E["Penjaminan"]
        E --> F["Pemeriksaan Pabean"]
        F --> G["Manajemen Risiko"]
        G --> H["Pengawasan"]
        H --> I["Pengauditan"]
        I --> J["Penyelesaian Kewajiban Pabean\\nEkspor Kembali / Lainnya"]
        B --> K["Permohonan Perpanjangan Izin"]
        B --> L["Permohonan Perubahan Tujuan Penggunaan"]
        B --> M["Permohonan Pindah Lokasi Penggunaan"]
        J --> N["Pemberitahuan Pabean Ekspor"]
    end`,
    useCaseDiagram: `flowchart LR
    Importir(["👤 Importir"])
    KantorPabean(["👤 Kantor Pabean"])
    KantorWilayah(["🏢 Kantor Wilayah"])
    subgraph "Modul IMSAMA"
        UC1["UC1: Permohonan Izin\\nImpor Sementara"]
        UC2["UC2: Perpanjangan\\nJangka Waktu Izin"]
        UC3["UC3: Perubahan\\nTujuan Penggunaan"]
        UC4["UC4: Pindah\\nLokasi Penggunaan"]
        UC5["UC5: Pengawasan\\nImpor Sementara"]
        UC6["UC6: Monitoring\\nImpor Sementara"]
        UC7["UC7: Penyelesaian\\nKewajiban Pabean"]
    end
    Importir --> UC1 & UC2 & UC3 & UC4 & UC7
    KantorPabean --> UC1 & UC2 & UC3 & UC4 & UC5 & UC7
    KantorWilayah --> UC6`,
    erd: `erDiagram
    IMPORTIR {
        string ID_IMPORTIR PK
        string NAMA
        string NPWP
    }
    IZIN_IMPOR_SEMENTARA {
        string ID_IZIN PK
        string ID_IMPORTIR FK
        string ID_KANTOR FK
        date TANGGAL_PENGAJUAN
    }
    BARANG_IMPOR {
        string ID_BARANG PK
        string ID_IZIN FK
        string NAMA_BARANG
    }
    IMPORTIR ||--o{ IZIN_IMPOR_SEMENTARA : "mengajukan"
    IZIN_IMPOR_SEMENTARA ||--o{ BARANG_IMPOR : "terkait dengan"`,
  },

  fsdProcess:    { asIs: '', toBe: '' },
  fsdMockups:    [],
  fsdAccessRights: [],
  fsdDesign: [
    { id: 'd1', item: 'Use Case Diagram', pic: '', link: '' },
    { id: 'd2', item: 'Activity Diagram', pic: '', link: '' },
    { id: 'd3', item: 'Class Diagram',    pic: '', link: '' },
    { id: 'd4', item: 'Data Model / ERD', pic: '', link: '' },
  ],
  fsdSourceCode: { pic: '', link: '' },

  charter: {
    scope:           '',
    outOfScope:      '',
    supportingReqs:  '',
    specialReqs:     '',
    bizProcessOwner: '',
    stakeholders:    '',
    endUsers:        '',
    benefits:        '',
    risks:           '',
    constraints:     '',
    assumptions:     '',
    timeline: [
      { id: 1, milestone: 'Analisis & Desain', start: '', end: '', note: '' },
      { id: 2, milestone: 'Development',       start: '', end: '', note: '' },
      { id: 3, milestone: 'Testing & UAT',     start: '', end: '', note: '' },
      { id: 4, milestone: 'Deployment',        start: '', end: '', note: '' },
    ],
    team: [
      { id: 1, name: '', role: 'Project Manager', responsibility: 'Manajemen Proyek' },
      { id: 2, name: '', role: 'System Analyst',  responsibility: 'Analisis & Desain' },
      { id: 3, name: '', role: 'Developer',       responsibility: 'Coding & Integrasi' },
    ],
  },

  signatures: {
    date:       '',
    approvedBy: { name: '', nip: '', role: '' },
    preparedBy: { name: '', nip: '', role: '' },
  },
});

// ─── Upload status enum ───────────────────────────────────────────────────────
const STATUS = { IDLE: 'idle', EXTRACTING: 'extracting', ANALYZING: 'analyzing', DONE: 'done', ERROR: 'error' };

// ─── AI Array Normalizer ──────────────────────────────────────────────────────
const formatAIArray = (arr, prefix) => {
  if (!Array.isArray(arr)) return [];
  
  return arr.map((item, i) => {
    const fallbackId = `${prefix}_${Date.now()}_${i}`;
    
    // Fallback if AI returned a flat array of strings
    if (typeof item === 'string') {
      return { 
        id: fallbackId, 
        kebutuhan: item, 
        deskripsi: item,
        risk: item,
        prioritas: 'Medium' 
      };
    }
    
    // Standardize objects and guarantee an ID, mapping common variations
    return { 
      ...item, 
      id: item.id || fallbackId,
      // Aggressively map to 'kebutuhan' so it shows up in TabKajian table
      kebutuhan: item.kebutuhan || item.deskripsi || item.description || item.requirement || '',
      deskripsi: item.deskripsi || item.kebutuhan || item.description || item.requirement || '',
      prioritas: item.prioritas || 'Medium'
    };
  });
};

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,    setActiveTab]    = useState('kajian');
  const [uploadStatus, setUploadStatus] = useState(STATUS.IDLE);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError,  setUploadError]  = useState(null);
  const [aiMeta,       setAiMeta]       = useState({ usedModel: null, usage: null, log: [] });
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [project,      setProject]      = useState(makeInitialProject);
  const [showLanding,  setShowLanding]  = useState(true);

  // ─── Section AI Filling State ────────────────────────────────────────────
  const [currentDocumentText, setCurrentDocumentText] = useState('');
  const [tokenBudget, setTokenBudget] = useState({
    total: 0,
    remaining: 1.0,
    budgetCap: 1.0,
    breakdown: {},
  });
  const [loadingSections, setLoadingSections] = useState(new Set());
  const [filledSections, setFilledSections] = useState(new Set());
  const [showTokenMonitor, setShowTokenMonitor] = useState(false);
  
  // ─── Three-Tier AI Pipeline State ─────────────────────────────────
  const [threeTierOrchestrator, setThreeTierOrchestrator] = useState(
    new ThreeTierPipelineOrchestrator(1.0)
  );
  const [threeTierUsage, setThreeTierUsage] = useState(null);
  const [threeTierActive, setThreeTierActive] = useState(false);

  const isLoading = uploadStatus === STATUS.EXTRACTING || uploadStatus === STATUS.ANALYZING;

  // ─── Derived calculations ───────────────────────────────────────────────
  const calc = useMemo(() => {
    const uaw  = (project.actors   || []).reduce((s, a)  => s + (getActorComplexity(a.type)?.weight   || 0), 0);
    const uucw = (project.useCases || []).reduce((s, uc) => s + (getUseCaseComplexity(uc.transactions)?.weight || 0), 0);
    const uucp = uaw + uucw;
    const tcf  = 0.87;
    const ef   = 0.77;
    const ucp  = uucp * tcf * ef;

    const totalPersonHours = ucp * (project.phm || 20);
    const workingDays      = totalPersonHours / 8;
    const totalManMonths   = workingDays / 22;

    const kakTableData = (project.kakStructure || []).map(item => {
      const effortMM = ((item.percent || 0) / 100) * totalManMonths;
      const cost     = effortMM * (item.rate || 0);
      return { ...item, effortMM, cost };
    });

    const runningTotalCost = kakTableData.reduce((s, i) => s + i.cost, 0);
    const warrantyCost     = runningTotalCost * 0.25;
    const subTotal         = runningTotalCost + warrantyCost;
    const ppn              = subTotal * 0.11;
    const grandTotal       = subTotal + ppn;

    const bvValues    = Object.values(project.bvEffort || {});
    const totalBV     = bvValues.slice(0, 4).reduce((s, v) => s + (v.score || 0), 0);
    const totalEffort = bvValues.slice(4).reduce((s, v) => s + (v.score || 0), 0);
    const ratio       = totalBV / (totalEffort || 1);
    const priority    = ratio > 2 ? 'P1 (Critical)' : ratio > 1 ? 'P2 (High)' : 'P3 (Low)';

    return {
      uaw, uucw, uucp, tcf, ef, ucp,
      totalPersonHours, workingDays, totalManMonths,
      kakTableData, runningTotalCost, warrantyCost, subTotal, ppn, grandTotal,
      totalBV, totalEffort, priority,
    };
  }, [project]);

  // ─── Mermaid cleaner ────────────────────────────────────────────────────
  const cleanMermaid = (code) => {
    if (!code) return '';
    return code
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '  ')
      .replace(/<(bos|eos|pad|unk|s|\/s)>/gi, '')
      .replace(/;(\s*\n)/g, '$1')
      .trim();
  };

  // ─── File upload & AI analysis ──────────────────────────────────────────
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    // Reset input so same file can be re-uploaded
    e.target.value = '';
    if (!file) return;

    if (!API_KEY) {
      setUploadError('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env.local file and restart the dev server.');
      setUploadStatus(STATUS.ERROR);
      return;
    }

    setUploadError(null);
    setUploadedFile(null);
    setUploadStatus(STATUS.EXTRACTING);

    // Reset token tracking for new document
    setCurrentDocumentText('');
    setTokenBudget({ total: 0, remaining: 1.0, budgetCap: 1.0, breakdown: {} });
    setLoadingSections(new Set());
    setFilledSections(new Set());
    
    // Reset three-tier orchestrator
    const newOrchestrator = new ThreeTierPipelineOrchestrator(1.0);
    setThreeTierOrchestrator(newOrchestrator);
    setThreeTierUsage(null);
    setThreeTierActive(false);

    try {
      // Step 1 — extract pages (page-aware)
      const extracted = await extractDocumentPages(file);

      if (!extracted.fullText || extracted.fullText.trim().length < 50) {
        throw new Error('Gagal mengekstrak teks dari file. Dokumen mungkin berupa scan gambar atau terenkripsi.');
      }

      console.log(`📄 Extracted ${extracted.parsedPages} pages (${extracted.totalPages} total) from "${file.name}"`);

      // Store document text for section AI filling
      setCurrentDocumentText(extracted.fullText);

      // Step 2 — two-pass AI analysis (LEGACY: can be replaced with three-tier)
      setUploadStatus(STATUS.ANALYZING);
      const result = await processDocumentWithAI(
        API_KEY,
        extracted,                          // pass full page object, not just string
        (msg) => console.log('[AI]', msg),  // progress logger
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Analisis AI gagal tanpa pesan error.');
      }

      const ai = result.data;
      setAiMeta({
        usedModel:     result.usedModel,
        triageModel:   result.triageModel,
        usage:         result.usage,
        selectedPages: result.selectedPages,
        totalPages:    result.totalPages,
        log:           result.log,
      });

      // Step 3 — merge AI output into project state with safe array formatting
      setProject(prev => {
        // Evaluate the requirements arrays first to handle both ID/EN keys
        const kfSource = (Array.isArray(ai.kebutuhanFungsional) && ai.kebutuhanFungsional.length > 0) ? ai.kebutuhanFungsional : 
                         (Array.isArray(ai.functionalRequirements) && ai.functionalRequirements.length > 0) ? ai.functionalRequirements : null;
                         
        const nfrSource = (Array.isArray(ai.kebutuhanNonFungsional) && ai.kebutuhanNonFungsional.length > 0) ? ai.kebutuhanNonFungsional : 
                          (Array.isArray(ai.nonFunctionalRequirements) && ai.nonFunctionalRequirements.length > 0) ? ai.nonFunctionalRequirements : null;

        return {
          ...prev,
          nama:                ai.nama                || prev.nama,
          pengampu:            ai.pengampu            || prev.pengampu,
          unitPenanggungJawab: ai.unitPenanggungJawab || prev.unitPenanggungJawab,
          namaPIC:             ai.namaPIC             || prev.namaPIC,
          kontakPIC:           ai.kontakPIC           || prev.kontakPIC,
          latarBelakang:       ai.latarBelakang       || prev.latarBelakang,
          masalahIsu:          ai.masalahIsu          || prev.masalahIsu,
          targetPenyelesaian:  ai.targetPenyelesaian  || prev.targetPenyelesaian,
          targetOutcome:       ai.targetOutcome       || prev.targetOutcome,
          outcomeKeluaran:     ai.outcomeKeluaran     || prev.outcomeKeluaran,
          businessValue:       ai.businessValue       || prev.businessValue,
          alurBisnisProses:    ai.alurBisnisProses    || prev.alurBisnisProses,
          bia:                 ai.bia                 || prev.bia,

          // Safely map arrays so they always have IDs and correct structure
          kebutuhanFungsional:    kfSource ? formatAIArray(kfSource, 'kf') : prev.kebutuhanFungsional,
          kebutuhanNonFungsional: nfrSource ? formatAIArray(nfrSource, 'nfr') : prev.kebutuhanNonFungsional,
          risikoBisnis:           Array.isArray(ai.risikoBisnis) && ai.risikoBisnis.length > 0 ? formatAIArray(ai.risikoBisnis, 'rb') : prev.risikoBisnis,
          actors:                 Array.isArray(ai.actors) && ai.actors.length > 0 ? formatAIArray(ai.actors, 'act') : prev.actors,
          useCases:               Array.isArray(ai.useCases) && ai.useCases.length > 0 ? formatAIArray(ai.useCases, 'uc') : prev.useCases,
          
          asIsToBe:               ai.asIsToBe?.length               ? ai.asIsToBe               : prev.asIsToBe,
          brdProcessAnalysis:     ai.brdProcessAnalysis             || prev.brdProcessAnalysis,

          mermaid: {
            processFlow:    cleanMermaid(ai.mermaid?.processFlow)    || prev.mermaid.processFlow,
            useCaseDiagram: cleanMermaid(ai.mermaid?.useCaseDiagram) || prev.mermaid.useCaseDiagram,
            erd:            cleanMermaid(ai.mermaid?.erd)            || prev.mermaid.erd,
          },

          fsdProcess: {
            asIs: ai.fsdLinks?.diagrams || prev.fsdProcess.asIs,
            toBe: prev.fsdProcess.toBe,
          },
          fsdSourceCode: {
            ...prev.fsdSourceCode,
            link: ai.fsdLinks?.repo || prev.fsdSourceCode.link,
          },

          charter: {
            ...prev.charter,
            scope:    ai.alurBisnisProses || prev.charter.scope,
            benefits: ai.businessValue    || prev.charter.benefits,
            risks:    Array.isArray(ai.risikoBisnis) && ai.risikoBisnis.length
              ? ai.risikoBisnis.map(r => r.risk).join('\n')
              : prev.charter.risks,
            team: ai.detectedPeople?.length
              ? ai.detectedPeople.map((p, i) => ({
                  id:             Date.now() + i,
                  name:           p.name,
                  role:           p.role || 'Anggota Tim',
                  responsibility: 'Pelaksana Proyek',
                }))
              : prev.charter.team,
          },
        };
      });

      setUploadedFile(file.name);
      setUploadStatus(STATUS.DONE);
      setActiveTab('kajian');

    } catch (err) {
      console.error('Upload/AI Error:', err);
      setUploadError(err.message || 'Terjadi kesalahan yang tidak diketahui.');
      setUploadStatus(STATUS.ERROR);
      setUploadedFile(null);
    }
  }, []);

  // ─── Section AI Filling Handler ──────────────────────────────────────────
  const handleFillSectionWithAI = useCallback(async (sectionKey) => {
    if (!currentDocumentText) {
      message.error('Tidak ada dokumen untuk dianalisis. Silakan upload dokumen terlebih dahulu.');
      return;
    }

    const section = SECTION_DEFINITIONS[sectionKey];
    if (!section) {
      message.error(`Bagian tidak dikenal: ${sectionKey}`);
      return;
    }

    // Check budget
    const estimate = TokenBudgetTracker.estimateSectionCost(sectionKey);
    if (tokenBudget.total + estimate.cost > tokenBudget.budgetCap) {
      message.error(`Tidak bisa generate: akan melebihi budget $${tokenBudget.budgetCap}. Sisa budget: $${tokenBudget.remaining.toFixed(4)}`);
      return;
    }

    // Set loading state
    setLoadingSections(prev => new Set(prev).add(sectionKey));

    try {
      const result = await SectionAIGenerator.fillSection(
        API_KEY,
        sectionKey,
        currentDocumentText,
        (progress) => console.log(progress)
      );

      if (result.success) {
        // Update project state with AI results
        setProject(prev => {
          const updated = { ...prev };
          const field = section.parseField;

          // Handle nested fields like mermaid.processFlow
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            updated[parent] = { ...updated[parent], [child]: result.data };
          } else {
            // Handle array fields (actors, useCases, etc.)
            if (Array.isArray(result.data)) {
              updated[field] = formatAIArray(result.data, field.substring(0, 3));
            } else {
              updated[field] = result.data;
            }
          }

          return updated;
        });

        // Update token budget
        setTokenBudget(prev => ({
          ...prev,
          total: prev.total + result.cost.totalCost,
          remaining: tokenBudget.budgetCap - (prev.total + result.cost.totalCost),
          breakdown: {
            ...prev.breakdown,
            [sectionKey]: result.cost,
          },
        }));

        // Mark as filled
        setFilledSections(prev => new Set(prev).add(sectionKey));
        message.success(`✅ ${section.label} berhasil di-generate`);
      } else {
        message.error(`Gagal generate ${section.label}`);
      }
    } catch (error) {
      console.error(`Error filling ${sectionKey}:`, error);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoadingSections(prev => {
        const updated = new Set(prev);
        updated.delete(sectionKey);
        return updated;
      });
    }
  }, [currentDocumentText, API_KEY, tokenBudget.budgetCap, tokenBudget.total, tokenBudget.remaining]);

  // ─── Array CRUD helpers ─────────────────────────────────────────────────
  const handleUpdateArray = useCallback((name, id, field, value) => {
    setProject(prev => ({
      ...prev,
      [name]: (prev[name] || []).map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  }, []);

  const handleAddArray = useCallback((name, newItem) => {
    setProject(prev => ({ ...prev, [name]: [...(prev[name] || []), newItem] }));
  }, []);

  const handleRemoveArray = useCallback((name, id) => {
    setProject(prev => ({ ...prev, [name]: (prev[name] || []).filter(i => i.id !== id) }));
  }, []);

  // ─── Three-Tier AI Pipeline Handler - DISABLED ────────────────────────────
  const handleRunThreeTierPipeline = useCallback(async () => {
    if (!currentDocumentText) {
      message.error('Tidak ada dokumen. Silakan upload dokumen terlebih dahulu.');
      return;
    }

    setThreeTierActive(true);

    try {
      // Define target sections for distribution
      const targetSections = [
        { tab: 'penelitian', field: 'actors', label: 'Actors', key: 'actors' },
        { tab: 'penelitian', field: 'useCases', label: 'Use Cases', key: 'useCases' },
        { tab: 'kajian', field: 'kebutuhanFungsional', label: 'Kebutuhan Fungsional', key: 'kebutuhanFungsional' },
        { tab: 'brd', field: 'asIsToBe', label: 'As-Is / To-Be', key: 'asIsToBe' },
        { tab: 'fsd', field: 'processFlow', label: 'Process Flow', key: 'processFlow' },
        { tab: 'fsd', field: 'useCaseDiagram', label: 'Use Case Diagram', key: 'useCaseDiagram' },
        { tab: 'fsd', field: 'erd', label: 'ERD', key: 'erd' },
      ];

      // Progress callback
      const onProgress = (data) => {
        console.log('[Three-Tier Progress]', data);
        // Emit event for monitor
        window.dispatchEvent(new CustomEvent('threeTierProgress', { detail: data }));
      };

      // Run pipeline
      const result = await threeTierOrchestrator.processThroughPipeline(
        currentDocumentText,
        targetSections,
        onProgress
      );

      if (result.success) {
        setThreeTierUsage(result.usage);

        // Merge results into project
        setProject(prev => {
          let updated = { ...prev };

          // Apply distributions to project
          if (result.distributions) {
            result.distributions.forEach(dist => {
              if (dist.status === 'distributed') {
                const { tab, field, data } = dist;
                
                if (tab === 'penelitian') {
                  if (field === 'actors' || field === 'useCases') {
                    updated[field] = Array.isArray(data) ? formatAIArray(data, field.substring(0, 3)) : data;
                  }
                } else if (tab === 'kajian') {
                  if (field === 'kebutuhanFungsional') {
                    updated[field] = Array.isArray(data) ? formatAIArray(data, 'kf') : data;
                  }
                } else if (tab === 'brd') {
                  if (field === 'asIsToBe') {
                    updated[field] = Array.isArray(data) ? data : [data];
                  }
                } else if (tab === 'fsd') {
                  if (field.includes('Flow') || field.includes('Diagram') || field === 'erd') {
                    updated.mermaid = {
                      ...updated.mermaid,
                      [field]: typeof data === 'string' ? cleanMermaid(data) : data
                    };
                  }
                }
              }
            });
          }

          return updated;
        });

        message.success(`✅ Pipeline selesai: ${result.distributions.filter(d => d.status === 'distributed').length} seksi terisi`);
        setFilledSections(prev => new Set([...prev, ...targetSections.map(s => s.key)]));
      }
    } catch (error) {
      console.error('Three-Tier Pipeline Error:', error);
      message.error(`Pipeline error: ${error.message}`);
    } finally {
      setThreeTierActive(false);
    }
  }, [currentDocumentText, threeTierOrchestrator, cleanMermaid]);

  // ─── Upload status helpers ──────────────────────────────────────────────
  const statusLabel = {
    [STATUS.IDLE]:      uploadedFile ? uploadedFile.substring(0, 20) + (uploadedFile.length > 20 ? '…' : '') : 'Import TOR / KAK',
    [STATUS.EXTRACTING]: 'Membaca dokumen…',
    [STATUS.ANALYZING]:  'Claude menganalisis…',
    [STATUS.DONE]:       uploadedFile ? uploadedFile.substring(0, 20) + (uploadedFile.length > 20 ? '…' : '') : 'Selesai',
    [STATUS.ERROR]:      'Upload Gagal',
  }[uploadStatus];

  const activeTabData = TABS.find(t => t.id === activeTab);

  // ─── Render ─────────────────────────────────────────────────────────────  // Show landing page if first visit
  if (showLanding) {
    return <LandingPageV2 onEnter={() => setShowLanding(false)} />;
  }
  return (
    <ConfigProvider theme={beaCukaiTheme}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--kt-bg)' }}>

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <aside style={{
        width:           sidebarOpen ? 'var(--kt-sidebar-width)' : '72px',
        background:      'var(--kt-sidebar-bg)',
        display:         'flex',
        flexDirection:   'column',
        flexShrink:      0,
        transition:      'width 0.25s ease',
        overflow:        'hidden',
        position:        'sticky',
        top:             0,
        height:          '100vh',
        zIndex:          40,
      }}>

        {/* Brand */}
        <div style={{
          padding:      '0 16px',
          height:       70,
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink:   0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--kt-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Bot style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                Doc Genie
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--kt-sidebar-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                CEISA 4.0
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {sidebarOpen && (
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(157,157,181,0.5)', padding: '4px 6px 10px' }}>
              Dokumen Proyek
            </div>
          )}

          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`kt-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              title={!sidebarOpen ? tab.label : undefined}
              style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            >
              <tab.icon style={{ flexShrink: 0 }} />
              {sidebarOpen && (
                <>
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: activeTab === tab.id ? 'rgba(110,168,255,0.6)' : 'rgba(157,157,181,0.35)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {tab.step}
                  </span>
                </>
              )}
            </button>
          ))}

          {/* Divider */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }} />

          {/* Download Excel */}
          <button
            onClick={() => generateExcelDocument(project, calc)}
            className="kt-nav-item"
            title={!sidebarOpen ? 'Download Excel' : undefined}
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
          >
            <Download style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Download Excel</span>}
          </button>

          {/* Upload TOR */}
          <label
            className={`kt-nav-item ${isLoading ? 'disabled' : ''}`}
            style={{
              cursor:          isLoading ? 'not-allowed' : 'pointer',
              justifyContent:  sidebarOpen ? 'flex-start' : 'center',
              opacity:         isLoading ? 0.7 : 1,
              color:           uploadStatus === STATUS.ERROR
                ? 'var(--kt-danger)'
                : uploadStatus === STATUS.DONE
                  ? 'var(--kt-success)'
                  : undefined,
            }}
            title={!sidebarOpen ? 'Import TOR' : undefined}
          >
            {isLoading
              ? <Loader2 className="kt-spin" style={{ flexShrink: 0, width: 16, height: 16 }} />
              : uploadStatus === STATUS.DONE
                ? <Sparkles style={{ flexShrink: 0, width: 16, height: 16 }} />
                : uploadStatus === STATUS.ERROR
                  ? <AlertCircle style={{ flexShrink: 0, width: 16, height: 16 }} />
                  : <Upload style={{ flexShrink: 0 }} />
            }
            {sidebarOpen && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{statusLabel}</span>}
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.docx"
              disabled={isLoading}
            />
          </label>
        </nav>

        {/* AI model badge */}
        {sidebarOpen && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 7, padding: '5px 10px',
            }}>
              <Cpu style={{ width: 12, height: 12, color: '#a5b4fc', flexShrink: 0 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.04em' }}>
                Claude Opus
              </span>
              {aiMeta.usage && (
                <span style={{ fontSize: 9, color: 'rgba(165,180,252,0.6)', marginLeft: 'auto' }}>
                  {(aiMeta.usage.output_tokens || 0).toLocaleString()} tok
                </span>
              )}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="kt-nav-item"
            style={{ justifyContent: 'center', width: '100%' }}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            <ChevronRight style={{
              transition: 'transform 0.25s',
              transform:  sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }} />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── TOPBAR ──────────────────────────────────────────────────── */}
        <header style={{
          height:         70,
          background:     '#ffffff',
          borderBottom:   '1px solid var(--kt-border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '0 28px',
          position:       'sticky',
          top:            0,
          zIndex:         30,
          gap:            16,
          boxShadow:      '0 1px 0 var(--kt-border)',
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--kt-text-dark)', whiteSpace: 'nowrap' }}>
              {activeTabData?.label}
            </span>
            <ChevronRight style={{ width: 14, height: 14, color: 'var(--kt-text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--kt-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
              {project.nama}
            </span>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            {/* Upload status pill */}
            {uploadStatus === STATUS.DONE && uploadedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--kt-success-light)', border: '1px solid rgba(23,198,83,0.2)', borderRadius: 8, padding: '5px 12px' }}>
                <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--kt-success)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#028a3b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {uploadedFile}
                </span>
              </div>
            )}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--kt-primary-light)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '5px 12px' }}>
                <Loader2 className="kt-spin" style={{ width: 13, height: 13, color: 'var(--kt-primary)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--kt-primary)' }}>
                  {uploadStatus === STATUS.EXTRACTING ? 'Membaca file…' : 'Claude menganalisis…'}
                </span>
              </div>
            )}

            {/* Three-Tier Pipeline Button */}
            {uploadStatus === STATUS.DONE && !isLoading && (
              <button
                onClick={handleRunThreeTierPipeline}
                disabled={threeTierActive}
                className="kt-btn kt-btn-secondary kt-btn-sm"
                title="3-tier pipeline (Extract → Analyze → Distribute)"
                style={{ opacity: threeTierActive ? 0.5 : 1, cursor: threeTierActive ? 'not-allowed' : 'pointer' }}
              >
                <Zap style={{ width: 14, height: 14 }} />
                Pipeline 3-Tier
              </button>
            )}

            {/* Export button */}
            <button
              onClick={() => generateExcelDocument(project, calc)}
              className="kt-btn kt-btn-primary kt-btn-sm"
            >
              <Download style={{ width: 14, height: 14 }} />
              Export Excel
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

          {/* Three-Tier Pipeline Monitor */}
          {uploadStatus === STATUS.DONE && threeTierActive && (
            <ThreeTierPipelineMonitor 
              onProgress={true}
              isActive={threeTierActive}
            />
          )}

          {/* Token Budget Monitor */}
          {showTokenMonitor && uploadStatus === STATUS.DONE && (
            <TokenBudgetMonitor
              totalCost={tokenBudget.total}
              totalTokens={Object.values(tokenBudget.breakdown || {}).reduce((a, b) => a + (b || 0), 0)}
              budgetCap={tokenBudget.budgetCap}
              sectionBreakdown={tokenBudget.breakdown}
              autoFillSections={['actors', 'useCases', 'kebutuhanFungsional', 'asIsToBe', 'processFlow', 'useCaseDiagram', 'erd']}
              filledSections={filledSections}
              showDetails={true}
            />
          )}

          {/* Error banner */}
          {uploadError && (
            <div className="kt-notice kt-notice-danger" style={{ marginBottom: 20 }}>
              <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13 }}>{uploadError}</span>
              <button
                onClick={() => { setUploadError(null); setUploadStatus(STATUS.IDLE); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kt-danger)', padding: 0, lineHeight: 1 }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}

          {/* AI usage info */}
          {uploadStatus === STATUS.DONE && aiMeta.usage && (
            <>
              <div className="kt-notice" style={{ marginBottom: 20, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12.5, color: '#4f46e5' }}>
                    Analisis selesai menggunakan <strong>{aiMeta.usedModel}</strong> — {(aiMeta.usage.input_tokens || 0).toLocaleString()} input token, {(aiMeta.usage.output_tokens || 0).toLocaleString()} output token.
                  </span>
                  <button
                    onClick={() => { setUploadStatus(STATUS.IDLE); setAiMeta({ usedModel: null, usage: null, log: [] }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 0, lineHeight: 1 }}
                  >
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
              
              {/* Detailed Token Usage Display */}
              <TokenUsageDisplay 
                usageData={aiMeta.usage}
                maxBudgetUSD={0.01}
                isLoading={false}
              />
            </>
          )}

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
            {TABS.map((tab, idx) => {
              const isActive = tab.id === activeTab;
              const isDone   = TABS.findIndex(t => t.id === activeTab) > idx;
              return (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display:         'flex',
                      alignItems:      'center',
                      gap:             8,
                      padding:         '8px 14px',
                      borderRadius:    8,
                      border:          'none',
                      cursor:          'pointer',
                      fontFamily:      'inherit',
                      fontSize:        12.5,
                      fontWeight:      isActive ? 700 : 500,
                      color:           isActive ? 'var(--kt-primary)' : isDone ? 'var(--kt-success)' : 'var(--kt-text-muted)',
                      background:      isActive ? 'var(--kt-primary-light)' : isDone ? 'var(--kt-success-light)' : 'transparent',
                      transition:      'all 0.15s',
                      whiteSpace:      'nowrap',
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10.5, fontWeight: 800,
                      background: isActive ? 'var(--kt-primary)' : isDone ? 'var(--kt-success)' : 'var(--kt-border)',
                      color:      isActive || isDone ? '#fff' : 'var(--kt-text-muted)',
                    }}>
                      {tab.step}
                    </span>
                    {tab.short}
                  </button>
                  {idx < TABS.length - 1 && (
                    <ChevronRight style={{ width: 14, height: 14, color: 'var(--kt-border)', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Loading overlay */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 20 }}>
              <div style={{ position: 'relative', width: 72, height: 72 }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'var(--kt-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot style={{ width: 32, height: 32, color: 'var(--kt-primary)' }} />
                </div>
                <Loader2
                  className="kt-spin"
                  style={{ position: 'absolute', inset: -4, width: 80, height: 80, color: 'var(--kt-primary)', opacity: 0.3 }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--kt-text-dark)' }}>
                  {uploadStatus === STATUS.EXTRACTING ? 'Membaca dokumen…' : 'Claude Opus sedang menganalisis…'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--kt-text-muted)', marginTop: 6, maxWidth: 400 }}>
                  {uploadStatus === STATUS.EXTRACTING
                    ? 'Mengekstrak teks dari file. Mohon tunggu sebentar.'
                    : 'AI sedang membaca seluruh dokumen dan menghasilkan analisis mendalam. Proses ini mungkin memakan 20–60 detik tergantung ukuran dokumen.'
                  }
                </div>
              </div>
            </div>

          ) : (
            <div className="kt-fade-in">
              {activeTab === 'kajian'     && (
                <TabKajian
                  project={project} setProject={setProject}
                  uploadedFile={uploadedFile} aiMeta={aiMeta}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                  tokenBudget={tokenBudget}
                  loadingSections={loadingSections}
                  filledSections={filledSections}
                  handleFillSectionWithAI={handleFillSectionWithAI}
                />
              )}
              {activeTab === 'penelitian' && (
                <TabPenelitian
                  project={project} setProject={setProject} calc={calc}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                  tokenBudget={tokenBudget}
                  loadingSections={loadingSections}
                  filledSections={filledSections}
                  handleFillSectionWithAI={handleFillSectionWithAI}
                />
              )}
              {activeTab === 'brd' && (
                <TabBRD
                  project={project} setProject={setProject}
                  uploadedFile={uploadedFile} calc={calc}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                  tokenBudget={tokenBudget}
                  loadingSections={loadingSections}
                  filledSections={filledSections}
                  handleFillSectionWithAI={handleFillSectionWithAI}
                />
              )}
              {activeTab === 'fsd' && (
                <TabFSD
                  project={project} setProject={setProject}
                  uploadedFile={uploadedFile}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                  tokenBudget={tokenBudget}
                  loadingSections={loadingSections}
                  filledSections={filledSections}
                  handleFillSectionWithAI={handleFillSectionWithAI}
                />
              )}
              {activeTab === 'charter' && (
                <TabCharter
                  project={project} setProject={setProject} calc={calc}
                  tokenBudget={tokenBudget}
                  loadingSections={loadingSections}
                  filledSections={filledSections}
                  handleFillSectionWithAI={handleFillSectionWithAI}
                />
              )}
            </div>
          )}
        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer style={{
          height:         44,
          borderTop:      '1px solid var(--kt-border)',
          background:     '#fff',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '0 28px',
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--kt-text-muted)', fontWeight: 600 }}>
            Internal Property of IKC Customs Indonesia © 2026
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {aiMeta.usedModel && (
              <span style={{ fontSize: 10.5, color: 'rgba(99,102,241,0.6)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {aiMeta.usedModel}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--kt-text-muted)', letterSpacing: '0.04em' }}>
              v2.1 — CEISA 4.0 Doc Genie
            </span>
          </div>
        </footer>
      </div>

    </div>
    </ConfigProvider>
  );
}
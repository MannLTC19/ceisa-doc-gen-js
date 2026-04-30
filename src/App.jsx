import React, { useState, useMemo, useCallback } from 'react';
import {
  Bot, Download, FileText, Settings, Shield,
  Users, Zap, Loader2, ChevronRight, Upload,
  X, CheckCircle2, AlertCircle, Cpu, Sparkles, Link2
} from 'lucide-react';

import { TabKajian }     from './components/TabKajian.jsx';
import { TabPenelitian } from './components/TabPenelitian.jsx';
import { TabBRD }        from './components/TabBRD.jsx';
import { TabFSD }        from './components/TabFSD.jsx';
import { TabCharter }    from './components/TabCharter.jsx';
import { TabRTM }        from './components/TabRTM.jsx'; 

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

// ─── Config ──────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const TABS = [
  { id: 'kajian',     label: 'Kajian Kebutuhan',   short: 'Kajian',     icon: FileText,  step: '01' },
  { id: 'penelitian', label: 'Penelitian (UCP)',   short: 'Penelitian', icon: Zap,       step: '02' },
  { id: 'brd',        label: 'BRD',                short: 'BRD',        icon: Users,     step: '03' },
  { id: 'charter',    label: 'Project Charter',    short: 'Charter',    icon: Shield,    step: '04' },
  { id: 'fsd',        label: 'FSD',                short: 'FSD',        icon: Settings,  step: '05' },
  { id: 'rtm',        label: 'Traceability (RTM)', short: 'RTM',        icon: Link2,     step: '06' },
];

// ─── Initial project state factory ───────────────────────────────────────────
const makeInitialProject = () => ({
  nama:                   'Pengembangan Modul Baru CEISA 4.0',
  uraianUsulan:           '',
  pengampu:               'Direktorat Informasi Kepabeanan dan Cukai',
  nomorND:                '',
  tanggalND:              '',
  tanggalPembuatan:       '',
  unitPenanggungJawab:    'Subdirektorat Pengembangan Sistem Informasi',
  namaPIC:                '',
  kontakPIC:              '',
  latarBelakang:          '',
  tujuan:                 '',
  gambaranKondisiSaatIni: '', 
  masalahIsu:             '',
  targetPenyelesaian:     '', 
  targetOutcome:          '',
  outcomeKeluaran:        '',
  businessValue:          '',
  alurBisnisProses:       '',
  tautanMockup:           '',
  integrasiSSO:           '',
  phm: 20,

  actors:    [],
  useCases:  [],
  tcfImpacts: TCF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
  efImpacts:  EF_FACTORS.reduce((acc, f)  => ({ ...acc, [f.id]: 3 }), {}),

  // UPDATE: Menggunakan parameter BV vs Effort dari KEP-225/BC/2025
  bvEffort: {
    efisiensi:            { label: 'Optimalisasi Aplikasi Existing', score: 2 },
    penggunaLayanan:      { label: 'Pengguna Jasa', score: 4 },
    dasarKebutuhan:       { label: 'Rekomendasi APF', score: 3 },
    scoringBIA:           { label: 'Kritis > 70% s.d. 90%', score: 3 },
    targetPenyelesaian:   { label: '< 3 bulan', score: 5 },
    kesiapanRegulasi:     { label: 'Regulasi dan SOP sudah ada', score: 1 },
    sistemTerkait:        { label: '2-5 sistem', score: 3 },
    kerahasiaanInformasi: { label: 'Terbatas', score: 2 },
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
  rtm:                    [],

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
    { id: 'd1', status: 'Belum', item: 'Use Case Diagram', pic: '', link: '' },
    { id: 'd2', status: 'Belum', item: 'Activity Diagram', pic: '', link: '' },
    { id: 'd3', status: 'Belum', item: 'Class Diagram',    pic: '', link: '' },
    { id: 'd4', status: 'Belum', item: 'Rancangan Basis Data (ERD & Kamus Data)', pic: '', link: '' },
    { id: 'd5', status: 'Belum', item: 'Rancangan Service / API Collection', pic: '', link: '' },
  ],
  fsdSourceCode: { status: 'Belum', pic: '', link: '' }, 
  fsdArchitecture: {
    database: { pic: '', status: 'Pending' },
    infra:    { pic: '', status: 'Pending' },
    security: { pic: '', status: 'Pending' }
  },

  charter: {
    scope:              '',
    outOfScope:         '',
    stakeholders:       '',
    endUsers:           '',
    manfaat:            '', 
    kasusBisnis:        '',
    sasaran:            '',
    faktorPenentu:      '',
    areaLayanan:        '', 
    catatanProbis:      '', 
    prosesTerdampak:    '',
    tanggalMulai:       '',
    tanggalSelesai:     '',
    kebutuhanPendukung: '',
    kebutuhanKhusus:    '',
    risks:              '',
    constraints:        '',
    assumptions:        '',
    timeline: [
      { id: 1, milestone: 'Project Charter Template', start: '', end: '', note: '' },
      { id: 2, milestone: 'Form Project Team / Preliminary Review / Scope', start: '', end: '', note: '' },
      { id: 3, milestone: 'Finalize Project Plan / Charter / Kick Off', start: '', end: '', note: '' },
      { id: 4, milestone: 'Define Phase', start: '', end: '', note: '' },
      { id: 5, milestone: 'Measurement Phase', start: '', end: '', note: '' },
      { id: 6, milestone: 'Analysis Phase', start: '', end: '', note: '' },
      { id: 7, milestone: 'Improvement Phase', start: '', end: '', note: '' },
      { id: 8, milestone: 'Control Phase', start: '', end: '', note: '' },
      { id: 9, milestone: 'Project Summary Report and Close Out', start: '', end: '', note: '' },
    ],
    team: [
      { id: 1, name: '', role: 'Project Manager', responsibility: '' },
      { id: 2, name: '', role: 'System Analyst',  responsibility: '' },
      { id: 3, name: '', role: 'Data Modeler',  responsibility: '' },
      { id: 4, name: '', role: 'Product Engineer',  responsibility: '' },
      { id: 5, name: '', role: 'Quality Control / Technical Writer',  responsibility: '' },
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
        prioritas: 'Medium',
        detailFungsi: '',
        fungsi: item, // Menyokong format NFR baru
        catatan: ''   // Menyokong Acceptance Criteria
      };
    }
    
    // Standardize objects and guarantee an ID, mapping common variations
    return { 
      ...item, 
      id: item.id || fallbackId,
      kebutuhan: item.kebutuhan || item.deskripsi || item.description || item.requirement || '',
      deskripsi: item.deskripsi || item.kebutuhan || item.description || item.requirement || '',
      prioritas: item.prioritas || 'Medium',
      detailFungsi: item.detailFungsi || item.subfungsi || '',
      // UPDATE: Mapping fungsi dan catatan untuk KEP-225
      fungsi: item.fungsi || item.kategori || '',
      catatan: item.catatan || item.acceptanceCriteria || ''
    };
  });
};

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab,    setActiveTab]    = useState('kajian');
  const [uploadStatus, setUploadStatus] = useState(STATUS.IDLE);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError,  setUploadError]  = useState(null);
  const [aiMeta,       setAiMeta]       = useState({ usedModel: null, enrichModel: null, usage: null, log: [] });
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [project,      setProject]      = useState(makeInitialProject);

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

    // UPDATE: Kalkulasi eksplisit menggunakan parameter KEP-225/BC/2025
    const totalBV = (project.bvEffort.efisiensi?.score || 0) + 
                    (project.bvEffort.penggunaLayanan?.score || 0) + 
                    (project.bvEffort.dasarKebutuhan?.score || 0) + 
                    (project.bvEffort.scoringBIA?.score || 0);

    const totalEffort = (project.bvEffort.targetPenyelesaian?.score || 0) + 
                        (project.bvEffort.kesiapanRegulasi?.score || 0) + 
                        (project.bvEffort.sistemTerkait?.score || 0) + 
                        (project.bvEffort.kerahasiaanInformasi?.score || 0);

    const ratio       = totalBV / (totalEffort || 1);
    const priority    = ratio > 2 ? 'P1 (Critical)' : ratio > 1 ? 'P2 (High)' : 'P3 (Low)';

    return {
      uaw, uucw, uucp, tcf, ef, ucp,
      totalPersonHours, workingDays,
      totalMandays: workingDays,
      totalManMonths,
      kakTableData, runningTotalCost, warrantyCost, subTotal, ppn, grandTotal,
      totalBV, totalEffort, priority,
    };
  }, [project]);

  // ─── Mermaid cleaner ────────────────────────────────────────────────────
  const normalizeAsIsToBe = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr
      .filter(item => item && typeof item === 'object')
      .map((item, i) => ({
        ...item,
        id:     `ais_${Date.now()}_${i}`,
        factor: item.factor || '',
        asIs:   item.asIs   || '',
        toBe:   item.toBe   || '',
      }));
  };

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

    try {
      const extracted = await extractDocumentPages(file);

      if (!extracted.fullText || extracted.fullText.trim().length < 50) {
        throw new Error('Gagal mengekstrak teks dari file. Dokumen mungkin berupa scan gambar atau terenkripsi.');
      }

      console.log(`📄 Extracted ${extracted.parsedPages} pages (${extracted.totalPages} total) from "${file.name}"`);

      setUploadStatus(STATUS.ANALYZING);
      const result = await processDocumentWithAI(
        API_KEY,
        extracted,                          
        (msg) => console.log('[AI]', msg),  
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Analisis AI gagal tanpa pesan error.');
      }

      const ai = result.data;
      setAiMeta({
        usedModel:     result.usedModel,
        enrichModel:   result.enrichModel,
        triageModel:   result.triageModel,
        usage:         result.usage,
        selectedPages: result.selectedPages,
        totalPages:    result.totalPages,
        log:           result.log,
      });

      setProject(prev => {
        const kfSource = (Array.isArray(ai.kebutuhanFungsional) && ai.kebutuhanFungsional.length > 0) ? ai.kebutuhanFungsional : 
                         (Array.isArray(ai.functionalRequirements) && ai.functionalRequirements.length > 0) ? ai.functionalRequirements : null;
                         
        const nfrSource = (Array.isArray(ai.kebutuhanNonFungsional) && ai.kebutuhanNonFungsional.length > 0) ? ai.kebutuhanNonFungsional : 
                          (Array.isArray(ai.nonFunctionalRequirements) && ai.nonFunctionalRequirements.length > 0) ? ai.nonFunctionalRequirements : null;

        return {
          ...prev,
          nama:                   ai.nama                   || prev.nama,
          pengampu:               ai.pengampu               || prev.pengampu,
          unitPenanggungJawab:    ai.unitPenanggungJawab    || prev.unitPenanggungJawab,
          namaPIC:                ai.namaPIC                || prev.namaPIC,
          kontakPIC:              ai.kontakPIC              || prev.kontakPIC,
          latarBelakang:          ai.latarBelakang          || prev.latarBelakang,
          tujuan:                 ai.tujuan                 || prev.tujuan,                 
          gambaranKondisiSaatIni: ai.gambaranKondisiSaatIni || prev.gambaranKondisiSaatIni,
          masalahIsu:             ai.masalahIsu             || prev.masalahIsu,
          targetPenyelesaian:     ai.targetPenyelesaian     || prev.targetPenyelesaian,
          targetOutcome:          ai.targetOutcome          || prev.targetOutcome,
          outcomeKeluaran:        ai.outcomeKeluaran        || prev.outcomeKeluaran,
          businessValue:          ai.businessValue          || prev.businessValue,
          alurBisnisProses:       ai.alurBisnisProses       || prev.alurBisnisProses,
          tautanMockup:           ai.tautanMockup           || prev.tautanMockup,           
          integrasiSSO:           ai.integrasiSSO           || prev.integrasiSSO,           
          bia:                    ai.bia                    || prev.bia,

          kebutuhanFungsional:    kfSource ? formatAIArray(kfSource, 'kf') : prev.kebutuhanFungsional,
          kebutuhanNonFungsional: nfrSource ? formatAIArray(nfrSource, 'nfr') : prev.kebutuhanNonFungsional,
          risikoBisnis:           Array.isArray(ai.risikoBisnis) && ai.risikoBisnis.length > 0 ? formatAIArray(ai.risikoBisnis, 'rb') : prev.risikoBisnis,
          actors:                 Array.isArray(ai.actors) && ai.actors.length > 0 ? formatAIArray(ai.actors, 'act') : prev.actors,
          useCases:               Array.isArray(ai.useCases) && ai.useCases.length > 0 ? formatAIArray(ai.useCases, 'uc') : prev.useCases,
          
          asIsToBe:               normalizeAsIsToBe(ai.asIsToBe) || prev.asIsToBe,
          brdProcessAnalysis:     ai.brdProcessAnalysis          || prev.brdProcessAnalysis,

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
            kasusBisnis:   ai.kasusBisnis      || prev.charter.kasusBisnis,
            sasaran:       ai.sasaran          || prev.charter.sasaran,
            faktorPenentu: ai.faktorPenentu    || prev.charter.faktorPenentu,
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

  const statusLabel = {
    [STATUS.IDLE]:      uploadedFile ? uploadedFile.substring(0, 20) + (uploadedFile.length > 20 ? '…' : '') : 'Import TOR / KAK',
    [STATUS.EXTRACTING]: 'Membaca dokumen…',
    [STATUS.ANALYZING]:  'Claude menganalisis…',
    [STATUS.DONE]:       uploadedFile ? uploadedFile.substring(0, 20) + (uploadedFile.length > 20 ? '…' : '') : 'Selesai',
    [STATUS.ERROR]:      'Upload Gagal',
  }[uploadStatus];

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 7, padding: '4px 10px' }}>
                <Cpu style={{ width: 11, height: 11, color: '#a5b4fc', flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.04em' }}>Haiku · Triage</span>
                {aiMeta.usage?.triage && <span style={{ fontSize: 9, color: 'rgba(165,180,252,0.6)', marginLeft: 'auto' }}>{(aiMeta.usage.triage.input_tokens || 0).toLocaleString()} in</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, padding: '4px 10px' }}>
                <Cpu style={{ width: 11, height: 11, color: '#a5b4fc', flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.04em' }}>Opus · Analysis</span>
                {aiMeta.usage?.analysis && <span style={{ fontSize: 9, color: 'rgba(165,180,252,0.6)', marginLeft: 'auto' }}>{(aiMeta.usage.analysis.output_tokens || 0).toLocaleString()} out</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 7, padding: '4px 10px' }}>
                <Cpu style={{ width: 11, height: 11, color: '#a5b4fc', flexShrink: 0 }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.04em' }}>Sonnet · Enrich</span>
                {aiMeta.usage?.enrich && <span style={{ fontSize: 9, color: 'rgba(165,180,252,0.6)', marginLeft: 'auto' }}>{(aiMeta.usage.enrich.output_tokens || 0).toLocaleString()} out</span>}
              </div>
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
            <div className="kt-notice" style={{ marginBottom: 20, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                <Sparkles style={{ width: 16, height: 16, color: '#6366f1', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12.5, color: '#4f46e5', fontWeight: 600 }}>
                  Analisis selesai · {(aiMeta.usage.input_tokens || 0).toLocaleString()} in / {(aiMeta.usage.output_tokens || 0).toLocaleString()} out tokens
                </span>
                <button onClick={() => setUploadStatus(STATUS.IDLE)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 0, lineHeight: 1 }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(79,70,229,0.7)', paddingLeft: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {aiMeta.triageModel  && <span>⚡ {aiMeta.triageModel}: {(aiMeta.usage.triage?.input_tokens||0).toLocaleString()} in</span>}
                {aiMeta.usedModel   && <span>🧠 {aiMeta.usedModel}: {(aiMeta.usage.analysis?.output_tokens||0).toLocaleString()} out</span>}
                {aiMeta.enrichModel && <span>✨ {aiMeta.enrichModel}: {(aiMeta.usage.enrich?.output_tokens||0).toLocaleString()} out</span>}
              </div>
            </div>
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
                  calc={calc}  
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                />
              )}
              {activeTab === 'penelitian' && (
                <TabPenelitian
                  project={project} setProject={setProject} calc={calc}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                />
              )}
              {activeTab === 'brd' && (
                <TabBRD
                  project={project} setProject={setProject}
                  uploadedFile={uploadedFile} calc={calc}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                />
              )}
              {activeTab === 'charter' && (
                <TabCharter project={project} setProject={setProject} calc={calc} 
                />
              )}
              {activeTab === 'fsd' && (
                <TabFSD
                  project={project} setProject={setProject}
                  uploadedFile={uploadedFile}
                  handleUpdateArray={handleUpdateArray}
                  handleAddArray={handleAddArray}
                  handleRemoveArray={handleRemoveArray}
                />
              )}
              {activeTab === 'rtm' && (
                <TabRTM 
                  project={project} setProject={setProject} 
                  handleUpdateArray={handleUpdateArray} 
                  handleAddArray={handleAddArray} 
                  handleRemoveArray={handleRemoveArray} 
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
                {aiMeta.usedModel}{aiMeta.enrichModel ? ` + ${aiMeta.enrichModel}` : ''}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--kt-text-muted)', letterSpacing: '0.04em' }}>
              v2.1 — CEISA 4.0 Doc Genie
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
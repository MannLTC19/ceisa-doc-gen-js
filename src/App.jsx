import React, { useState, useMemo } from 'react';
import { 
  Bot, Download, FileText, Layout, 
  Settings, Shield, Users, Zap, Loader2 
} from 'lucide-react';
 // ← must be here
import './index.css';

import { TabKajian } from './components/TabKajian.jsx';
import { TabPenelitian } from './components/TabPenelitian.jsx';
import { TabBRD } from './components/TabBRD.jsx';
import { TabFSD } from './components/TabFSD.jsx';
import { TabCharter } from './components/TabCharter.jsx';

import { 
  ROLE_RATES_2023, 
  PHASE_DISTRIBUTION, 
  getUseCaseComplexity, 
  getActorComplexity,
  TCF_FACTORS,  // used for initial tcfImpacts state
  EF_FACTORS    // used for initial efImpacts state
} from './constants.js';

import { processDocumentWithAI } from './utils/aiProcessor.js';
import { extractTextFromPdf, extractTextFromDocx } from './utils/fileHelpers.js';
import { generateExcelDocument } from "./utils/excelGenerator.js";

// Requires VITE_GEMINI_API_KEY in your .env.local file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [activeTab, setActiveTab] = useState('kajian');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [aiMeta, setAiMeta] = useState({ usedModel: null, log: [] });

  const [project, setProject] = useState({
    // 1. KAJIAN KEBUTUHAN
    nama: 'Pengembangan Modul Baru CEISA 4.0',
    pengampu: 'Direktorat Informasi Kepabeanan dan Cukai',
    unitPenanggungJawab: 'Subdirektorat Pengembangan Sistem Informasi',
    namaPIC: '',
    kontakPIC: '',
    latarBelakang: '',
    masalahIsu: '',
    targetPenyelesaian: '',
    targetOutcome: '',
    outcomeKeluaran: '',
    businessValue: '',
    alurBisnisProses: '',
    phm: 20, 
    
    // 2. PENELITIAN
    actors: [],
    useCases: [],
    tcfImpacts: TCF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
    efImpacts: EF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
    bvEffort: {
      efficiency:  { label: 'Med',        score: 3 },
      users:       { label: '100-500',    score: 3 },
      regulatory:  { label: 'Recommended', score: 3 },
      bia:         { label: 'Med',        score: 3 },
      duration:    { label: '3-6 Months', score: 3 },
      technology:  { label: 'Existing',   score: 1 },
      systems:     { label: 'None',       score: 1 },
      strategy:    { label: 'High',       score: 1 }
    },
    kakStructure: PHASE_DISTRIBUTION.map((p, i) => ({
      id: `phase-${i}`,
      ...p,
      rate: ROLE_RATES_2023[p.roleId] || 20000000
    })),

    // 3. BRD
    brdProcessAnalysis: { modul: '', subModul: '', eaMapping: '', notes: '' },
    asIsToBe: [], 
    kebutuhanFungsional: [],
    kebutuhanNonFungsional: [],
    risikoBisnis: [],
    bia: { operasional: 'Medium', finansial: 'Low', reputasi: 'Medium', hukum: 'Low', rto: '4h', rpo: '24h' },
    
    // 4. FSD
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
    end
    subgraph "Integrasi Sistem"
        O["CEISA Impor Sementara"] --> P["CEISA Impor / PIB"]
        O --> Q["CEISA Ekspor / PEB"]
        R["SKP Pemberitahuan Pabean"] --> P
        R --> Q
        O -->|"Belum Terintegrasi"| S["SKP Lainnya di DJBC"]
    end
    subgraph "Sistem Baru IMSAMA"
        Y["SKP IMSAMA\\nPerbaikan CEISA Impor Sementara"]
    end
    O --> Y
    Y --> Z(["✅ Optimalisasi Layanan & Pengawasan"])`,

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
    IZIN_IMPOR_SEMENTARA ||--o{ BARANG_IMPOR : "terkait dengan"`
    },
    fsdProcess: { asIs: '', toBe: '' },
    fsdMockups: [],
    fsdAccessRights: [],
    fsdDesign: [
      { id: 'd1', item: 'Use Case Diagram',   pic: '', link: '' },
      { id: 'd2', item: 'Activity Diagram',   pic: '', link: '' },
      { id: 'd3', item: 'Class Diagram',      pic: '', link: '' },
      { id: 'd4', item: 'Data Model / ERD',   pic: '', link: '' }
    ],
    fsdSourceCode: { pic: '', link: '' },

    // 5. CHARTER
    charter: {
      scope: '',
      outOfScope: '',
      supportingReqs: '',
      specialReqs: '',
      bizProcessOwner: '',
      stakeholders: '',
      endUsers: '',
      benefits: '',
      risks: '',
      constraints: '',
      assumptions: '',
      timeline: [
        { id: 1, milestone: 'Analisis & Desain', start: '', end: '', note: '' },
        { id: 2, milestone: 'Development',       start: '', end: '', note: '' },
        { id: 3, milestone: 'Testing & UAT',     start: '', end: '', note: '' },
        { id: 4, milestone: 'Deployment',        start: '', end: '', note: '' }
      ],
      team: [
        { id: 1, name: '', role: 'Project Manager', responsibility: 'Manajemen Proyek' },
        { id: 2, name: '', role: 'System Analyst',  responsibility: 'Analisis & Desain' },
        { id: 3, name: '', role: 'Developer',       responsibility: 'Coding & Integrasi' }
      ]
    },

    // SIGNATURES
    signatures: {
      date: '',
      approvedBy: { name: '', nip: '', role: '' },
      preparedBy:  { name: '', nip: '', role: '' }
    }
  });

  // ─── CALCULATIONS ────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const uaw  = (project.actors   || []).reduce((acc, a)  => acc + getActorComplexity(a.type).weight, 0);
    const uucw = (project.useCases || []).reduce((acc, uc) => acc + getUseCaseComplexity(uc.transactions).weight, 0);
    const uucp = uaw + uucw;

    // ── Official Bea Cukai standard values (fixed by regulation) ───────
    // TCF = 0.6 + (0.01 × 26.50) → 0.87
    // ECF = 1.4 + (−0.03 × 21.00) → 0.77
    const tcf = 0.87;
    const ef  = 0.77;

    const ucp             = uucp * tcf * ef;
    const totalPersonHours = ucp * project.phm;
    const workingDays     = totalPersonHours / 8;
    const totalManMonths  = workingDays / 22;

    const kakTableData = (project.kakStructure || []).map(item => {
      const effortMM = (item.percent / 100) * totalManMonths;
      const cost     = effortMM * item.rate;
      return { ...item, effortMM, cost };
    });

    const runningTotalCost = kakTableData.reduce((acc, item) => acc + item.cost, 0);
    const warrantyCost     = runningTotalCost * 0.25;
    const subTotal         = runningTotalCost + warrantyCost;
    const ppn              = subTotal * 0.11;
    const grandTotal       = subTotal + ppn;

    const bvValues     = Object.values(project.bvEffort);
    const totalBV      = bvValues.slice(0, 4).reduce((acc, v) => acc + v.score, 0);
    const totalEffort  = bvValues.slice(4).reduce((acc, v) => acc + v.score, 0);
    const priorityScore = totalBV / (totalEffort || 1);

    let priority = "P3 (Low)";
    if (priorityScore > 2)      priority = "P1 (Critical)";
    else if (priorityScore > 1) priority = "P2 (High)";

    return {
      uaw, uucw, uucp, tcf, ef, ucp,
      totalPersonHours, workingDays, totalManMonths,
      kakTableData, runningTotalCost, warrantyCost, subTotal, ppn, grandTotal,
      totalBV, totalEffort, priority
    };
  }, [project]);

  // ─── MERMAID CLEANER ─────────────────────────────────────────────────────
  // Decodes JSON-escaped characters and strips any residual model artifacts.
  // Does NOT touch double quotes — the prompt enforces them and Mermaid requires them.
  const cleanMermaid = (code) => {
    if (!code) return "";
    return code
      .replace(/\\n/g, '\n')                        // decode JSON-escaped newlines
      .replace(/\\t/g, '  ')                        // decode JSON-escaped tabs
      .replace(/<(bos|eos|pad|unk|s|\/s)>/gi, '')  // strip any leaked model tokens
      .replace(/;(\s*\n)/g, '$1')                   // strip trailing semicolons
      .trim();
    // ← intentionally no .replace(/"/g, "'") — that was the original bug
  };

  // ─── FILE PROCESSING ─────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate API key before doing any work
    if (!API_KEY) {
      setUploadError("VITE_GEMINI_API_KEY is not set. Add it to your .env.local file.");
      return;
    }

    // Validate file type explicitly
    const isPdf  = file.type === "application/pdf";
    const isDocx = file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isPdf && !isDocx) {
      setUploadError(`Unsupported file type: "${file.name}". Please upload a .pdf or .docx file.`);
      return;
    }

    setLoading(true);
    setUploadError(null);
    setUploadedFile(file.name);

    try {
      let text = "";
      if (isPdf) text = await extractTextFromPdf(file);
      else        text = await extractTextFromDocx(file);

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract readable text from this file. The document may be scanned or image-based.");
      }

      const response = await processDocumentWithAI(API_KEY, text);
      
      if (!response.success) {
        throw new Error(response.error?.message || "AI Extraction Failed");
      }

      const ai = response.data;
      setAiMeta({ usedModel: response.usedModel, log: response.log });

      setProject(prev => ({
        ...prev,
        // General info — all use functional prev to avoid stale closures
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
        // Arrays
        kebutuhanFungsional:    ai.kebutuhanFungsional    || prev.kebutuhanFungsional    || [],
        kebutuhanNonFungsional: ai.kebutuhanNonFungsional || prev.kebutuhanNonFungsional || [],
        risikoBisnis:           ai.risikoBisnis           || prev.risikoBisnis           || [],
        actors:                 ai.actors                 || prev.actors                 || [],
        useCases:               ai.useCases               || prev.useCases               || [],
        asIsToBe:               ai.asIsToBe               || prev.asIsToBe               || [],
        brdProcessAnalysis:     ai.brdProcessAnalysis     || prev.brdProcessAnalysis,
        // Mermaid diagrams — clean escaped chars only, preserve double quotes
        mermaid: {
          processFlow:    cleanMermaid(ai.mermaid?.processFlow)    || prev.mermaid.processFlow,
          useCaseDiagram: cleanMermaid(ai.mermaid?.useCaseDiagram) || prev.mermaid.useCaseDiagram,
          erd:            cleanMermaid(ai.mermaid?.erd)            || prev.mermaid.erd,
        },
        fsdProcess: {
          asIs: ai.fsdLinks?.diagrams || prev.fsdProcess.asIs,
          toBe: prev.fsdProcess.toBe
        },
        fsdSourceCode: {
          ...prev.fsdSourceCode,
          link: ai.fsdLinks?.repo || prev.fsdSourceCode.link
        },
        // Charter — map AI top-level fields into charter object (ai has no "charter" key)
        charter: {
          ...prev.charter,
          scope:    ai.alurBisnisProses || prev.charter.scope,
          benefits: ai.businessValue    || prev.charter.benefits,
          risks:    ai.risikoBisnis?.map(r => r.risk).join('\n') || prev.charter.risks,
          team: (ai.detectedPeople?.length > 0)
            ? ai.detectedPeople.map((p, i) => ({
                id:             Date.now() + i,
                name:           p.name,
                role:           p.role || 'Anggota Tim',
                responsibility: 'Pelaksana Proyek'
              }))
            : prev.charter.team
        }
      }));

      setActiveTab('kajian');
    } catch (err) {
      console.error("AI Processing Error:", err);
      setUploadError(`Gagal memproses file: ${err.message}`);
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  };

  // ─── ARRAY HELPERS ───────────────────────────────────────────────────────
  const handleUpdateArray = (name, id, field, value) => {
    setProject(prev => ({
      ...prev,
      [name]: (prev[name] || []).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddArray = (name, newItem) => {
    setProject(prev => ({ ...prev, [name]: [...(prev[name] || []), newItem] }));
  };

  const handleRemoveArray = (name, id) => {
    setProject(prev => ({ ...prev, [name]: (prev[name] || []).filter(i => i.id !== id) }));
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="w-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-xl">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase">CEISA 4.0 Doc Genie</h1>
              <p className="text-[10px] font-bold text-slate-400">System Analyst Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl cursor-pointer transition-all">
              <Layout className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">
                {loading ? 'Processing...' : uploadedFile || 'Import TOR'}
              </span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".pdf,.docx" 
                disabled={loading} 
              />
            </label>
      <button 
    className="btn-primary" 
    onClick={() => generateExcelDocument(project, calc)}
>
    Download Kajian Kebutuhan (Excel)
</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full p-4 md:p-6 flex flex-col gap-6">

        {/* Upload error banner */}
        {uploadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-start justify-between gap-3 text-sm shadow-sm">
            <span>⚠️ {uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-rose-400 hover:text-rose-600 font-bold shrink-0">✕</button>
          </div>
        )}
        <nav className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          {[
            { id: 'kajian',     label: '1. Kajian Kebutuhan', icon: FileText },
            { id: 'penelitian', label: '2. Penelitian (UCP)', icon: Zap      },
            { id: 'brd',        label: '3. BRD',              icon: Users    },
            { id: 'fsd',        label: '4. FSD',              icon: Settings },
            { id: 'charter',    label: '5. Charter',          icon: Shield   }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-black text-slate-800">AI Genie is analyzing...</h2>
          </div>
        ) : (
          <div className="flex-1">
            {activeTab === 'kajian'     && <TabKajian     project={project} setProject={setProject} uploadedFile={uploadedFile} aiMeta={aiMeta} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'penelitian' && <TabPenelitian project={project} setProject={setProject} calc={calc} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'brd'        && <TabBRD        project={project} setProject={setProject} uploadedFile={uploadedFile} calc={calc} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'fsd'        && <TabFSD        project={project} setProject={setProject} uploadedFile={uploadedFile} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'charter'    && <TabCharter    project={project} setProject={setProject} calc={calc} />}
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t bg-white">
        Internal Property of IKC Customs Indonesia © 2026
      </footer>
    </div>
  );
}

export default App;
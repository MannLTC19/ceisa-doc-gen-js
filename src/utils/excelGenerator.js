import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
    formatIDR, 
    getActorComplexity, 
    getUseCaseComplexity,
    TCF_FACTORS,
    EF_FACTORS
} from "../constants.js";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
    navy:       "FF002F5B",
    slate800:   "FF1E293B",
    slate200:   "FFE2E8F0",
    white:      "FFFFFFFF",
    success:    "FF047857",
    danger:     "FFBE123C",
    warning:    "FFD97706",
};

// ─── Sheet Helper Factory ─────────────────────────────────────────────────────
const makeHelpers = (sheet) => {
    const addHeader = (title) => {
        const row = sheet.addRow([title]);
        row.font = { bold: true, size: 14, color: { argb: C.navy } };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.slate200 } };
        sheet.addRow([]); // spacing
    };

    const addKeyValue = (key, value) => {
        const row = sheet.addRow([key, value || '-']);
        row.getCell(1).font = { bold: true, color: { argb: C.slate800 } };
        row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    };

    const addTable = (headers, dataRows) => {
        const headerRow = sheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: C.white } };
        headerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.navy } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        if (!dataRows || dataRows.length === 0) {
            sheet.addRow(['Belum ada data']);
        } else {
            dataRows.forEach(rowData => {
                const row = sheet.addRow(rowData);
                row.alignment = { wrapText: true, vertical: 'top' };
            });
        }
        sheet.addRow([]); // spacing
    };

    return { addHeader, addKeyValue, addTable };
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET BUILDERS
// ═════════════════════════════════════════════════════════════════════════════

// 1. KAJIAN KEBUTUHAN
const buildKajian = (workbook, project, calc) => {
    const sheet = workbook.addWorksheet('01 - Kajian Kebutuhan');
    sheet.columns = [
        { width: 30 }, { width: 35 }, { width: 30 }, { width: 25 }, 
        { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 15 }, { width: 15 }
    ];
    const { addHeader, addKeyValue, addTable } = makeHelpers(sheet);

    addHeader('01. INFORMASI UMUM');
    addKeyValue('Nama Proyek', project?.nama);
    addKeyValue('Uraian Singkat', project?.uraianUsulan);
    addKeyValue('Unit Pengampu Bisnis Proses', project?.pengampu);
    addKeyValue('Unit Penanggung Jawab TIK', project?.unitPenanggungJawab);
    addKeyValue('Nama PIC', project?.namaPIC);
    addKeyValue('Kontak PIC', project?.kontakPIC);
    addKeyValue('Nomor Nota Dinas', project?.nomorND);
    addKeyValue('Tanggal Nota Dinas', project?.tanggalND);
    addKeyValue('Tanggal Pembuatan Dokumen', project?.tanggalPembuatan);
    sheet.addRow([]);

    addHeader('02. LATAR BELAKANG, TUJUAN & MASALAH');
    addKeyValue('Latar Belakang / Urgensi', project?.latarBelakang);
    addKeyValue('Tujuan Proyek', project?.tujuan);
    addKeyValue('Gambaran Kondisi Saat Ini', project?.gambaranKondisiSaatIni);
    addKeyValue('Masalah atau Isu (Pain Points)', project?.masalahIsu);
    sheet.addRow([]);

    addHeader('03. TARGET DAN OUTCOME');
    addKeyValue('Target Penyelesaian', project?.targetPenyelesaian);
    addKeyValue('Target Outcome', project?.targetOutcome);
    addKeyValue('Outcome / Keluaran Proyek', project?.outcomeKeluaran);
    addKeyValue('Business Value / Cost Benefit', project?.businessValue);
    sheet.addRow([]);

    addHeader('04. ANALISIS PROSES BISNIS');
    addKeyValue('Modul', project?.brdProcessAnalysis?.modul);
    addKeyValue('Sub Modul', project?.brdProcessAnalysis?.subModul);
    addKeyValue('Pemetaan EA Kemenkeu', project?.brdProcessAnalysis?.eaMapping);
    addKeyValue('Catatan / Keterangan', project?.brdProcessAnalysis?.notes);
    sheet.addRow([]);

    addHeader('05. KONDISI AS-IS TO-BE');
    const asIsData = (project?.asIsToBe || []).map((a, i) => [i + 1, a.factor, a.asIs, a.toBe]);
    addTable(['No', 'Faktor Pembanding', 'As Is', 'To Be'], asIsData);

    addHeader('06. ALUR PROSES BISNIS');
    addKeyValue('Deskripsi Alur Bisnis Proses', project?.alurBisnisProses);
    addKeyValue('Source Code BPMN (Mermaid JS)', project?.mermaid?.processFlow); // <--- Ditambahkan di sini
    addKeyValue('Tautan Mock Up / Figma', project?.tautanMockup);
    addKeyValue('Integrasi SSO', project?.integrasiSSO);
    sheet.addRow([]);

    addHeader('07. KEBUTUHAN FUNGSIONAL');
    const kfData = (project?.kebutuhanFungsional || []).map((kf, i) => [i + 1, kf.kebutuhan, kf.detailFungsi]);
    addTable(['No', 'Fungsi', 'Deskripsi / Detail Fungsi'], kfData);

    addHeader('08. KEBUTUHAN NON-FUNGSIONAL');
    const knfData = (project?.kebutuhanNonFungsional || []).map((knf, i) => [i + 1, knf.deskripsi, knf.alasan]);
    addTable(['No', 'Deskripsi Kebutuhan', 'Alasan'], knfData);

    addHeader('09. ANALISIS RISIKO BISNIS');
    const riskData = (project?.risikoBisnis || []).map((r, i) => [i + 1, r.risk, r.impact, r.mitigasi, r.level]);
    addTable(['No', 'Risiko', 'Dampak', 'Mitigasi', 'Level'], riskData);

    addHeader('10. BUSINESS IMPACT ANALYSIS (BIA)');
    addKeyValue('Dampak Operasional', project?.bia?.operasional || 'Low');
    addKeyValue('Dampak Finansial', project?.bia?.finansial || 'Low');
    addKeyValue('Dampak Reputasi', project?.bia?.reputasi || 'Low');
    addKeyValue('Dampak Hukum', project?.bia?.hukum || 'Low');
    addKeyValue('Target RTO (Recovery Time Objective)', project?.bia?.rto || '4h');
    addKeyValue('Target RPO (Recovery Point Objective)', project?.bia?.rpo || '24h');
    sheet.addRow([]);

    addHeader('11. SPESIFIKASI AKTOR');
    const actorData = (project?.actors || []).map((a, i) => [
        `MOD-A-${i + 1}`, a.name, a.desc, a.type, getActorComplexity(a.type)?.weight || 0
    ]);
    addTable(['Kode Aktor', 'Nama Aktor', 'Deskripsi', 'Jenis', 'UAW Score'], actorData);

    addHeader('12. USE CASE DESKRIPSI');
    const ucData = (project?.useCases || []).map((uc, i) => [
        `MOD-UC-${i + 1}`, uc.name || uc.deskripsi, uc.prioritas, uc.actorRef, 
        uc.preCond, uc.postCond, uc.mainFlow, uc.altFlow, uc.transactions,
        getUseCaseComplexity(uc.transactions)?.weight || 0
    ]);
    addTable(['Kode UC', 'Nama UC', 'Prioritas', 'Aktor', 'Kondisi Awal', 'Kondisi Akhir', 'Alur Utama', 'Alur Alternatif', 'Jml UI', 'UUCW'], ucData);

    addHeader('13. BUSINESS VALUE VS EFFORT');
    addKeyValue('Total Business Value (BV)', calc?.totalBV);
    addKeyValue('Total Effort Score', calc?.totalEffort);
    addKeyValue('Rekomendasi Prioritas', calc?.priority);
};

// 2. BRD
const buildBRD = (workbook, project, calc) => {
    const sheet = workbook.addWorksheet('02 - BRD');
    sheet.columns = [
        { width: 30 }, { width: 35 }, { width: 30 }, { width: 25 }, 
        { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }
    ];
    const { addHeader, addKeyValue, addTable } = makeHelpers(sheet);

    addHeader('01. INFORMASI UMUM');
    addKeyValue('Nama Proyek', project?.nama);
    addKeyValue('Uraian Singkat', project?.uraianUsulan);
    addKeyValue('Unit Pengampu', project?.pengampu);
    addKeyValue('Nomor Nota Dinas', project?.nomorND);
    addKeyValue('Tanggal Pembuatan Dokumen', project?.tanggalPembuatan);
    sheet.addRow([]);

    addHeader('02. ANALISIS PROSES BISNIS');
    addKeyValue('Modul', project?.brdProcessAnalysis?.modul);
    addKeyValue('Sub Modul', project?.brdProcessAnalysis?.subModul);
    addKeyValue('Pemetaan EA', project?.brdProcessAnalysis?.eaMapping);
    addKeyValue('Keterangan', project?.brdProcessAnalysis?.notes);
    sheet.addRow([]);

    addHeader('03. KONDISI AS-IS TO-BE');
    const asIsData = (project?.asIsToBe || []).map((a, i) => [i + 1, a.factor, a.asIs, a.toBe]);
    addTable(['No', 'Faktor Pembanding', 'As Is', 'To Be'], asIsData);

    addHeader('04. KEBUTUHAN FUNGSIONAL');
    const kfData = (project?.kebutuhanFungsional || []).map((kf, i) => [i + 1, kf.kebutuhan, kf.detailFungsi]);
    addTable(['No', 'Fungsi', 'Deskripsi'], kfData);

    addHeader('05. KEBUTUHAN NON-FUNGSIONAL');
    const knfData = (project?.kebutuhanNonFungsional || []).map((knf, i) => [i + 1, knf.deskripsi, knf.alasan]);
    addTable(['No', 'Deskripsi Kebutuhan', 'Alasan'], knfData);

    addHeader('06. SPESIFIKASI AKTOR');
    const actorData = (project?.actors || []).map((a, i) => [
        `MOD-A-${i + 1}`, a.name, a.desc, a.type, getActorComplexity(a.type)?.weight || 0
    ]);
    addTable(['Kode Aktor', 'Nama Aktor', 'Deskripsi', 'Jenis Aktor', 'UAW Score'], actorData);

    addHeader('07. USE CASE DIAGRAM DAN DESKRIPSI');
    addKeyValue('Source Code Use Case (Mermaid JS)', project?.mermaid?.useCaseDiagram); // <--- Ditambahkan di sini
    sheet.addRow([]);
    const ucData = (project?.useCases || []).map((uc, i) => [
        `MOD-UC-${i + 1}`, uc.name || uc.deskripsi, uc.prioritas, uc.actorRef, 
        uc.preCond, uc.postCond, uc.mainFlow, uc.altFlow, uc.transactions,
        getUseCaseComplexity(uc.transactions)?.weight || 0
    ]);
    addTable(['Kode UC', 'Nama UC', 'Prioritas', 'Aktor', 'Kondisi Awal', 'Kondisi Akhir', 'Alur Utama', 'Alur Alternatif', 'Jml UI', 'UUCW'], ucData);

    addHeader('08. USE CASE POINT');
    addKeyValue('UUCP (UAW + UUCW)', calc?.uucp);
    addKeyValue('TCF Applied (Standar IKC)', '0.87');
    addKeyValue('EF Applied (Standar IKC)', '0.77');
    addKeyValue('Final UCP (UUCP x TCF x EF)', calc?.ucp?.toFixed(2));
    sheet.addRow([]);

    addHeader('09. MAN MONTH ESTIMATION');
    addKeyValue('Decision Rule (PHM)', `${project?.phm || 20} Jam`);
    addKeyValue('Person-Hours (UCP x PHM)', calc?.totalPersonHours?.toFixed(2));
    addKeyValue('Working Days (WD)', calc?.workingDays?.toFixed(2));
    addKeyValue('Man Month (MM)', calc?.totalManMonths?.toFixed(2));
    addKeyValue('Estimasi Pengerjaan (Bulan)', Math.ceil(calc?.totalManMonths || 0));
};

// 3. DOKUMEN PENELITIAN (UCP & KAK)
const buildPenelitian = (workbook, project, calc) => {
    const sheet = workbook.addWorksheet('03 - Penelitian (Estimasi)');
    sheet.columns = [{ width: 35 }, { width: 35 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 25 }];
    const { addHeader, addKeyValue, addTable } = makeHelpers(sheet);

    addHeader('01. USE CASE POINT (UCP) CALCULATION');
    addKeyValue('Total UAW (Actor Weight)', calc?.uaw);
    addKeyValue('Total UUCW (Use Case Weight)', calc?.uucw);
    addKeyValue('UUCP (UAW + UUCW)', calc?.uucp);
    sheet.addRow([]);

    addHeader('02. TECHNICAL COMPLEXITY FACTOR (TCF) - SIMULASI');
    const tcfRows = TCF_FACTORS.map(f => {
        const rel = project?.tcfImpacts?.[f.id] ?? 3;
        const score = (f.weight || 0) * rel;
        return [f.id, f.name, f.weight, rel, score.toFixed(2)];
    });
    addTable(['ID', 'Faktor', 'Bobot', 'Relevansi (0-5)', 'Skor'], tcfRows);

    addHeader('03. ENVIRONMENTAL FACTOR (EF) - SIMULASI');
    const efRows = EF_FACTORS.map(f => {
        const imp = project?.efImpacts?.[f.id] ?? 3;
        const score = (f.weight || 0) * imp;
        return [f.id, f.name, f.weight, imp, score.toFixed(2)];
    });
    addTable(['ID', 'Faktor', 'Bobot', 'Dampak (0-5)', 'Skor'], efRows);

    addHeader('04. FINAL UCP SCORE');
    addKeyValue('TCF Applied (Standar IKC)', '0.87');
    addKeyValue('EF Applied (Standar IKC)', '0.77');
    addKeyValue('Final UCP (UUCP x TCF x EF)', calc?.ucp?.toFixed(2));
    sheet.addRow([]);

    addHeader('05. MAN MONTH ESTIMATION');
    addKeyValue('Decision Rule (PHM)', `${project?.phm || 20} Jam`);
    addKeyValue('Person-Hours (UCP x PHM)', calc?.totalPersonHours?.toFixed(2));
    addKeyValue('Working Days (WD)', calc?.workingDays?.toFixed(2));
    addKeyValue('Man Month (MM)', calc?.totalManMonths?.toFixed(2));
    addKeyValue('Estimasi Waktu Pengerjaan (Bulan)', Math.ceil(calc?.totalManMonths || 0));
    sheet.addRow([]);

    addHeader('06. COST ESTIMATION (RAB / KAK)');
    const kakData = (calc?.kakTableData || []).map(k => [
        k.group, k.name, `${k.percent}%`, k.effortMM?.toFixed(3), k.roleName, formatIDR(k.rate), formatIDR(k.cost)
    ]);
    addTable(['Fase', 'Aktivitas', 'Persentase', 'Effort (MM)', 'PIC', 'Rate Per Bulan', 'Total Cost'], kakData);
    
    addKeyValue('Total Effort (MM)', calc?.totalManMonths?.toFixed(2));
    addKeyValue('Running Total', formatIDR(calc?.runningTotalCost));
    addKeyValue('Garansi 25%', formatIDR(calc?.warrantyCost));
    addKeyValue('Sub Total', formatIDR(calc?.subTotal));
    addKeyValue('PPN 11%', formatIDR(calc?.ppn));
    addKeyValue('GRAND TOTAL RAB', formatIDR(calc?.grandTotal));
};

// 4. PROJECT CHARTER
const buildCharter = (workbook, project) => {
    const sheet = workbook.addWorksheet('04 - Project Charter');
    sheet.columns = [{ width: 30 }, { width: 70 }, { width: 25 }, { width: 25 }];
    const { addHeader, addKeyValue, addTable } = makeHelpers(sheet);

    addHeader('01. INFORMASI UMUM & STRATEGIC ALIGNMENT');
    addKeyValue('Proses Terdampak', project?.charter?.prosesTerdampak);
    addKeyValue('Tanggal Mulai (Diharapkan)', project?.charter?.tanggalMulai);
    addKeyValue('Tanggal Selesai (Diharapkan)', project?.charter?.tanggalSelesai);
    addKeyValue('Kasus Bisnis', project?.charter?.kasusBisnis);
    addKeyValue('Sasaran / Tujuan', project?.charter?.sasaran);
    addKeyValue('Faktor Penentu Keberhasilan', project?.charter?.faktorPenentu);
    addKeyValue('Area Layanan', project?.charter?.areaLayanan);
    addKeyValue('Catatan Analisis Probis', project?.charter?.catatanProbis);
    sheet.addRow([]);

    addHeader('02. LINGKUP PROYEK');
    addKeyValue('In-Scope', project?.charter?.scope);
    addKeyValue('Out-of-Scope', project?.charter?.outOfScope);
    sheet.addRow([]);

    addHeader('03. TIMELINE TENTATIVE');
    const tlData = (project?.charter?.timeline || []).map((t, i) => [i + 1, t.milestone, t.start, t.end, t.note]);
    addTable(['No', 'Key Milestone', 'Start Date', 'End Date', 'Keterangan'], tlData);

    addHeader('04. SUMBER DAYA & BIAYA PROYEK');
    const teamData = (project?.charter?.team || []).map((t, i) => [i + 1, t.name, t.role, t.responsibility]);
    addTable(['No', 'Nama / NIP', 'Peran', 'Tugas & Kewenangan'], teamData);
    addKeyValue('Kebutuhan Pendukung', project?.charter?.kebutuhanPendukung);
    addKeyValue('Kebutuhan Khusus', project?.charter?.kebutuhanKhusus);
    sheet.addRow([]);

    addHeader('05. MANFAAT & PENGAMPU');
    addKeyValue('Pemangku Kepentingan (Stakeholders)', project?.charter?.stakeholders);
    addKeyValue('Pengguna Akhir / User', project?.charter?.endUsers);
    addKeyValue('Manfaat yang Diharapkan', project?.charter?.manfaat);
    sheet.addRow([]);

    addHeader('06. RISIKO, KENDALA & ASUMSI');
    addKeyValue('Risiko', project?.charter?.risks);
    addKeyValue('Kendala', project?.charter?.constraints);
    addKeyValue('Asumsi', project?.charter?.assumptions);
};

// 5. FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
const buildFSD = (workbook, project) => {
    const sheet = workbook.addWorksheet('05 - FSD');
    sheet.columns = [{ width: 25 }, { width: 35 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];
    const { addHeader, addKeyValue, addTable } = makeHelpers(sheet);

    addHeader('01. INFORMASI FSD & MOCK UP');
    addKeyValue('Tanggal Dokumen FSD', project?.tanggalFSD);
    addKeyValue('Link Mock Up (Figma)', project?.tautanMockup);
    sheet.addRow([]);

    addHeader('02. DIAGRAM ALUR PROSES BISNIS'); // <--- Ditambahkan di sini
    addKeyValue('Source Code BPMN (Mermaid JS)', project?.mermaid?.processFlow);
    sheet.addRow([]);

    addHeader('03. DAFTAR HAK AKSES INFORMASI (CRUD)');
    const accessData = (project?.fsdAccessRights || []).map((ar, i) => [
        i + 1, ar.role, ar.feature, ar.c ? 'Ya' : '-', ar.r ? 'Ya' : '-', ar.u ? 'Ya' : '-', ar.d ? 'Ya' : '-'
    ]);
    addTable(['No', 'Kategori Pengguna (Role)', 'Fitur', 'Create', 'Read', 'Update', 'Delete'], accessData);

    addHeader('04. RANCANGAN SISTEM & DIAGRAM');
    const designData = (project?.fsdDesign || []).map(d => [d.status, d.item, d.pic, d.link]);
    addTable(['Status', 'Artefak Rancangan', 'Nama PIC Reviu', 'Link / Referensi'], designData);
    
    // <--- Ditambahkan ERD dan UC Source Code di sini
    addKeyValue('Source Code Use Case (Mermaid JS)', project?.mermaid?.useCaseDiagram);
    addKeyValue('Source Code ERD (Mermaid JS)', project?.mermaid?.erd);
    sheet.addRow([]);

    addHeader('05. REVIU ARSITEKTUR');
    const arch = project?.fsdArchitecture || {};
    const archData = [
        [arch.database?.status || 'Pending', 'Database & Storage', arch.database?.pic || '-'],
        [arch.infra?.status || 'Pending', 'Infrastruktur & Jaringan', arch.infra?.pic || '-'],
        [arch.security?.status || 'Pending', 'Security & Keamanan', arch.security?.pic || '-']
    ];
    addTable(['Status', 'Komponen Arsitektur', 'Nama PIC Reviu'], archData);

    addHeader('06. DEVELOPMENT (SOURCE CODE)');
    const sc = project?.fsdSourceCode || {};
    addTable(['Status', 'Komponen', 'PIC Reviu', 'Link Repository'], [
        [sc.status || 'Belum', 'Source Code', sc.pic || '-', sc.link || '-']
    ]);
};

// 6. TRACEABILITY MATRIX (RTM)
const buildRTM = (workbook, project) => {
    const sheet = workbook.addWorksheet('06 - RTM (Traceability)');
    sheet.columns = [
        { width: 10 }, { width: 15 }, { width: 30 }, { width: 15 }, 
        { width: 15 }, { width: 40 }, { width: 15 }, { width: 25 }
    ];
    const { addHeader, addTable } = makeHelpers(sheet);

    addHeader('REQUIREMENT TRACEABILITY MATRIX (RTM)');
    const rtmData = (project?.rtm || []).map(r => [
        r.version, r.useCaseId, r.useCaseName, r.priority, 
        r.testCaseId, r.testCaseDesc, r.status, r.keterangan
    ]);
    addTable(['Versi', 'Kode UC', 'Nama Use Case', 'Prioritas', 'Kode TC', 'Deskripsi Test Case', 'Status', 'Keterangan'], rtmData);
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT FUNCTION
// ═════════════════════════════════════════════════════════════════════════════
export const generateExcelDocument = async (project, calc) => {
    try {
        const workbook  = new ExcelJS.Workbook();
        workbook.creator = 'CEISA 4.0 — Doc Genie';
        workbook.created = new Date();

        // Build all sheets in precise order
        buildKajian(workbook, project, calc);
        buildBRD(workbook, project, calc);
        buildPenelitian(workbook, project, calc);
        buildCharter(workbook, project);
        buildFSD(workbook, project);
        buildRTM(workbook, project);

        // Generate and save file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Clean filename formatting
        const safeName = (project?.nama || 'Dokumen_Proyek').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        saveAs(blob, `CEISA4.0_${safeName}_Planning.xlsx`);
        
    } catch (error) {
        console.error("Excel Export Error:", error);
        alert("Terjadi kesalahan saat membuat file Excel. Silakan periksa console untuk detailnya.");
    }
};
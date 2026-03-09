import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatIDR, getUseCaseComplexity, getActorComplexity } from "../constants.js";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
    navy:       "FF002F5B",
    slate800:   "FF1E293B",
    slate700:   "FF334155",
    slate200:   "FFE2E8F0",
    white:      "FFFFFFFF",
    cream:      "FFFFF8E1",
    emerald700: "FF047857",
    indigo700:  "FF3730A3",
    violet700:  "FF6D28D9",
    amber800:   "FF92400E",
    rose700:    "FFBE123C",
    blue700:    "FF1D4ED8",
    teal700:    "FF0F766E",
    orange700:  "FFC2410C",
};

// ─── Sheet Helper Factory ─────────────────────────────────────────────────────
// Returns helpers pre-bound to a specific worksheet so styling is consistent
// and each sheet is fully independent.
const makeHelpers = (sheet, accentColor = C.navy) => {

    const addTitle = (title, subtitle) => {
        const r = sheet.addRow([title]);
        r.font      = { bold: true, size: 16, color: { argb: C.white } };
        r.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentColor } };
        r.alignment = { horizontal: 'center', vertical: 'middle' };
        r.height    = 30;
        sheet.mergeCells(`A${r.number}:F${r.number}`);

        if (subtitle) {
            const r2 = sheet.addRow([subtitle]);
            r2.font      = { italic: true, size: 11 };
            r2.alignment = { horizontal: 'center' };
            sheet.mergeCells(`A${r2.number}:F${r2.number}`);
        }
        sheet.addRow([]);
    };

    const addSection = (text, color = accentColor) => {
        sheet.addRow([]);
        const r = sheet.addRow([text]);
        r.font      = { bold: true, size: 11, color: { argb: C.white } };
        r.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        r.height    = 22;
        r.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
        sheet.mergeCells(`A${r.number}:F${r.number}`);
    };

    const styleHeader = (row, bgColor = C.slate800) => {
        row.font   = { bold: true, size: 10, color: { argb: C.white } };
        row.height = 18;
        row.eachCell({ includeEmpty: true }, cell => {
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            cell.border    = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
    };

    const border = (row) => {
        row.eachCell({ includeEmpty: true }, cell => {
            cell.border    = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
            cell.alignment = { vertical: 'middle', wrapText: true };
        });
    };

    // Label (col A) + value spanning B–F
    const kv = (label, value) => {
        const row = sheet.addRow([label, value ?? '-']);
        row.getCell(1).font = { bold: true, size: 10 };
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.cream } };
        row.getCell(2).alignment = { wrapText: true };
        sheet.mergeCells(`B${row.number}:F${row.number}`);
        border(row);
        const len = String(value || '').length;
        if (len > 80) row.height = Math.max(30, Math.ceil(len / 80) * 14);
    };

    // Full-width wrapped text block
    const block = (text) => {
        const row = sheet.addRow([text || '-']);
        sheet.mergeCells(`A${row.number}:F${row.number}`);
        row.getCell(1).alignment = { wrapText: true, vertical: 'top' };
        row.getCell(1).border    = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
        const len = String(text || '').length;
        row.height = Math.max(40, Math.ceil(len / 90) * 15);
    };

    const gap = () => sheet.addRow([]);

    return { addTitle, addSection, styleHeader, border, kv, block, gap };
};

// ─── Column layout helper ─────────────────────────────────────────────────────
const setCols = (sheet, widths) => {
    sheet.columns = widths.map((w, i) => ({
        key: String.fromCharCode(65 + i), width: w
    }));
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 1 — Cover
// ═════════════════════════════════════════════════════════════════════════════
const buildCover = (wb, project, calc) => {
    const sheet = wb.addWorksheet('📋 Cover');
    setCols(sheet, [28, 32, 20, 20, 20, 20]);
    const { addTitle, addSection, kv, border, gap } = makeHelpers(sheet, C.navy);

    addTitle('DOKUMEN PENELITIAN & KAK — CEISA 4.0', `Proyek: ${project.nama}`);

    addSection('Informasi Umum Proyek');
    kv('Nama Proyek',               project.nama);
    kv('Unit Pengampu Bisnis',      project.pengampu);
    kv('Unit Penanggung Jawab TIK', project.unitPenanggungJawab);
    kv('Nama PIC',                  project.namaPIC);
    kv('Kontak PIC',                project.kontakPIC);
    kv('Target Penyelesaian',       project.targetPenyelesaian);
    kv('Target Outcome',            project.targetOutcome);
    kv('Business Value',            project.businessValue);

    addSection('Ringkasan Estimasi', C.emerald700);
    kv('Total Man-Month',       `${(calc.totalManMonths || 0).toFixed(2)} MM`);
    kv('Estimasi Waktu',        `~${Math.ceil(calc.totalManMonths || 0)} Bulan`);
    kv('Total UCP',             (calc.ucp || 0).toFixed(2));
    kv('Total Biaya (RAB)',     formatIDR(calc.grandTotal));
    kv('Rekomendasi Prioritas', calc.priority || '-');

    gap(); gap(); gap();
    addSection('Tanda Tangan', C.slate700);
    gap();

    const s1 = sheet.addRow(['Disetujui oleh:', '', '', '', 'Disusun oleh:', '']);
    s1.font = { bold: true };
    sheet.mergeCells(`A${s1.number}:C${s1.number}`);
    sheet.mergeCells(`E${s1.number}:F${s1.number}`);

    const s2 = sheet.addRow([
        project.charter?.bizProcessOwner || 'Pemilik Proses Bisnis', '', '', '',
        'System Analyst / PIC TIK', ''
    ]);
    s2.font = { bold: true, color: { argb: C.navy } };
    sheet.mergeCells(`A${s2.number}:C${s2.number}`);
    sheet.mergeCells(`E${s2.number}:F${s2.number}`);

    gap(); gap(); gap();

    const s3 = sheet.addRow([
        `Nama : ${project.charter?.bizProcessOwner || '..................'}`, '', '', '',
        `Nama : ${project.namaPIC || '..................'}`, ''
    ]);
    sheet.mergeCells(`A${s3.number}:C${s3.number}`);
    sheet.mergeCells(`E${s3.number}:F${s3.number}`);

    const s4 = sheet.addRow(['NIP  : ..................', '', '', '', 'NIP  : ..................', '']);
    sheet.mergeCells(`A${s4.number}:C${s4.number}`);
    sheet.mergeCells(`E${s4.number}:F${s4.number}`);
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 2 — Kajian Kebutuhan
// ═════════════════════════════════════════════════════════════════════════════
const buildKajian = (wb, project) => {
    const sheet = wb.addWorksheet('📄 Kajian');
    setCols(sheet, [28, 32, 22, 22, 22, 22]);
    const { addTitle, addSection, styleHeader, border, kv, block, gap } = makeHelpers(sheet, C.indigo700);

    addTitle('Kajian Kebutuhan', project.nama);

    // Latar Belakang & Masalah
    addSection('Latar Belakang & Masalah');
    sheet.addRow(['Latar Belakang / Urgensi']).getCell(1).font = { bold: true };
    block(project.latarBelakang);
    gap();
    sheet.addRow(['Masalah / Isu (Pain Points)']).getCell(1).font = { bold: true };
    block(project.masalahIsu);

    // Target & Outcome
    addSection('Target & Outcome');
    kv('Target Penyelesaian', project.targetPenyelesaian);
    kv('Target Outcome',      project.targetOutcome);
    kv('Outcome / Keluaran',  project.outcomeKeluaran);
    kv('Business Value',      project.businessValue);

    // As-Is → To-Be
    addSection('Kondisi As-Is → To-Be');
    const aisHdr = sheet.addRow(['No', 'Faktor Pembanding', 'Kondisi As-Is', '', 'Kondisi To-Be', '']);
    styleHeader(aisHdr);
    sheet.mergeCells(`C${aisHdr.number}:D${aisHdr.number}`);
    sheet.mergeCells(`E${aisHdr.number}:F${aisHdr.number}`);
    aisHdr.getCell(2).alignment = { horizontal: 'left' };

    (project.asIsToBe || []).forEach((item, idx) => {
        const row = sheet.addRow([idx + 1, item.factor || '-', item.asIs || '-', '', item.toBe || '-', '']);
        sheet.mergeCells(`C${row.number}:D${row.number}`);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
        row.getCell(2).font = { bold: true };
        // Stripe rows
        if (idx % 2 === 0) {
            [3, 4, 5, 6].forEach(c => {
                row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            });
        }
    });

    // Alur Bisnis
    addSection('Alur Bisnis Proses');
    block(project.alurBisnisProses);

    // Risiko Bisnis
    addSection('Risiko Bisnis', C.rose700);
    const riskHdr = sheet.addRow(['No', 'Risiko', 'Dampak', 'Mitigasi', 'Level', '']);
    styleHeader(riskHdr, C.rose700);

    (project.risikoBisnis || []).forEach((r, idx) => {
        const row = sheet.addRow([idx + 1, r.risk || '-', r.impact || '-', r.mitigasi || '-', r.level || '-', '']);
        border(row);
        const levelFill = { Tinggi: 'FFFEE2E2', Sedang: 'FFFEF9C3', Rendah: 'FFF0FDF4' };
        row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: levelFill[r.level] || C.slate200 } };
        row.getCell(5).font = { bold: true };
    });

    // BIA
    addSection('Business Impact Analysis (BIA)', C.violet700);
    const bia = project.bia || {};
    ['operasional', 'finansial', 'reputasi', 'hukum'].forEach(key => {
        kv(key.charAt(0).toUpperCase() + key.slice(1), bia[key] || '-');
    });
    kv('RTO (Recovery Time Objective)', bia.rto || '-');
    kv('RPO (Recovery Point Objective)', bia.rpo || '-');
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 3 — BRD
// ═════════════════════════════════════════════════════════════════════════════
const buildBRD = (wb, project) => {
    const sheet = wb.addWorksheet('📌 BRD');
    setCols(sheet, [10, 22, 50, 16, 16, 14]);
    const { addTitle, addSection, styleHeader, border, kv } = makeHelpers(sheet, C.blue700);

    addTitle('Business Requirement Document (BRD)', project.nama);

    // Analisis Proses Bisnis
    addSection('Analisis Proses Bisnis');
    const bpa = project.brdProcessAnalysis || {};
    kv('Modul',                bpa.modul     || '-');
    kv('Sub Modul',            bpa.subModul  || '-');
    kv('Pemetaan EA Kemenkeu', bpa.eaMapping || '-');
    kv('Catatan',              bpa.notes     || '-');

    // Kebutuhan Fungsional
    addSection('Kebutuhan Fungsional');
    const kfHdr = sheet.addRow(['No', 'ID', 'Deskripsi Kebutuhan', '', 'Prioritas', '']);
    styleHeader(kfHdr);
    sheet.mergeCells(`C${kfHdr.number}:D${kfHdr.number}`);
    sheet.mergeCells(`E${kfHdr.number}:F${kfHdr.number}`);
    kfHdr.getCell(3).alignment = { horizontal: 'left' };

    (project.kebutuhanFungsional || []).forEach((item, idx) => {
        const row = sheet.addRow([idx + 1, item.id || '-', item.deskripsi || '-', '', item.prioritas || '-', '']);
        sheet.mergeCells(`C${row.number}:D${row.number}`);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
        if (item.prioritas === 'Mandatory') {
            row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
            row.getCell(5).font = { bold: true };
        }
    });

    // Kebutuhan Non-Fungsional
    addSection('Kebutuhan Non-Fungsional', C.teal700);
    const nfrHdr = sheet.addRow(['No', 'Kategori', 'Deskripsi', '', '', '']);
    styleHeader(nfrHdr, C.teal700);
    sheet.mergeCells(`C${nfrHdr.number}:F${nfrHdr.number}`);
    nfrHdr.getCell(3).alignment = { horizontal: 'left' };

    (project.kebutuhanNonFungsional || []).forEach((item, idx) => {
        const row = sheet.addRow([idx + 1, item.kategori || '-', item.deskripsi || '-', '', '', '']);
        sheet.mergeCells(`C${row.number}:F${row.number}`);
        border(row);
        row.getCell(2).font = { bold: true };
        // Category colour bands
        const catColor = {
            Performance: 'FFE0F2FE', Security: 'FFFCE7F3',
            Availability: 'FFF0FDF4', Reliability: 'FFFEF9C3', Scalability: 'FFEDE9FE'
        };
        if (catColor[item.kategori]) {
            row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: catColor[item.kategori] } };
        }
    });
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 4 — UCP & RAB
// ═════════════════════════════════════════════════════════════════════════════
const buildUCPandRAB = (wb, project, calc) => {
    const sheet = wb.addWorksheet('🔢 UCP & RAB');
    setCols(sheet, [10, 34, 24, 18, 18, 22]);
    const { addTitle, addSection, styleHeader, border, kv, gap } = makeHelpers(sheet, C.emerald700);

    addTitle('Perhitungan UCP & Estimasi Biaya (RAB)', project.nama);

    // ── Actors (UAW)
    addSection('Spesifikasi Aktor (UAW)');
    const actHdr = sheet.addRow(['No', 'Nama Aktor', 'Deskripsi', 'Tipe', 'UAW', '']);
    styleHeader(actHdr, C.slate700);

    (project.actors || []).forEach((actor, idx) => {
        const row = sheet.addRow([
            idx + 1, actor.name, actor.desc || '-', actor.type,
            getActorComplexity(actor.type).weight, ''
        ]);
        border(row);
        row.getCell(2).font = { bold: true };
        row.getCell(5).alignment = { horizontal: 'center' };
    });

    const uawTotal = sheet.addRow(['', 'Total UAW', '', '', calc.uaw || 0, '']);
    uawTotal.font = { bold: true };
    uawTotal.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    uawTotal.getCell(5).alignment = { horizontal: 'center' };
    sheet.mergeCells(`B${uawTotal.number}:D${uawTotal.number}`);
    border(uawTotal);

    // ── Use Cases (UUCW)
    addSection('Use Case Deskripsi (UUCW)');
    const ucHdr = sheet.addRow(['No', 'Nama Use Case', 'Sub-System', 'Aktor', 'Trans.', 'UUCW']);
    styleHeader(ucHdr, C.slate700);

    (project.useCases || []).forEach((uc, idx) => {
        const row = sheet.addRow([
            idx + 1, uc.name, uc.subSystem || '-', uc.actorRef || '-',
            uc.transactions, getUseCaseComplexity(uc.transactions).weight
        ]);
        border(row);
        row.getCell(2).font = { bold: true };
        [5, 6].forEach(c => row.getCell(c).alignment = { horizontal: 'center' });
    });

    const uucwTotal = sheet.addRow(['', 'Total UUCW', '', '', '', calc.uucw || 0]);
    uucwTotal.font = { bold: true };
    uucwTotal.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
    uucwTotal.getCell(6).alignment = { horizontal: 'center' };
    sheet.mergeCells(`B${uucwTotal.number}:E${uucwTotal.number}`);
    border(uucwTotal);

    // ── Pre/Post Conditions
    addSection('Pre / Post Conditions per Use Case', C.slate700);
    const condHdr = sheet.addRow(['No', 'Use Case', 'Kondisi Awal (Pre)', '', 'Kondisi Akhir (Post)', '']);
    styleHeader(condHdr, C.slate700);
    sheet.mergeCells(`C${condHdr.number}:D${condHdr.number}`);
    sheet.mergeCells(`E${condHdr.number}:F${condHdr.number}`);
    [3, 5].forEach(c => condHdr.getCell(c).alignment = { horizontal: 'left' });

    (project.useCases || []).forEach((uc, idx) => {
        const row = sheet.addRow([idx + 1, uc.name, uc.preCond || '-', '', uc.postCond || '-', '']);
        sheet.mergeCells(`C${row.number}:D${row.number}`);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
    });

    // ── UCP Index
    addSection('Final UCP Complexity Index');
    kv('TCF (Technical Complexity Factor)', (calc.tcf  || 0).toFixed(3));
    kv('EF  (Environmental Factor)',        (calc.ef   || 0).toFixed(3));
    kv('UAW',                               calc.uaw   || 0);
    kv('UUCW',                              calc.uucw  || 0);
    kv('Final UCP',                         (calc.ucp  || 0).toFixed(2));

    // ── Man-Month Estimation
    addSection('Man-Month Estimation');
    const mmHdr = sheet.addRow(['UCP', 'PHM', 'Total Person-Hours', 'Man Month (MM)', 'Estimasi Waktu', '']);
    styleHeader(mmHdr, C.emerald700);
    const mmRow = sheet.addRow([
        (calc.ucp || 0).toFixed(2),
        project.phm || '-',
        `${(calc.totalPersonHours || 0).toFixed(0)} Jam`,
        (calc.totalManMonths || 0).toFixed(2),
        `~${Math.ceil(calc.totalManMonths || 0)} Bulan`,
        ''
    ]);
    mmRow.font = { bold: true, size: 12 };
    mmRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    border(mmRow);

    // ── RAB / KAK
    addSection('Estimasi Biaya (RAB) & KAK');
    const rabHdr = sheet.addRow(['No', 'Fase / Aktivitas', 'Role', '%', 'MM', 'Biaya']);
    styleHeader(rabHdr, C.navy);

    (calc.kakTableData || []).forEach((item, idx) => {
        const row = sheet.addRow([
            idx + 1, item.name, item.roleName,
            `${item.percent}%`, item.effortMM.toFixed(3), formatIDR(item.cost)
        ]);
        border(row);
        if (idx % 2 === 0) {
            row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
        row.getCell(6).alignment = { horizontal: 'right' };
    });

    const totalRow = (label, value, highlight = false) => {
        const row = sheet.addRow(['', label, '', '', '', value]);
        row.font = { bold: true };
        row.getCell(2).alignment = { horizontal: 'right' };
        row.getCell(6).alignment = { horizontal: 'right' };
        sheet.mergeCells(`B${row.number}:E${row.number}`);
        border(row);
        if (highlight) {
            row.eachCell({ includeEmpty: true }, cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            });
            row.font = { bold: true, size: 12, color: { argb: C.emerald700 } };
        }
    };

    gap();
    totalRow('Total Effort Cost',          formatIDR(calc.runningTotalCost));
    totalRow('Estimasi Garansi (25%)',      formatIDR(calc.warrantyCost));
    totalRow('Sub Total',                  formatIDR(calc.subTotal));
    totalRow('PPN (11%)',                  formatIDR(calc.ppn));
    totalRow('TOTAL BIAYA ESTIMASI (RAB)', formatIDR(calc.grandTotal), true);
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 5 — FSD
// ═════════════════════════════════════════════════════════════════════════════
const buildFSD = (wb, project) => {
    const sheet = wb.addWorksheet('🎨 FSD');
    setCols(sheet, [10, 30, 22, 22, 16, 16]);
    const { addTitle, addSection, styleHeader, border, kv, block } = makeHelpers(sheet, C.teal700);

    addTitle('Functional Specification Document (FSD)', project.nama);

    // Dokumen Referensi
    addSection('Dokumen & Diagram Referensi');
    const refHdr = sheet.addRow(['No', 'Diagram / Dokumen', 'PIC', 'Link Referensi', '', '']);
    styleHeader(refHdr, C.slate700);
    sheet.mergeCells(`D${refHdr.number}:F${refHdr.number}`);

    (project.fsdDesign || []).forEach((item, idx) => {
        const linkVal = item.link ? { text: item.link, hyperlink: item.link } : '-';
        const row = sheet.addRow([idx + 1, item.item, item.pic, linkVal, '', '']);
        sheet.mergeCells(`D${row.number}:F${row.number}`);
        if (item.link) row.getCell(4).font = { color: { argb: 'FF0563C1' }, underline: true };
        border(row);
    });

    // Mermaid Diagrams as code
    addSection('Diagram BPMN — Alur Proses Bisnis (Mermaid)', C.slate700);
    block(project.mermaid?.processFlow);

    addSection('Use Case Diagram (Mermaid)', C.slate700);
    block(project.mermaid?.useCaseDiagram);

    addSection('Data Model / ERD (Mermaid)', C.slate700);
    block(project.mermaid?.erd);

    // Mock Ups
    addSection('Mock Up Pages');
    const mockHdr = sheet.addRow(['No', 'Nama Page', 'Link Figma / Mockup', '', '', '']);
    styleHeader(mockHdr, C.slate700);
    sheet.mergeCells(`C${mockHdr.number}:F${mockHdr.number}`);

    (project.fsdMockups || []).forEach((mock, idx) => {
        const linkVal = mock.link ? { text: mock.link, hyperlink: mock.link } : '-';
        const row = sheet.addRow([idx + 1, mock.name, linkVal, '', '', '']);
        sheet.mergeCells(`C${row.number}:F${row.number}`);
        if (mock.link) row.getCell(3).font = { color: { argb: 'FF0563C1' }, underline: true };
        border(row);
    });

    // Hak Akses / CRUD Matrix — 7 logical cols squeezed into 6 by combining U+D
    addSection('Hak Akses (CRUD Matrix)', C.amber800);
    const crudHdr = sheet.addRow(['No', 'Role', 'Fitur / Modul', 'C', 'R', 'U / D']);
    styleHeader(crudHdr, C.amber800);

    const check = (v) => v ? '✓' : '✗';
    (project.fsdAccessRights || []).forEach((item, idx) => {
        const row = sheet.addRow([
            idx + 1,
            item.role    || '-',
            item.feature || '-',
            check(item.c),
            check(item.r),
            `${check(item.u)} / ${check(item.d)}`
        ]);
        border(row);
        [4, 5, 6].forEach(col => {
            const cell = row.getCell(col);
            cell.alignment = { horizontal: 'center' };
            if (cell.value === '✓') {
                cell.font = { bold: true, color: { argb: C.emerald700 } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
            } else if (String(cell.value).startsWith('✗')) {
                cell.font = { color: { argb: 'FFB91C1C' } };
            }
        });
    });

    // Source Code
    addSection('Source Code Repository', C.slate700);
    kv('Link Git / Repository', project.fsdSourceCode?.link || '-');
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 6 — Project Charter
// ═════════════════════════════════════════════════════════════════════════════
const buildCharter = (wb, project) => {
    const sheet = wb.addWorksheet('🚩 Charter');
    setCols(sheet, [10, 28, 18, 18, 32, 14]);
    const { addTitle, addSection, styleHeader, border, kv, block } = makeHelpers(sheet, C.orange700);

    addTitle('Project Charter', project.nama);

    addSection('Lingkup Kerja (Scope)');
    block(project.charter?.scope);

    addSection('Manfaat yang Diharapkan', C.emerald700);
    block(project.charter?.benefits);

    addSection('Risiko Proyek', C.rose700);
    block(project.charter?.risks);

    addSection('Pengampu Proses Bisnis', C.slate700);
    kv('Pengampu', project.charter?.bizProcessOwner || '-');

    addSection('Jadwal Pelaksanaan (Timeline)');
    const tlHdr = sheet.addRow(['No', 'Key Milestone', 'Start', 'End', 'Keterangan', '']);
    styleHeader(tlHdr, C.orange700);
    sheet.mergeCells(`E${tlHdr.number}:F${tlHdr.number}`);

    (project.charter?.timeline || []).forEach((t) => {
        const row = sheet.addRow([t.id, t.milestone, t.start, t.end, t.note || '-', '']);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
        row.getCell(2).font = { bold: true };
        [3, 4].forEach(c => row.getCell(c).alignment = { horizontal: 'center' });
    });

    addSection('Tim Proyek Pengembang');
    const teamHdr = sheet.addRow(['No', 'Nama / NIP', 'Peran', '', 'Tugas dan Kewenangan', '']);
    styleHeader(teamHdr, C.orange700);
    sheet.mergeCells(`C${teamHdr.number}:D${teamHdr.number}`);
    sheet.mergeCells(`E${teamHdr.number}:F${teamHdr.number}`);

    (project.charter?.team || []).forEach((t) => {
        const row = sheet.addRow([t.id, t.name || '-', t.role || '-', '', t.responsibility || '-', '']);
        sheet.mergeCells(`C${row.number}:D${row.number}`);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
        row.getCell(2).font = { bold: true };
    });
};

// ═════════════════════════════════════════════════════════════════════════════
//  SHEET 7 — Business Value vs Effort
// ═════════════════════════════════════════════════════════════════════════════
const buildBVEffort = (wb, project, calc) => {
    const sheet = wb.addWorksheet('📊 BV vs Effort');
    setCols(sheet, [28, 36, 14, 14, 14, 14]);
    const { addTitle, addSection, styleHeader, border, kv } = makeHelpers(sheet, C.violet700);

    addTitle('Business Value vs Effort & Prioritas Proyek', project.nama);

    // Scorecard
    addSection('Hasil Perhitungan & Rekomendasi');
    kv('Total Business Value Score', (calc.totalBV     || 0).toFixed(2));
    kv('Total Effort Score',         (calc.totalEffort || 0).toFixed(2));

    // Priority highlight row
    const prioRow = sheet.addRow(['Rekomendasi Prioritas', calc.priority || '-']);
    prioRow.height = 28;
    prioRow.font = { bold: true, size: 14, color: { argb: C.violet700 } };
    prioRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.cream } };
    prioRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E8FF' } };
    prioRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(`B${prioRow.number}:F${prioRow.number}`);
    prioRow.eachCell({ includeEmpty: true }, cell => {
        cell.border = { top:{style:'medium'}, left:{style:'medium'}, bottom:{style:'medium'}, right:{style:'medium'} };
    });

    // Detail per-category
    addSection('Detail Pilihan per Kategori', C.blue700);
    const detHdr = sheet.addRow(['Kategori', 'Label Pilihan', 'Score', 'Tipe', '', '']);
    styleHeader(detHdr, C.blue700);
    sheet.mergeCells(`E${detHdr.number}:F${detHdr.number}`);

    const bvEffort = project.bvEffort || {};
    Object.entries(bvEffort).forEach(([key, val]) => {
        if (!val) return;
        const isBV = (val.score ?? 0) >= 0; // rough split; adjust if constants provide a 'type' field
        const row = sheet.addRow([key, val.label ?? '-', val.score ?? '-', isBV ? 'BV' : 'Effort', '', '']);
        sheet.mergeCells(`E${row.number}:F${row.number}`);
        border(row);
        row.getCell(1).font = { bold: true };
        row.getCell(3).alignment = { horizontal: 'center' };
        row.getCell(4).alignment = { horizontal: 'center' };
        // Colour-code score
        if (typeof val.score === 'number') {
            const hiScore = val.score >= 4;
            row.getCell(3).fill = { type: 'pattern', pattern: 'solid',
                fgColor: { argb: hiScore ? 'FFD1FAE5' : 'FFFFF7ED' }
            };
        }
    });
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════
export const generateExcelDocument = async (project, calc) => {
    const workbook  = new ExcelJS.Workbook();
    workbook.creator = 'CEISA 4.0 — Doc Generator';
    workbook.created = new Date();

    buildCover    (workbook, project, calc);  // 📋 Sheet 1
    buildKajian   (workbook, project);        // 📄 Sheet 2
    buildBRD      (workbook, project);        // 📌 Sheet 3
    buildUCPandRAB(workbook, project, calc);  // 🔢 Sheet 4
    buildFSD      (workbook, project);        // 🎨 Sheet 5
    buildCharter  (workbook, project);        // 🚩 Sheet 6
    buildBVEffort (workbook, project, calc);  // 📊 Sheet 7

    const buffer = await workbook.xlsx.writeBuffer();
    const blob   = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `CEISA_${(project.nama || 'Proyek').replace(/\s+/g, '_')}.xlsx`);
};
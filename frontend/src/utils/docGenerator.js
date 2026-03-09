import { 
    Document, Packer, Paragraph, TextRun, Table, TableRow, 
    TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, ExternalHyperlink 
} from "docx";
import { formatIDR, getUseCaseComplexity, getActorComplexity } from "../constants.js";

// ─── Design tokens — change here to update entire document ────────────────
const COLORS = {
    headerDark:   "1E293B", // slate-800 — primary table header
    headerMid:    "334155", // slate-700 — section banners  
    headerLight:  "E2E8F0", // slate-200 — light alternating rows / subtotals
    white:        "FFFFFF",
    accent:       "002f5b", // DJBC navy blue
};

/**
 * Helper to create simple text cells with consistent styling
 */
const createTextCell = (text, bold = false, fill = undefined, textColor = undefined) => {
    return new TableCell({
        children: [new Paragraph({ 
            children: [new TextRun({ 
                text: text || "-", 
                bold: bold, 
                size: 24, // 12pt
                color: textColor 
            })], 
        })],
        shading: fill ? { fill: fill } : undefined,
        verticalAlign: "center",
        margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
};

// Dark-background header cell (white text)
const createHeaderCell = (text) => createTextCell(text, true, COLORS.headerDark, COLORS.white);

const createHeader = (text) => {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
    });
};

const createSubHeader = (text) => {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
    });
};

const createLabelValue = (label, value) => {
    return new Paragraph({
        children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: value || "-" })
        ],
        spacing: { after: 100 }
    });
};

/**
 * Main function to generate and download the .docx file
 */
export const generateWordDocument = async (project, calc) => {
    
    // --- SECTION 1: KAJIAN KEBUTUHAN ---
    const generalInfo = [
        createHeader("1. Kajian Kebutuhan & Informasi Umum"),
        createLabelValue("Nama Proyek", project.nama),
        createLabelValue("Unit Pengampu", project.pengampu),
        createLabelValue("Unit Penanggung Jawab", project.unitPenanggungJawab),
        createLabelValue("PIC", `${project.namaPIC} (${project.kontakPIC})`),
        createSubHeader("Latar Belakang & Masalah"),
        new Paragraph({ text: project.latarBelakang }),
        new Paragraph({ children: [new TextRun({ text: "\nMasalah Utama:", bold: true })] }),
        new Paragraph({ text: project.masalahIsu }),
        createSubHeader("Target & Outcome"),
        createLabelValue("Target Penyelesaian", project.targetPenyelesaian),
        createLabelValue("Target Outcome", project.targetOutcome),
        createLabelValue("Business Value", project.businessValue),
    ];

    // --- SECTION 2: COST ESTIMATION (RAB) ---
    const costRows = calc.kakTableData.map((item) => 
        new TableRow({
            children: [
                createTextCell(item.name),
                createTextCell(`${item.percent}%`),
                createTextCell(item.effortMM.toFixed(3)),
                createTextCell(item.roleName),
                createTextCell(formatIDR(item.rate)),
                createTextCell(formatIDR(item.cost)),
            ]
        })
    );

    const totalRows = [
        new TableRow({ children: [createTextCell("Total Effort Cost", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.runningTotalCost), true)] }),
        new TableRow({ children: [createTextCell("Estimasi Garansi (25%)", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.warrantyCost), true)] }),
        new TableRow({ children: [createTextCell("Sub Total", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.subTotal), true)] }),
        new TableRow({ children: [createTextCell("PPN (11%)", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.ppn), true)] }),
        new TableRow({ children: [createTextCell("TOTAL BIAYA ESTIMASI (RAB)", true, COLORS.headerLight), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.grandTotal), true, COLORS.headerLight)] }),
    ];

    const costTable = new Table({
        rows: [
            new TableRow({
                children: [
                    createHeaderCell("Fase / Aktivitas"), // Slate-800
                    createHeaderCell("%"),
                    createHeaderCell("MM"),
                    createHeaderCell("Role"),
                    createHeaderCell("Rate"),
                    createHeaderCell("Biaya"),
                ]
            }),
            ...costRows,
            ...totalRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 3: USE CASES & ACTORS ---
    const actorRows = project.actors.map((actor, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString()),
                createTextCell(actor.name, true),
                createTextCell(actor.desc || ""),
                createTextCell(actor.type),
                createTextCell(getActorComplexity(actor.type).weight.toString())
            ]
        })
    );

    const actorTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("No", true, COLORS.headerLight), createTextCell("Aktor", true, COLORS.headerLight), createTextCell("Deskripsi", true, COLORS.headerLight), createTextCell("Tipe", true, COLORS.headerLight), createTextCell("UAW", true, COLORS.headerLight)] }),
            ...actorRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    const ucRows = project.useCases.map((uc, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString()),
                createTextCell(uc.name, true),
                createTextCell(uc.subSystem || "-"),
                createTextCell(uc.transactions.toString()),
                createTextCell(getUseCaseComplexity(uc.transactions).weight.toString())
            ]
        })
    );

    const ucTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("No", true, COLORS.headerLight), createTextCell("Use Case", true, COLORS.headerLight), createTextCell("Sub-System", true, COLORS.headerLight), createTextCell("Trans.", true, COLORS.headerLight), createTextCell("UUCW", true, COLORS.headerLight)] }),
            ...ucRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 4: BRD (FUNCTIONAL REQS) ---
    const reqRows = project.kebutuhanFungsional.map((req) => 
        new TableRow({
            children: [
                createTextCell(req.id),
                createTextCell(req.deskripsi),
                createTextCell(req.prioritas)
            ]
        })
    );

    const reqTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("ID", true, COLORS.headerLight), createTextCell("Deskripsi Kebutuhan Fungsional", true, COLORS.headerLight), createTextCell("Prioritas", true, COLORS.headerLight)] }),
            ...reqRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 5: FSD (DESIGN & DIAGRAMS) ---
    const fsdRows = project.fsdDesign.map((item) => 
        new TableRow({
            children: [
                createTextCell(item.item),
                createTextCell(item.pic),
                new TableCell({
                    children: [
                        item.link ?
                        new Paragraph({
                            children: [
                                new ExternalHyperlink({
                                    children: [
                                        new TextRun({
                                            text: item.link,
                                            style: "Hyperlink",
                                            color: "0563C1",
                                            underline: { type: "single" },
                                        }),
                                    ],
                                    link: item.link,
                                }),
                            ],
                        }) : 
                        new Paragraph({ children: [new TextRun({ text: "-" })] })
                    ],
                    verticalAlign: "center",
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                })
            ]
        })
    );

    const fsdTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("Diagram / Dokumen", true, COLORS.headerLight), createTextCell("PIC", true, COLORS.headerLight), createTextCell("Link Referensi", true, COLORS.headerLight)] }),
            ...fsdRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 6: CHARTER ---
    const timelineRows = project.charter.timeline.map((t) => 
        new TableRow({
            children: [
                createTextCell(t.milestone),
                createTextCell(t.start),
                createTextCell(t.end),
                createTextCell(t.note || "-")
            ]
        })
    );

    const timelineTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("Milestone", true, COLORS.headerLight), createTextCell("Start", true, COLORS.headerLight), createTextCell("End", true, COLORS.headerLight), createTextCell("Note", true, COLORS.headerLight)] }),
            ...timelineRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SIGNATURE SECTION ---
    const signatureTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({ text: "Disetujui oleh:", spacing: { after: 100 } }),
                            new Paragraph({ text: project.charter.bizProcessOwner || "Pemilik Proses Bisnis", bold: true }),
                            new Paragraph({ text: "", spacing: { after: 800 } }), 
                            new Paragraph({ children: [new TextRun({ text: "Nama : ", bold: true }), new TextRun({ text: project.namaPIC || "...................." })] }),
                            new Paragraph({ children: [new TextRun({ text: "NIP  : ", bold: true }), new TextRun({ text: "...................." })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({ text: "Disusun oleh:", spacing: { after: 100 } }),
                            new Paragraph({ text: "System Analyst / PIC TIK", bold: true }),
                            new Paragraph({ text: "", spacing: { after: 800 } }),
                            new Paragraph({ children: [new TextRun({ text: "Nama : ", bold: true }), new TextRun({ text: "...................." })] }),
                            new Paragraph({ children: [new TextRun({ text: "NIP  : ", bold: true }), new TextRun({ text: "...................." })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                ]
            })
        ]
    });

    // --- COMPILE DOCUMENT ---
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "DOKUMEN PENELITIAN & KAK", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `CEISA 4.0 Proyek: ${project.nama}`, alignment: AlignmentType.CENTER, spacing: { after: 500 } }),
                
                ...generalInfo,
                
                createHeader("2. Estimasi Biaya (RAB) & KAK"),
                costTable,
                new Paragraph({ children: [new TextRun({ text: `Total Man-Month: ${calc.totalManMonths.toFixed(2)} MM`, bold: true })], spacing: { before: 200 } }),

                createHeader("3. Detail Perhitungan UCP"),
                createSubHeader("A. Daftar Aktor (UAW)"),
                actorTable,
                createSubHeader("B. Daftar Use Case (UUCW)"),
                ucTable,
                createSubHeader("C. Final Complexity Index"),
                new Paragraph({ text: `TCF: ${calc.tcf.toFixed(3)} | EF: ${calc.ef.toFixed(3)} | Final UCP: ${calc.ucp.toFixed(2)}`, bold: true }),

                createHeader("4. Kebutuhan Fungsional (BRD)"),
                reqTable,

                createHeader("5. Functional Specification (FSD)"),
                fsdTable,

                createHeader("6. Project Charter & Timeline"),
                new Paragraph({ text: "Lingkup Kerja:", bold: true }),
                new Paragraph({ text: project.charter.scope }),
                new Paragraph({ text: "Jadwal Pelaksanaan:", bold: true, spacing: { before: 200 } }),
                timelineTable,

                new Paragraph({ text: "", spacing: { before: 800 } }), 
                signatureTable
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CEISA_Kajian_${project.nama.replace(/\s+/g, '_')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
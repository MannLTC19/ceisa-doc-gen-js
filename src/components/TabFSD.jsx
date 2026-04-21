import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
    Layout, Server, Code, Link as LinkIcon, Plus, Trash2, 
    UserCheck, Database, ShieldCheck, Maximize, X, Workflow,
    ZoomIn, ZoomOut, RefreshCw, Target, MonitorSmartphone, LayoutList
} from 'lucide-react';

// ─── MERMAID INIT ────────────────────────────────────────────────────────
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default', 
    securityLevel: 'loose',
    suppressErrorRendering: true,
    flowchart: { useMaxWidth: false, htmlLabels: true } 
});

export const TabFSD = ({ 
    project, setProject, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {
    const [fullScreenDiagram, setFullScreenDiagram] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    const mermaidRefs = {
        processFlow: useRef(null),
        useCase: useRef(null),
        erd: useRef(null)
    };
    const fullScreenRef = useRef(null);

    // Render Mermaid diagrams safely for inline previews
    useEffect(() => {
        const renderDiagram = async (ref, id, code) => {
            if (ref.current && code) {
                try {
                    ref.current.removeAttribute('data-processed');
                    const { svg } = await mermaid.render(id, code);
                    if (ref.current) ref.current.innerHTML = svg;
                } catch (err) {
                    if (ref.current) ref.current.innerHTML = `<div style="color:var(--kt-danger); font-size:12px; font-weight: 600;">Error: ${err.message}</div>`;
                }
            }
        };
        renderDiagram(mermaidRefs.processFlow, `fsd_bpmn_${Date.now()}`, project.mermaid?.processFlow);
        renderDiagram(mermaidRefs.useCase, `fsd_uc_${Date.now()}`, project.mermaid?.useCaseDiagram);
        renderDiagram(mermaidRefs.erd, `fsd_erd_${Date.now()}`, project.mermaid?.erd);
    }, [project.mermaid?.processFlow, project.mermaid?.useCaseDiagram, project.mermaid?.erd]);

    // Handle Fullscreen Mermaid Render safely (Async)
    useEffect(() => {
        if (fullScreenDiagram && fullScreenRef.current) {
            fullScreenRef.current.removeAttribute('data-processed');
            mermaid.render(`fsd_full_${Date.now()}`, fullScreenDiagram)
              .then(({ svg }) => {
                if (fullScreenRef.current) fullScreenRef.current.innerHTML = svg;
              })
              .catch(err => {
                if (fullScreenRef.current) fullScreenRef.current.innerHTML = `<div style="color:red;">Error render: ${err.message}</div>`;
              });
        }
    }, [fullScreenDiagram]);

    const closeFullscreen = () => {
        setFullScreenDiagram(null);
        setZoomLevel(1);
    };

    const handleUpdateArch = (domain, field, value) => {
        setProject(prev => ({
            ...prev,
            fsdArchitecture: {
                ...(prev.fsdArchitecture),
                [domain]: { ...(prev.fsdArchitecture?.[domain]), [field]: value }
            }
        }));
    };

    const cleanTableHeaderStyle = {
        background: '#f4f5f8', color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '0.05em', fontWeight: 700, padding: '12px 16px', borderBottom: '1px solid #e4e6ef'
    };

    // Ensure backwards compatibility if they don't have the new design array
    const designItems = project.fsdDesign?.length >= 5 ? project.fsdDesign : [
        { id: 'd1', status: 'Belum', item: 'Use Case Diagram', pic: '', link: '' },
        { id: 'd2', status: 'Belum', item: 'Activity Diagram', pic: '', link: '' },
        { id: 'd3', status: 'Belum', item: 'Class Diagram',    pic: '', link: '' },
        { id: 'd4', status: 'Belum', item: 'Rancangan Basis Data (ERD & Kamus Data)', pic: '', link: '' },
        { id: 'd5', status: 'Belum', item: 'Rancangan Service / API Collection', pic: '', link: '' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <div className="kt-notice kt-notice-primary" style={{ background: 'var(--kt-primary-light)', borderColor: 'rgba(27,132,255,0.2)', color: 'var(--kt-primary)' }}>
                <Layout />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Functional Specification Document (FSD)</div>
                    <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
                        FSD diisi oleh Tim Pengembang (Project Manager, System Analyst, Programmer, Tim DB, Tim Infra) untuk mendefinisikan spesifikasi teknis dan rancangan sistem.
                    </div>
                </div>
            </div>

            {/* ── 01. INFORMASI UMUM ──────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Target style={{ color: 'var(--kt-primary)' }}/> 01. Informasi Umum</h3>
                </div>
                <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label className="kt-label" style={{ fontSize: 11 }}>Nama Proyek</label><div style={{ fontWeight: 700, fontSize: 14 }}>{project.nama || '-'}</div></div>
                    <div><label className="kt-label" style={{ fontSize: 11 }}>Uraian Singkat</label><div style={{ fontSize: 13 }}>{project.uraianUsulan || '-'}</div></div>
                    <div><label className="kt-label" style={{ fontSize: 11 }}>Unit Pengampu Bisnis Proses</label><div style={{ fontSize: 13 }}>{project.pengampu || '-'}</div></div>
                    <div className="kt-form-row">
                        <label className="kt-label" style={{ fontSize: 11 }}>Tanggal Dokumen FSD</label>
                        <input type="date" className="kt-input" style={{ width: '100%', maxWidth: 200 }} value={project.tanggalFSD || ''} onChange={(e) => setProject(prev => ({...prev, tanggalFSD: e.target.value}))} />
                    </div>
                </div>
            </div>

            {/* ── 02. DIAGRAM ALUR PROSES BISNIS ──────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Workflow style={{ color: 'var(--kt-primary)' }}/> 02. Diagram Alur Proses Bisnis</h3>
                </div>
                <div className="kt-card-body" style={{ background: '#fafafa' }}>
                    <p style={{ fontSize: 12, color: 'var(--kt-text-muted)', marginBottom: 20 }}>
                        Bagian ini menjelaskan alur proses bisnis AS IS dan TO BE dalam bagan BPMN berdasarkan hasil diskusi dengan pemilik proses bisnis.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            <label className="kt-label" style={{ fontSize: 11 }}>Source Code (Mermaid JS)</label>
                            <textarea className="kt-textarea" style={{ fontFamily: 'monospace', fontSize: 11.5, height: 280, background: '#1e1e1e', color: '#d4d4d4', resize: 'vertical' }} value={project.mermaid?.processFlow || ''} onChange={(e) => setProject(prev => ({ ...prev, mermaid: { ...prev.mermaid, processFlow: e.target.value } }))}/>
                        </div>
                        <div style={{ border: '1px solid #e4e6ef', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>Preview AS-IS / TO-BE</span>
                                {project.mermaid?.processFlow && (
                                    <button onClick={() => setFullScreenDiagram(project.mermaid.processFlow)} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'var(--kt-primary-light)' }}>
                                        <Maximize style={{ width: 14, height: 14, color: 'var(--kt-primary)' }} />
                                    </button>
                                )}
                            </div>
                            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#f8f9fa', borderRadius: 6, padding: 16 }}>
                                {project.mermaid?.processFlow ? <div ref={mermaidRefs.processFlow} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} /> : <span style={{ color: 'var(--kt-text-muted)', fontSize: 13, margin: 'auto' }}>Diagram belum tersedia.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 03. MOCK UP ─────────────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><MonitorSmartphone style={{ color: 'var(--kt-primary)' }}/> 03. Mock Up</h3>
                </div>
                <div className="kt-card-body">
                    <div className="kt-form-row">
                        <label className="kt-label">Link Mock Up (Figma / Prototype)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--kt-primary-light)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(27,132,255,0.2)' }}>
                            <LinkIcon style={{ width: 18, height: 18, color: 'var(--kt-primary)' }} />
                            <input 
                                className="kt-input" 
                                style={{ flex: 1, background: 'transparent', border: 'none', padding: 0, fontWeight: 600, outline: 'none' }}
                                value={project.tautanMockup || ''} 
                                onChange={e => setProject(prev => ({ ...prev, tautanMockup: e.target.value }))} 
                                placeholder="https://www.figma.com/..." 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 04. DAFTAR HAK AKSES INFORMASI (CRUD) ─────────────────────── */}
            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                    <h3 className="kt-card-title"><UserCheck style={{ color: 'var(--kt-primary)' }} /> 04. Daftar Hak Akses Informasi</h3>
                    <button 
                        onClick={() => handleAddArray('fsdAccessRights', { id: `ar_${Date.now()}`, role: '', feature: '', c: false, r: false, u: false, d: false })} 
                        className="kt-btn kt-btn-primary kt-btn-sm"
                        style={{ borderRadius: 8 }}
                    >
                        <Plus style={{ width: 14, height: 14 }} /> Tambah Akses
                    </button>
                </div>
                <div style={{ padding: '0 24px 16px 24px', fontSize: 12, color: 'var(--kt-text-muted)' }}>
                    <strong>C</strong> = Create | <strong>R</strong> = Read | <strong>U</strong> = Update | <strong>D</strong> = Delete | Ceklis = Memiliki hak akses
                </div>
                <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 50, textAlign: 'center' }}>No</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '30%' }}>Kategori Pengguna (Role)</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '40%' }}>Fitur / Modul</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>C</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>R</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>U</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>D</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {(project.fsdAccessRights || []).length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada matriks hak akses.</td></tr>
                            ) : (
                                project.fsdAccessRights.map((ar, idx) => (
                                    <tr key={ar.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>{idx + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input className="kt-input" style={{ fontWeight: 600 }} value={ar.role || ''} onChange={e => handleUpdateArray('fsdAccessRights', ar.id, 'role', e.target.value)} placeholder="Contoh: Pegawai" />
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input className="kt-input" value={ar.feature || ''} onChange={e => handleUpdateArray('fsdAccessRights', ar.id, 'feature', e.target.value)} placeholder="Contoh: Merekam Draft Nota Dinas" />
                                        </td>
                                        {['c', 'r', 'u', 'd'].map(perm => (
                                            <td key={perm} style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <input type="checkbox" checked={ar[perm] || false} onChange={e => handleUpdateArray('fsdAccessRights', ar.id, perm, e.target.checked)} style={{ cursor: 'pointer', width: 16, height: 16 }} />
                                            </td>
                                        ))}
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveArray('fsdAccessRights', ar.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                                <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── 05. RANCANGAN (DOKUMEN & DIAGRAM) ─────────────────────────── */}
            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><LayoutList style={{ color: 'var(--kt-primary)' }} /> 05. Rancangan Sistem</h3>
                </div>
                
                {/* Tabel Dokumen Rancangan */}
                <div style={{ overflowX: 'auto', borderBottom: '1px solid #e4e6ef' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f4f5f8' }}>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 140 }}>Status</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>Artefak</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>PIC Reviu</th>
                                <th style={cleanTableHeaderStyle}>Link / Referensi</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {designItems.map((design, idx) => (
                                <tr key={design.id || idx} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select 
                                            className="kt-select" 
                                            value={design.status || 'Belum'} 
                                            onChange={e => handleUpdateArray('fsdDesign', design.id, 'status', e.target.value)}
                                            style={{ 
                                                fontSize: 12, fontWeight: 700, 
                                                color: design.status === 'Selesai' ? 'var(--kt-success)' : 'var(--kt-text-muted)' 
                                            }}
                                        >
                                            <option value="Belum">Belum</option>
                                            <option value="Selesai">Selesai</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, color: 'var(--kt-text-dark)' }}>{design.item}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input className="kt-input" value={design.pic || ''} onChange={e => handleUpdateArray('fsdDesign', design.id, 'pic', e.target.value)} placeholder="Nama PIC..." />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <LinkIcon style={{ width: 14, height: 14, color: 'var(--kt-text-muted)' }} />
                                            <input className="kt-input" value={design.link || ''} onChange={e => handleUpdateArray('fsdDesign', design.id, 'link', e.target.value)} placeholder="https://..." style={{ flex: 1 }}/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Editor Mermaid untuk Rancangan (Use Case & ERD) */}
                <div className="kt-card-body" style={{ background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {[
                        { title: 'Use Case Diagram', key: 'useCaseDiagram', ref: mermaidRefs.useCase, code: project.mermaid?.useCaseDiagram },
                        { title: 'Data Model / ERD', key: 'erd', ref: mermaidRefs.erd, code: project.mermaid?.erd }
                    ].map((diag) => (
                        <div key={diag.key}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--kt-text-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Code style={{ width: 16, height: 16, color: 'var(--kt-primary)' }}/> Editor {diag.title}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                                    <label className="kt-label" style={{ fontSize: 11 }}>Source Code (Mermaid JS)</label>
                                    <textarea 
                                        className="kt-textarea" 
                                        style={{ fontFamily: 'monospace', fontSize: 11.5, height: 280, background: '#1e1e1e', color: '#d4d4d4', width: '100%', resize: 'vertical' }}
                                        value={diag.code || ''}
                                        onChange={(e) => setProject(prev => ({ ...prev, mermaid: { ...prev.mermaid, [diag.key]: e.target.value } }))}
                                    />
                                </div>
                                <div style={{ border: '1px solid #e4e6ef', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>Preview</span>
                                        {diag.code && (
                                            <button 
                                                onClick={() => setFullScreenDiagram(diag.code)} 
                                                className="kt-btn kt-btn-icon kt-btn-sm" 
                                                style={{ background: 'var(--kt-primary-light)' }} title="Lihat Fullscreen"
                                            >
                                                <Maximize style={{ width: 14, height: 14, color: 'var(--kt-primary)' }} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#f8f9fa', borderRadius: 6, padding: 16 }}>
                                        {diag.code ? <div ref={diag.ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} /> : <span style={{ color: 'var(--kt-text-muted)', fontSize: 13, margin: 'auto' }}>Diagram belum tersedia.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 06. REVIU ARSITEKTUR ────────────────────────────────────────── */}
            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Server style={{ color: 'var(--kt-primary)' }} /> 06. Reviu Arsitektur (Architecture Gate)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f4f5f8' }}>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Status Persetujuan</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>Komponen Arsitektur</th>
                                <th style={cleanTableHeaderStyle}>Nama PIC Reviu</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {[
                                { key: 'database', title: 'Database & Storage', icon: Database, color: 'var(--kt-info)' },
                                { key: 'infra', title: 'Infrastruktur & Jaringan', icon: Server, color: 'var(--kt-primary)' },
                                { key: 'security', title: 'Security & Keamanan', icon: ShieldCheck, color: 'var(--kt-danger)' }
                            ].map(domain => (
                                <tr key={domain.key} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select 
                                            className="kt-select" 
                                            value={project.fsdArchitecture?.[domain.key]?.status || 'Pending'} 
                                            onChange={e => handleUpdateArch(domain.key, 'status', e.target.value)}
                                            style={{ 
                                                fontSize: 12, fontWeight: 700, 
                                                color: project.fsdArchitecture?.[domain.key]?.status === 'Approved' ? 'var(--kt-success)' : project.fsdArchitecture?.[domain.key]?.status === 'Revisi' ? 'var(--kt-danger)' : 'var(--kt-text-muted)' 
                                            }}
                                        >
                                            <option value="Pending">Pending / Draft</option>
                                            <option value="Revisi">Perlu Revisi</option>
                                            <option value="Approved">Approved</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, color: 'var(--kt-text-dark)', fontSize: 13 }}>
                                        <domain.icon style={{ width: 16, height: 16, color: domain.color }} /> {domain.title}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input className="kt-input" value={project.fsdArchitecture?.[domain.key]?.pic || ''} onChange={e => handleUpdateArch(domain.key, 'pic', e.target.value)} placeholder="Nama PIC..." />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── 07. DEVELOPMENT (SOURCE CODE) ─────────────────────────────── */}
            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Code style={{ color: 'var(--kt-primary)' }} /> 07. Development</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f4f5f8' }}>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Status</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '20%' }}>Komponen</th>
                                <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>PIC Reviu</th>
                                <th style={cleanTableHeaderStyle}>Link Repository (GitLab)</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            <tr>
                                <td style={{ padding: '16px' }}>
                                    <select 
                                        className="kt-select" 
                                        value={project.fsdSourceCode?.status || 'Belum'} 
                                        onChange={e => setProject(prev => ({...prev, fsdSourceCode: {...prev.fsdSourceCode, status: e.target.value}}))}
                                        style={{ fontSize: 12, fontWeight: 700, color: project.fsdSourceCode?.status === 'Selesai' ? 'var(--kt-success)' : 'var(--kt-text-muted)' }}
                                    >
                                        <option value="Belum">Belum</option>
                                        <option value="Selesai">Selesai</option>
                                    </select>
                                </td>
                                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--kt-text-dark)', fontSize: 13 }}>Source Code</td>
                                <td style={{ padding: '16px' }}>
                                    <input className="kt-input" value={project.fsdSourceCode?.pic || ''} onChange={e => setProject(prev => ({...prev, fsdSourceCode: {...prev.fsdSourceCode, pic: e.target.value}}))} placeholder="Nama PIC..." />
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <LinkIcon style={{ width: 14, height: 14, color: 'var(--kt-text-muted)' }}/>
                                        <input 
                                            className="kt-input"
                                            value={project.fsdSourceCode?.link || ''} 
                                            onChange={e => setProject(prev => ({ ...prev, fsdSourceCode: { ...prev.fsdSourceCode, link: e.target.value } }))} 
                                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--kt-primary)', fontFamily: 'monospace', fontSize: 13, padding: 0, outline: 'none' }} 
                                            placeholder="https://gitlab.customs.go.id/..."
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── FULLSCREEN MODAL WITH ZOOM ─────────────────────────────────── */}
            {fullScreenDiagram && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Diagram Viewer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 4 }}>
                                <button onClick={() => setZoomLevel(z => Math.max(0.25, z - 0.25))} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }}><ZoomOut size={18} /></button>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '0 12px', display: 'flex', alignItems: 'center', minWidth: 60, justifyContent: 'center' }}>{Math.round(zoomLevel * 100)}%</div>
                                <button onClick={() => setZoomLevel(1)} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }}><RefreshCw size={16} /></button>
                                <button onClick={() => setZoomLevel(z => z + 0.25)} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }}><ZoomIn size={18} /></button>
                            </div>
                            <button onClick={closeFullscreen} style={{ background: 'var(--kt-danger)', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}>
                                <X style={{ width: 22, height: 22, color: '#fff' }} />
                            </button>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }}>
                        <div style={{ background: '#fff', padding: '40px 60px', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', minWidth: '60%', transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div ref={fullScreenRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
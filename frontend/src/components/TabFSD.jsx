import React, { useState, useEffect, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import { 
    Target, Sparkles, Workflow, Layout, 
    Server, Code, Link as LinkIcon, Plus, Trash2, 
    UserCheck, Database, GitBranch, 
    Maximize, X, ZoomIn, ZoomOut
} from 'lucide-react';

// ─── MERMAID INIT (module-level, runs once) ──────────────────────────────
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default', 
    securityLevel: 'loose',
    suppressErrorRendering: true,
    flowchart: { useMaxWidth: false, htmlLabels: true } 
});

// ─── MERMAID CODE SANITIZER ──────────────────────────────────────────────
const sanitizeMermaid = (rawCode) => {
    if (!rawCode) return "";
    return rawCode
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '  ')
        .replace(/\[\'([^\']*)\'\]/g, '["$1"]')
        .replace(/\(\[\'([^\']*)\'\]\)/g, '(["$1"])')
        .replace(/\{\'([^\']*)\'\}/g, '{"$1"}')
        .replace(/subgraph\s+'([^']+)'/g, 'subgraph "$1"')
        .replace(/;(\s*\n)/g, '$1')
        .replace(/;(\s*)$/g, '$1');
};

// ─── MERMAID VIEWER COMPONENT ────────────────────────────────────────────
const MermaidViewer = ({ code, onChange, title }) => {
    const [preview, setPreview]         = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale]             = useState(1);
    const containerRef   = useRef(null);
    const fullscreenRef  = useRef(null);

    const renderDiagram = async (element, rawCode) => {
        if (!element || !rawCode?.trim()) return;
        const diagramCode = sanitizeMermaid(rawCode);
        
        try {
            element.innerHTML = '';
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            const { svg } = await mermaid.render(id, diagramCode);
            element.innerHTML = svg;

            const svgEl = element.querySelector('svg');
            if (svgEl) {
                svgEl.style.height    = '100%';
                svgEl.style.maxWidth  = '100%';
            }
        } catch (err) {
            console.warn("Mermaid render warning:", err.message);
            element.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                            height:100%;color:var(--kt-text-muted);gap:8px;background:var(--kt-bg);
                            border:2px dashed var(--kt-border);border-radius:12px;padding:24px;text-align:center;">
                    <div style="font-size:2rem;opacity:0.4">⚡</div>
                    <p style="font-size:12px;font-weight:700;margin:0;color:var(--kt-text-dark)">Preview Unavailable</p>
                    <p style="font-size:11px;margin:0;">Switch to <strong>Code</strong> view to fix syntax</p>
                </div>`;
        }
    };

    useEffect(() => {
        if (preview) renderDiagram(containerRef.current, code);
    }, [code, preview]);

    useEffect(() => {
        if (isFullscreen && preview) {
            setTimeout(() => renderDiagram(fullscreenRef.current, code), 50);
        }
    }, [isFullscreen, code, preview]);

    return (
        <>
            {/* ── CARD VIEW ── */}
            <div className="kt-card" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
                <div className="kt-card-header" style={{ padding: '12px 16px', background: 'var(--kt-border-light)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>{title}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ display: 'flex', background: '#fff', borderRadius: 6, border: '1px solid var(--kt-border)', padding: 2 }}>
                            <button 
                                onClick={() => setPreview(false)} 
                                style={{
                                    padding: '4px 12px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none',
                                    background: !preview ? 'var(--kt-primary)' : 'transparent',
                                    color: !preview ? '#fff' : 'var(--kt-text-muted)'
                                }}
                            >
                                Code
                            </button>
                            <button 
                                onClick={() => setPreview(true)} 
                                style={{
                                    padding: '4px 12px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none',
                                    background: preview ? 'var(--kt-primary)' : 'transparent',
                                    color: preview ? '#fff' : 'var(--kt-text-muted)'
                                }}
                            >
                                Preview
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsFullscreen(true)} 
                            className="kt-btn kt-btn-light kt-btn-icon" 
                            title="Fullscreen"
                        >
                            <Maximize style={{ width: 14, height: 14 }}/>
                        </button>
                    </div>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#fff' }}>
                    {preview ? (
                        <div 
                            ref={containerRef} 
                            style={{ width: '100%', height: '100%', overflow: 'auto', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                    ) : (
                        <textarea 
                            value={code} 
                            onChange={(e) => onChange(e.target.value)} 
                            style={{ 
                                width: '100%', height: '100%', padding: 16, fontFamily: 'monospace', fontSize: 12, 
                                color: 'var(--kt-text-dark)', background: 'var(--kt-bg)', border: 'none', resize: 'none', outline: 'none' 
                            }}
                            spellCheck="false"
                            placeholder="Paste or edit Mermaid diagram code here..."
                        />
                    )}
                </div>
            </div>

            {/* ── FULLSCREEN MODAL ── */}
            {isFullscreen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
                    background: 'rgba(7, 20, 55, 0.9)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyItems: 'center', padding: 32
                }}>
                    <div style={{ background: '#fff', width: '100%', height: '100%', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--kt-border-light)', padding: '16px 24px', borderBottom: '1px solid var(--kt-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                                <Maximize style={{ width: 18, height: 18, color: 'var(--kt-primary)' }}/> {title}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => setScale(s => Math.max(0.3, s - 0.2))} className="kt-btn kt-btn-light kt-btn-icon">
                                    <ZoomOut style={{ width: 16, height: 16 }}/>
                                </button>
                                <span style={{ fontSize: 12, fontFamily: 'monospace', width: 48, textAlign: 'center', background: '#fff', border: '1px solid var(--kt-border)', borderRadius: 4, padding: '4px 0' }}>
                                    {(scale * 100).toFixed(0)}%
                                </span>
                                <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="kt-btn kt-btn-light kt-btn-icon">
                                    <ZoomIn style={{ width: 16, height: 16 }}/>
                                </button>
                                <div style={{ height: 24, width: 1, background: 'var(--kt-border)', margin: '0 8px' }}/>
                                <button 
                                    onClick={() => { setIsFullscreen(false); setScale(1); }} 
                                    className="kt-btn kt-btn-icon"
                                    style={{ background: 'var(--kt-danger-light)', color: 'var(--kt-danger)' }}
                                >
                                    <X style={{ width: 16, height: 16 }}/>
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', background: 'var(--kt-bg)', padding: 32, display: 'flex', alignItems: 'flex-start', justifyItems: 'center' }}>
                            <div 
                                ref={fullscreenRef} 
                                style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s ease', margin: '0 auto' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ─── TAB FSD ─────────────────────────────────────────────────────────────
export const TabFSD = ({ 
    project, setProject, uploadedFile, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

    // Logic: Safe updates to Mermaid structure
    const updateMermaid = (field, value) => {
        setProject(prev => ({
            ...prev,
            mermaid: { ...prev.mermaid, [field]: value }
        }));
    };

    // Logic: Auto-populate list of names for PIC inputs
    const availablePeople = useMemo(() => {
        const names = new Set();
        if (project.namaPIC) names.add(project.namaPIC);
        if (project.signatures?.approvedBy?.name) names.add(project.signatures.approvedBy.name);
        if (project.signatures?.preparedBy?.name) names.add(project.signatures.preparedBy.name);
        if (Array.isArray(project.charter?.team)) {
            project.charter.team.forEach(t => t.name && names.add(t.name));
        }
        return Array.from(names).filter(n => n?.trim() && n !== '....................');
    }, [project]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">
            <datalist id="pic-list">
                {availablePeople.map((name, idx) => <option key={idx} value={name} />)}
            </datalist>

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <div className="kt-notice kt-notice-success">
                <Target />
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Functional Specification (FSD) 
                        {uploadedFile && <Sparkles style={{ width: 14, height: 14 }}/>}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
                        Spesifikasi teknis mencakup diagram alur, mockup, hak akses, dan arsitektur pengembangan.
                    </div>
                </div>
            </div>

            {/* ── 1. BPMN ─────────────────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title">
                        <Workflow /> 1. Diagram Alur Proses Bisnis (BPMN)
                    </h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="Business Process Flow" 
                        code={project.mermaid?.processFlow || ''} 
                        onChange={val => updateMermaid('processFlow', val)} 
                    />
                </div>
            </div>

            {/* ── 2. USE CASE ─────────────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title">
                        <GitBranch /> 2. Use Case Diagram
                    </h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="System Use Case Diagram" 
                        code={project.mermaid?.useCaseDiagram || ''} 
                        onChange={val => updateMermaid('useCaseDiagram', val)} 
                    />
                </div>
            </div>

            {/* ── 3. ERD ──────────────────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title">
                        <Database /> 3. Data Model / ERD
                    </h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="Entity Relationship Diagram (ERD)" 
                        code={project.mermaid?.erd || ''} 
                        onChange={val => updateMermaid('erd', val)} 
                    />
                </div>
            </div>

            {/* ── 4 & 5. MOCKUP & RIGHTS ──────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                
                {/* Mockups */}
                <div className="kt-card">
                    <div className="kt-card-header">
                        <h3 className="kt-card-title">
                            <Layout /> 4. Mock Up (UI/UX)
                        </h3>
                        <button 
                            onClick={() => handleAddArray('fsdMockups', { id: Date.now(), name: 'Page', link: '' })} 
                            className="kt-btn kt-btn-primary kt-btn-sm"
                        >
                            <Plus style={{ width: 14, height: 14 }}/> Add Link
                        </button>
                    </div>
                    <div className="kt-card-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(project.fsdMockups || []).length === 0 && (
                                <span style={{ fontSize: 12, color: 'var(--kt-text-muted)', textAlign: 'center', padding: 20 }}>Tidak ada link mockup.</span>
                            )}
                            {(project.fsdMockups || []).map((mock, idx) => (
                                <div key={mock.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--kt-bg)', padding: 8, borderRadius: 8, border: '1px solid var(--kt-border)' }}>
                                    <span style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kt-primary-light)', color: 'var(--kt-primary)', borderRadius: '50%', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                        {idx + 1}
                                    </span>
                                    <input 
                                        value={mock.name} 
                                        onChange={e => handleUpdateArray('fsdMockups', mock.id, 'name', e.target.value)} 
                                        className="kt-input" 
                                        style={{ flex: 1, padding: '6px 10px' }}
                                        placeholder="Nama Halaman / Modul" 
                                    />
                                    <input 
                                        value={mock.link} 
                                        onChange={e => handleUpdateArray('fsdMockups', mock.id, 'link', e.target.value)} 
                                        className="kt-input" 
                                        style={{ width: 140, padding: '6px 10px', fontSize: 11, color: 'var(--kt-primary)' }}
                                        placeholder="Link Figma / URL..." 
                                    />
                                    <button onClick={() => handleRemoveArray('fsdMockups', mock.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                        <Trash2 style={{ width: 14, height: 14, color: 'var(--kt-danger)' }}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Access Rights */}
                <div className="kt-card">
                    <div className="kt-card-header">
                        <h3 className="kt-card-title">
                            <UserCheck /> 5. Hak Akses (Matrix)
                        </h3>
                        <button 
                            onClick={() => handleAddArray('fsdAccessRights', { 
                                id: `ar_${Date.now()}`, role: 'User', feature: 'Login', 
                                c: false, r: true, u: false, d: false 
                            })} 
                            className="kt-btn kt-btn-primary kt-btn-sm"
                            style={{ background: 'var(--kt-warning)', color: '#fff' }}
                        >
                            <Plus style={{ width: 14, height: 14 }}/> Add Hak Akses
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="kt-table">
                            <thead>
                                <tr>
                                    <th>Role</th>
                                    <th>Fitur</th>
                                    <th style={{ width: 30, textAlign: 'center' }} title="Create">C</th>
                                    <th style={{ width: 30, textAlign: 'center' }} title="Read">R</th>
                                    <th style={{ width: 30, textAlign: 'center' }} title="Update">U</th>
                                    <th style={{ width: 30, textAlign: 'center' }} title="Delete">D</th>
                                    <th style={{ width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(project.fsdAccessRights || []).length === 0 && (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--kt-text-muted)', fontSize: 12 }}>Belum ada data hak akses.</td></tr>
                                )}
                                {(project.fsdAccessRights || []).map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <input 
                                                value={item.role} 
                                                onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'role', e.target.value)} 
                                                className="kt-input" style={{ padding: '4px 8px', fontWeight: 700 }}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                value={item.feature} 
                                                onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'feature', e.target.value)} 
                                                className="kt-input" style={{ padding: '4px 8px' }}
                                            />
                                        </td>
                                        {['c','r','u','d'].map(perm => (
                                            <td key={perm} style={{ textAlign: 'center' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={item[perm]} 
                                                    onChange={e => handleUpdateArray('fsdAccessRights', item.id, perm, e.target.checked)} 
                                                    style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--kt-primary)' }}
                                                />
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveArray('fsdAccessRights', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                                <Trash2 style={{ width: 14, height: 14, color: 'var(--kt-danger)' }}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── 6. DEVELOPMENT ──────────────────────────────────────────────── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title">
                        <Code /> 6. Development & Repository
                    </h3>
                </div>
                <div className="kt-card-body" style={{ background: 'var(--kt-sidebar-bg)', color: '#fff' }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ padding: 12, background: 'rgba(23,198,83,0.15)', borderRadius: '50%' }}>
                                <GitBranch style={{ width: 24, height: 24, color: 'var(--kt-success)' }}/>
                            </div>
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Source Code Repository</h4>
                                <p style={{ fontSize: 12, color: 'var(--kt-sidebar-text)', margin: 0 }}>Tautan ke repository Gitlab/Github proyek</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 250 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <LinkIcon style={{ width: 14, height: 14, color: 'var(--kt-sidebar-text)' }}/>
                                <input 
                                    value={project.fsdSourceCode?.link || ''} 
                                    onChange={e => setProject({
                                        ...project, 
                                        fsdSourceCode: { ...project.fsdSourceCode, link: e.target.value }
                                    })} 
                                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--kt-success)', fontFamily: 'monospace', fontSize: 13 }} 
                                    placeholder="https://gitlab.customs.go.id/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
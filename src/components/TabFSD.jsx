import React, { useState, useEffect, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import { 
    Target, Sparkles, Workflow, Layout, 
    Server, Code, Link as LinkIcon, Plus, Trash2, 
    UserCheck, Database, GitBranch, 
    Maximize, X, ZoomIn, ZoomOut, Wand2, RefreshCw, Eye, EyeOff, Loader
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

// ─── MOCKUP VIEWER (HTML preview + code editor) ──────────────────────────
const MockupViewer = ({ mock, project, onCodeChange, onRegenerate }) => {
    const [view, setView]           = useState('preview'); // 'preview' | 'code'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const iframeRef     = useRef(null);
    const fsIframeRef   = useRef(null);

    const buildIframeSrc = (html) => {
        if (!html) return 'about:blank';
        const blob = new Blob([html], { type: 'text/html' });
        return URL.createObjectURL(blob);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // ── Rich context assembled from ALL tabs ──────────────────────
            const projectName  = project.namaAplikasi || project.namaProyek || 'Sistem';
            const unit         = project.unitKerja || project.namaUnit || '';
            const description  = project.deskripsi || project.latar_belakang || project.charter?.latar_belakang || '';
            const scope        = project.charter?.scope || '';
            const benefits     = project.charter?.benefits || '';
            const bizOwner     = project.charter?.bizProcessOwner || '';

            // Actors (from TabPenelitian)
            const actors = (project.actors || [])
                .map(a => `${a.name} (${a.type}): ${a.desc || '-'}`)
                .join('\n');

            // Use Cases (from TabPenelitian)
            const useCases = (project.useCases || [])
                .map(uc => `- [${uc.subSystem}] ${uc.name}`)
                .join('\n');

            // Access Rights (from FSD section 5)
            const accessRoles = [...new Set((project.fsdAccessRights || []).map(a => a.role))].join(', ') || 'Admin, User';
            const accessMatrix = (project.fsdAccessRights || [])
                .map(a => `${a.role} > ${a.feature}: C=${a.c?'✓':'✗'} R=${a.r?'✓':'✗'} U=${a.u?'✓':'✗'} D=${a.d?'✓':'✗'}`)
                .join('\n');

            // BRD — module info
            const modul    = project.brdProcessAnalysis?.modul    || '';
            const subModul = project.brdProcessAnalysis?.subModul || '';

            // As-Is / To-Be conditions
            const asIsToBe = (project.asIsToBe || [])
                .map(r => `${r.factor}: [As-Is] ${r.asIs} → [To-Be] ${r.toBe}`)
                .join('\n');

            // Charter team
            const team = (project.charter?.team || [])
                .map(t => `${t.name} — ${t.role}`)
                .join(', ');

            // Functional requirements (kajian)
            const funcReqs = (project.functionalReqs || project.kajian?.functionalReqs || [])
                .map(r => `- ${r.name || r.feature || r.description || JSON.stringify(r)}`)
                .join('\n');

            const prompt = `You are a senior UI/UX developer specialising in Indonesian government enterprise applications (Kemenkeu/DJBC ecosystem).
Generate a realistic, complete, self-contained HTML mockup for the screen described below.

═══ PROJECT CONTEXT ═══
Project Name   : ${projectName}
Unit / Instansi: ${unit}
Module         : ${modul}${subModul ? ' > ' + subModul : ''}
Description    : ${description}
Scope          : ${scope}
Benefits       : ${benefits}
Business Owner : ${bizOwner}

═══ TEAM ═══
${team || 'Not specified'}

═══ ACTORS ═══
${actors || 'Not specified'}

═══ USE CASES / FEATURES ═══
${useCases || 'Not specified'}

═══ FUNCTIONAL REQUIREMENTS ═══
${funcReqs || 'Not specified'}

═══ AS-IS → TO-BE ═══
${asIsToBe || 'Not specified'}

═══ ACCESS RIGHTS MATRIX ═══
Roles: ${accessRoles}
${accessMatrix || 'Not specified'}

═══ SCREEN TO GENERATE ═══
"${mock.name}"

═══ REQUIREMENTS ═══
- Output ONLY a complete, self-contained HTML document (<!DOCTYPE html>…</html>). No markdown fences, no explanation.
- Design a realistic, production-ready screen that fits naturally into this project — NOT a generic wireframe.
- Infer the correct layout from the screen name: dashboards get KPI cards + charts placeholders; list pages get filterable tables; form pages get labelled input groups; detail pages get a master-detail layout.
- Use a government/enterprise design language: navy sidebar (#1b2a4a), white main area, blue accent (#1b84ff), clean sans-serif font (system-ui).
- Top navigation bar: show project name + unit on the left, user avatar + role badge on the right.
- Left sidebar (collapsible-looking): logo area, nav links derived from the use cases above, active state on the current screen.
- Main content: page title + breadcrumb, then the appropriate UI for this screen name.
- Populate with realistic Indonesian-language dummy data relevant to the project domain.
- Use Unicode/emoji icons (🔍 ✏️ 🗑️ ➕ 📋 etc.) where icons would appear — no external icon libraries.
- Simulate CRUD buttons, status badges, pagination, and filter bars where appropriate.
- All CSS must be inline or in a <style> block inside <head> — no external stylesheets.
- The result must look polished enough to present to a stakeholder in a sprint review.

Output ONLY the raw HTML. No explanation, no markdown, no code fences.`;

            const response = await fetch('/anthropic/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4000,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();
            const html = data.content?.map(b => b.text || '').join('') || '';
            const clean = html.replace(/^```html\s*/i, '').replace(/```\s*$/,'').trim();
            onCodeChange(mock.id, clean);
            setView('preview');
        } catch (err) {
            console.error('Mockup generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const isEmpty = !mock.htmlCode?.trim();

    return (
        <>
            {/* ── CARD ── */}
            <div style={{ 
                border: '1px solid var(--kt-border)', borderRadius: 12, overflow: 'hidden',
                background: '#fff', display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '10px 14px', background: 'var(--kt-border-light)', 
                    borderBottom: '1px solid var(--kt-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
                }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--kt-text-dark)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mock.name || 'Unnamed Screen'}
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {/* Code / Preview toggle */}
                        {!isEmpty && (
                            <div style={{ display: 'flex', background: '#fff', borderRadius: 6, border: '1px solid var(--kt-border)', padding: 2 }}>
                                <button 
                                    onClick={() => setView('code')}
                                    style={{
                                        padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none',
                                        background: view === 'code' ? 'var(--kt-primary)' : 'transparent',
                                        color: view === 'code' ? '#fff' : 'var(--kt-text-muted)'
                                    }}
                                >
                                    Code
                                </button>
                                <button 
                                    onClick={() => setView('preview')}
                                    style={{
                                        padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none',
                                        background: view === 'preview' ? 'var(--kt-primary)' : 'transparent',
                                        color: view === 'preview' ? '#fff' : 'var(--kt-text-muted)'
                                    }}
                                >
                                    Preview
                                </button>
                            </div>
                        )}

                        {/* Generate / Regenerate */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6,
                                border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer',
                                background: isEmpty ? 'var(--kt-primary)' : 'var(--kt-warning)',
                                color: '#fff', opacity: isGenerating ? 0.7 : 1,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            {isGenerating
                                ? <><Loader style={{ width: 11, height: 11, animation: 'spin 1s linear infinite' }}/> Generating...</>
                                : isEmpty
                                    ? <><Wand2 style={{ width: 11, height: 11 }}/> Generate</>
                                    : <><RefreshCw style={{ width: 11, height: 11 }}/> Regenerate</>
                            }
                        </button>

                        {/* Fullscreen */}
                        {!isEmpty && (
                            <button 
                                onClick={() => setIsFullscreen(true)} 
                                className="kt-btn kt-btn-light kt-btn-icon" 
                                title="Fullscreen"
                            >
                                <Maximize style={{ width: 13, height: 13 }}/>
                            </button>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div style={{ height: 340, position: 'relative', background: isEmpty ? 'var(--kt-bg)' : '#fff' }}>
                    {isEmpty ? (
                        /* Empty state */
                        <div style={{ 
                            height: '100%', display: 'flex', flexDirection: 'column', 
                            alignItems: 'center', justifyContent: 'center', gap: 10,
                            color: 'var(--kt-text-muted)'
                        }}>
                            <div style={{ 
                                width: 52, height: 52, borderRadius: '50%', 
                                background: 'var(--kt-primary-light)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Wand2 style={{ width: 24, height: 24, color: 'var(--kt-primary)' }}/>
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: 'var(--kt-text-dark)' }}>No mockup generated yet</p>
                            <p style={{ fontSize: 11, margin: 0 }}>Click <strong>Generate</strong> to create an AI mockup for this screen</p>
                        </div>
                    ) : view === 'preview' ? (
                        /* Live iframe preview */
                        <iframe
                            ref={iframeRef}
                            key={mock.htmlCode}
                            src={buildIframeSrc(mock.htmlCode)}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            sandbox="allow-scripts allow-same-origin"
                            title={`Mockup: ${mock.name}`}
                        />
                    ) : (
                        /* Code editor */
                        <textarea
                            value={mock.htmlCode}
                            onChange={e => onCodeChange(mock.id, e.target.value)}
                            style={{ 
                                width: '100%', height: '100%', padding: 14, 
                                fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6,
                                color: 'var(--kt-text-dark)', background: 'var(--kt-bg)',
                                border: 'none', resize: 'none', outline: 'none'
                            }}
                            spellCheck="false"
                            placeholder="HTML code will appear here after generation..."
                        />
                    )}

                    {/* Generating overlay */}
                    {isGenerating && (
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.92)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                            backdropFilter: 'blur(2px)'
                        }}>
                            <div style={{ position: 'relative', width: 48, height: 48 }}>
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    border: '3px solid var(--kt-primary-light)',
                                    borderTopColor: 'var(--kt-primary)',
                                    animation: 'spin 0.8s linear infinite'
                                }}/>
                                <Sparkles style={{ 
                                    position: 'absolute', top: '50%', left: '50%', 
                                    transform: 'translate(-50%,-50%)',
                                    width: 20, height: 20, color: 'var(--kt-primary)' 
                                }}/>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: 'var(--kt-text-dark)' }}>Generating Mockup...</p>
                                <p style={{ fontSize: 11, color: 'var(--kt-text-muted)', margin: '4px 0 0' }}>Claude is designing your UI</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── FULLSCREEN MODAL ── */}
            {isFullscreen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
                    background: 'rgba(7,20,55,0.9)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32
                }}>
                    <div style={{ background: '#fff', width: '100%', height: '100%', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--kt-border-light)', padding: '14px 24px', borderBottom: '1px solid var(--kt-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layout style={{ width: 16, height: 16, color: 'var(--kt-primary)' }}/> {mock.name}
                            </h3>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <div style={{ display: 'flex', background: '#fff', borderRadius: 6, border: '1px solid var(--kt-border)', padding: 2 }}>
                                    <button 
                                        onClick={() => setView('code')}
                                        style={{ padding: '4px 14px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none', background: view === 'code' ? 'var(--kt-primary)' : 'transparent', color: view === 'code' ? '#fff' : 'var(--kt-text-muted)' }}
                                    >Code</button>
                                    <button 
                                        onClick={() => setView('preview')}
                                        style={{ padding: '4px 14px', fontSize: 11, fontWeight: 700, borderRadius: 4, cursor: 'pointer', border: 'none', background: view === 'preview' ? 'var(--kt-primary)' : 'transparent', color: view === 'preview' ? '#fff' : 'var(--kt-text-muted)' }}
                                    >Preview</button>
                                </div>
                                <div style={{ height: 24, width: 1, background: 'var(--kt-border)' }}/>
                                <button 
                                    onClick={() => setIsFullscreen(false)} 
                                    className="kt-btn kt-btn-icon"
                                    style={{ background: 'var(--kt-danger-light)', color: 'var(--kt-danger)' }}
                                >
                                    <X style={{ width: 16, height: 16 }}/>
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {view === 'preview' ? (
                                <iframe
                                    ref={fsIframeRef}
                                    key={`fs-${mock.htmlCode}`}
                                    src={buildIframeSrc(mock.htmlCode)}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    sandbox="allow-scripts allow-same-origin"
                                    title={`Mockup Fullscreen: ${mock.name}`}
                                />
                            ) : (
                                <textarea
                                    value={mock.htmlCode}
                                    onChange={e => onCodeChange(mock.id, e.target.value)}
                                    style={{ width: '100%', height: '100%', padding: 20, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, color: 'var(--kt-text-dark)', background: 'var(--kt-bg)', border: 'none', resize: 'none', outline: 'none' }}
                                    spellCheck="false"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spin keyframe injected once */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
    // Update mockup HTML code
    const handleMockupCodeChange = (id, htmlCode) => {
        setProject(prev => ({
            ...prev,
            fsdMockups: (prev.fsdMockups || []).map(m => m.id === id ? { ...m, htmlCode } : m)
        }));
    };

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

            {/* ── HEADER ── */}
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

            {/* ── 1. BPMN ── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Workflow /> 1. Diagram Alur Proses Bisnis (BPMN)</h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="Business Process Flow" 
                        code={project.mermaid?.processFlow || ''} 
                        onChange={val => updateMermaid('processFlow', val)} 
                    />
                </div>
            </div>

            {/* ── 2. USE CASE ── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><GitBranch /> 2. Use Case Diagram</h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="System Use Case Diagram" 
                        code={project.mermaid?.useCaseDiagram || ''} 
                        onChange={val => updateMermaid('useCaseDiagram', val)} 
                    />
                </div>
            </div>

            {/* ── 3. ERD ── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Database /> 3. Data Model / ERD</h3>
                </div>
                <div className="kt-card-body">
                    <MermaidViewer 
                        title="Entity Relationship Diagram (ERD)" 
                        code={project.mermaid?.erd || ''} 
                        onChange={val => updateMermaid('erd', val)} 
                    />
                </div>
            </div>

            {/* ── 4 & 5. MOCKUP & RIGHTS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
                
                {/* ── 4. Mockups (AI-powered) ── */}
                <div className="kt-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="kt-card-header">
                        <h3 className="kt-card-title">
                            <Layout /> 4. Mock Up (UI/UX)
                            <span style={{ 
                                marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                                display: 'inline-flex', alignItems: 'center', gap: 4
                            }}>
                                <Sparkles style={{ width: 10, height: 10 }}/> AI Generated
                            </span>
                        </h3>
                        <button 
                            onClick={() => handleAddArray('fsdMockups', { id: Date.now(), name: 'New Screen', htmlCode: '' })} 
                            className="kt-btn kt-btn-primary kt-btn-sm"
                        >
                            <Plus style={{ width: 14, height: 14 }}/> Add Screen
                        </button>
                    </div>

                    <div className="kt-card-body">
                                            {(project.fsdMockups || []).length === 0 ? (
                                                <div style={{ 
                                                    textAlign: 'center', padding: '40px 20px',
                                                    background: 'var(--kt-bg)', borderRadius: 12,
                                                    border: '2px dashed var(--kt-border)'
                                                }}>
                                                    <div style={{ 
                                                        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                                                        background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <Layout style={{ width: 28, height: 28, color: '#7c3aed' }}/>
                                                    </div>
                                                    <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px', color: 'var(--kt-text-dark)' }}>No screens yet</p>
                                                    <p style={{ fontSize: 12, color: 'var(--kt-text-muted)', margin: '0 0 16px' }}>
                                                        Add screens and let Claude generate realistic UI mockups from your project data.
                                                    </p>
                                                    <button 
                                                        onClick={() => handleAddArray('fsdMockups', { id: Date.now(), name: 'Dashboard', htmlCode: '' })}
                                                        className="kt-btn kt-btn-primary kt-btn-sm"
                                                    >
                                                        <Plus style={{ width: 14, height: 14 }}/> Add First Screen
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {(project.fsdMockups || []).map((mock, idx) => (
                               <div key={mock.id}>
                                        {/* Screen name row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                            <span style={{ 
                                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                                background: 'var(--kt-primary-light)', color: 'var(--kt-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 700
                                            }}>{idx + 1}</span>
                                    <input 
                                        value={mock.name} 
                                        onChange={e => handleUpdateArray('fsdMockups', mock.id, 'name', e.target.value)} 
                                        className="kt-input" 
                                        style={{ flex: 1, padding: '6px 12px', fontWeight: 600 }}
                                                placeholder="Screen / Page name..."
                                    />
                                    <button 
                                                onClick={() => handleRemoveArray('fsdMockups', mock.id)} 
                                                className="kt-btn kt-btn-icon" 
                                                style={{ background: 'transparent', flexShrink: 0 }}
                                                title="Remove screen"
                                            >
                                        <Trash2 style={{ width: 14, height: 14, color: 'var(--kt-danger)' }}/>
                                    </button>
                                    </div>

                                        {/* Mockup viewer */}
                                        <MockupViewer
                                            mock={mock}
                                            project={project}
                                            onCodeChange={handleMockupCodeChange}
                                        />
                                </div>
                            ))}
                        </div>
                                            )}
                    </div>
                </div>

                {/* Access Rights */}
                <div className="kt-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="kt-card-header">
                        <h3 className="kt-card-title"><UserCheck /> 5. Hak Akses (Matrix)</h3>
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
                                            <input value={item.role} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'role', e.target.value)} className="kt-input" style={{ padding: '4px 8px', fontWeight: 700 }}/>
                                        </td>
                                        <td>
                                            <input value={item.feature} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'feature', e.target.value)} className="kt-input" style={{ padding: '4px 8px' }}/>
                                        </td>
                                        {['c','r','u','d'].map(perm => (
                                            <td key={perm} style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={item[perm]} onChange={e => handleUpdateArray('fsdAccessRights', item.id, perm, e.target.checked)} style={{ cursor: 'pointer', width: 14, height: 14, accentColor: 'var(--kt-primary)' }}/>
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

            {/* ── 6. DEVELOPMENT ── */}
            <div className="kt-card">
                <div className="kt-card-header">
                    <h3 className="kt-card-title"><Code /> 6. Development & Repository</h3>
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
                                    onChange={e => setProject({ ...project, fsdSourceCode: { ...project.fsdSourceCode, link: e.target.value }})} 
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
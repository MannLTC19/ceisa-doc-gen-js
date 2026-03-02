import React, { useState, useEffect, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import { 
    Target, Sparkles, Workflow, Layout, 
    PenTool, Server, Code, Link as LinkIcon, Plus, Trash2, 
    UserCheck, Database, Lock, Globe, Layers, GitBranch, 
    Maximize, X, ZoomIn, ZoomOut
} from 'lucide-react';

// ─── MERMAID INIT (module-level, runs once) ──────────────────────────────
// FIX: startOnLoad must be FALSE when calling mermaid.render() manually.
// Setting it to true causes double-render conflicts and "already registered" errors.
mermaid.initialize({ 
    startOnLoad: false,   // ← was incorrectly "true"
    theme: 'default', 
    securityLevel: 'loose',
    suppressErrorRendering: true,
    flowchart: { useMaxWidth: false, htmlLabels: true } 
});

// ─── MERMAID CODE SANITIZER ──────────────────────────────────────────────
// Fixes common issues that survive the AI prompt:
// - Escaped newlines that weren't decoded (\\n → real newline)
// - Single-quoted labels → double-quoted  e.g. A['label'] → A["label"]
// - Single-quoted subgraph names
// Does NOT touch quotes that are already correct double quotes.
const sanitizeMermaid = (rawCode) => {
    if (!rawCode) return "";
    return rawCode
        // 1. Decode escaped newlines (JSON artifact)
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '  ')

        // 2. Fix single-quoted node labels: ['text'] → ["text"]
        //    Handles: ["text"], (["text"]), {"text"}, (["text"])
        .replace(/\[\'([^\']*)\'\]/g, '["$1"]')
        .replace(/\(\[\'([^\']*)\'\]\)/g, '(["$1"])')
        .replace(/\{\'([^\']*)\'\}/g, '{"$1"}')

        // 3. Fix single-quoted subgraph names: subgraph 'name' → subgraph "name"
        .replace(/subgraph\s+'([^']+)'/g, 'subgraph "$1"')

        // 4. Remove semicolons at end of lines
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
                            height:100%;color:#94a3b8;gap:8px;background:#f8fafc;
                            border:2px dashed #e2e8f0;border-radius:12px;padding:24px;text-align:center;">
                    <div style="font-size:2rem;opacity:0.4">⚡</div>
                    <p style="font-size:12px;font-weight:600;margin:0">Preview Unavailable</p>
                    <p style="font-size:11px;margin:0;color:#cbd5e1">
                        Switch to <strong>Code</strong> view to fix the syntax error
                    </p>
                </div>`;
        }
    };

    // Re-render whenever code changes or view mode changes
    useEffect(() => {
        if (preview) {
            renderDiagram(containerRef.current, code);
        }
    }, [code, preview]);

    useEffect(() => {
        if (isFullscreen && preview) {
            // Small delay to let the modal DOM mount first
            setTimeout(() => renderDiagram(fullscreenRef.current, code), 50);
        }
    }, [isFullscreen, code, preview]);

    return (
        <>
            {/* ── CARD VIEW ── */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-96 transition-all hover:shadow-md">
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase px-2">{title}</span>
                    <div className="flex gap-2">
                        <div className="flex bg-white rounded-lg border border-slate-300 p-0.5">
                            <button 
                                onClick={() => setPreview(false)} 
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors 
                                    ${!preview ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Code
                            </button>
                            <button 
                                onClick={() => setPreview(true)} 
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors 
                                    ${preview ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Preview
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsFullscreen(true)} 
                            className="p-1.5 bg-white border border-slate-300 rounded-md hover:bg-blue-50 text-slate-600" 
                            title="Fullscreen"
                        >
                            <Maximize className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-hidden relative bg-white">
                    {preview ? (
                        <div 
                            ref={containerRef} 
                            className="w-full h-full overflow-auto p-4 flex items-center justify-center"
                        />
                    ) : (
                        <textarea 
                            value={code} 
                            onChange={(e) => onChange(e.target.value)} 
                            className="w-full h-full p-4 font-mono text-xs text-slate-800 bg-slate-50 resize-none outline-none focus:bg-white transition-colors"
                            spellCheck="false"
                            placeholder="Paste or edit Mermaid diagram code here..."
                        />
                    )}
                </div>
            </div>

            {/* ── FULLSCREEN MODAL ── */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
                    <div className="bg-white w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="bg-slate-100 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                                <Maximize className="w-5 h-5 text-blue-600"/> {title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setScale(s => Math.max(0.3, s - 0.2))} 
                                    className="p-2 hover:bg-slate-200 rounded-lg" 
                                    title="Zoom out"
                                >
                                    <ZoomOut className="w-5 h-5"/>
                                </button>
                                <span className="text-xs font-mono w-12 text-center bg-white border rounded px-1 py-0.5">
                                    {(scale * 100).toFixed(0)}%
                                </span>
                                <button 
                                    onClick={() => setScale(s => Math.min(3, s + 0.2))} 
                                    className="p-2 hover:bg-slate-200 rounded-lg" 
                                    title="Zoom in"
                                >
                                    <ZoomIn className="w-5 h-5"/>
                                </button>
                                <div className="h-6 w-px bg-slate-300 mx-2"/>
                                <button 
                                    onClick={() => { setIsFullscreen(false); setScale(1); }} 
                                    className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg"
                                    title="Close"
                                >
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-50 p-8 flex items-start justify-center">
                            <div 
                                ref={fullscreenRef} 
                                className="transition-transform duration-200 origin-top"
                                style={{ transform: `scale(${scale})` }}
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

    const updateMermaid = (field, value) => {
        setProject(prev => ({
            ...prev,
            mermaid: { ...prev.mermaid, [field]: value }
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
        <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
            <datalist id="pic-list">
                {availablePeople.map((name, idx) => <option key={idx} value={name} />)}
            </datalist>

            {/* Header */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-4 items-start">
                <Target className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                    <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                        Functional Specification (FSD) 
                        {uploadedFile && <Sparkles className="w-4 h-4 text-emerald-500"/>}
                    </h3>
                    <p className="text-sm text-emerald-700">
                        Spesifikasi teknis mencakup diagram alur, mockup, hak akses, dan arsitektur.
                    </p>
                </div>
            </div>

            {/* 1. BPMN */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <Workflow className="w-5 h-5 text-blue-600"/> 1. Diagram Alur Proses Bisnis
                </h3>
                <MermaidViewer 
                    title="Business Process Flow (BPMN)" 
                    code={project.mermaid?.processFlow || ''} 
                    onChange={val => updateMermaid('processFlow', val)} 
                />
            </div>

            {/* 2. USE CASE */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <GitBranch className="w-5 h-5 text-indigo-600"/> 2. Use Case Diagram
                </h3>
                <MermaidViewer 
                    title="System Use Case Diagram" 
                    code={project.mermaid?.useCaseDiagram || ''} 
                    onChange={val => updateMermaid('useCaseDiagram', val)} 
                />
            </div>

            {/* 3. ERD */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <Database className="w-5 h-5 text-teal-600"/> 3. Data Model / ERD
                </h3>
                <MermaidViewer 
                    title="Entity Relationship Diagram (ERD)" 
                    code={project.mermaid?.erd || ''} 
                    onChange={val => updateMermaid('erd', val)} 
                />
            </div>

            {/* 4. MOCKUP & RIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mockups */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <Layout className="w-5 h-5 text-purple-600"/> 4. Mock Up
                        </h3>
                        <button 
                            onClick={() => handleAddArray('fsdMockups', { id: Date.now(), name: 'Page', link: '' })} 
                            className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-purple-100"
                        >
                            <Plus className="w-3 h-3"/> Add
                        </button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {(project.fsdMockups || []).map((mock, idx) => (
                            <div key={mock.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border">
                                <span className="w-5 h-5 flex items-center justify-center bg-purple-200 text-purple-800 rounded-full text-[10px] font-bold shrink-0">
                                    {idx + 1}
                                </span>
                                <input 
                                    value={mock.name} 
                                    onChange={e => handleUpdateArray('fsdMockups', mock.id, 'name', e.target.value)} 
                                    className="flex-1 text-xs bg-transparent outline-none" 
                                    placeholder="Page Name" 
                                />
                                <input 
                                    value={mock.link} 
                                    onChange={e => handleUpdateArray('fsdMockups', mock.id, 'link', e.target.value)} 
                                    className="w-32 text-[10px] bg-white border rounded px-1 text-blue-600" 
                                    placeholder="Link Figma..." 
                                />
                                <button onClick={() => handleRemoveArray('fsdMockups', mock.id)}>
                                    <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-500"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Rights */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                            <UserCheck className="w-5 h-5 text-amber-600"/> 5. Hak Akses
                        </h3>
                        <button 
                            onClick={() => handleAddArray('fsdAccessRights', { 
                                id: `ar_${Date.now()}`, role: 'User', feature: 'Login', 
                                c: false, r: true, u: false, d: false 
                            })} 
                            className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-100"
                        >
                            <Plus className="w-3 h-3"/> Add
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                                <tr>
                                    <th className="p-2">Role</th>
                                    <th className="p-2">Fitur</th>
                                    <th className="p-2 text-center">C</th>
                                    <th className="p-2 text-center">R</th>
                                    <th className="p-2 text-center">U</th>
                                    <th className="p-2 text-center">D</th>
                                    <th/>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(project.fsdAccessRights || []).map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="p-2">
                                            <input 
                                                value={item.role} 
                                                onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'role', e.target.value)} 
                                                className="w-full bg-transparent outline-none font-bold" 
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                value={item.feature} 
                                                onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'feature', e.target.value)} 
                                                className="w-full bg-transparent outline-none" 
                                            />
                                        </td>
                                        {['c','r','u','d'].map(perm => (
                                            <td key={perm} className="p-2 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item[perm]} 
                                                    onChange={e => handleUpdateArray('fsdAccessRights', item.id, perm, e.target.checked)} 
                                                    className="cursor-pointer"
                                                />
                                            </td>
                                        ))}
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleRemoveArray('fsdAccessRights', item.id)}>
                                                <Trash2 className="w-3 h-3 text-slate-300 hover:text-rose-500"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 6. DEVELOPMENT */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                    <Code className="w-5 h-5 text-emerald-600"/> 6. Development
                </h3>
                <div className="bg-slate-900 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex items-center gap-4 text-white">
                        <div className="p-3 bg-emerald-500/20 rounded-full">
                            <GitBranch className="w-8 h-8 text-emerald-400"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Source Code Repository</h4>
                            <p className="text-xs text-slate-400">Tautan ke repository Gitlab/Github proyek</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
                            <span className="text-xs font-bold text-slate-500 w-24 px-2 shrink-0">Link Git:</span>
                            <input 
                                value={project.fsdSourceCode?.link || ''} 
                                onChange={e => setProject({
                                    ...project, 
                                    fsdSourceCode: { ...project.fsdSourceCode, link: e.target.value }
                                })} 
                                className="flex-1 bg-transparent outline-none text-emerald-400 font-mono text-sm" 
                                placeholder="https://gitlab.customs.go.id/..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
    FileSpreadsheet, Plus, Trash2, Calculator, Settings, User, 
    TrendingUp, Clock, Briefcase, Lock, Edit3, Unlock, Workflow,
    Maximize, X, ZoomIn, ZoomOut, RefreshCw, Target, LayoutList,
    GitCompare, CheckSquare, GitGraph, CheckCircle2
} from 'lucide-react';

import { 
    formatIDR, getUseCaseComplexity, getActorComplexity, 
    BV_OPTIONS, EFFORT_OPTIONS 
} from '../constants.js';

// ─── MERMAID INIT ────────────────────────────────────────────────────────
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default', 
    securityLevel: 'loose',
    suppressErrorRendering: true,
    flowchart: { useMaxWidth: false, htmlLabels: true } 
});

export const TabPenelitian = ({ 
    project, setProject, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  const [fullScreenDiagram, setFullScreenDiagram] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const processFlowRef = useRef(null);
  const useCaseRef = useRef(null);
  const fullScreenRef = useRef(null);

  // Render Mermaid diagrams safely for inline preview (Read Only)
  useEffect(() => {
      const renderDiagram = async (ref, id, code) => {
          if (ref.current && code) {
              try {
                  ref.current.removeAttribute('data-processed');
                  const { svg } = await mermaid.render(id, code);
                  if (ref.current) ref.current.innerHTML = svg;
              } catch (err) {
                  if (ref.current) ref.current.innerHTML = `<div style="color:var(--kt-danger); font-size:12px;">Error: ${err.message}</div>`;
              }
          }
      };
      renderDiagram(processFlowRef, `penelitian_bpmn_${Date.now()}`, project.mermaid?.processFlow);
      renderDiagram(useCaseRef, `penelitian_uc_${Date.now()}`, project.mermaid?.useCaseDiagram);
  }, [project.mermaid?.processFlow, project.mermaid?.useCaseDiagram]);

  // Handle Fullscreen Mermaid Render
  useEffect(() => {
      if (fullScreenDiagram && fullScreenRef.current) {
          fullScreenRef.current.removeAttribute('data-processed');
          mermaid.render(`penelitian_full_${Date.now()}`, fullScreenDiagram)
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

  const updateBVEffort = (type, category, index) => {
      const options = type === 'bv' ? BV_OPTIONS : EFFORT_OPTIONS;
      const selectedOption = options[category][index];
      setProject((prev) => ({ ...prev, bvEffort: { ...prev.bvEffort, [category]: selectedOption } }));
  };

  const updateKakItem = (id, field, value) => {
      setProject((prev) => {
          const newKak = (prev.kakStructure || []).map((item) =>
              item.id === id ? { ...item, [field]: value } : item
          );
          return { ...prev, kakStructure: newKak };
      });
  };

  // ─── STYLING HELPERS ─────────────────────────────────────────────────────
  const cleanTableHeaderStyle = {
    background: '#f4f5f8', color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.05em', fontWeight: 700, padding: '12px 16px', borderBottom: '1px solid #e4e6ef'
  };

  const getActorPill = (type) => {
     if (type === 'GUI') return { background: 'var(--kt-danger-light)', color: 'var(--kt-danger)', border: '1px solid rgba(248,40,90,0.2)' };
     if (type === 'Protocol') return { background: 'var(--kt-warning-light)', color: '#7a5800', border: '1px solid rgba(246,177,0,0.25)' };
     return { background: 'var(--kt-success-light)', color: 'var(--kt-success)', border: '1px solid rgba(23,198,83,0.2)' };
  };

  const getUCPill = (lvl) => {
     if (lvl === 'Complex') return { background: 'var(--kt-danger-light)', color: 'var(--kt-danger)', border: '1px solid rgba(248,40,90,0.2)' };
     if (lvl === 'Average') return { background: 'var(--kt-warning-light)', color: '#7a5800', border: '1px solid rgba(246,177,0,0.25)' };
     return { background: 'var(--kt-success-light)', color: 'var(--kt-success)', border: '1px solid rgba(23,198,83,0.2)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">
        
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="kt-notice kt-notice-primary" style={{ background: 'var(--kt-primary-light)', borderColor: 'rgba(27,132,255,0.2)', color: 'var(--kt-primary)' }}>
             <FileSpreadsheet />
             <div>
                 <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Dokumen Penelitian Kajian Kebutuhan</div>
                 <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
                     Format lengkap 9 Bagian sesuai standar CEISA 4.0, terintegrasi dengan perhitungan UCP dan KAK.
                 </div>
             </div>
        </div>

        {/* ── 01. INFORMASI UMUM ────────────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header"><h3 className="kt-card-title"><Target style={{ color: 'var(--kt-primary)' }}/> 01. Informasi Umum</h3></div>
            <div className="kt-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="kt-form-row">
                        <label className="kt-label">Nama Proyek</label>
                        <input className="kt-input" style={{ fontWeight: 800, fontSize: 15, color: 'var(--kt-primary)' }} value={project.nama || ''} onChange={e => setProject(prev => ({ ...prev, nama: e.target.value }))} />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Uraian Singkat Usulan Proyek</label>
                        <textarea className="kt-textarea" rows={2} value={project.uraianUsulan || ''} onChange={e => setProject(prev => ({ ...prev, uraianUsulan: e.target.value }))} />
                    </div>
                    <div className="kt-form-grid kt-form-grid-2">
                        <div className="kt-form-row">
                            <label className="kt-label">Unit Pengampu Bisnis Proses</label>
                            <input className="kt-input" value={project.pengampu || ''} onChange={e => setProject(prev => ({ ...prev, pengampu: e.target.value }))} />
                        </div>
                        <div className="kt-form-row">
                            <label className="kt-label">Nomor Nota Dinas Kajian Kebutuhan</label>
                            <input className="kt-input" value={project.nomorND || ''} onChange={e => setProject(prev => ({ ...prev, nomorND: e.target.value }))} />
                        </div>
                        <div className="kt-form-row">
                            <label className="kt-label">Tanggal Pembuatan Dokumen</label>
                            <input type="date" className="kt-input" value={project.tanggalPembuatan || ''} onChange={e => setProject(prev => ({ ...prev, tanggalPembuatan: e.target.value }))} />
                        </div>
                        <div className="kt-form-row">
                            <label className="kt-label">Tanggal Nota Dinas</label>
                            <input type="date" className="kt-input" value={project.tanggalND || ''} onChange={e => setProject(prev => ({ ...prev, tanggalND: e.target.value }))} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* ── 02. ANALISIS PROSES BISNIS ────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header"><h3 className="kt-card-title"><LayoutList style={{ color: 'var(--kt-primary)' }}/> 02. Analisis Proses Bisnis</h3></div>
            <div className="kt-card-body">
                <div className="kt-form-grid kt-form-grid-2">
                    <div className="kt-form-row">
                        <label className="kt-label">Modul</label>
                        <input value={project.brdProcessAnalysis?.modul || ''} onChange={e => setProject(prev => ({...prev, brdProcessAnalysis: {...prev.brdProcessAnalysis, modul: e.target.value}}))} className="kt-input" />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Sub Modul</label>
                        <input value={project.brdProcessAnalysis?.subModul || ''} onChange={e => setProject(prev => ({...prev, brdProcessAnalysis: {...prev.brdProcessAnalysis, subModul: e.target.value}}))} className="kt-input" />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Analisis pemetaan EA Kemenkeu</label>
                        <textarea value={project.brdProcessAnalysis?.eaMapping || ''} onChange={e => setProject(prev => ({...prev, brdProcessAnalysis: {...prev.brdProcessAnalysis, eaMapping: e.target.value}}))} className="kt-textarea" rows={2}/>
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Catatan atau Keterangan</label>
                        <textarea value={project.brdProcessAnalysis?.notes || ''} onChange={e => setProject(prev => ({...prev, brdProcessAnalysis: {...prev.brdProcessAnalysis, notes: e.target.value}}))} className="kt-textarea" rows={2}/>
                    </div>
                </div>
            </div>
        </div>

        {/* ── 03. KONDISI AS-IS TO-BE ───────────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><GitCompare style={{ color: 'var(--kt-primary)' }}/> 03. Kondisi As-Is To-Be</h3>
                <button onClick={() => handleAddArray('asIsToBe', {id: Date.now().toString(), factor: '', asIs: '', toBe: ''})} className="kt-btn kt-btn-primary kt-btn-sm" style={{ borderRadius: 8 }}>
                    <Plus style={{ width: 14, height: 14 }}/> Tambah Baris
                </button>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>Faktor Pembanding</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>As Is</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>To Be</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 50 }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project.asIsToBe || []).length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada data As-Is To-Be.</td></tr>
                        ) : (
                            (project.asIsToBe || []).map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input value={item.factor || ''} onChange={e => handleUpdateArray('asIsToBe', item.id, 'factor', e.target.value)} className="kt-input" placeholder="Faktor..."/>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item.asIs || ''} onChange={e => handleUpdateArray('asIsToBe', item.id, 'asIs', e.target.value)} className="kt-textarea" rows={2} placeholder="Kondisi saat ini..."/>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item.toBe || ''} onChange={e => handleUpdateArray('asIsToBe', item.id, 'toBe', e.target.value)} className="kt-textarea" rows={2} style={{ borderColor: 'rgba(23,198,83,0.3)', background: 'var(--kt-success-light)' }} placeholder="Kondisi diharapkan..."/>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveArray('asIsToBe', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                            <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }}/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 04. DIAGRAM ALUR PROSES BISNIS (READ-ONLY) ────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title"><Workflow style={{ color: 'var(--kt-primary)' }}/> 04. Diagram Alur Proses Bisnis (BPMN)</h3>
            </div>
            <div className="kt-card-body" style={{ background: '#fafafa' }}>
                <div style={{ border: '1px solid #e4e6ef', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>Preview Diagram (Ditarik dari FSD)</span>
                        {project.mermaid?.processFlow && (
                            <button onClick={() => setFullScreenDiagram(project.mermaid.processFlow)} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'var(--kt-primary-light)' }} title="Fullscreen">
                                <Maximize style={{ width: 14, height: 14, color: 'var(--kt-primary)' }} />
                            </button>
                        )}
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                        {project.mermaid?.processFlow ? <div ref={processFlowRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} /> : <span style={{ color: 'var(--kt-text-muted)', fontSize: 13 }}>Diagram belum tersedia. Buat source code di tab FSD.</span>}
                    </div>
                </div>
            </div>
        </div>

        {/* ── 05. KEBUTUHAN FUNGSIONAL ──────────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-primary)' }} /> 05. Kebutuhan Fungsional</h3>
                <button onClick={() => handleAddArray('kebutuhanFungsional', { id: `kf_${Date.now()}`, kebutuhan: '', detailFungsi: '' })} className="kt-btn kt-btn-primary kt-btn-sm" style={{ borderRadius: 8 }}>
                    <Plus style={{ width: 14, height: 14 }} /> Tambah
                </button>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                            <th style={cleanTableHeaderStyle}>Fungsi</th>
                            <th style={cleanTableHeaderStyle}>Deskripsi</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 60 }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project.kebutuhanFungsional || []).length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada kebutuhan fungsional.</td></tr>
                        ) : (
                            (project.kebutuhanFungsional || []).map((item, idx) => (
                                <tr key={item?.id || idx} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item?.kebutuhan || ''} onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'kebutuhan', e.target.value)} className="kt-textarea" rows={2} style={{ fontWeight: 500 }} placeholder="Merekam Nota Dinas..." />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item?.detailFungsi || ''} onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'detailFungsi', e.target.value)} className="kt-textarea" rows={2} placeholder="Detail fungsi..." />
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveArray('kebutuhanFungsional', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
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

        {/* ── 06. KEBUTUHAN NON-FUNGSIONAL ──────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-primary)' }} /> 06. Kebutuhan Non-Fungsional</h3>
                <button onClick={() => handleAddArray('kebutuhanNonFungsional', { id: `nfr_${Date.now()}`, fungsi: '', deskripsi: '' })} className="kt-btn kt-btn-primary kt-btn-sm" style={{ borderRadius: 8 }}>
                    <Plus style={{ width: 14, height: 14 }} /> Tambah
                </button>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 200 }}>Fungsi Kebutuhan</th>
                            <th style={cleanTableHeaderStyle}>Deskripsi</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 60 }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project.kebutuhanNonFungsional || []).length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada kebutuhan non-fungsional.</td></tr>
                        ) : (
                            (project.kebutuhanNonFungsional || []).map((item, idx) => (
                                <tr key={item?.id || idx} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item?.fungsi || ''} onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'fungsi', e.target.value)} className="kt-textarea" rows={2} style={{ fontWeight: 600 }} placeholder="Keamanan Data…" />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <textarea value={item?.deskripsi || ''} onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'deskripsi', e.target.value)} className="kt-textarea" rows={2} placeholder="Kapasitas penyimpanan besar…" />
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveArray('kebutuhanNonFungsional', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
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

        {/* ── 07. SPESIFIKASI AKTOR & UAW ───────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><User style={{ color: 'var(--kt-primary)' }}/> 07. Spesifikasi Aktor sekaligus Perhitungan UAW</h3>
                <button 
                   onClick={() => handleAddArray('actors', {id: Date.now(), name: '', type: 'GUI', desc: ''})} 
                   className="kt-btn kt-btn-primary kt-btn-sm"
                   style={{ borderRadius: 8 }}
                >
                   <Plus style={{ width: 14, height: 14 }}/> Tambah Aktor
                </button>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 110 }}>Kode Aktor</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '20%' }}>Nama Aktor</th>
                            <th style={cleanTableHeaderStyle}>Deskripsi</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Jenis (Utk UAW)</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 90, textAlign: 'center', background: '#fff8dd', color: '#ffc700' }}>UAW Score</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 60 }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project.actors || []).length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada aktor. Klik "Tambah Aktor".</td></tr>
                        ) : (
                            (project.actors || []).map((item, idx) => {
                                 const complexity = getActorComplexity(item.type);
                                 const pillStyle = getActorPill(item.type);
                                 return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--kt-text-muted)', fontFamily: 'monospace' }}>MOD-A-{idx + 1}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input value={item.name} onChange={e => handleUpdateArray('actors', item.id, 'name', e.target.value)} className="kt-input" style={{ fontWeight: 700 }} placeholder="Nama Aktor..."/>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input value={item.desc || ''} onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} className="kt-input" placeholder="Deskripsi peran..."/>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <select 
                                                value={item.type} 
                                                onChange={e => handleUpdateArray('actors', item.id, 'type', e.target.value)} 
                                                style={{ ...pillStyle, width: '100%', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center' }}
                                            >
                                                <option value="API">API (Simple)</option>
                                                <option value="Protocol">Protocol (Average)</option>
                                                <option value="GUI">GUI (Complex)</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, background: '#fff8dd', color: '#ffc700', fontSize: 15 }}>{complexity.weight}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveArray('actors', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                                <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }}/>
                                            </button>
                                        </td>
                                    </tr>
                                 );
                            })
                        )}
                        <tr style={{ background: '#1e1e2d' }}>
                            <td colSpan={4} style={{ padding: '16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Unadjusted Actor Weight (UAW)</td>
                            <td style={{ padding: '16px', textAlign: 'center', color: '#ffc700', fontWeight: 900, fontSize: 20 }}>{calc.uaw || 0}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 08. USE CASE DIAGRAM & UUCW ───────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
             <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                 <h3 className="kt-card-title"><GitGraph style={{ color: 'var(--kt-primary)' }}/> 08. Use Case Deskripsi sekaligus Perhitungan UUCW</h3>
                 <button 
                    onClick={() => handleAddArray('useCases', {id: `uc_${Date.now()}`, name: '', prioritas: 'High', actorRef: '', preCond: '', postCond: '', mainFlow: '', altFlow: '', transactions: 1})} 
                    className="kt-btn kt-btn-primary kt-btn-sm"
                    style={{ borderRadius: 8 }}
                 >
                    <Plus style={{ width: 14, height: 14 }}/> Tambah Use Case
                 </button>
             </div>

             {/* Diagram Preview (Read-Only) */}
             <div className="kt-card-body" style={{ background: '#fafafa', borderTop: '1px solid #e4e6ef', borderBottom: '1px solid #e4e6ef', padding: 16 }}>
                 <div style={{ border: '1px solid #e4e6ef', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                         <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>Preview Use Case Diagram (Ditarik dari FSD)</span>
                         {project.mermaid?.useCaseDiagram && (
                             <button onClick={() => setFullScreenDiagram(project.mermaid.useCaseDiagram)} className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'var(--kt-primary-light)' }}>
                                 <Maximize style={{ width: 14, height: 14, color: 'var(--kt-primary)' }} />
                             </button>
                         )}
                     </div>
                     <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#f8f9fa', borderRadius: 6, padding: 16, minHeight: 150 }}>
                         {project.mermaid?.useCaseDiagram ? <div ref={useCaseRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} /> : <span style={{ color: 'var(--kt-text-muted)', fontSize: 13, margin: 'auto' }}>Diagram belum tersedia.</span>}
                     </div>
                 </div>
             </div>

             {/* Tabel Use Case Super Komprehensif */}
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 80 }}>Kode UC</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 120 }}>Nama UC</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 100 }}>Prioritas</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 140 }}>Kondisi Awal / Akhir</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 220 }}>Alur Utama / Alt. / Catatan (Acceptance)</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center' }}>Jml Trans.</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 110, textAlign: 'center' }}>Complexity</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center', background: '#fff8dd', color: '#ffc700' }}>UUCW</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 50 }}></th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project.useCases || []).length === 0 ? (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>Belum ada Use Case.</td></tr>
                        ) : (
                            (project.useCases || []).map((uc, idx) => {
                                const complexity = getUseCaseComplexity(uc.transactions);
                                const pillStyle = getUCPill(complexity.level);
                                return (
                                    <tr key={uc.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--kt-text-muted)', fontFamily: 'monospace', fontSize: 11, verticalAlign: 'top' }}>MOD-UC-{idx + 1}</td>
                                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                            <textarea value={uc.name || uc.deskripsi || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'name', e.target.value)} className="kt-textarea" rows={2} style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }} placeholder="Nama UC..." />
                                            <textarea value={uc.actorRef || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'actorRef', e.target.value)} className="kt-textarea" rows={1} style={{ fontSize: 11 }} placeholder="Aktor..." />
                                        </td>
                                        <td style={{ padding: '8px', verticalAlign: 'top', paddingTop: 12 }}>
                                            <select value={uc.prioritas || 'High'} onChange={e => handleUpdateArray('useCases', uc.id, 'prioritas', e.target.value)} className="kt-select" style={{ fontSize: 11, padding: '4px 8px' }}>
                                                <option>Critical</option>
                                                <option>High</option>
                                                <option>Medium</option>
                                                <option>Low</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                            <textarea value={uc.preCond || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'preCond', e.target.value)} className="kt-textarea" rows={2} style={{ fontSize: 11, marginBottom: 4 }} placeholder="Kondisi Awal..." />
                                            <textarea value={uc.postCond || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'postCond', e.target.value)} className="kt-textarea" rows={2} style={{ fontSize: 11 }} placeholder="Kondisi Akhir..." />
                                        </td>
                                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                            <textarea value={uc.mainFlow || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'mainFlow', e.target.value)} className="kt-textarea" rows={2} style={{ fontSize: 11, marginBottom: 4 }} placeholder="Alur Utama..."/>
                                            <textarea value={uc.altFlow || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'altFlow', e.target.value)} className="kt-textarea" rows={2} style={{ fontSize: 11 }} placeholder="Alur Alternatif..."/>
                                            <textarea value={uc.catatan || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'catatan', e.target.value)} className="kt-textarea" rows={3} style={{ fontSize: 11, borderColor: 'var(--kt-primary-light)', background: '#f8f9fa' }} placeholder="Catatan / Acceptance Criteria..."/>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>
                                            <input type="number" min="1" value={uc.transactions || 1} onChange={e => handleUpdateArray('useCases', uc.id, 'transactions', parseInt(e.target.value) || 1)} className="kt-input" style={{ textAlign: 'center', fontWeight: 800, padding: '6px' }} />
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                                            <div style={{ ...pillStyle, padding: '4px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{complexity.level}</div>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, background: '#fff8dd', color: '#ffc700', fontSize: 15, verticalAlign: 'middle' }}>{complexity.weight}</td>
                                        <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                                            <button onClick={() => handleRemoveArray('useCases', uc.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}><Trash2 style={{ width: 14, height: 14, color: 'var(--kt-danger)' }}/></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        <tr style={{ background: '#1e1e2d' }}>
                            <td colSpan={7} style={{ padding: '16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Unadjusted Use Case Weighting (UUCW)</td>
                            <td style={{ padding: '16px', textAlign: 'center', color: '#ffc700', fontWeight: 900, fontSize: 20 }}>{calc.uucw || 0}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>

        {/* ── 09. PARAMETER PENILAIAN (TCF & EF) ─────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="kt-card-title"><Settings style={{ width: 18 }}/> 09. Parameter Penilaian Terkunci (TCF & EF)</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, background: '#1e1e2d', color: '#fff', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                    <Lock style={{ width: 12, height: 12 }}/> IKC Standard Applied
                </span>
            </div>
            <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                <div style={{ background: 'var(--kt-warning-light)', border: '1px solid rgba(246,177,0,0.2)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#7a5800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Technical Complexity (TCF)</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--kt-warning)' }}>{calc.tcf}</div>
                </div>
                <div style={{ background: 'var(--kt-success-light)', border: '1px solid rgba(23,198,83,0.2)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#028a3b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Environmental Factor (EF)</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--kt-success)' }}>{calc.ef}</div>
                </div>
                <div style={{ background: '#1e1e2d', padding: 24, borderRadius: 12, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', transform: 'scale(1.02)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kt-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Final UCP Score</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{(calc.ucp || 0).toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>UUCP x TCF x EF</div>
                </div>
            </div>
        </div>

        {/* ── 10. PERHITUNGAN EFFORT (MAN-MONTH) ─────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 className="kt-card-title"><Clock style={{ width: 18 }}/> 10. Perhitungan Effort (Man-Month)</h3>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e1e2d', padding: '6px 16px', borderRadius: 20 }}>
                     <Edit3 style={{ width: 14, height: 14, color: 'var(--kt-primary)' }}/>
                     <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Decision Rule (PHM):</span>
                     <input 
                        type="number" min="1"
                        value={project.phm || 20}
                        onChange={(e) => setProject(prev => ({ ...prev, phm: parseInt(e.target.value) || 20 }))}
                        style={{ background: 'transparent', color: '#fff', fontWeight: 800, fontSize: 12, width: 30, textAlign: 'center', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', outline: 'none' }}
                     />
                     <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Jam</span>
                 </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                     <thead>
                         <tr>
                             <th style={{ ...cleanTableHeaderStyle, textAlign: 'left', borderRight: '1px solid #e4e6ef' }}>Sub Paket</th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>Total UAW</th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>Total UUCW</th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>UUCP<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(UAW+UUCW)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>UCP<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(UUCP*TCF*EF)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef', background: 'var(--kt-primary-light)', color: 'var(--kt-primary)' }}>PHM<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(UCP*{project.phm})</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>WD<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(PHM/8)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, background: 'var(--kt-primary)', color: '#fff' }}>MM<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(WD/22)</span></th>
                         </tr>
                     </thead>
                     <tbody style={{ background: '#fff' }}>
                         <tr style={{ borderBottom: '1px solid #f4f5f8' }}>
                             <td style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: 'var(--kt-text-dark)', borderRight: '1px solid #e4e6ef' }}>{project.nama || 'Nama Proyek'}</td>
                             <td style={{ padding: '16px', fontWeight: 600, borderRight: '1px solid #e4e6ef' }}>{calc.uaw}</td>
                             <td style={{ padding: '16px', fontWeight: 600, borderRight: '1px solid #e4e6ef' }}>{calc.uucw}</td>
                             <td style={{ padding: '16px', fontWeight: 800, background: '#fff8dd', color: '#ffc700', borderRight: '1px solid #e4e6ef' }}>{calc.uucp}</td>
                             <td style={{ padding: '16px', fontWeight: 800, background: '#f4f5f8', borderRight: '1px solid #e4e6ef' }}>{(calc.ucp || 0).toFixed(2)}</td>
                             <td style={{ padding: '16px', fontWeight: 800, background: 'var(--kt-primary-light)', color: 'var(--kt-primary)', borderRight: '1px solid #e4e6ef' }}>{(calc.totalPersonHours || 0).toFixed(0)}</td>
                             <td style={{ padding: '16px', fontWeight: 600, borderRight: '1px solid #e4e6ef' }}>{(calc.workingDays || 0).toFixed(0)}</td>
                             <td style={{ padding: '16px', fontWeight: 900, fontSize: 18, background: 'var(--kt-primary-light)', color: 'var(--kt-primary)' }}>{(calc.totalManMonths || 0).toFixed(2)}</td>
                         </tr>
                     </tbody>
                 </table>
            </div>
        </div>

        {/* ── 11. COST ESTIMATION (RAB) / KAK AKHIR TAHUN [UNTOUCHED] ────── */}
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
             <div className="mb-4 flex items-start justify-between">
                 <div>
                     <h4 className="font-bold text-emerald-900 text-base uppercase flex items-center gap-2">
                         <Briefcase className="w-5 h-5"/> 11. Cost Estimation (KAK Akhir Tahun)
                     </h4>
                     <p className="text-xs text-slate-500">Distribusi biaya berdasarkan fase pengembangan. Data dapat disesuaikan manual.</p>
                 </div>
                 {/* 🔥 NEW: Customization allowed badge */}
                 <span className="flex items-center gap-1.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1.5 rounded-full font-bold shrink-0">
                     <Unlock className="w-3 h-3"/> Kustomisasi Diizinkan
                 </span>
             </div>
             <div className="overflow-x-auto border border-emerald-200 rounded-lg">
                 <table className="w-full text-left text-xs border-collapse">
                     <thead className="bg-[#047857] text-white uppercase font-bold tracking-wider">
                         <tr>
                             <th className="p-3 border-r border-emerald-800">Phase</th>
                             <th className="p-3 border-r border-emerald-800 text-center w-32">Prosentase Effort</th>
                             <th className="p-3 border-r border-emerald-800 text-center w-36">Effort Distribution (MM)</th>
                             <th className="p-3 border-r border-emerald-800 w-48">PIC</th>
                             <th className="p-3 border-r border-emerald-800 w-44 text-right">Gaji Per Bulan</th>
                             <th className="p-3 w-40 text-right">Cost Estimation</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-emerald-100 text-slate-800">
                         {['Software Phase Development', 'Ongoing life-cycle activity', 'Quality and testing phases'].map(group => {
                             const groupItems = (calc.kakTableData || []).filter((i) => i.group === group);
                             return (
                                 <React.Fragment key={group}>
                                     <tr className="bg-slate-100">
                                         <td colSpan={6} className="p-2 px-3 font-bold italic text-slate-700 border-b border-slate-200">
                                             {group}
                                         </td>
                                     </tr>
                                     {groupItems.map((item) => (
                                         <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                                             <td className="p-2 px-3 border-r border-slate-200 italic text-slate-700">
                                                 {item.name}
                                             </td>
                                             
                                             <td className="p-2 px-3 border-r border-slate-200 text-center">
                                                 <div className="flex items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 rounded px-1 w-16 mx-auto">
                                                     <input 
                                                        type="number" step="0.1"
                                                        value={item.percent || 0}
                                                        onChange={(e) => updateKakItem(item.id, 'percent', parseFloat(e.target.value) || 0)}
                                                        className="w-10 bg-transparent text-center font-bold text-emerald-700 outline-none"
                                                     />
                                                     <span className="text-emerald-700 font-bold">%</span>
                                                 </div>
                                             </td>
                                             
                                             <td className="p-2 px-3 border-r border-slate-200 text-center font-mono text-slate-700">
                                                 {(item.effortMM || 0).toFixed(3)}
                                             </td>

                                             <td className="p-2 px-3 border-r border-slate-200 text-slate-700">
                                                 <input 
                                                    type="text"
                                                    value={item.roleName || ''}
                                                    onChange={(e) => updateKakItem(item.id, 'roleName', e.target.value)}
                                                    className="w-full bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-emerald-500 py-1"
                                                    placeholder="Role..."
                                                 />
                                             </td>

                                             <td className="p-2 px-3 border-r border-slate-200 text-right font-mono text-slate-600">
                                                 <div className="flex items-center justify-end gap-1">
                                                     <span>Rp</span>
                                                     <input 
                                                        type="number"
                                                        value={item.rate || 0}
                                                        onChange={(e) => updateKakItem(item.id, 'rate', parseInt(e.target.value) || 0)}
                                                        className="w-24 text-right bg-transparent outline-none border-b border-dashed border-slate-300 focus:border-emerald-500 font-mono py-1"
                                                     />
                                                 </div>
                                             </td>
                                             
                                             <td className="p-2 px-3 text-right font-mono font-bold text-slate-800">
                                                 {formatIDR(item.cost || 0)}
                                             </td>
                                         </tr>
                                     ))}
                                 </React.Fragment>
                             );
                         })}

                         {/* TOTALS */}
                         <tr className="border-t-2 border-slate-300 font-bold bg-slate-50 text-slate-700">
                             <td className="p-2 px-3 italic" colSpan={2}>Total of Effort</td>
                             <td className="p-2 px-3 text-center font-mono font-black text-slate-800">
                                 {(calc.totalManMonths || 0).toFixed(2)}
                             </td>
                             <td colSpan={2}></td>
                             <td className="p-2 px-3 text-right font-bold">{formatIDR(calc.runningTotalCost || 0)}</td>
                         </tr>
                         <tr className="text-slate-600 bg-white">
                             <td className="p-2 px-3" colSpan={5}>Estimasi Garansi 25%</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.warrantyCost || 0)}</td>
                         </tr>
                         <tr className="font-bold bg-white text-slate-700">
                             <td className="p-2 px-3" colSpan={5}>Sub Total</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.subTotal || 0)}</td>
                         </tr>
                         <tr className="text-slate-600 bg-white">
                             <td className="p-2 px-3" colSpan={5}>PPN 11%</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.ppn || 0)}</td>
                         </tr>
                         <tr className="bg-[#047857] text-white font-black text-sm">
                             <td className="p-3 uppercase tracking-wide" colSpan={5}>Total</td>
                             <td className="p-3 text-right text-base font-black tracking-tight">{formatIDR(calc.grandTotal || 0)}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>

        {/* ── 12. BUSINESS VALUE VS EFFORT ─────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title"><TrendingUp style={{ width: 18, color: 'var(--kt-primary)' }}/> 12. Perhitungan Business Value vs Effort</h3>
            </div>
            <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                {/* BV */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f5f8', paddingBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--kt-text-dark)' }}>Business Value</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--kt-primary)' }}>{(calc.totalBV || 0).toFixed(2)}</span>
                    </div>
                    {Object.keys(BV_OPTIONS || {}).map((key) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                             <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>{key}</label>
                             <select 
                                className="kt-select"
                                style={{ fontWeight: 600, fontSize: 13 }}
                                onChange={(e) => updateBVEffort('bv', key, e.target.selectedIndex)}
                                value={project.bvEffort?.[key]?.label || ''}
                             >
                                 {(BV_OPTIONS[key] || []).map((opt) => (
                                     <option key={opt.label} value={opt.label}>{opt.label} (Score: {opt.score})</option>
                                 ))}
                             </select>
                        </div>
                    ))}
                </div>

                {/* Effort */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f5f8', paddingBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--kt-text-dark)' }}>Effort</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--kt-danger)' }}>{(calc.totalEffort || 0).toFixed(2)}</span>
                    </div>
                     {Object.keys(EFFORT_OPTIONS || {}).map((key) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                             <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>{key}</label>
                             <select 
                                className="kt-select"
                                style={{ fontWeight: 600, fontSize: 13 }}
                                onChange={(e) => updateBVEffort('effort', key, e.target.selectedIndex)}
                                value={project.bvEffort?.[key]?.label || ''}
                             >
                                 {(EFFORT_OPTIONS[key] || []).map((opt) => (
                                     <option key={opt.label} value={opt.label}>{opt.label} (Score: {opt.score})</option>
                                 ))}
                             </select>
                        </div>
                    ))}
                </div>

                {/* Recommendation Footer */}
                <div style={{ gridColumn: '1 / -1', marginTop: 16, background: '#f4f5f8', border: '1px solid #e4e6ef', padding: 24, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kt-text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Rekomendasi Prioritas</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--kt-text-dark)' }}>{calc.priority || "P3 (Low)"}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kt-text-gray)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Score (BV / Effort)</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--kt-primary)' }}>{calc.totalBV || 0}</span>
                            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--kt-text-muted)' }}>/</span>
                            <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--kt-danger)' }}>{calc.totalEffort || 0}</span>
                        </div>
                    </div>
                </div>
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
import React from 'react';
import { 
    Briefcase, Sparkles, Target, LayoutList, 
    GitCompare, CheckSquare, User, GitGraph, 
    Calculator, Clock, Lock
} from 'lucide-react';

import { 
    getActorComplexity, getUseCaseComplexity,
    TCF_FACTORS, EF_FACTORS 
} from '../constants';

export const TabBRD = ({ 
    project, setProject, uploadedFile, calc, handleUpdateArray 
}) => {
  
  const handleUpdateTcf = (id, value) => {
    const val = Math.max(0, Math.min(5, parseInt(value) || 0));
    setProject(prev => ({ ...prev, tcfImpacts: { ...prev.tcfImpacts, [id]: val } }));
  };

  const handleUpdateEf = (id, value) => {
    const val = Math.max(0, Math.min(5, parseInt(value) || 0));
    setProject(prev => ({ ...prev, efImpacts: { ...prev.efImpacts, [id]: val } }));
  };

  const cleanTableHeaderStyle = {
    background: '#f4f5f8', color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.05em', fontWeight: 700, padding: '12px 16px', borderBottom: '1px solid #e4e6ef'
  };

  // 🛡️ SUPER SAFE CALCULATION: Mencegah undefined crash
  const totalTcfScore = TCF_FACTORS.reduce((s, f) => s + (Number(f.weight || 0) * Number(project.tcfImpacts?.[f.id] ?? 3)), 0);
  const totalEfScore = EF_FACTORS.reduce((s, f) => s + (Number(f.weight || 0) * Number(project.efImpacts?.[f.id] ?? 3)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">
        
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="kt-notice kt-notice-primary" style={{ background: 'var(--kt-info-light)', borderColor: 'rgba(114,57,234,0.2)', color: 'var(--kt-info)' }}>
            <Briefcase />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Business Requirement Document (BRD) 
                  {uploadedFile && <Sparkles style={{ width: 14, height: 14 }}/>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
                  PENGINGAT PENTING: BRD disiapkan oleh Product Manager. Dokumen acuannya yaitu Dokumen Penelitian yang merupakan output dari Tim DM.
              </div>
            </div>
        </div>

        {/* ── 01. INFORMASI UMUM ──────────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title"><Target style={{ color: 'var(--kt-info)' }}/> 01. Informasi Umum</h3>
            </div>
            <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Nama Proyek</label><div style={{ fontWeight: 700, fontSize: 14 }}>{project?.nama || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Uraian Singkat</label><div style={{ fontSize: 13 }}>{project?.uraianUsulan || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Unit Pengampu Bisnis Proses</label><div style={{ fontSize: 13 }}>{project?.pengampu || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Nomor & Tgl ND Kajian Kebutuhan</label><div style={{ fontSize: 13 }}>{project?.nomorND || '-'} / {project?.tanggalND || '-'}</div></div>
            </div>
        </div>

        {/* ── 02. ANALISIS PROSES BISNIS ──────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header"><h3 className="kt-card-title"><LayoutList style={{ color: 'var(--kt-info)' }}/> 02. Analisis Proses Bisnis</h3></div>
            <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Modul</label><div style={{ fontWeight: 700 }}>{project?.brdProcessAnalysis?.modul || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Sub Modul</label><div style={{ fontWeight: 700 }}>{project?.brdProcessAnalysis?.subModul || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Pemetaan EA</label><div style={{ fontSize: 13 }}>{project?.brdProcessAnalysis?.eaMapping || '-'}</div></div>
                <div><label className="kt-label" style={{ fontSize: 11 }}>Keterangan</label><div style={{ fontSize: 13 }}>{project?.brdProcessAnalysis?.notes || '-'}</div></div>
            </div>
        </div>

        {/* ── 03. KONDISI AS-IS TO-BE ─────────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                 <h3 className="kt-card-title"><GitCompare style={{ color: 'var(--kt-info)' }}/> 03. Kondisi As-Is To-Be</h3>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>Faktor Pembanding</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>As Is</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>To Be</th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project?.asIsToBe || []).length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)' }}>Belum ada data. Silakan isi di Tab Kajian.</td></tr>
                        ) : (
                            (project?.asIsToBe || []).map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', fontWeight: 600 }}>{item.factor}</td>
                                    <td style={{ padding: '12px', fontSize: 13 }}>{item.asIs}</td>
                                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--kt-success)', fontWeight: 500 }}>{item.toBe}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 04 & 05. KEBUTUHAN FUNGSIONAL & NON-FUNGSIONAL ──────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                    <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-info)' }}/> 04. Keb. Fungsional</h3>
                </div>
                <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>No</th>
                                <th style={cleanTableHeaderStyle}>Fungsi</th>
                                <th style={cleanTableHeaderStyle}>Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {(project?.kebutuhanFungsional || []).map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', fontWeight: 600, fontSize: 12 }}>{item.kebutuhan}</td>
                                    <td style={{ padding: '12px', fontSize: 12, color: 'var(--kt-text-gray)' }}>{item.detailFungsi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="kt-card" style={{ overflow: 'hidden' }}>
                <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                    <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-info)' }}/> 05. Keb. Non-Fungsional</h3>
                </div>
                <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: 40, textAlign: 'center' }}>No</th>
                                <th style={cleanTableHeaderStyle}>Deskripsi</th>
                                <th style={cleanTableHeaderStyle}>Alasan</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {(project?.kebutuhanNonFungsional || []).map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', fontWeight: 600, fontSize: 12 }}>{item.deskripsi}</td>
                                    <td style={{ padding: '12px', fontSize: 12, color: 'var(--kt-text-gray)' }}>{item.alasan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* ── 06. SPESIFIKASI AKTOR ───────────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><User style={{ color: 'var(--kt-info)' }}/> 06. Spesifikasi Aktor</h3>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 120 }}>Kode Aktor</th>
                            <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>Nama Aktor</th>
                            <th style={cleanTableHeaderStyle}>Deskripsi</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 140, textAlign: 'center' }}>Jenis Aktor</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center', background: 'rgba(255,199,0,0.1)', color: '#ffc700' }}>UAW</th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project?.actors || []).length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--kt-text-muted)' }}>Belum ada aktor.</td></tr>
                        ) : (
                            (project?.actors || []).map((item, idx) => {
                                 const complexity = getActorComplexity(item.type);
                                 return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--kt-text-muted)', fontFamily: 'monospace' }}>MOD-A-{idx + 1}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700 }}>{item.name}</td>
                                        <td style={{ padding: '12px 16px', fontSize: 12 }}>{item.desc}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: '1px solid #e4e6ef' }}>{item.type}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, background: '#fff8dd', color: '#ffc700', fontSize: 15 }}>{complexity.weight}</td>
                                    </tr>
                                 );
                            })
                        )}
                        <tr style={{ background: '#1e1e2d' }}>
                            <td colSpan={4} style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total UAW</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ffc700', fontWeight: 900, fontSize: 18 }}>{calc?.uaw || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 07. USE CASE DIAGRAM DAN DESKRIPSI ──────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
                <h3 className="kt-card-title"><GitGraph style={{ color: 'var(--kt-info)' }}/> 07. Use Case Diagram dan Deskripsi</h3>
            </div>
            <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th style={{ ...cleanTableHeaderStyle, width: 80 }}>Kode UC</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 140 }}>Nama UC</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 100 }}>Aktor</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Alur Utama</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Alur Alternatif</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center' }}>Jml UI</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 110, textAlign: 'center' }}>Complexity</th>
                            <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center', background: 'rgba(255,199,0,0.1)', color: '#ffc700' }}>UUCW</th>
                        </tr>
                    </thead>
                    <tbody style={{ background: '#fff' }}>
                        {(project?.useCases || []).length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--kt-text-muted)' }}>Belum ada Use Case.</td></tr>
                        ) : (
                            (project?.useCases || []).map((uc, idx) => {
                                const complexity = getUseCaseComplexity(uc.transactions);
                                return (
                                    <tr key={uc.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--kt-text-muted)', fontFamily: 'monospace', fontSize: 11, verticalAlign: 'top' }}>MOD-UC-{idx + 1}</td>
                                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{uc.name || uc.deskripsi}</div>
                                            <div style={{ fontSize: 10, color: 'var(--kt-text-muted)' }}>Prioritas: {uc.prioritas}</div>
                                        </td>
                                        <td style={{ padding: '8px', fontSize: 11, verticalAlign: 'top' }}>{uc.actorRef}</td>
                                        <td style={{ padding: '8px', fontSize: 11, color: 'var(--kt-text-gray)', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{uc.mainFlow}</td>
                                        <td style={{ padding: '8px', fontSize: 11, color: 'var(--kt-text-gray)', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{uc.altFlow}</td>
                                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, verticalAlign: 'top' }}>{uc.transactions}</td>
                                        <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: '1px solid #e4e6ef' }}>{complexity.level}</span>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, background: '#fff8dd', color: '#ffc700', fontSize: 15, verticalAlign: 'top' }}>{complexity.weight}</td>
                                    </tr>
                                );
                            })
                        )}
                        <tr style={{ background: '#1e1e2d' }}>
                            <td colSpan={7} style={{ padding: '12px 16px', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total UUCW</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: '#ffc700', fontWeight: 900, fontSize: 18 }}>{calc?.uucw || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 08. USE CASE POINT (TCF & EF TABLES) ────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="kt-card-title"><Calculator style={{ color: 'var(--kt-info)' }}/> 08. Use Case Point</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'var(--kt-info-light)', color: 'var(--kt-info)', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                    UUCP (UAW + UUCW) = {calc?.uucp || 0}
                </span>
            </div>
            
            {/* TCF Table */}
            <div style={{ padding: 24, paddingBottom: 0 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: 'var(--kt-text-dark)' }}>Technical Complexity Factor (TCF)</h4>
                <div style={{ overflowX: 'auto', border: '1px solid #e4e6ef', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: '40%' }}>Factor</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center' }}>Weight</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 140, textAlign: 'center' }}>Relevance (0-5)</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 100, textAlign: 'center' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {TCF_FACTORS.map(f => {
                                const rel = project?.tcfImpacts?.[f.id] ?? 3;
                                const score = Number(f.weight || 0) * Number(rel || 0);
                                return (
                                    <tr key={f.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 12 }}>{f.id} {f.name}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: 'var(--kt-text-muted)' }}>{Number(f.weight || 0).toFixed(2)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <input 
                                                type="number" min="0" max="5" 
                                                value={rel} onChange={(e) => handleUpdateTcf(f.id, e.target.value)}
                                                className="kt-input" style={{ width: 60, textAlign: 'center', padding: '4px', fontSize: 12, fontWeight: 700 }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)' }}>{Number(score || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            <tr style={{ background: '#f8f9fa' }}>
                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: 12 }}>Total TCF Score (Simulasi)</td>
                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: 'var(--kt-text-dark)', fontSize: 14 }}>{Number(totalTcfScore || 0).toFixed(2)}</td>
                            </tr>
                            <tr style={{ background: 'var(--kt-warning-light)' }}>
                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#7a5800', fontSize: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                        <Lock style={{ width: 14, height: 14 }}/> TCF Applied (Standar IKC Bea Cukai)
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: 'var(--kt-warning)', fontSize: 16 }}>0.87</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EF Table */}
            <div style={{ padding: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: 'var(--kt-text-dark)' }}>Environmental Factor (EF)</h4>
                <div style={{ overflowX: 'auto', border: '1px solid #e4e6ef', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ ...cleanTableHeaderStyle, width: '40%' }}>Factor</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 80, textAlign: 'center' }}>Weight</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 140, textAlign: 'center' }}>Impact (0-5)</th>
                                <th style={{ ...cleanTableHeaderStyle, width: 100, textAlign: 'center' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#fff' }}>
                            {EF_FACTORS.map(f => {
                                const imp = project?.efImpacts?.[f.id] ?? 3;
                                const score = Number(f.weight || 0) * Number(imp || 0);
                                return (
                                    <tr key={f.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                                        <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 12 }}>{f.id} {f.name}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontSize: 12, color: 'var(--kt-text-muted)' }}>{Number(f.weight || 0).toFixed(2)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <input 
                                                type="number" min="0" max="5" 
                                                value={imp} onChange={(e) => handleUpdateEf(f.id, e.target.value)}
                                                className="kt-input" style={{ width: 60, textAlign: 'center', padding: '4px', fontSize: 12, fontWeight: 700 }}
                                            />
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)' }}>{Number(score || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            <tr style={{ background: '#f8f9fa' }}>
                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: 12 }}>Environmental Total Score (Simulasi)</td>
                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: 'var(--kt-text-dark)', fontSize: 14 }}>{Number(totalEfScore || 0).toFixed(2)}</td>
                            </tr>
                            <tr style={{ background: 'var(--kt-success-light)' }}>
                                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#028a3b', fontSize: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                        <Lock style={{ width: 14, height: 14 }}/> EF Applied (Standar IKC Bea Cukai)
                                    </div>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: 'var(--kt-success)', fontSize: 16 }}>0.77</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Final UCP */}
            <div style={{ background: '#1e1e2d', padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kt-info)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Final UCP Score</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#fff' }}>{Number(calc?.ucp || 0).toFixed(2)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>UUCP ({calc?.uucp || 0}) × Locked TCF (0.87) × Locked EF (0.77)</div>
            </div>
        </div>

        {/* ── 09. MAN MONTH ESTIMATION ────────────────────────────────────── */}
        <div className="kt-card" style={{ overflow: 'hidden' }}>
            <div className="kt-card-header">
                 <h3 className="kt-card-title"><Clock style={{ color: 'var(--kt-info)' }}/> 09. Man Month Estimation</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                     <thead>
                         <tr>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>UCP<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(UUCP*TCF*EF)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>PHM<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(Decision Rule)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>Person-Hours<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(UCP*PHM)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, borderRight: '1px solid #e4e6ef' }}>WD<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(PHM/8)</span></th>
                             <th style={{ ...cleanTableHeaderStyle, background: 'var(--kt-info-light)', color: 'var(--kt-info)' }}>MM<br/><span style={{ fontWeight: 500, fontSize: 9 }}>(WD/22)</span></th>
                         </tr>
                     </thead>
                     <tbody style={{ background: '#fff' }}>
                         <tr style={{ borderBottom: '1px solid #f4f5f8' }}>
                             <td style={{ padding: '20px 16px', fontWeight: 800, fontSize: 16, borderRight: '1px solid #e4e6ef' }}>{Number(calc?.ucp || 0).toFixed(2)}</td>
                             <td style={{ padding: '20px 16px', fontWeight: 800, fontSize: 16, borderRight: '1px solid #e4e6ef' }}>{project?.phm || 20}</td>
                             <td style={{ padding: '20px 16px', fontWeight: 800, fontSize: 16, color: 'var(--kt-warning)', borderRight: '1px solid #e4e6ef' }}>{Number(calc?.totalPersonHours || 0).toFixed(0)}</td>
                             <td style={{ padding: '20px 16px', fontWeight: 800, fontSize: 16, borderRight: '1px solid #e4e6ef' }}>{Number(calc?.workingDays || 0).toFixed(0)}</td>
                             <td style={{ padding: '20px 16px', fontWeight: 900, fontSize: 24, background: 'var(--kt-info-light)', color: 'var(--kt-info)' }}>{Number(calc?.totalManMonths || 0).toFixed(2)}</td>
                         </tr>
                     </tbody>
                 </table>
            </div>
            <div style={{ padding: 16, background: '#fafafa', textAlign: 'center', fontSize: 12, color: 'var(--kt-text-gray)' }}>
                Berdasarkan perhitungan di atas, estimasi lama pengerjaan proyek adalah sekitar <strong style={{ color: 'var(--kt-success)' }}>~{Math.ceil(calc?.totalManMonths || 0)} Bulan</strong>.
            </div>
        </div>

    </div>
  );
};
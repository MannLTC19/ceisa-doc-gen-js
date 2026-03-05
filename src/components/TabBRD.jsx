import React from 'react';
import { 
    Briefcase, Sparkles, Plus, Trash2, LayoutList, 
    User, GitGraph, Calendar, GitCompare 
} from 'lucide-react';
import FileUploadWithOCR from './FileUploadWithOCR';

import { 
    getActorComplexity, getUseCaseComplexity 
} from '../constants';

export const TabBRD = ({ 
    project, setProject, uploadedFile, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {
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
                  Mendefinisikan perubahan proses bisnis, kebutuhan fungsional, dan resume perhitungan estimasi (UCP).
              </div>
            </div>
        </div>

        {/* ── 1. ANALISIS PROSES BISNIS ───────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title">
                    <LayoutList /> 1. Analisis Proses Bisnis
                </h3>
            </div>
            <div className="kt-card-body">
                <div className="kt-form-grid kt-form-grid-2">
                    <FileUploadWithOCR
                        label="📄 Unggah Dokumen (Proses/Modul)"
                        onFileExtracted={(text) => {
                            setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, notes: project.brdProcessAnalysis?.notes ? project.brdProcessAnalysis.notes + '\n\n' + text.substring(0, 500) : text.substring(0, 500)}});
                        }}
                        qualityThreshold={45}
                    />
                    <div className="kt-form-row">
                        <label className="kt-label">Modul</label>
                        <input 
                            value={project.brdProcessAnalysis?.modul || ''} 
                            onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, modul: e.target.value}})} 
                            className="kt-input" 
                            placeholder="Nama Modul"
                        />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Sub Modul</label>
                        <input 
                            value={project.brdProcessAnalysis?.subModul || ''} 
                            onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, subModul: e.target.value}})} 
                            className="kt-input" 
                            placeholder="Nama Sub Modul"
                        />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Analisis pemetaan EA Kemenkeu</label>
                        <input 
                            value={project.brdProcessAnalysis?.eaMapping || ''} 
                            onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, eaMapping: e.target.value}})} 
                            className="kt-input" 
                            placeholder="Kode / Nama EA"
                        />
                    </div>
                    <div className="kt-form-row">
                        <label className="kt-label">Catatan atau Keterangan</label>
                        <input 
                            value={project.brdProcessAnalysis?.notes || ''} 
                            onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, notes: e.target.value}})} 
                            className="kt-input" 
                            placeholder="Catatan Tambahan"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* ── 2. KONDISI AS-IS TO-BE ──────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                    <GitCompare /> 2. Kondisi As-Is To-Be
                 </h3>
                 <button 
                    onClick={() => handleAddArray('asIsToBe', {id: Date.now().toString(), factor: '', asIs: '', toBe: ''})} 
                    className="kt-btn kt-btn-primary kt-btn-sm"
                    style={{ background: 'var(--kt-success)', color: '#fff' }}
                 >
                    <Plus style={{ width: 14, height: 14 }}/> Tambah Baris
                 </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ width: '25%' }}>Faktor Pembanding</th>
                            <th style={{ width: '35%' }}>As Is (Kondisi Saat Ini)</th>
                            <th style={{ width: '35%' }}>To Be (Kondisi Usulan)</th>
                            <th style={{ width: 50 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(project.asIsToBe ?? []).length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)', fontSize: 12.5 }}>
                                    Belum ada data As-Is To-Be. Klik "Tambah Baris" untuk menambahkan.
                                </td>
                            </tr>
                        ) : (
                            (project.asIsToBe ?? []).map((item, idx) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <input 
                                            value={item.factor || ''} 
                                            onChange={e => handleUpdateArray('asIsToBe', item.id, 'factor', e.target.value)} 
                                            className="kt-input" 
                                            placeholder="Faktor..."
                                        />
                                    </td>
                                    <td>
                                        <textarea 
                                            value={item.asIs || ''} 
                                            onChange={e => handleUpdateArray('asIsToBe', item.id, 'asIs', e.target.value)} 
                                            className="kt-textarea" 
                                            style={{ minHeight: 40 }}
                                            placeholder="Kondisi Saat Ini..."
                                        />
                                    </td>
                                    <td>
                                        <textarea 
                                            value={item.toBe || ''} 
                                            onChange={e => handleUpdateArray('asIsToBe', item.id, 'toBe', e.target.value)} 
                                            className="kt-textarea" 
                                            style={{ minHeight: 40, borderColor: 'rgba(23,198,83,0.3)', background: 'var(--kt-success-light)' }}
                                            placeholder="Kondisi Usulan..."
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
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

        {/* ── 3. KEBUTUHAN FUNGSIONAL (READ ONLY) ─────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title">
                    <LayoutList /> 3. Kebutuhan Fungsional (Resume dari Kajian)
                </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ width: 150 }}>Fungsi / Kode</th>
                            <th>Deskripsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(project.kebutuhanFungsional ?? []).length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)', fontSize: 12.5 }}>
                                    Data kebutuhan fungsional ditarik otomatis dari tab Kajian Kebutuhan.
                                </td>
                            </tr>
                        ) : (
                            (project.kebutuhanFungsional ?? []).map((item, idx) => (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <span className="kt-badge kt-badge-light" style={{ fontFamily: 'monospace' }}>{item.id}</span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{item.kebutuhan || item.deskripsi}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 4. SPESIFIKASI AKTOR (RESUME) ───────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title">
                    <User /> 4. Spesifikasi Aktor
                </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 100 }}>Kode Aktor</th>
                            <th style={{ width: '25%' }}>Nama Aktor</th>
                            <th>Deskripsi</th>
                            <th style={{ width: 80, textAlign: 'center' }}>UAW</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(project.actors ?? []).length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)', fontSize: 12.5 }}>
                                    Data aktor ditarik dari tab Penelitian.
                                </td>
                            </tr>
                        ) : (
                            (project.actors ?? []).map((item) => {
                                 const complexity = getActorComplexity(item.type);
                                 return (
                                    <tr key={item.id}>
                                        <td><span className="kt-badge kt-badge-light" style={{ fontFamily: 'monospace' }}>ACT-{item.id.toString().slice(-4)}</span></td>
                                        <td style={{ fontWeight: 700 }}>{item.name}</td>
                                        <td>
                                            <input 
                                                value={item.desc || ''} 
                                                onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} 
                                                className="kt-input" 
                                                placeholder="Deskripsi peran aktor di sistem..."
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{complexity.weight}</td>
                                    </tr>
                                 );
                            })
                        )}
                        <tr style={{ background: 'var(--kt-border-light)' }}>
                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total UAW</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)', fontSize: 16 }}>{calc.uaw || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 5. USE CASE SUMMARY ─────────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title">
                    <GitGraph /> 5. Use Case Summary
                </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 90 }}>Kode UC</th>
                            <th style={{ width: '20%' }}>Nama UC</th>
                            <th style={{ width: '15%' }}>Aktor</th>
                            <th style={{ width: '25%' }}>Kondisi Awal</th>
                            <th style={{ width: '25%' }}>Kondisi Akhir</th>
                            <th style={{ width: 80, textAlign: 'center' }}>UUCW</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(project.useCases ?? []).length === 0 ? (
                             <tr>
                                 <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)', fontSize: 12.5 }}>
                                     Data Use Case ditarik dari tab Penelitian.
                                 </td>
                             </tr>
                        ) : (
                            (project.useCases ?? []).map((uc) => {
                                 const complexity = getUseCaseComplexity(uc.transactions);
                                 return (
                                    <tr key={uc.id}>
                                        <td><span className="kt-badge kt-badge-light" style={{ fontFamily: 'monospace' }}>UC-{uc.id.toString().replace('uc_','').slice(-4)}</span></td>
                                        <td style={{ fontWeight: 700 }}>{uc.name}</td>
                                        <td>
                                            <input 
                                                value={uc.actorRef || ''} 
                                                onChange={e => handleUpdateArray('useCases', uc.id, 'actorRef', e.target.value)} 
                                                className="kt-input" 
                                                placeholder="Aktor Terkait"
                                            />
                                        </td>
                                        <td>
                                            <textarea 
                                                value={uc.preCond || ''} 
                                                onChange={e => handleUpdateArray('useCases', uc.id, 'preCond', e.target.value)} 
                                                className="kt-textarea" 
                                                style={{ minHeight: 40 }}
                                                placeholder="Kondisi Awal..."
                                            />
                                        </td>
                                        <td>
                                            <textarea 
                                                value={uc.postCond || ''} 
                                                onChange={e => handleUpdateArray('useCases', uc.id, 'postCond', e.target.value)} 
                                                className="kt-textarea" 
                                                style={{ minHeight: 40 }}
                                                placeholder="Kondisi Akhir..."
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{complexity.weight}</td>
                                    </tr>
                                 );
                            })
                        )}
                        <tr style={{ background: 'var(--kt-border-light)' }}>
                            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total UUCW</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)', fontSize: 16 }}>{calc.uucw || 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 6. MAN MONTH SUMMARY ────────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                <h3 className="kt-card-title">
                    <Calendar /> 6. Man Month Estimation Summary
                </h3>
            </div>
            <div style={{ overflowX: 'auto', padding: 24 }}>
                <table className="kt-table" style={{ border: '1px solid var(--kt-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <thead style={{ background: 'var(--kt-sidebar-bg)' }}>
                        <tr>
                            <th style={{ color: '#fff', textAlign: 'center' }}>UCP Total</th>
                            <th style={{ color: '#fff', textAlign: 'center' }}>PHM Rule</th>
                            <th style={{ color: '#fff', textAlign: 'center' }}>Total Person-Hours</th>
                            <th style={{ color: '#fff', textAlign: 'center', background: 'var(--kt-primary)' }}>Man Month (MM)</th>
                            <th style={{ color: '#fff', textAlign: 'center' }}>Estimasi Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'center', fontSize: 18, fontWeight: 700 }}>{(calc.ucp || 0).toFixed(2)}</td>
                            <td style={{ textAlign: 'center', fontSize: 18, fontWeight: 700 }}>{project.phm}</td>
                            <td style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'var(--kt-warning)' }}>{(calc.totalPersonHours || 0).toFixed(0)} Jam</td>
                            <td style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: 'var(--kt-primary)', background: 'var(--kt-primary-light)' }}>
                                {(calc.totalManMonths || 0).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--kt-success)' }}>
                                ~ {Math.ceil(calc.totalManMonths || 0)} Bulan
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  );
};
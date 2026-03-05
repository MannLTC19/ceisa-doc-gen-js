import React from 'react';
import { 
    FileSpreadsheet, Plus, Trash2, Calculator, Settings, User, 
    TrendingUp, Clock, Briefcase, Lock
} from 'lucide-react';
import FileUploadWithOCR from './FileUploadWithOCR';

import { 
    formatIDR, getUseCaseComplexity, getActorComplexity, 
    BV_OPTIONS, EFFORT_OPTIONS 
} from '../constants.js';

export const TabPenelitian = ({ 
    project, setProject, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  // Logic: Handle updating Business Value and Effort Selectors
  const updateBVEffort = (type, category, index) => {
      const options = type === 'bv' ? BV_OPTIONS : EFFORT_OPTIONS;
      if (!options || !options[category]) return;
      const selectedOption = options[category][index];
      setProject((prev) => ({ 
          ...prev, 
          bvEffort: { ...prev.bvEffort, [category]: selectedOption } 
      }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">
        
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="kt-notice kt-notice-primary">
            <FileSpreadsheet />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Dokumen Penelitian</div>
              <div style={{ fontSize: 12.5 }}>Perhitungan UCP, Standar TCF/EF Bea Cukai, Estimasi Biaya (RAB), dan Prioritas Proyek</div>
            </div>
        </div>

        {/* ── 1. SPESIFIKASI AKTOR (UAW) ──────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <User />
                     1. Spesifikasi Aktor (UAW)
                 </h3>
                 <button 
                    onClick={() => handleAddArray('actors', {id: Date.now(), name: 'Aktor Baru', type: 'GUI', desc: ''})} 
                    className="kt-btn kt-btn-primary kt-btn-sm"
                 >
                    <Plus style={{ width: 14, height: 14 }}/> Add Actor
                 </button>
            </div>
            <div style={{ padding: '16px' }}>
              <FileUploadWithOCR
                label="📄 Unggah Dokumen Aktor/Pengguna"
                onFileExtracted={(text) => {
                  const cleanText = text.substring(0, 300);
                  handleAddArray('actors', {id: Date.now(), name: 'Dari Dokumen', type: 'GUI', desc: cleanText});
                }}
                qualityThreshold={45}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ width: '25%' }}>Nama Aktor</th>
                            <th>Deskripsi</th>
                            <th style={{ width: 150 }}>Jenis Aktor</th>
                            <th style={{ width: 80, textAlign: 'center' }}>UAW</th>
                            <th style={{ width: 50 }}></th></tr>
                    </thead>
                    <tbody>
                        {(project.actors || []).map((item, idx) => {
                             const complexity = getActorComplexity(item.type);
                             return (
                                <tr key={item.id}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <input 
                                            value={item.name} 
                                            onChange={e => handleUpdateArray('actors', item.id, 'name', e.target.value)} 
                                            className="kt-input" 
                                            placeholder="Nama Aktor..."
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            value={item.desc || ''} 
                                            onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} 
                                            className="kt-input" 
                                            placeholder="Deskripsi peran..."
                                        />
                                    </td>
                                    <td>
                                        <select 
                                            value={item.type} 
                                            onChange={e => handleUpdateArray('actors', item.id, 'type', e.target.value)} 
                                            className="kt-select"
                                        >
                                            <option value="API">API (Simple)</option>
                                            <option value="Protocol">Protocol (Average)</option>
                                            <option value="GUI">GUI (Complex)</option>
                                        </select>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{complexity.weight}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveArray('actors', item.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                            <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }}/>
                                        </button>
                                    </td>
                                             </tr>
                             );
                        })}
                        <tr style={{ background: 'var(--kt-border-light)' }}>
                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total Unadjusted Actor Weight (UAW)</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)', fontSize: 16 }}>{calc.uaw || 0}</td>
                            <td></td>
                                             </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 2. USE CASE (UUCW) ──────────────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <Calculator />
                     2. Use Case Deskripsi (UUCW)
                 </h3>
                 <button 
                    onClick={() => handleAddArray('useCases', {id: `uc_${Date.now()}`, subSystem: 'New Sub', name: 'Fitur Baru', transactions: 1})} 
                    className="kt-btn kt-btn-primary kt-btn-sm"
                 >
                    <Plus style={{ width: 14, height: 14 }}/> Add Use Case
                 </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="kt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>No</th>
                            <th style={{ width: '20%' }}>Sub System</th>
                            <th>Nama Use Case</th>
                            <th style={{ width: 80, textAlign: 'center' }}>Trans.</th>
                            <th style={{ width: 100, textAlign: 'center' }}>Complexity</th>
                            <th style={{ width: 80, textAlign: 'center' }}>UUCW</th>
                            <th style={{ width: 50 }}></th></tr>
                    </thead>
                    <tbody>
                        {(project.useCases || []).map((uc, idx) => {
                            const complexity = getUseCaseComplexity(uc.transactions);
                            
                            // Badge color logic based on complexity level
                            let badgeClass = "kt-badge-success";
                            if (complexity.level === 'Average') badgeClass = "kt-badge-warning";
                            if (complexity.level === 'Complex') badgeClass = "kt-badge-danger";

                            return (
                                <tr key={uc.id}>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <input 
                                            value={uc.subSystem} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'subSystem', e.target.value)}
                                            className="kt-input" 
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            value={uc.name} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'name', e.target.value)}
                                            className="kt-input" 
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input 
                                            type="number" min="1"
                                            value={uc.transactions} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'transactions', parseInt(e.target.value) || 1)}
                                            className="kt-input" 
                                            style={{ textAlign: 'center' }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`kt-badge ${badgeClass}`}>{complexity.level}</span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{complexity.weight}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleRemoveArray('useCases', uc.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                            <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }}/>
                                        </button>
                                    </td>
                                             </tr>
                            );
                        })}
                        <tr style={{ background: 'var(--kt-border-light)' }}>
                            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Total Unadjusted Use Case Weighting (UUCW)</td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--kt-primary)', fontSize: 16 }}>{calc.uucw || 0}</td>
                            <td></td>
                                             </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* ── 3. PARAMETER PENILAIAN (TCF & EF) ──────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <Settings />
                     3. Parameter Penilaian Terkunci (TCF & EF)
                 </h3>
                 <span className="kt-badge kt-badge-info"><Lock style={{ width: 12, height: 12 }}/> IKC Standard Applied</span>
            </div>
            <div className="kt-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                     <div className="kt-stat" style={{ background: 'var(--kt-warning-light)', borderColor: 'rgba(246,177,0,0.2)' }}>
                         <span className="kt-stat-label" style={{ color: '#8c6400' }}>Technical Complexity (TCF)</span>
                         <span className="kt-stat-value" style={{ color: '#7a5800' }}>{calc.tcf?.toFixed(2)}</span>
                     </div>
                     <div className="kt-stat" style={{ background: 'var(--kt-success-light)', borderColor: 'rgba(23,198,83,0.2)' }}>
                         <span className="kt-stat-label" style={{ color: '#028a3b' }}>Environmental Factor (EF)</span>
                         <span className="kt-stat-value" style={{ color: '#0a7533' }}>{calc.ef?.toFixed(2)}</span>
                     </div>
                     <div className="kt-stat" style={{ background: 'var(--kt-sidebar-bg)', borderColor: 'var(--kt-sidebar-bg)' }}>
                         <span className="kt-stat-label" style={{ color: 'var(--kt-primary)' }}>Final UCP Score</span>
                         <span className="kt-stat-value" style={{ color: '#ffffff', fontSize: 28 }}>{(calc.ucp || 0).toFixed(2)}</span>
                     </div>
                </div>
            </div>
        </div>

        {/* ── 4. PERHITUNGAN EFFORT (MAN-MONTH) ──────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <Clock />
                     4. Perhitungan Effort (Man-Month)
                 </h3>
                 <span className="kt-badge kt-badge-light">Decision Rule: {project.phm} Jam</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                 <table className="kt-table" style={{ textAlign: 'center' }}>
                     <thead>
                         <tr>
                             <th style={{ textAlign: 'left' }}>Sub Paket</th>
                             <th style={{ textAlign: 'center' }}>UAW</th>
                             <th style={{ textAlign: 'center' }}>UUCW</th>
                             <th style={{ textAlign: 'center' }}>UUCP</th>
                             <th style={{ textAlign: 'center' }}>UCP</th>
                             <th style={{ textAlign: 'center' }}>PHM</th>
                             <th style={{ textAlign: 'center' }}>WD</th>
                             <th style={{ textAlign: 'center', color: 'var(--kt-primary)' }}>MM</th></tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td style={{ textAlign: 'left', fontWeight: 700 }}>{project.nama}</td>
                             <td>{calc.uaw}</td>
                             <td>{calc.uucw}</td>
                             <td style={{ fontWeight: 600 }}>{calc.uucp}</td>
                             <td style={{ fontWeight: 600 }}>{(calc.ucp || 0).toFixed(0)}</td>
                             <td>{(calc.totalPersonHours || 0).toFixed(0)}</td>
                             <td>{(calc.workingDays || 0).toFixed(0)}</td>
                             <td style={{ fontWeight: 800, color: 'var(--kt-primary)', fontSize: 15 }}>{(calc.totalManMonths || 0).toFixed(0)}</td>
                                             </tr>
                     </tbody>
                 </table>
            </div>
        </div>

        {/* ── 5. COST ESTIMATION (RAB) ───────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <Briefcase />
                     5. Cost Estimation (KAK Akhir Tahun)
                 </h3>
                 <span className="kt-badge kt-badge-warning"><Lock style={{ width: 12, height: 12 }}/> Terkunci</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
                 <table className="kt-table">
                     <thead>
                         <tr>
                             <th>Phase</th>
                             <th style={{ textAlign: 'center' }}>% Effort</th>
                             <th style={{ textAlign: 'center' }}>Effort (MM)</th>
                             <th>Role / PIC</th>
                             <th style={{ textAlign: 'right' }}>Gaji Per Bulan (Inkindo)</th>
                             <th style={{ textAlign: 'right' }}>Cost Estimation</th></tr>
                     </thead>
                     <tbody>
                         {['Software Phase Development', 'Ongoing life-cycle activity', 'Quality and testing phases'].map(group => {
                             const groupItems = (calc.kakTableData || []).filter((i) => i.group === group);
                             return (
                                 <React.Fragment key={group}>
                                     <tr>
                                         <td colSpan={6} className="kt-divider-title" style={{ padding: '12px 14px', background: 'var(--kt-border-light)' }}>
                                             {group}
                                         </td>
                                             </tr>
                                     {groupItems.map((item) => (
                                         <tr key={item.id}>
                                             <td style={{ color: 'var(--kt-text-gray)' }}>{item.name}</td>
                                             <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.percent}%</td>
                                             <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--kt-text-gray)' }}>{(item.effortMM || 0).toFixed(3)}</td>
                                             <td style={{ fontWeight: 500 }}>{item.roleName}</td>
                                             <td style={{ textAlign: 'right', color: 'var(--kt-text-gray)', fontFamily: 'monospace' }}>
                                                 {formatIDR(item.rate || 0)}
                                             </td>
                                             <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--kt-text-dark)', fontFamily: 'monospace' }}>
                                                 {formatIDR(item.cost || 0)}
                                             </td>
                                             </tr>
                                     ))}
                                 </React.Fragment>
                             );
                         })}

                         {/* TOTALS */}
                         <tr style={{ background: 'var(--kt-border-light)' }}>
                             <td colSpan={2} style={{ fontWeight: 700 }}>Total of Effort</td>
                             <td style={{ textAlign: 'center', fontWeight: 800 }}>{(calc.totalManMonths || 0).toFixed(2)}</td>
                             <td colSpan={2}></td>
                             <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>{formatIDR(calc.runningTotalCost || 0)}</td>
                                             </tr>
                         <tr>
                             <td colSpan={5} style={{ fontWeight: 600, color: 'var(--kt-text-gray)' }}>Estimasi Garansi 25%</td>
                             <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{formatIDR(calc.warrantyCost || 0)}</td>
                                             </tr>
                         <tr>
                             <td colSpan={5} style={{ fontWeight: 700 }}>Sub Total</td>
                             <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{formatIDR(calc.subTotal || 0)}</td>
                                             </tr>
                         <tr>
                             <td colSpan={5} style={{ fontWeight: 600, color: 'var(--kt-text-gray)' }}>PPN 11%</td>
                             <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{formatIDR(calc.ppn || 0)}</td>
                                             </tr>
                         <tr style={{ background: 'var(--kt-success-light)' }}>
                             <td colSpan={5} style={{ fontWeight: 800, color: '#0a7533', textTransform: 'uppercase' }}>Total Anggaran</td>
                             <td style={{ textAlign: 'right', fontWeight: 800, color: '#0a7533', fontSize: 16, fontFamily: 'monospace' }}>
                                 {formatIDR(calc.grandTotal || 0)}
                             </td>
                                             </tr>
                     </tbody>
                 </table>
            </div>
        </div>

        {/* ── 6. BUSINESS VALUE VS EFFORT ────────────────────────────────── */}
        <div className="kt-card">
            <div className="kt-card-header">
                 <h3 className="kt-card-title">
                     <TrendingUp />
                     6. Perhitungan Business Value vs Effort
                 </h3>
            </div>
            <div className="kt-card-body">
                <div className="kt-form-grid kt-form-grid-2">
                    {/* Business Value Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--kt-border)', paddingBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>Business Value</span>
                            <span style={{ fontWeight: 800, color: 'var(--kt-primary)' }}>{(calc.totalBV || 0).toFixed(2)}</span>
                        </div>
                        {Object.keys(BV_OPTIONS || {}).map((key) => (
                            <div key={key} className="kt-form-row">
                                 <label className="kt-label" style={{ fontSize: 11, textTransform: 'uppercase' }}>{key}</label>
                                 <select 
                                    className="kt-select"
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

                    {/* Effort Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--kt-border)', paddingBottom: 8 }}>
                            <span style={{ fontWeight: 700 }}>Effort</span>
                            <span style={{ fontWeight: 800, color: 'var(--kt-danger)' }}>{(calc.totalEffort || 0).toFixed(2)}</span>
                        </div>
                         {Object.keys(EFFORT_OPTIONS || {}).map((key) => (
                            <div key={key} className="kt-form-row">
                                 <label className="kt-label" style={{ fontSize: 11, textTransform: 'uppercase' }}>{key}</label>
                                 <select 
                                    className="kt-select"
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
                </div>

                {/* Priority Result Banner */}
                <div style={{ 
                    marginTop: 24, padding: '16px 20px', 
                    background: 'var(--kt-border-light)', borderRadius: 8, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                    <div>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--kt-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                            Rekomendasi Prioritas
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--kt-text-dark)' }}>
                            {calc.priority || "P3 (Low)"}
                        </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--kt-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                            Total Score (BV / Effort)
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--kt-primary)' }}>{calc.totalBV || 0}</span> 
                        <span style={{ color: 'var(--kt-text-muted)', margin: '0 6px' }}>/</span> 
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--kt-danger)' }}>{calc.totalEffort || 0}</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};
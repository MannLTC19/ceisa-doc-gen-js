import React from 'react';
import {
  Target, FileText, AlertOctagon, TrendingUp,
  CheckSquare, Plus, Trash2, Network, CheckCircle2,
} from 'lucide-react';
import FileUploadWithOCR from './FileUploadWithOCR';
import SectionWithAIFill from './SectionWithAIFill';
import AIFillButton from './AIFillButton';
import { SECTION_DEFINITIONS, TokenBudgetTracker } from '../utils/sectionAIFiller.js';

export const TabKajian = ({
  project, setProject, uploadedFile, aiMeta,
  handleUpdateArray, handleAddArray, handleRemoveArray,
  tokenBudget, loadingSections, filledSections, handleFillSectionWithAI,
}) => {

  const biaConfig = {
    Critical: { bg: 'var(--kt-danger-light)',  text: 'var(--kt-danger)',   border: 'rgba(248,40,90,0.2)' },
    High:     { bg: '#fff4e5',                 text: '#7a3800',            border: 'rgba(246,140,0,0.25)' },
    Medium:   { bg: 'var(--kt-warning-light)', text: '#7a5800',            border: 'rgba(246,177,0,0.25)' },
    Low:      { bg: 'var(--kt-primary-light)', text: 'var(--kt-primary)',  border: 'rgba(27,132,255,0.2)' },
  };

  const priorityStyle = (p) => ({
    fontWeight: 700,
    background:  p === 'Mandatory' || p === 'High' ? 'var(--kt-danger-light)'  : p === 'Medium' ? 'var(--kt-warning-light)' : 'var(--kt-success-light)',
    color:       p === 'Mandatory' || p === 'High' ? 'var(--kt-danger)'        : p === 'Medium' ? '#7a5800'                 : '#028a3b',
    borderColor: p === 'Mandatory' || p === 'High' ? 'rgba(248,40,90,0.2)'    : p === 'Medium' ? 'rgba(246,177,0,0.2)'     : 'rgba(23,198,83,0.2)',
  });

  const riskStyle = (l) => ({
    fontWeight: 700,
    background:  l === 'Tinggi' ? 'var(--kt-danger-light)'  : l === 'Sedang' ? 'var(--kt-warning-light)' : 'var(--kt-success-light)',
    color:       l === 'Tinggi' ? 'var(--kt-danger)'        : l === 'Sedang' ? '#7a5800'                 : '#028a3b',
    borderColor: l === 'Tinggi' ? 'rgba(248,40,90,0.2)'    : l === 'Sedang' ? 'rgba(246,177,0,0.2)'     : 'rgba(23,198,83,0.2)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">

      {/* ── AI STATUS BANNER ─────────────────────────────────────────────── */}
      {uploadedFile && aiMeta?.usedModel && (
        <div style={{
          background: 'var(--kt-sidebar-bg)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(23,198,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--kt-success)' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Analisis AI Selesai</div>
              <div style={{ fontSize: 11.5, color: 'rgba(157,157,181,0.8)', marginTop: 2 }}>
                Engine:{' '}
                <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, color: '#fff' }}>
                  {aiMeta.usedModel}
                </span>
                {aiMeta.triageModel && (
                  <span style={{ marginLeft: 6, fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4, color: 'rgba(255,255,255,0.6)' }}>
                    + {aiMeta.triageModel} (triage)
                  </span>
                )}
                {aiMeta.selectedPages && (
                  <span style={{ marginLeft: 8, color: 'rgba(157,157,181,0.7)' }}>
                    · {aiMeta.selectedPages.length}/{aiMeta.totalPages} halaman
                  </span>
                )}
                {aiMeta.usage && (
                  <span style={{ marginLeft: 8, color: 'rgba(157,157,181,0.7)' }}>
                    · {(aiMeta.usage.input_tokens || 0).toLocaleString()} in / {(aiMeta.usage.output_tokens || 0).toLocaleString()} out tokens
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {aiMeta.log?.map((entry, idx) => (
              <span key={idx} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: entry.status === 'Success' ? 'rgba(23,198,83,0.15)' : 'rgba(248,40,90,0.15)',
                border: `1px solid ${entry.status === 'Success' ? 'rgba(23,198,83,0.3)' : 'rgba(248,40,90,0.3)'}`,
                color: entry.status === 'Success' ? '#17c653' : '#f8285a',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                {entry.model}: {entry.status === 'Success' ? 'OK' : entry.error}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. INFORMASI UMUM ────────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Target /> 1. Informasi Umum Proyek</h3>
        </div>
        <div className="kt-card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="kt-form-row">
              <label className="kt-label">Nama Proyek / Modul</label>
              <input
                className="kt-input"
                style={{ fontWeight: 800, fontSize: 15, color: 'var(--kt-primary)' }}
                value={project.nama || ''}
                onChange={e => setProject(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Nama proyek…"
              />
            </div>
            <div className="kt-form-grid kt-form-grid-2">
              <div className="kt-form-row">
                <label className="kt-label">Unit Pengampu Bisnis Proses (Es. II)</label>
                <input className="kt-input" value={project.pengampu || ''}
                  onChange={e => setProject(prev => ({ ...prev, pengampu: e.target.value }))} />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Unit Penanggung Jawab TIK (Es. III/IV)</label>
                <input className="kt-input" value={project.unitPenanggungJawab || ''}
                  onChange={e => setProject(prev => ({ ...prev, unitPenanggungJawab: e.target.value }))} />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Nama PIC</label>
                <input className="kt-input" value={project.namaPIC || ''}
                  onChange={e => setProject(prev => ({ ...prev, namaPIC: e.target.value }))}
                  placeholder="Nama lengkap PIC…" />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Kontak PIC</label>
                <input className="kt-input" value={project.kontakPIC || ''}
                  onChange={e => setProject(prev => ({ ...prev, kontakPIC: e.target.value }))}
                  placeholder="Email / telepon…" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2 & 3. LATAR BELAKANG + TARGET ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

        <div className="kt-card">
          <div className="kt-card-header">
            <h3 className="kt-card-title"><FileText /> 2. Latar Belakang & Masalah</h3>
          </div>
          <div className="kt-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FileUploadWithOCR
                label="📄 Atau Unggah Dokumen untuk Extract Text"
                onFileExtracted={(text) => {
                  setProject(prev => ({
                    ...prev,
                    latarBelakang: prev.latarBelakang ? prev.latarBelakang + '\n\n' + text.substring(0, 1000) : text.substring(0, 1000)
                  }));
                }}
                qualityThreshold={45}
              />
              <div className="kt-form-row">
                <label className="kt-label">Latar Belakang / Urgensi</label>
                <textarea className="kt-textarea" rows={4}
                  value={project.latarBelakang || ''}
                  onChange={e => setProject(prev => ({ ...prev, latarBelakang: e.target.value }))}
                  placeholder="Uraikan latar belakang dan urgensi proyek…" />
              </div>
              <div className="kt-form-row">
                <label className="kt-label" style={{ color: 'var(--kt-danger)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertOctagon style={{ width: 14, height: 14 }} /> Masalah atau Isu (Pain Points)
                </label>
                <textarea className="kt-textarea" rows={4}
                  style={{ borderColor: 'rgba(248,40,90,0.2)', background: 'var(--kt-danger-light)' }}
                  value={project.masalahIsu || ''}
                  onChange={e => setProject(prev => ({ ...prev, masalahIsu: e.target.value }))}
                  placeholder="Jelaskan masalah atau isu yang ada…" />
              </div>
            </div>
          </div>
        </div>

        <div className="kt-card">
          <div className="kt-card-header">
            <h3 className="kt-card-title"><TrendingUp /> 3. Target dan Outcome</h3>
          </div>
          <div className="kt-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="kt-form-row">
                <label className="kt-label">Target Penyelesaian</label>
                <input className="kt-input" type="text"
                  value={project.targetPenyelesaian || ''}
                  onChange={e => setProject(prev => ({ ...prev, targetPenyelesaian: e.target.value }))}
                  placeholder="Q3 2025 / Des 2025…" />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Target Outcome</label>
                <textarea className="kt-textarea" rows={3}
                  value={project.targetOutcome || ''}
                  onChange={e => setProject(prev => ({ ...prev, targetOutcome: e.target.value }))}
                  placeholder="Outcome yang ingin dicapai…" />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Outcome / Keluaran Proyek</label>
                <textarea className="kt-textarea" rows={3}
                  value={project.outcomeKeluaran || ''}
                  onChange={e => setProject(prev => ({ ...prev, outcomeKeluaran: e.target.value }))}
                  placeholder="Deliverable proyek…" />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Business Value</label>
                <textarea className="kt-textarea" rows={3}
                  value={project.businessValue || ''}
                  onChange={e => setProject(prev => ({ ...prev, businessValue: e.target.value }))}
                  placeholder="Nilai bisnis / efisiensi yang dicapai…" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. KEBUTUHAN FUNGSIONAL ──────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><CheckSquare /> 4. Kebutuhan Fungsional (High-Level)</h3>
          <button
            onClick={() => handleAddArray('kebutuhanFungsional', {
              id: `kf_${Date.now()}`,
              kebutuhan: '',
              prioritas: 'Medium',
            })}
            className="kt-btn kt-btn-primary kt-btn-sm"
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="kt-table">
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>No</th>
                <th>Kebutuhan Fungsional</th>
                <th style={{ width: 160 }}>Prioritas</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {(project.kebutuhanFungsional || []).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)' }}>
                    Belum ada kebutuhan fungsional. Klik "+ Tambah" atau upload TOR untuk mengisi otomatis.
                  </td>
                </tr>
              ) : (
                (project.kebutuhanFungsional || []).map((item, idx) => (
                  <tr key={item?.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <input
                        value={item?.kebutuhan || ''}
                        onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'kebutuhan', e.target.value)}
                        className="kt-input"
                        placeholder="Deskripsi kebutuhan fungsional…"
                      />
                    </td>
                    <td>
                      <select
                        value={item?.prioritas || 'Medium'}
                        onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'prioritas', e.target.value)}
                        className="kt-select"
                        style={priorityStyle(item?.prioritas)}
                      >
                        <option value="Mandatory">Mandatory</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveArray('kebutuhanFungsional', item.id)}
                        className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}
                      >
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

      {/* ── 5. KEBUTUHAN NON-FUNGSIONAL ──────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><CheckSquare /> 5. Kebutuhan Non-Fungsional</h3>
          <button
            onClick={() => handleAddArray('kebutuhanNonFungsional', {
              id: `nfr_${Date.now()}`,
              kategori: 'Security',
              deskripsi: '',
            })}
            className="kt-btn kt-btn-primary kt-btn-sm"
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="kt-table">
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>No</th>
                <th style={{ width: 180 }}>Kategori</th>
                <th>Deskripsi Kebutuhan</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {(project.kebutuhanNonFungsional || []).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)' }}>
                    Belum ada kebutuhan non-fungsional. Klik "+ Tambah" atau upload TOR untuk mengisi otomatis.
                  </td>
                </tr>
              ) : (
                (project.kebutuhanNonFungsional || []).map((item, idx) => (
                  <tr key={item?.id || idx}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <select
                        value={item?.kategori || 'Security'}
                        onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'kategori', e.target.value)}
                        className="kt-select"
                        style={{ fontWeight: 700 }}
                      >
                        <option>Security</option>
                        <option>Performance</option>
                        <option>Availability</option>
                        <option>Scalability</option>
                        <option>Compliance</option>
                        <option>Usability</option>
                        <option>Maintainability</option>
                      </select>
                    </td>
                    <td>
                      <input
                        value={item?.deskripsi || ''}
                        onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'deskripsi', e.target.value)}
                        className="kt-input"
                        placeholder="Deskripsi kebutuhan non-fungsional…"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveArray('kebutuhanNonFungsional', item.id)}
                        className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}
                      >
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

      {/* ── 6. ALUR BISNIS & BIA ─────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Network /> 6. Alur Bisnis & Analisis Dampak (BIA)</h3>
        </div>
        <div className="kt-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

            {/* Left: Alur Bisnis + Risiko */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="kt-form-row">
                <label className="kt-label">Deskripsi Alur Bisnis Proses</label>
                <textarea className="kt-textarea" rows={4}
                  value={project.alurBisnisProses || ''}
                  onChange={e => setProject(prev => ({ ...prev, alurBisnisProses: e.target.value }))}
                  placeholder="Jelaskan alur bisnis proses secara garis besar…" />
              </div>

              {/* Risiko Bisnis */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="kt-label" style={{ marginBottom: 0 }}>Risiko Bisnis</label>
                  <button
                    onClick={() => handleAddArray('risikoBisnis', { id: `r_${Date.now()}`, risk: '', impact: '', mitigasi: '', level: 'Sedang' })}
                    className="kt-btn kt-btn-light kt-btn-sm"
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Tambah Risiko
                  </button>
                </div>
                <div style={{ border: '1px solid var(--kt-border)', borderRadius: 8, overflow: 'hidden' }}>
                  <table className="kt-table">
                    <thead>
                      <tr>
                        <th>Risiko</th>
                        <th>Dampak</th>
                        <th>Mitigasi</th>
                        <th style={{ width: 100 }}>Level</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.risikoBisnis || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--kt-text-muted)' }}>
                            Belum ada risiko bisnis yang didefinisikan.
                          </td>
                        </tr>
                      ) : (
                        project.risikoBisnis.map((risk, idx) => (
                          <tr key={risk?.id || idx}>
                            <td>
                              <input value={risk?.risk || ''}
                                onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'risk', e.target.value)}
                                className="kt-input" style={{ padding: '6px 10px' }} placeholder="Risiko…" />
                            </td>
                            <td>
                              <input value={risk?.impact || ''}
                                onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'impact', e.target.value)}
                                className="kt-input" style={{ padding: '6px 10px', color: 'var(--kt-danger)' }} placeholder="Dampak…" />
                            </td>
                            <td>
                              <input value={risk?.mitigasi || ''}
                                onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'mitigasi', e.target.value)}
                                className="kt-input" style={{ padding: '6px 10px', color: '#028a3b' }} placeholder="Mitigasi…" />
                            </td>
                            <td>
                              <select value={risk?.level || 'Sedang'}
                                onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'level', e.target.value)}
                                className="kt-select"
                                style={{ padding: '6px 8px', ...riskStyle(risk?.level) }}
                              >
                                <option>Tinggi</option>
                                <option>Sedang</option>
                                <option>Rendah</option>
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => handleRemoveArray('risikoBisnis', risk.id)}
                                className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                                <Trash2 style={{ width: 14, height: 14, color: 'var(--kt-danger)' }} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: BIA Panel */}
            <div style={{ background: 'var(--kt-border-light)', border: '1px solid var(--kt-border)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--kt-text-muted)', marginBottom: 16 }}>
                Analisis Dampak Bisnis TIK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['operasional', 'finansial', 'reputasi', 'hukum'].map(key => {
                  const val = project.bia?.[key] || 'Low';
                  const cfg = biaConfig[val] || biaConfig['Low'];
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--kt-text-gray)', textTransform: 'capitalize' }}>{key}</span>
                      <select
                        value={val}
                        onChange={e => setProject(prev => ({ ...prev, bia: { ...prev.bia, [key]: e.target.value } }))}
                        style={{
                          fontSize: 12, fontWeight: 700, padding: '6px 12px',
                          borderRadius: 20, border: `1px solid ${cfg.border}`,
                          background: cfg.bg, color: cfg.text,
                          cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                          width: 110, textAlign: 'center',
                        }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  );
                })}
                <div style={{ borderTop: '1px solid var(--kt-border)', paddingTop: 16, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['RTO (Jam)', 'rto', '4h'], ['RPO (Jam)', 'rpo', '24h']].map(([lbl, field, ph]) => (
                    <div key={field} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--kt-text-gray)' }}>{lbl}</span>
                      <input
                        value={project.bia?.[field] || ''}
                        onChange={e => setProject(prev => ({ ...prev, bia: { ...prev.bia, [field]: e.target.value } }))}
                        placeholder={ph}
                        className="kt-input"
                        style={{ width: 110, textAlign: 'center', fontWeight: 700 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
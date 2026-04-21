import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  Target, FileText, AlertOctagon, TrendingUp,
  CheckSquare, Plus, Trash2, Network, CheckCircle2,
  Link as LinkIcon, Key, Workflow, Maximize, X, 
  ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react';

// ─── MERMAID INIT ────────────────────────────────────────────────────────
mermaid.initialize({ 
    startOnLoad: false,
    theme: 'default', 
    securityLevel: 'loose',
    suppressErrorRendering: true,
    flowchart: { useMaxWidth: false, htmlLabels: true } 
});

export const TabKajian = ({
  project, setProject, uploadedFile, aiMeta,
  handleUpdateArray, handleAddArray, handleRemoveArray,
}) => {

  const [fullScreenDiagram, setFullScreenDiagram] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const mermaidRefs = {
      processFlow: useRef(null)
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
                  if (ref.current) ref.current.innerHTML = `<div style="color:var(--kt-danger); font-size:12px;">Error: ${err.message}</div>`;
              }
          }
      };
      renderDiagram(mermaidRefs.processFlow, `kajian_bpmn_${Date.now()}`, project.mermaid?.processFlow);
  }, [project.mermaid?.processFlow]);

  // Handle Fullscreen Mermaid Render safely (Async)
  useEffect(() => {
      if (fullScreenDiagram && fullScreenRef.current) {
          fullScreenRef.current.removeAttribute('data-processed');
          mermaid.render(`kajian_full_${Date.now()}`, fullScreenDiagram)
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
    borderColor: p === 'Mandatory' || p === 'High' ? 'rgba(248,40,90,0.2)'     : p === 'Medium' ? 'rgba(246,177,0,0.2)'     : 'rgba(23,198,83,0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
    borderStyle: 'solid',
    borderWidth: '1px',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
    appearance: 'none'
  });

  const riskStyle = (l) => ({
    fontWeight: 700,
    background:  l === 'Tinggi' ? 'var(--kt-danger-light)'  : l === 'Sedang' ? 'var(--kt-warning-light)' : 'var(--kt-success-light)',
    color:       l === 'Tinggi' ? 'var(--kt-danger)'        : l === 'Sedang' ? '#7a5800'                 : '#028a3b',
    borderColor: l === 'Tinggi' ? 'rgba(248,40,90,0.2)'     : l === 'Sedang' ? 'rgba(246,177,0,0.2)'     : 'rgba(23,198,83,0.2)',
  });

  const cleanTableHeaderStyle = {
    background: '#f4f5f8', 
    color: '#a1a5b7', 
    fontSize: 11, 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em', 
    fontWeight: 700,
    padding: '12px 16px',
    borderBottom: '1px solid #e4e6ef'
  };

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
            <h3 className="kt-card-title"><FileText /> 2. Latar Belakang, Tujuan & Masalah</h3>
          </div>
          <div className="kt-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="kt-form-row">
                <label className="kt-label">Latar Belakang / Urgensi</label>
                <textarea className="kt-textarea" rows={3}
                  value={project.latarBelakang || ''}
                  onChange={e => setProject(prev => ({ ...prev, latarBelakang: e.target.value }))}
                  placeholder="Uraikan latar belakang dan urgensi proyek…" />
              </div>

              <div className="kt-form-row">
                <label className="kt-label" style={{ color: 'var(--kt-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  Tujuan Proyek
                </label>
                <textarea className="kt-textarea" rows={2}
                  style={{ borderColor: 'rgba(27,132,255,0.2)', background: 'var(--kt-primary-light)' }}
                  value={project.tujuan || ''}
                  onChange={e => setProject(prev => ({ ...prev, tujuan: e.target.value }))}
                  placeholder="Tujuan spesifik dari proyek ini (Misal: Tersedianya aplikasi office automation)..." />
              </div>
              
              <div className="kt-form-row">
                <label className="kt-label">Gambaran Kondisi Saat Ini</label>
                <textarea className="kt-textarea" rows={3}
                  value={project.gambaranKondisiSaatIni || ''}
                  onChange={e => setProject(prev => ({ ...prev, gambaranKondisiSaatIni: e.target.value }))}
                  placeholder="Jelaskan kondisi existing sebelum proyek ini ada…" />
              </div>

              <div className="kt-form-row">
                <label className="kt-label" style={{ color: 'var(--kt-danger)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertOctagon style={{ width: 14, height: 14 }} /> Masalah atau Isu (Pain Points)
                </label>
                <textarea className="kt-textarea" rows={3}
                  style={{ borderColor: 'rgba(248,40,90,0.2)', background: 'var(--kt-danger-light)' }}
                  value={project.masalahIsu || ''}
                  onChange={e => setProject(prev => ({ ...prev, masalahIsu: e.target.value }))}
                  placeholder="Jelaskan masalah atau isu yang ada (Misal: Adanya duplikasi aplikasi)…" />
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
                <label className="kt-label">Target Penyelesaian Yang Diharapkan</label>
                <input className="kt-input" type="text"
                  value={project.targetPenyelesaian || ''}
                  onChange={e => setProject(prev => ({ ...prev, targetPenyelesaian: e.target.value }))}
                  placeholder="Contoh: Implementasi aturan, Penyelesaian sistem, UAT, Piloting, Mandatori..." />
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
                <label className="kt-label">Business Value / Cost Benefit</label>
                <textarea className="kt-textarea" rows={4}
                  value={project.businessValue || ''}
                  onChange={e => setProject(prev => ({ ...prev, businessValue: e.target.value }))}
                  placeholder="Nilai bisnis / efisiensi / kapabilitas baru yang dicapai…" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. KEBUTUHAN FUNGSIONAL ────────────────────────── */}
      <div className="kt-card" style={{ overflow: 'hidden' }}>
        <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
          <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-primary)' }} /> 4. Kebutuhan Fungsional (High-Level)</h3>
          <button
            onClick={() => handleAddArray('kebutuhanFungsional', {
              id: `kf_${Date.now()}`,
              kebutuhan: '',
              detailFungsi: '',
              prioritas: 'Medium',
            })}
            className="kt-btn kt-btn-primary kt-btn-sm"
            style={{ borderRadius: 8 }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah
          </button>
        </div>
        <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                <th style={cleanTableHeaderStyle}>Kebutuhan Fungsional</th>
                <th style={cleanTableHeaderStyle}>Detail/Keterangan Fungsi</th>
                <th style={{ ...cleanTableHeaderStyle, width: 140, textAlign: 'center' }}>Prioritas</th>
                <th style={{ ...cleanTableHeaderStyle, width: 60 }}></th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {(project.kebutuhanFungsional || []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>
                    Belum ada kebutuhan fungsional. Klik "+ Tambah" atau upload TOR untuk mengisi otomatis.
                  </td>
                </tr>
              ) : (
                (project.kebutuhanFungsional || []).map((item, idx) => (
                  <tr key={item?.id || idx} style={{ borderBottom: '1px solid #f4f5f8' }}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <textarea
                        value={item?.kebutuhan || ''}
                        onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'kebutuhan', e.target.value)}
                        style={{ width: '100%', minHeight: 44, padding: '10px 14px', border: '1px solid #e4e6ef', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--kt-text-dark)', fontWeight: 500 }}
                        placeholder="Contoh: Merekam Nota Dinas..."
                        onFocus={(e) => e.target.style.borderColor = 'var(--kt-primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e4e6ef'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <textarea
                        value={item?.detailFungsi || ''}
                        onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'detailFungsi', e.target.value)}
                        style={{ width: '100%', minHeight: 44, padding: '10px 14px', border: '1px solid #e4e6ef', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--kt-text-gray)' }}
                        placeholder="Detail fungsi (1. Merekam nomor & tanggal...)"
                        onFocus={(e) => e.target.style.borderColor = 'var(--kt-primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e4e6ef'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <select
                        value={item?.prioritas || 'Medium'}
                        onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'prioritas', e.target.value)}
                        style={priorityStyle(item?.prioritas)}
                      >
                        <option value="Mandatory">Mandatory</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
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

      {/* ── 5. KEBUTUHAN NON-FUNGSIONAL ────────────────────── */}
      <div className="kt-card" style={{ overflow: 'hidden' }}>
        <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
          <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-primary)' }} /> 5. Kebutuhan Non-Fungsional</h3>
          <button
            onClick={() => handleAddArray('kebutuhanNonFungsional', {
              id: `nfr_${Date.now()}`,
              kategori: 'Security',
              deskripsi: '',
              alasan: '',
            })}
            className="kt-btn kt-btn-primary kt-btn-sm"
            style={{ borderRadius: 8 }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Tambah
          </button>
        </div>
        <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                <th style={{ ...cleanTableHeaderStyle, width: 160 }}>Kategori</th>
                <th style={cleanTableHeaderStyle}>Deskripsi Kebutuhan</th>
                <th style={cleanTableHeaderStyle}>Alasan</th>
                <th style={{ ...cleanTableHeaderStyle, width: 60 }}></th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {(project.kebutuhanNonFungsional || []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#a1a5b7', fontSize: 13 }}>
                    Belum ada kebutuhan non-fungsional. Klik "+ Tambah" atau upload TOR untuk mengisi otomatis.
                  </td>
                </tr>
              ) : (
                (project.kebutuhanNonFungsional || []).map((item, idx) => (
                  <tr key={item?.id || idx} style={{ borderBottom: '1px solid #f4f5f8' }}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '16px' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <select
                        value={item?.kategori || 'Security'}
                        onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'kategori', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e4e6ef', fontSize: 13, fontWeight: 600, color: 'var(--kt-text-dark)', outline: 'none' }}
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
                    <td style={{ padding: '12px 16px' }}>
                      <textarea
                        value={item?.deskripsi || ''}
                        onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'deskripsi', e.target.value)}
                        style={{ width: '100%', minHeight: 44, padding: '10px 14px', border: '1px solid #e4e6ef', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--kt-text-dark)' }}
                        placeholder="Deskripsi kebutuhan (Cth: Kapasitas penyimpanan besar)…"
                        onFocus={(e) => e.target.style.borderColor = 'var(--kt-primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e4e6ef'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <textarea
                        value={item?.alasan || ''}
                        onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'alasan', e.target.value)}
                        style={{ width: '100%', minHeight: 44, padding: '10px 14px', border: '1px solid #e4e6ef', borderRadius: 6, fontSize: 13, outline: 'none', resize: 'vertical', color: 'var(--kt-text-gray)' }}
                        placeholder="Alasan (Cth: Menampung lampiran dokumen)…"
                        onFocus={(e) => e.target.style.borderColor = 'var(--kt-primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e4e6ef'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
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

      {/* ── 6. ALUR BISNIS, DIAGRAM & BIA ───────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Network /> 6. Alur Bisnis & Analisis Risiko Bisnis</h3>
        </div>
        <div className="kt-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* A. Deskripsi & Link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="kt-form-row">
              <label className="kt-label">Deskripsi Alur Bisnis Proses</label>
              <textarea className="kt-textarea" rows={3}
                value={project.alurBisnisProses || ''}
                onChange={e => setProject(prev => ({ ...prev, alurBisnisProses: e.target.value }))}
                placeholder="Jelaskan alur bisnis proses secara garis besar…" />
            </div>

            <div className="kt-form-grid kt-form-grid-2">
              <div className="kt-form-row">
                <label className="kt-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LinkIcon style={{ width: 14, height: 14 }} /> Tautan Mock Up / Figma
                </label>
                <input className="kt-input"
                  value={project.tautanMockup || ''}
                  onChange={e => setProject(prev => ({ ...prev, tautanMockup: e.target.value }))}
                  placeholder="https://figma.com/..." />
              </div>
              <div className="kt-form-row">
                <label className="kt-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Key style={{ width: 14, height: 14 }} /> Integrasi SSO
                </label>
                <input className="kt-input"
                  value={project.integrasiSSO || ''}
                  onChange={e => setProject(prev => ({ ...prev, integrasiSSO: e.target.value }))}
                  placeholder="Contoh: CEISA 4.0 SSO" />
              </div>
            </div>
          </div>

          {/* B. Diagram Editor (Mermaid JS) */}
          <div style={{ background: '#fafafa', border: '1px solid #e4e6ef', borderRadius: 8, padding: 20 }}>
            <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--kt-text-dark)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Workflow style={{ width: 18, height: 18, color: 'var(--kt-primary)' }}/> Editor Diagram Alur Bisnis
                </h4>
                <p style={{ fontSize: 12, color: 'var(--kt-text-muted)', margin: 0 }}>
                    Diagram yang Anda buat di sini akan otomatis terhubung dan dapat diedit juga di dalam tab FSD.
                </p>
            </div>
             
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                    { title: 'Business Process Flow', key: 'processFlow', ref: mermaidRefs.processFlow, code: project.mermaid?.processFlow }
                ].map((diag) => (
                    <div key={diag.key}>
                        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: 20 }}>
                            {/* Source Code */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                                <label className="kt-label" style={{ fontSize: 11 }}>Source Code (Mermaid JS)</label>
                                <textarea 
                                    className="kt-textarea" 
                                    style={{ fontFamily: 'monospace', fontSize: 11.5, height: 240, background: '#1e1e1e', color: '#d4d4d4', width: '100%', resize: 'vertical' }}
                                    value={diag.code || ''}
                                    onChange={(e) => setProject(prev => ({ ...prev, mermaid: { ...prev.mermaid, [diag.key]: e.target.value } }))}
                                />
                            </div>
                            {/* Preview */}
                            <div style={{ border: '1px solid #e4e6ef', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kt-text-gray)', textTransform: 'uppercase' }}>Preview</span>
                                    {diag.code && (
                                        <button 
                                            onClick={() => setFullScreenDiagram(diag.code)} 
                                            className="kt-btn kt-btn-icon kt-btn-sm" 
                                            style={{ background: 'var(--kt-primary-light)', padding: '6px' }}
                                            title="Lihat Fullscreen"
                                        >
                                            <Maximize style={{ width: 14, height: 14, color: 'var(--kt-primary)' }} />
                                        </button>
                                    )}
                                </div>
                                <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#f8f9fa', borderRadius: 6, padding: 16 }}>
                                    {diag.code ? (
                                        <div ref={diag.ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                                    ) : (
                                        <span style={{ color: 'var(--kt-text-muted)', fontSize: 13, margin: 'auto' }}>Diagram belum tersedia.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* C. Risiko Bisnis & BIA Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start', borderTop: '1px solid #e4e6ef', paddingTop: 24 }}>
            
            {/* Risiko Bisnis */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="kt-label" style={{ marginBottom: 0 }}>Analisis Risiko Bisnis</label>
                <button
                  onClick={() => handleAddArray('risikoBisnis', { id: `r_${Date.now()}`, risk: '', impact: '', mitigasi: '', level: 'Sedang' })}
                  className="kt-btn kt-btn-light kt-btn-sm"
                >
                  <Plus style={{ width: 14, height: 14 }} /> Tambah Risiko
                </button>
              </div>
              <div style={{ border: '1px solid var(--kt-border)', borderRadius: 8, overflow: 'hidden' }}>
                <table className="kt-table">
                  <thead style={{ background: '#f4f5f8' }}>
                    <tr>
                      <th style={{ color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase' }}>Risiko</th>
                      <th style={{ color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase' }}>Dampak</th>
                      <th style={{ color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase' }}>Mitigasi</th>
                      <th style={{ color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase', width: 110, textAlign: 'center' }}>Level</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.risikoBisnis || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--kt-text-muted)', fontSize: 13 }}>
                          Belum ada risiko bisnis yang didefinisikan.
                        </td>
                      </tr>
                    ) : (
                      project.risikoBisnis.map((risk, idx) => (
                        <tr key={risk?.id || idx}>
                          <td>
                            <input value={risk?.risk || ''}
                              onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'risk', e.target.value)}
                              className="kt-input" style={{ padding: '6px 10px', fontSize: 13 }} placeholder="Risiko…" />
                          </td>
                          <td>
                            <input value={risk?.impact || ''}
                              onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'impact', e.target.value)}
                              className="kt-input" style={{ padding: '6px 10px', fontSize: 13, color: 'var(--kt-danger)' }} placeholder="Dampak…" />
                          </td>
                          <td>
                            <input value={risk?.mitigasi || ''}
                              onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'mitigasi', e.target.value)}
                              className="kt-input" style={{ padding: '6px 10px', fontSize: 13, color: '#028a3b' }} placeholder="Mitigasi…" />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <select value={risk?.level || 'Sedang'}
                              onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'level', e.target.value)}
                              style={{
                                  ...riskStyle(risk?.level),
                                  padding: '4px 10px', borderRadius: '12px', borderStyle: 'solid', borderWidth: '1px',
                                  fontSize: '11px', outline: 'none', width: '100%', appearance: 'none', textAlign: 'center'
                              }}
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

            {/* BIA Panel */}
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
                          width: 110, textAlign: 'center', appearance: 'none'
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

      {/* ── FULLSCREEN MODAL WITH ZOOM ─────────────────────────────────── */}
      {fullScreenDiagram && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
              
              {/* Toolbar */}
              <div style={{ height: 70, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      Diagram Viewer
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Zoom Controls */}
                      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 4 }}>
                          <button 
                              onClick={() => setZoomLevel(z => Math.max(0.25, z - 0.25))}
                              className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }} title="Zoom Out"
                          >
                              <ZoomOut size={18} />
                          </button>
                          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, padding: '0 12px', display: 'flex', alignItems: 'center', minWidth: 60, justifyContent: 'center' }}>
                              {Math.round(zoomLevel * 100)}%
                          </div>
                          <button 
                              onClick={() => setZoomLevel(1)}
                              className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }} title="Reset Zoom"
                          >
                              <RefreshCw size={16} />
                          </button>
                          <button 
                              onClick={() => setZoomLevel(z => z + 0.25)}
                              className="kt-btn kt-btn-icon kt-btn-sm" style={{ background: 'transparent', color: '#fff' }} title="Zoom In"
                          >
                              <ZoomIn size={18} />
                          </button>
                      </div>

                      {/* Close Button */}
                      <button 
                          onClick={closeFullscreen} 
                          style={{ background: 'var(--kt-danger)', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                      >
                          <X style={{ width: 22, height: 22, color: '#fff' }} />
                      </button>
                  </div>
              </div>

              {/* Viewer Area (Scrollable + Zoomable) */}
              <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }}>
                  <div style={{ 
                      background: '#fff', 
                      padding: '40px 60px', 
                      borderRadius: 16, 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)', 
                      minWidth: '60%',
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.2s ease-out',
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                  }}>
                      <div ref={fullScreenRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
                  </div>
              </div>

          </div>
      )}

    </div>
  );
};
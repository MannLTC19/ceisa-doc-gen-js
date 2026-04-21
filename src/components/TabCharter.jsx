import React from 'react';
import { 
  Flag, Calendar, Users, AlertTriangle, Target, 
  Briefcase, CheckSquare, Clock, LayoutList, HeartHandshake
} from 'lucide-react';

export const TabCharter = ({ project, setProject, calc }) => {

  // Logic: Safe updates for the Charter object
  const handleUpdateCharter = (field, value) => {
    setProject((prev) => ({
      ...prev,
      charter: { ...prev.charter, [field]: value }
    }));
  };

  // Logic: Handle Timeline Array
  const updateTimeline = (id, field, value) => {
    const newTimeline = (project.charter.timeline || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateCharter('timeline', newTimeline);
  };

  // Logic: Handle Team Array
  const updateTeam = (id, field, value) => {
    const newTeam = (project.charter.team || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateCharter('team', newTeam);
  };

  const cleanTableHeaderStyle = {
    background: '#f4f5f8', color: '#a1a5b7', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.05em', fontWeight: 700, padding: '12px 16px', borderBottom: '1px solid #e4e6ef'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="kt-notice kt-notice-primary" style={{ background: 'var(--kt-primary-light)', borderColor: 'rgba(27,132,255,0.2)', color: 'var(--kt-primary)' }}>
        <Flag />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Project Charter</div>
          <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
            Dokumen formal yang mengesahkan proyek. Mendefinisikan kasus bisnis, sasaran, ruang lingkup, jadwal, sumber daya, dan batasan.
          </div>
        </div>
      </div>

      {/* ── 01. INFORMASI UMUM ──────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Calendar style={{ color: 'var(--kt-primary)' }} /> 01. Informasi Umum</h3>
        </div>
        <div className="kt-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Terhubung dengan root project state */}
            <div className="kt-form-row" style={{ gridColumn: '1 / -1' }}>
              <label className="kt-label">Nama Proyek</label>
              <input className="kt-input" style={{ fontWeight: 700, fontSize: 14 }} value={project.nama || ''} onChange={(e) => setProject(prev => ({ ...prev, nama: e.target.value }))} />
            </div>
            <div className="kt-form-row" style={{ gridColumn: '1 / -1' }}>
              <label className="kt-label">Uraian Singkat Usulan Proyek</label>
              <textarea className="kt-textarea" rows={2} value={project.uraianUsulan || ''} onChange={(e) => setProject(prev => ({ ...prev, uraianUsulan: e.target.value }))} />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Unit Pengampu Bisnis Proses</label>
              <input className="kt-input" value={project.pengampu || ''} onChange={(e) => setProject(prev => ({ ...prev, pengampu: e.target.value }))} />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Tanggal Pembuatan Dokumen</label>
              <input type="date" className="kt-input" value={project.tanggalPembuatan || ''} onChange={(e) => setProject(prev => ({ ...prev, tanggalPembuatan: e.target.value }))} />
            </div>
            
            {/* Terhubung dengan charter state */}
            <div className="kt-form-row" style={{ gridColumn: '1 / -1' }}>
              <label className="kt-label">Proses yang Terkena Dampak</label>
              <input className="kt-input" value={project.charter.prosesTerdampak || ''} onChange={(e) => handleUpdateCharter('prosesTerdampak', e.target.value)} placeholder="Contoh: Proses Pelayanan Impor Sementara..." />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Tanggal Mulai yang Diharapkan</label>
              <input type="date" className="kt-input" value={project.charter.tanggalMulai || ''} onChange={(e) => handleUpdateCharter('tanggalMulai', e.target.value)} />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Tanggal Penyelesaian yang Diharapkan</label>
              <input type="date" className="kt-input" value={project.charter.tanggalSelesai || ''} onChange={(e) => handleUpdateCharter('tanggalSelesai', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 02. DESKRIPSI MASALAH, TUJUAN, SASARAN, DAN HASIL PROYEK ────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Target style={{ color: 'var(--kt-primary)' }} /> 02. Deskripsi Masalah, Tujuan, Sasaran & Hasil</h3>
        </div>
        <div className="kt-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="kt-form-row">
            <label className="kt-label" style={{ color: 'var(--kt-primary)' }}>Kasus Bisnis (Business Case)</label>
            <p style={{ fontSize: 11, color: 'var(--kt-text-muted)', marginBottom: 8 }}>Alasan mengapa proyek ini dilakukan dan nilai tambah yang akan diberikan kepada organisasi.</p>
            <textarea className="kt-textarea" rows={3} value={project.charter.kasusBisnis || ''} onChange={(e) => handleUpdateCharter('kasusBisnis', e.target.value)} placeholder="Uraikan kasus bisnis..." />
          </div>
          <div className="kt-form-row">
            <label className="kt-label" style={{ color: 'var(--kt-primary)' }}>Sasaran / Tujuan Proyek (Objectives)</label>
            <p style={{ fontSize: 11, color: 'var(--kt-text-muted)', marginBottom: 8 }}>Target spesifik, terukur, dan realistis yang ingin dicapai (SMART Goals).</p>
            <textarea className="kt-textarea" rows={3} value={project.charter.sasaran || ''} onChange={(e) => handleUpdateCharter('sasaran', e.target.value)} placeholder="1. Mempersingkat waktu layanan menjadi...\n2. Mendigitalkan proses..." />
          </div>
          <div className="kt-form-row">
            <label className="kt-label" style={{ color: 'var(--kt-success)' }}>Faktor Penentu Keberhasilan Proyek (Success Factors)</label>
            <textarea className="kt-textarea" rows={3} value={project.charter.faktorPenentu || ''} onChange={(e) => handleUpdateCharter('faktorPenentu', e.target.value)} placeholder="Indikator bahwa proyek ini dianggap sukses..." />
          </div>
        </div>
      </div>

      {/* ── 03. ANALISIS PROSES BISNIS ──────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><LayoutList style={{ color: 'var(--kt-primary)' }} /> 03. Analisis Proses Bisnis</h3>
        </div>
        <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="kt-form-row">
            <label className="kt-label">Area Layanan</label>
            <input className="kt-input" value={project.charter.areaLayanan || ''} onChange={(e) => handleUpdateCharter('areaLayanan', e.target.value)} placeholder="Area layanan terkait..." />
          </div>
          <div className="kt-form-row">
            <label className="kt-label">Modul (Ditarik otomatis dari FSD)</label>
            <input className="kt-input" value={project.brdProcessAnalysis?.modul || ''} onChange={(e) => setProject(prev => ({...prev, brdProcessAnalysis: {...prev.brdProcessAnalysis, modul: e.target.value}}))} placeholder="Nama Modul" />
          </div>
          <div className="kt-form-row" style={{ gridColumn: '1 / -1' }}>
            <label className="kt-label">Catatan atau Keterangan</label>
            <textarea className="kt-textarea" rows={2} value={project.charter.catatanProbis || ''} onChange={(e) => handleUpdateCharter('catatanProbis', e.target.value)} placeholder="Catatan tambahan..." />
          </div>
        </div>
      </div>

      {/* ── 04. KEBUTUHAN FUNGSIONAL (READ ONLY) ────────────────────────── */}
      <div className="kt-card" style={{ overflow: 'hidden' }}>
        <div className="kt-card-header" style={{ borderBottom: 'none', paddingBottom: 12 }}>
          <h3 className="kt-card-title"><CheckSquare style={{ color: 'var(--kt-primary)' }} /> 04. Kebutuhan Fungsional</h3>
        </div>
        <div style={{ overflowX: 'auto', borderTop: '1px solid #e4e6ef' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                <th style={{ ...cleanTableHeaderStyle, width: '40%' }}>Fungsi</th>
                <th style={cleanTableHeaderStyle}>Deskripsi / Detail Fungsi</th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {(project.kebutuhanFungsional || []).length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--kt-text-muted)', fontSize: 13 }}>Data Kebutuhan Fungsional ditarik dari Tab Kajian.</td></tr>
              ) : (
                project.kebutuhanFungsional.map((kf, idx) => (
                  <tr key={kf.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px 16px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 12 }}>{kf.kebutuhan}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--kt-text-gray)' }}>{kf.detailFungsi || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 05. LINGKUP DAN JADWAL PROYEK ───────────────────────────────── */}
      <div className="kt-card" style={{ overflow: 'hidden' }}>
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Briefcase style={{ color: 'var(--kt-primary)' }} /> 05. Lingkup dan Jadwal Proyek</h3>
        </div>
        
        <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderBottom: '1px solid #e4e6ef' }}>
          <div className="kt-form-row">
            <label className="kt-label">Scope (Termasuk dalam lingkup)</label>
            <textarea className="kt-textarea" rows={4} value={project.charter.scope || ''} onChange={(e) => handleUpdateCharter('scope', e.target.value)} placeholder="Apa saja yang akan dikerjakan/disampaikan…" />
          </div>
          <div className="kt-form-row">
            <label className="kt-label" style={{ color: 'var(--kt-danger)' }}>Di Luar Scope</label>
            <textarea className="kt-textarea" rows={4} style={{ borderColor: 'rgba(248,40,90,0.2)', background: 'var(--kt-danger-light)' }} value={project.charter.outOfScope || ''} onChange={(e) => handleUpdateCharter('outOfScope', e.target.value)} placeholder="Secara tegas TIDAK akan dikerjakan…" />
          </div>
        </div>

        <div style={{ padding: '24px 24px 12px 24px' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--kt-text-dark)', marginBottom: 8 }}>Timeline Tentative</h4>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                <th style={{ ...cleanTableHeaderStyle, width: '35%' }}>Key Milestone</th>
                <th style={{ ...cleanTableHeaderStyle, width: 140 }}>Start Date</th>
                <th style={{ ...cleanTableHeaderStyle, width: 140 }}>End Date</th>
                <th style={cleanTableHeaderStyle}>Keterangan</th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {(project.charter.timeline || []).map((tl, idx) => (
                <tr key={tl.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px 16px' }}>{idx + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 12 }}>{tl.milestone}</td>
                  <td style={{ padding: '8px 16px' }}><input type="date" className="kt-input" style={{ fontSize: 11, padding: '6px' }} value={tl.start || ''} onChange={(e) => updateTimeline(tl.id, 'start', e.target.value)} /></td>
                  <td style={{ padding: '8px 16px' }}><input type="date" className="kt-input" style={{ fontSize: 11, padding: '6px' }} value={tl.end || ''} onChange={(e) => updateTimeline(tl.id, 'end', e.target.value)} /></td>
                  <td style={{ padding: '8px 16px' }}><input className="kt-input" style={{ fontSize: 12, padding: '6px' }} value={tl.note || ''} onChange={(e) => updateTimeline(tl.id, 'note', e.target.value)} placeholder="Catatan…" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 06. SUMBER DAYA DAN BIAYA PROYEK ────────────────────────────── */}
      <div className="kt-card" style={{ overflow: 'hidden' }}>
        <div className="kt-card-header">
          <h3 className="kt-card-title"><Users style={{ color: 'var(--kt-primary)' }} /> 06. Sumber Daya dan Biaya Proyek</h3>
        </div>
        
        <div style={{ padding: '24px 24px 12px 24px' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--kt-text-dark)', marginBottom: 8 }}>Tim Proyek Pengembang</h4>
        </div>
        <div style={{ overflowX: 'auto', borderBottom: '1px solid #e4e6ef' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ ...cleanTableHeaderStyle, width: 60, textAlign: 'center' }}>No</th>
                <th style={{ ...cleanTableHeaderStyle, width: '30%' }}>Nama / NIP</th>
                <th style={{ ...cleanTableHeaderStyle, width: '25%' }}>Peran</th>
                <th style={cleanTableHeaderStyle}>Tugas dan Kewenangan</th>
              </tr>
            </thead>
            <tbody style={{ background: '#fff' }}>
              {(project.charter.team || []).map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f4f5f8' }}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#a1a5b7', padding: '12px 16px' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 16px' }}><input className="kt-input" style={{ fontSize: 12, fontWeight: 600 }} value={t.name || ''} onChange={(e) => updateTeam(t.id, 'name', e.target.value)} placeholder="Nama / NIP…" /></td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 12, color: 'var(--kt-primary)' }}>{t.role}</td>
                  <td style={{ padding: '8px 16px' }}><input className="kt-input" style={{ fontSize: 12 }} value={t.responsibility || ''} onChange={(e) => updateTeam(t.id, 'responsibility', e.target.value)} placeholder="Tanggung jawab…" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="kt-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="kt-form-row">
              <label className="kt-label">Kebutuhan Pendukung</label>
              <textarea className="kt-textarea" rows={3} value={project.charter.kebutuhanPendukung || ''} onChange={(e) => handleUpdateCharter('kebutuhanPendukung', e.target.value)} placeholder="Infrastruktur, lisensi, perangkat keras..." />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Kebutuhan Khusus</label>
              <textarea className="kt-textarea" rows={3} value={project.charter.kebutuhanKhusus || ''} onChange={(e) => handleUpdateCharter('kebutuhanKhusus', e.target.value)} placeholder="Kebutuhan spesifik lainnya..." />
            </div>
        </div>
      </div>

      {/* ── 07. MANFAAT DAN PENGAMPU PROSES BISNIS ──────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><HeartHandshake style={{ color: 'var(--kt-primary)' }} /> 07. Manfaat dan Pengampu Proses Bisnis</h3>
        </div>
        <div className="kt-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="kt-form-row">
            <label className="kt-label">Pengampu Proses Bisnis (Ditarik otomatis dari Informasi Umum)</label>
            <input className="kt-input" value={project.pengampu || ''} onChange={(e) => setProject(prev => ({ ...prev, pengampu: e.target.value }))} style={{ background: 'var(--kt-sidebar-bg)', color: '#fff' }} />
          </div>
          <div className="kt-form-row">
            <label className="kt-label">Pemangku Kepentingan (Stakeholders)</label>
            <p style={{ fontSize: 11, color: 'var(--kt-text-muted)', marginBottom: 8 }}>Pimpinan/pejabat/staf/unit kerja yang terlibat langsung maupun tidak langsung (termasuk pemberi biaya, PM, dll).</p>
            <textarea className="kt-textarea" rows={3} value={project.charter.stakeholders || ''} onChange={(e) => handleUpdateCharter('stakeholders', e.target.value)} placeholder="Uraikan pemangku kepentingan..." />
          </div>
          <div className="kt-form-grid kt-form-grid-2">
              <div className="kt-form-row">
                <label className="kt-label">Pengguna Akhir / User</label>
                <textarea className="kt-textarea" rows={3} value={project.charter.endUsers || ''} onChange={(e) => handleUpdateCharter('endUsers', e.target.value)} placeholder="Siapa yang akan menggunakan sistem ini..." />
              </div>
              <div className="kt-form-row">
                <label className="kt-label">Manfaat yang Diharapkan</label>
                <textarea className="kt-textarea" rows={3} value={project.charter.manfaat || ''} onChange={(e) => handleUpdateCharter('manfaat', e.target.value)} placeholder="Efisiensi, akurasi, peningkatan layanan..." />
              </div>
          </div>
        </div>
      </div>

      {/* ── 08. RISIKO, KENDALA & ASUMSI ────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title"><AlertTriangle style={{ color: 'var(--kt-primary)' }} /> 08. Risiko, Kendala & Asumsi Proyek</h3>
        </div>
        <div className="kt-card-body">
          <div style={{ padding: '12px 16px', background: '#fff8dd', border: '1px dashed #ffc700', borderRadius: 8, fontSize: 11.5, color: '#7a5800', marginBottom: 24 }}>
              <strong>Catatan:</strong> Pembahasan di sini hanya pada risiko perubahan scope proyek, tidak membahas risiko-risiko proyek secara keseluruhan (seperti: risiko kebijakan pemerintah, perubahan struktur, dll).
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="kt-form-row">
              <label className="kt-label" style={{ color: 'var(--kt-danger)', display: 'flex', alignItems: 'center', gap: 6 }}>Risiko</label>
              <textarea className="kt-textarea" rows={5} style={{ borderColor: 'rgba(248,40,90,0.2)', background: 'var(--kt-danger-light)' }} value={project.charter.risks || ''} onChange={(e) => handleUpdateCharter('risks', e.target.value)} placeholder="Risiko terhadap scope proyek…" />
            </div>

            <div className="kt-form-row">
              <label className="kt-label" style={{ color: '#7a5800', display: 'flex', alignItems: 'center', gap: 6 }}>Kendala</label>
              <textarea className="kt-textarea" rows={5} style={{ borderColor: 'rgba(246,177,0,0.2)', background: 'var(--kt-warning-light)' }} value={project.charter.constraints || ''} onChange={(e) => handleUpdateCharter('constraints', e.target.value)} placeholder="Kendala yang membatasi pilihan tim proyek…" />
            </div>

            <div className="kt-form-row">
              <label className="kt-label" style={{ color: '#028a3b', display: 'flex', alignItems: 'center', gap: 6 }}>Asumsi</label>
              <textarea className="kt-textarea" rows={5} style={{ borderColor: 'rgba(23,198,83,0.2)', background: 'var(--kt-success-light)' }} value={project.charter.assumptions || ''} onChange={(e) => handleUpdateCharter('assumptions', e.target.value)} placeholder="Faktor-faktor yang dianggap benar demi keperluan perencanaan…" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
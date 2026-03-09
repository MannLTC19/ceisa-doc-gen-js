import React from 'react';
import { Flag, Calendar, Users, AlertTriangle, Target, User } from 'lucide-react';

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
    const newTimeline = project.charter.timeline.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateCharter('timeline', newTimeline);
  };

  // Logic: Handle Team Array
  const updateTeam = (id, field, value) => {
    const newTeam = project.charter.team.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateCharter('team', newTeam);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="kt-notice kt-notice-primary">
        <Flag />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Project Charter</div>
          <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
            Dokumen definisi awal proyek yang mengesahkan keberadaan proyek dan memberikan wewenang kepada manajer proyek.
          </div>
        </div>
      </div>

      {/* ── 1. LINGKUP & JADWAL ─────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title">
            <Target /> 1. Lingkup dan Jadwal Proyek
          </h3>
        </div>

        {/* Scope */}
        <div className="kt-card-body" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label className="kt-label">Scope Proyek</label>
              <p style={{ fontSize: 11.5, color: 'var(--kt-text-muted)', margin: 0 }}>Ruang lingkup yang tercakup dalam proyek ini secara keseluruhan.</p>
            </div>
            <textarea
              className="kt-textarea"
              rows={4}
              value={project.charter.scope}
              onChange={(e) => handleUpdateCharter('scope', e.target.value)}
              placeholder="Definisikan ruang lingkup proyek…"
            />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 12 }}>
            <label className="kt-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
              <Calendar style={{ width: 14, height: 14 }} /> Timeline Tentative
            </label>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="kt-table" style={{ border: '1px solid var(--kt-border)', borderRadius: 8 }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th style={{ width: '30%' }}>Key Milestone</th>
                  <th style={{ width: 160 }}>Start</th>
                  <th style={{ width: 160 }}>End</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {project.charter.timeline.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{item.id}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--kt-primary)', fontSize: 13 }}>
                        {item.milestone}
                      </span>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.start}
                        onChange={e => updateTimeline(item.id, 'start', e.target.value)}
                        className="kt-input"
                        style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.end}
                        onChange={e => updateTimeline(item.id, 'end', e.target.value)}
                        className="kt-input"
                        style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <input
                        value={item.note || ''}
                        onChange={e => updateTimeline(item.id, 'note', e.target.value)}
                        className="kt-input"
                        style={{ padding: '6px 10px' }}
                        placeholder="Catatan..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 2. TIM & BIAYA ──────────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title">
            <Users /> 2. Sumber Daya dan Biaya Proyek
          </h3>
          {calc && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--kt-text-dark)' }}>
                {calc.totalMandays?.toFixed(0) || '—'}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--kt-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Man-days
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: 12 }}>
            <label className="kt-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0 }}>
              <User style={{ width: 14, height: 14 }} /> Tim Proyek Pengembang
            </label>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="kt-table" style={{ border: '1px solid var(--kt-border)', borderRadius: 8 }}>
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: 'center' }}>#</th>
                  <th style={{ width: 250 }}>Nama / NIP</th>
                  <th style={{ width: 180 }}>Peran</th>
                  <th>Tugas dan Kewenangan</th>
                </tr>
              </thead>
              <tbody>
                {project.charter.team.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--kt-text-muted)' }}>{item.id}</td>
                    <td>
                      <input
                        value={item.name}
                        onChange={e => updateTeam(item.id, 'name', e.target.value)}
                        className="kt-input"
                        style={{ padding: '6px 10px', fontWeight: 600 }}
                        placeholder="Nama Lengkap…"
                      />
                    </td>
                    <td>
                      <span className="kt-badge kt-badge-primary">{item.role}</span>
                    </td>
                    <td>
                      <input
                        value={item.responsibility}
                        onChange={e => updateTeam(item.id, 'responsibility', e.target.value)}
                        className="kt-input"
                        style={{ padding: '6px 10px' }}
                        placeholder="Deskripsi tugas..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 3. MANFAAT & PENGAMPU ───────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title">
            <Target /> 3. Manfaat dan Pengampu Proses Bisnis
          </h3>
        </div>
        <div className="kt-card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="kt-form-row">
              <label className="kt-label">Pengampu Proses Bisnis</label>
              <input
                className="kt-input"
                value={project.charter.bizProcessOwner || ''}
                onChange={(e) => handleUpdateCharter('bizProcessOwner', e.target.value)}
                placeholder="Nama unit / pejabat pengampu…"
              />
            </div>
            <div className="kt-form-row">
              <label className="kt-label">Manfaat yang Diharapkan</label>
              <textarea
                className="kt-textarea"
                rows={3}
                value={project.charter.benefits || ''}
                onChange={(e) => handleUpdateCharter('benefits', e.target.value)}
                placeholder="Uraikan manfaat yang diharapkan dari proyek ini…"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. RISIKO, KENDALA & ASUMSI ─────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header">
          <h3 className="kt-card-title">
            <AlertTriangle /> 4. Risiko, Kendala dan Asumsi Proyek
          </h3>
        </div>
        <div className="kt-card-body">
          <div className="kt-form-grid kt-form-grid-3">

            <div className="kt-form-row">
              <label className="kt-label" style={{ color: 'var(--kt-danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--kt-danger)', flexShrink: 0 }} />
                Risiko Utama
              </label>
              <textarea
                className="kt-textarea"
                rows={5}
                style={{ borderColor: 'rgba(248,40,90,0.2)', background: 'var(--kt-danger-light)' }}
                value={project.charter.risks || ''}
                onChange={(e) => handleUpdateCharter('risks', e.target.value)}
                placeholder="Daftar risiko utama…"
              />
            </div>

            <div className="kt-form-row">
              <label className="kt-label" style={{ color: '#7a5800', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--kt-warning)', flexShrink: 0 }} />
                Kendala / Batasan
              </label>
              <textarea
                className="kt-textarea"
                rows={5}
                style={{ borderColor: 'rgba(246,177,0,0.2)', background: 'var(--kt-warning-light)' }}
                value={project.charter.constraints || ''}
                onChange={(e) => handleUpdateCharter('constraints', e.target.value)}
                placeholder="Kendala atau batasan yang diketahui…"
              />
            </div>

            <div className="kt-form-row">
              <label className="kt-label" style={{ color: '#028a3b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--kt-success)', flexShrink: 0 }} />
                Asumsi Proyek
              </label>
              <textarea
                className="kt-textarea"
                rows={5}
                style={{ borderColor: 'rgba(23,198,83,0.2)', background: 'var(--kt-success-light)' }}
                value={project.charter.assumptions || ''}
                onChange={(e) => handleUpdateCharter('assumptions', e.target.value)}
                placeholder="Asumsi yang digunakan…"
              />
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
import React from 'react';
import { 
  Link2, RefreshCw, Plus, Trash2, 
  CheckCircle2, CircleDashed, PlayCircle, XCircle 
} from 'lucide-react';

export const TabRTM = ({ 
  project, setProject, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  // Auto-sync logic: Pulls Use Cases from Tab Penelitian and creates RTM rows
  const handleSyncUseCases = () => {
    const existingUcNames = (project.rtm || []).map(r => r.useCaseName);
    const newRtmEntries = [];

    (project.useCases || []).forEach((uc, idx) => {
      if (!existingUcNames.includes(uc.deskripsi)) {
        newRtmEntries.push({
          id: `rtm_${Date.now()}_${idx}`,
          version: '1.0',
          useCaseId: `UC-${String(idx + 1).padStart(3, '0')}`,
          useCaseName: uc.deskripsi || '',
          priority: 'High', // Default
          testCaseId: `TC-${String(idx + 1).padStart(3, '0')}`,
          testCaseDesc: '',
          status: 'Not Started',
          keterangan: ''
        });
      }
    });

    if (newRtmEntries.length > 0) {
      setProject(prev => ({
        ...prev,
        rtm: [...(prev.rtm || []), ...newRtmEntries]
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':        return { color: 'var(--kt-success)', bg: 'var(--kt-success-light)' };
      case 'In Progress': return { color: 'var(--kt-primary)', bg: 'var(--kt-primary-light)' };
      case 'Failed':      return { color: 'var(--kt-danger)',  bg: 'var(--kt-danger-light)' };
      default:            return { color: 'var(--kt-text-muted)', bg: 'var(--kt-border-light)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="kt-fade-in">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="kt-notice kt-notice-primary">
        <Link2 />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>Requirement Traceability Matrix (RTM)</div>
          <div style={{ fontSize: 12.5, color: 'var(--kt-text-gray)' }}>
            Matriks untuk memastikan semua kebutuhan/Use Case telah dipetakan ke skenario pengujian (Test Case) dan memantau status implementasinya.
          </div>
        </div>
      </div>

      {/* ── RTM TABLE ─────────────────────────────────────────────────── */}
      <div className="kt-card">
        <div className="kt-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="kt-card-title"><Link2 style={{ width: 18 }} /> Matriks Keterlacakan Kebutuhan</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={handleSyncUseCases} 
              className="kt-btn kt-btn-light kt-btn-sm"
              title="Tarik data otomatis dari Tab Penelitian"
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> Sync dari Use Case
            </button>
            <button 
              onClick={() => handleAddArray('rtm', {
                id: `rtm_${Date.now()}`, version: '1.0', useCaseId: '', useCaseName: '', 
                priority: 'Medium', testCaseId: '', testCaseDesc: '', status: 'Not Started', keterangan: ''
              })} 
              className="kt-btn kt-btn-primary kt-btn-sm"
            >
              <Plus style={{ width: 14, height: 14 }} /> Tambah Manual
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="kt-table">
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>Versi</th>
                <th style={{ width: 100 }}>Use Case ID</th>
                <th style={{ width: '20%' }}>Nama Use Case</th>
                <th style={{ width: 100 }}>Priority</th>
                <th style={{ width: 100 }}>Test Case ID</th>
                <th style={{ width: '25%' }}>Deskripsi Test Case</th>
                <th style={{ width: 140 }}>Status Implementasi</th>
                <th style={{ width: '15%' }}>Keterangan</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {(project.rtm || []).length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--kt-text-muted)' }}>
                    Data RTM masih kosong. Klik <strong>"Sync dari Use Case"</strong> untuk mengisi otomatis berdasarkan data di Tab Penelitian.
                  </td>
                </tr>
              ) : (
                (project.rtm || []).map((row) => {
                  const sColor = getStatusColor(row.status);
                  return (
                    <tr key={row.id}>
                      <td>
                        <input className="kt-input" style={{ textAlign: 'center' }} value={row.version || ''} onChange={e => handleUpdateArray('rtm', row.id, 'version', e.target.value)} />
                      </td>
                      <td>
                        <input className="kt-input" style={{ fontWeight: 700 }} value={row.useCaseId || ''} onChange={e => handleUpdateArray('rtm', row.id, 'useCaseId', e.target.value)} placeholder="UC-001" />
                      </td>
                      <td>
                        <textarea className="kt-textarea" rows={2} value={row.useCaseName || ''} onChange={e => handleUpdateArray('rtm', row.id, 'useCaseName', e.target.value)} placeholder="Nama Use Case..." />
                      </td>
                      <td>
                        <select className="kt-select" value={row.priority || 'Medium'} onChange={e => handleUpdateArray('rtm', row.id, 'priority', e.target.value)}>
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td>
                        <input className="kt-input" style={{ fontWeight: 700 }} value={row.testCaseId || ''} onChange={e => handleUpdateArray('rtm', row.id, 'testCaseId', e.target.value)} placeholder="TC-001" />
                      </td>
                      <td>
                        <textarea className="kt-textarea" rows={2} value={row.testCaseDesc || ''} onChange={e => handleUpdateArray('rtm', row.id, 'testCaseDesc', e.target.value)} placeholder="Skenario uji..." />
                      </td>
                      <td>
                        <select 
                          className="kt-select" 
                          style={{ background: sColor.bg, color: sColor.color, fontWeight: 700, border: 'none' }}
                          value={row.status || 'Not Started'} 
                          onChange={e => handleUpdateArray('rtm', row.id, 'status', e.target.value)}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td>
                        <textarea className="kt-textarea" rows={2} value={row.keterangan || ''} onChange={e => handleUpdateArray('rtm', row.id, 'keterangan', e.target.value)} placeholder="Catatan..." />
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button onClick={() => handleRemoveArray('rtm', row.id)} className="kt-btn kt-btn-icon" style={{ background: 'transparent' }}>
                          <Trash2 style={{ width: 16, height: 16, color: 'var(--kt-danger)' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
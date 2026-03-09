import React, { useEffect, useState } from 'react';
import { Database, Save } from 'lucide-react';
import { supabase } from '../utils/supabase.js';

export function TabEntries({ user, userRole }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [savingId, setSavingId] = useState(null);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const runInitialLoad = async () => {
      let query = supabase
        .from('analysis_entries')
        .select('id, user_id, email, entry_title, entry_notes, source_file_name, total_pages, parsed_pages, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (!isMounted) return;

      if (error) {
        setMessage(`Gagal memuat entries: ${error.message}`);
        setLoading(false);
        return;
      }

      setEntries(data || []);
      setLoading(false);
    };

    runInitialLoad();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, user?.id]);

  const loadEntries = async () => {
    if (!user?.id) return;

    setLoading(true);
    setMessage('');

    let query = supabase
      .from('analysis_entries')
      .select('id, user_id, email, entry_title, entry_notes, source_file_name, total_pages, parsed_pages, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      setMessage(`Gagal memuat entries: ${error.message}`);
      setLoading(false);
      return;
    }

    setEntries(data || []);
    setLoading(false);
  };

  const handleFieldChange = (id, field, value) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));
  };

  const handleSave = async (entry) => {
    setSavingId(entry.id);
    setMessage('');

    const { error } = await supabase
      .from('analysis_entries')
      .update({
        entry_title: entry.entry_title || '',
        entry_notes: entry.entry_notes || '',
      })
      .eq('id', entry.id);

    if (error) {
      setMessage(`Gagal update entry: ${error.message}`);
      setSavingId(null);
      return;
    }

    setMessage('Entry berhasil diupdate.');
    setSavingId(null);
  };

  return (
    <div className="kt-card">
      <div className="kt-card-header">
        <h3 className="kt-card-title">
          <Database />
          Data Entries ({isAdmin ? 'Admin' : 'User'})
        </h3>
        <button className="kt-btn kt-btn-light kt-btn-sm" onClick={loadEntries}>
          Refresh
        </button>
      </div>

      <div className="kt-card-body">
        <div className="kt-notice kt-notice-primary" style={{ marginBottom: 16 }}>
          <span>
            {isAdmin
              ? 'Admin dapat melihat seluruh entry dan mengedit judul/catatan entry.'
              : 'User dapat melihat dan membuat entry (melalui upload dokumen), tanpa hak edit.'}
          </span>
        </div>

        {!!message && (
          <div className={`kt-notice ${message.startsWith('Gagal') ? 'kt-notice-danger' : 'kt-notice-success'}`} style={{ marginBottom: 16 }}>
            <span>{message}</span>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="kt-table" style={{ border: '1px solid var(--kt-border)', borderRadius: 8 }}>
            <thead>
              <tr>
                <th style={{ width: 220 }}>Judul Entry</th>
                <th style={{ width: 220 }}>File</th>
                <th style={{ width: 90 }}>Pages</th>
                <th style={{ width: 220 }}>User</th>
                <th>Catatan</th>
                {isAdmin && <th style={{ width: 120 }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--kt-text-muted)' }}>
                    Loading entries...
                  </td>
                </tr>
              )}

              {!loading && entries.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--kt-text-muted)' }}>
                    Belum ada entry.
                  </td>
                </tr>
              )}

              {!loading && entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    {isAdmin ? (
                      <input
                        className="kt-input"
                        value={entry.entry_title || ''}
                        onChange={(event) => handleFieldChange(entry.id, 'entry_title', event.target.value)}
                      />
                    ) : (
                      <span>{entry.entry_title || '-'}</span>
                    )}
                  </td>
                  <td>{entry.source_file_name || '-'}</td>
                  <td>{entry.parsed_pages || 0}/{entry.total_pages || 0}</td>
                  <td>{entry.email || entry.user_id}</td>
                  <td>
                    {isAdmin ? (
                      <textarea
                        className="kt-textarea"
                        rows={2}
                        value={entry.entry_notes || ''}
                        onChange={(event) => handleFieldChange(entry.id, 'entry_notes', event.target.value)}
                      />
                    ) : (
                      <span>{entry.entry_notes || '-'}</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        className="kt-btn kt-btn-primary kt-btn-sm"
                        onClick={() => handleSave(entry)}
                        disabled={savingId === entry.id}
                      >
                        <Save size={14} />
                        {savingId === entry.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Flag, Plus, Trash2 } from 'lucide-react';

export const TabCharter = ({ project, setProject, calc }) => {

  const handleUpdateCharter = (field, value) => {
      setProject((prev) => ({
          ...prev,
          charter: {
              ...prev.charter,
              [field]: value
          }
      }));
  };

  const updateTimeline = (id, field, value) => {
      const newTimeline = project.charter.timeline.map((item) => 
          item.id === id ? { ...item, [field]: value } : item
      );
      handleUpdateCharter('timeline', newTimeline);
  };

  const updateTeam = (id, field, value) => {
      const newTeam = project.charter.team.map((item) => 
          item.id === id ? { ...item, [field]: value } : item
      );
      handleUpdateCharter('team', newTeam);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-4 items-start">
            <Flag className="w-6 h-6 text-orange-600 mt-1" />
            <div>
                <h3 className="font-bold text-orange-900 flex items-center gap-2">Project Charter</h3>
                <p className="text-sm text-orange-700">Dokumen definisi awal proyek yang mengesahkan keberadaan proyek dan memberikan wewenang kepada manajer proyek.</p>
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* 1. LINGKUP DAN JADWAL PROYEK */}
            <div className="bg-slate-700 text-white p-3 font-bold uppercase text-sm">Lingkup dan Jadwal Proyek</div>
            <div className="divide-y divide-slate-200">
                {/* Scope */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Scope</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 transition-colors text-slate-800 bg-white"
                            value={project.charter.scope}
                            onChange={(e) => handleUpdateCharter('scope', e.target.value)}
                            placeholder="Definisikan ruang lingkup proyek..."
                        />
                    </div>
                </div>
                {/* Timeline */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Timeline Tentative</div>
                    <div className="p-4 flex-1 overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-200">
                            <thead className="bg-[#002f5b] text-white uppercase">
                                <tr>
                                    <th className="p-2 w-8 text-center">No</th>
                                    <th className="p-2">Key Milestone</th>
                                    <th className="p-2 w-32 text-center">Start</th>
                                    <th className="p-2 w-32 text-center">End</th>
                                    <th className="p-2">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {project.charter.timeline.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-center">{item.id}</td>
                                        <td className="p-2 font-medium text-slate-800">{item.milestone}</td>
                                        <td className="p-2">
                                            <input 
                                                type="date" 
                                                value={item.start} 
                                                onChange={e => updateTimeline(item.id, 'start', e.target.value)} 
                                                className="w-full bg-white border border-slate-300 p-1 rounded text-slate-800" 
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="date" 
                                                value={item.end} 
                                                onChange={e => updateTimeline(item.id, 'end', e.target.value)} 
                                                className="w-full bg-white border border-slate-300 p-1 rounded text-slate-800" 
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                value={item.note || ''} 
                                                onChange={e => updateTimeline(item.id, 'note', e.target.value)} 
                                                className="w-full bg-white border border-slate-300 p-1 rounded text-slate-800" 
                                                placeholder="-" 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 2. SUMBER DAYA DAN BIAYA PROYEK */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300">Sumber Daya dan Biaya Proyek</div>
            <div className="divide-y divide-slate-200">
                {/* Tim Proyek */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Tim Proyek Pengembang</div>
                    <div className="p-4 flex-1 overflow-x-auto">
                         <table className="w-full text-xs text-left border border-slate-200">
                            <thead className="bg-[#002f5b] text-white uppercase">
                                <tr>
                                    <th className="p-2 w-8 text-center">No</th>
                                    <th className="p-2 w-48">Nama / NIP</th>
                                    <th className="p-2 w-40">Peran</th>
                                    <th className="p-2">Tugas dan Kewenangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {project.charter.team.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-center">{item.id}</td>
                                        <td className="p-2">
                                            <input 
                                                value={item.name} 
                                                onChange={e => updateTeam(item.id, 'name', e.target.value)} 
                                                className="w-full bg-white border border-slate-300 p-1 rounded font-bold text-slate-800" 
                                                placeholder="Nama..." 
                                            />
                                        </td>
                                        <td className="p-2 text-slate-800">{item.role}</td>
                                        <td className="p-2">
                                            <input 
                                                value={item.responsibility} 
                                                onChange={e => updateTeam(item.id, 'responsibility', e.target.value)} 
                                                className="w-full bg-white border border-slate-300 p-1 rounded text-slate-800" 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. MANFAAT DAN PENGAMPU PROSES BISNIS */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300">Manfaat dan Pengampu Proses Bisnis</div>
            <div className="divide-y divide-slate-200">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Pengampu Proses Bisnis</div>
                    <div className="p-4 flex-1">
                        <input 
                            className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 font-bold text-slate-800 bg-white"
                            value={project.charter.bizProcessOwner || ''}
                            onChange={(e) => handleUpdateCharter('bizProcessOwner', e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Manfaat yang diharapkan</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-16 p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 text-slate-800 bg-white"
                            value={project.charter.benefits || ''}
                            onChange={(e) => handleUpdateCharter('benefits', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 4. RISIKO, KENDALA DAN ASUMSI PROYEK */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300">Risiko, Kendala dan Asumsi Proyek</div>
            <div className="divide-y divide-slate-200">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] p-4 font-bold text-slate-700 border-r border-slate-200 text-sm">Risiko</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-20 p-2 border border-slate-300 rounded text-sm outline-none focus:border-blue-500 text-slate-800 bg-white"
                            value={project.charter.risks || ''}
                            onChange={(e) => handleUpdateCharter('risks', e.target.value)}
                            placeholder="Risiko utama proyek..."
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
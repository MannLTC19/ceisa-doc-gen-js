import React from 'react';
import { 
    Target, Sparkles, FileText, AlertOctagon, TrendingUp, 
    CheckSquare, Plus, Trash2, Zap, Network, Info
} from 'lucide-react';

export const TabKajian = ({ 
    project, setProject, uploadedFile, aiMeta, // Received new prop here
    handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {
  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
        
        {/* --- NEW: AI MODEL STATUS DASHBOARD --- */}
        {uploadedFile && aiMeta && (
            <div className="bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-700 text-white flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-emerald-400">Analysis Complete</h3>
                        <p className="text-xs text-slate-400">
                            Engine Used: <span className="font-mono text-white bg-slate-700 px-1 rounded">{aiMeta.usedModel || "Unknown"}</span>
                        </p>
                    </div>
                </div>
                
                {/* Attempt Log */}
                <div className="flex-1 flex flex-wrap gap-2 justify-end">
                    {aiMeta.log && aiMeta.log.map((entry, idx) => (
                        <div key={idx} className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${
                            entry.status === 'Success' 
                                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                                : 'bg-rose-900/30 border-rose-800 text-rose-300'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${entry.status === 'Success' ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                            {entry.model}: {entry.status === 'Success' ? 'OK' : entry.error}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 1. INFORMASI UMUM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Target className="w-5 h-5 text-blue-600"/> 1. Informasi Umum Proyek
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proyek / Modul</label>
                    <input 
                        value={project.nama} 
                        onChange={e => setProject(prev => ({...prev, nama: e.target.value}))} 
                        className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800" 
                    />
                </div>
                {/* ... rest of the fields remain the same ... */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Pengampu Bisnis Proses (Es. II)</label>
                    <input 
                        value={project.pengampu} 
                        onChange={e => setProject(prev => ({...prev, pengampu: e.target.value}))} 
                        className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Penanggung Jawab TIK (Es. III/IV)</label>
                    <input 
                        value={project.unitPenanggungJawab} 
                        onChange={e => setProject(prev => ({...prev, unitPenanggungJawab: e.target.value}))} 
                        className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama PIC</label>
                    <input 
                        value={project.namaPIC} 
                        onChange={e => setProject(prev => ({...prev, namaPIC: e.target.value}))} 
                        className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kontak PIC</label>
                    <input 
                        value={project.kontakPIC} 
                        onChange={e => setProject(prev => ({...prev, kontakPIC: e.target.value}))} 
                        className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" 
                    />
                </div>
            </div>
        </div>

        {/* ... (Keep the rest of the TabKajian code exactly as it was) ... */}
        {/* I am omitting the rest of the file for brevity, but you should keep the existing code for sections 2, 3, 4, 5 */}
        
        {/* 2. LATAR BELAKANG & MASALAH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-indigo-600"/> 2. Latar Belakang & Masalah
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Latar Belakang / Urgensi</label>
                        <textarea 
                            value={project.latarBelakang} 
                            onChange={e => setProject(prev => ({...prev, latarBelakang: e.target.value}))} 
                            className="w-full p-3 text-sm border rounded-lg bg-slate-50 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-rose-500 mb-1 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3"/> Masalah atau Isu (Pain Points)
                        </label>
                        <textarea 
                            value={project.masalahIsu} 
                            onChange={e => setProject(prev => ({...prev, masalahIsu: e.target.value}))} 
                            className="w-full p-3 text-sm border border-rose-200 rounded-lg bg-rose-50 h-24 focus:ring-2 focus:ring-rose-500 outline-none resize-none text-rose-900 font-medium" 
                        />
                    </div>
                </div>
            </div>

            {/* 3. TARGET & OUTCOME */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800">
                    <TrendingUp className="w-5 h-5 text-emerald-600"/> 3. Target & Business Value
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Target Penyelesaian</label>
                          <input 
                            type="date" 
                            value={project.targetPenyelesaian} 
                            onChange={e => setProject(prev => ({...prev, targetPenyelesaian: e.target.value}))} 
                            className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" 
                          />
                      </div>
                      <div className="w-2/3">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Target Outcome</label>
                          <input 
                            value={project.targetOutcome} 
                            onChange={e => setProject(prev => ({...prev, targetOutcome: e.target.value}))} 
                            className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" 
                          />
                      </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Outcome / Keluaran</label>
                        <textarea 
                            value={project.outcomeKeluaran} 
                            onChange={e => setProject(prev => ({...prev, outcomeKeluaran: e.target.value}))} 
                            className="w-full p-2 text-sm border rounded-lg bg-slate-50 h-16 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-800" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-emerald-600 mb-1">Business Value</label>
                        <textarea 
                            value={project.businessValue} 
                            onChange={e => setProject(prev => ({...prev, businessValue: e.target.value}))} 
                            className="w-full p-2 text-sm border border-emerald-100 rounded-lg bg-emerald-50 h-16 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-emerald-900 font-medium" 
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 4. KEBUTUHAN FUNGSIONAL & NON-FUNGSIONAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-700">
                    <CheckSquare className="w-4 h-4 text-blue-500"/> Kebutuhan Fungsional
                  </h3>
                  <button 
                    onClick={() => handleAddArray('kebutuhanFungsional', {id: `fr${Date.now()}`, deskripsi: '', prioritas: 'Mandatory'})} 
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3"/> Add
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {project.kebutuhanFungsional.map((item) => (
                        <div key={item.id} className="flex gap-2 items-start group">
                            <textarea 
                                value={item.deskripsi} 
                                onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'deskripsi', e.target.value)} 
                                className="flex-1 p-2 text-xs border rounded bg-slate-50 outline-none resize-none text-slate-800" 
                                rows={2} 
                            />
                            <div className="flex flex-col gap-1">
                              <select 
                                value={item.prioritas} 
                                onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'prioritas', e.target.value)} 
                                className="w-24 p-1 text-[10px] border rounded bg-slate-100 outline-none text-slate-800 font-bold"
                              >
                                <option>Mandatory</option>
                                <option>Optional</option>
                              </select>
                              <button 
                                onClick={() => handleRemoveArray('kebutuhanFungsional', item.id)} 
                                className="text-rose-400 hover:text-rose-600 p-1 bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3 h-3 mx-auto"/>
                              </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-700">
                    <Zap className="w-4 h-4 text-amber-500"/> Kebutuhan Non-Fungsional
                  </h3>
                  <button 
                    onClick={() => handleAddArray('kebutuhanNonFungsional', {id: `nfr${Date.now()}`, kategori: 'Performance', deskripsi: ''})} 
                    className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3"/> Add
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {project.kebutuhanNonFungsional.map((item) => (
                        <div key={item.id} className="flex gap-2 items-start group">
                            <div className="flex-1 flex flex-col gap-1">
                              <select 
                                value={item.kategori} 
                                onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'kategori', e.target.value)} 
                                className="w-full p-1 text-[10px] border rounded bg-slate-100 font-bold text-slate-700 outline-none"
                              >
                                <option>Performance</option>
                                <option>Security</option>
                                <option>Availability</option>
                                <option>Reliability</option>
                                <option>Scalability</option>
                              </select>
                              <textarea 
                                value={item.deskripsi} 
                                onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'deskripsi', e.target.value)} 
                                className="w-full p-2 text-xs border rounded bg-slate-50 outline-none resize-none text-slate-800" 
                                rows={2} 
                              />
                            </div>
                            <button 
                                onClick={() => handleRemoveArray('kebutuhanNonFungsional', item.id)} 
                                className="mt-1 text-rose-400 hover:text-rose-600 p-1 bg-rose-50 rounded"
                            >
                                <Trash2 className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                </div>
             </div>
        </div>

        {/* 5. ALUR BISNIS & BIA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800">
                <Network className="w-5 h-5 text-purple-600"/> 5. Alur Bisnis & Analisis Dampak (BIA)
             </h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Alur Bisnis Proses</label>
                        <textarea 
                            value={project.alurBisnisProses} 
                            onChange={e => setProject(prev => ({...prev, alurBisnisProses: e.target.value}))} 
                            className="w-full p-3 text-sm border rounded-lg bg-slate-50 h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-800" 
                            placeholder="Jelaskan alur..." 
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-500">Risiko</label>
                            <button 
                                onClick={() => handleAddArray('risikoBisnis', {id: `r_${Date.now()}`, risk: '', impact: '', mitigasi: '', level: 'Sedang'})} 
                                className="text-[10px] text-blue-600 font-bold"
                            >
                                + Tambah
                            </button>
                        </div>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                    <tr>
                                        <th className="p-2">Risiko</th>
                                        <th className="p-2">Dampak</th>
                                        <th className="p-2">Mitigasi</th>
                                        <th className="p-2">Level</th>
                                        <th className="p-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {project.risikoBisnis.map((risk) => (
                                        <tr key={risk.id} className="hover:bg-slate-50">
                                            <td className="p-2"><input value={risk.risk} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'risk', e.target.value)} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" placeholder="Risiko..."/></td>
                                            <td className="p-2"><input value={risk.impact} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'impact', e.target.value)} className="w-full bg-transparent outline-none text-rose-700 placeholder-rose-300" placeholder="Dampak..."/></td>
                                            <td className="p-2"><input value={risk.mitigasi} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'mitigasi', e.target.value)} className="w-full bg-transparent outline-none text-emerald-700 placeholder-emerald-300" placeholder="Mitigasi..."/></td>
                                            <td className="p-2">
                                                <select 
                                                    value={risk.level} 
                                                    onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'level', e.target.value)} 
                                                    className="bg-transparent font-bold outline-none text-slate-800 cursor-pointer"
                                                >
                                                    <option>Tinggi</option>
                                                    <option>Sedang</option>
                                                    <option>Rendah</option>
                                                </select>
                                            </td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleRemoveArray('risikoBisnis', risk.id)}>
                                                    <Trash2 className="w-3 h-3 text-rose-400 hover:text-rose-600"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="text-xs font-black uppercase text-slate-600 mb-3 border-b border-slate-200 pb-2">Analisis Dampak Bisnis TIK</h4>
                    <div className="space-y-3">
                        {['operasional', 'finansial', 'reputasi', 'hukum'].map(key => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-600 capitalize">{key}</span>
                                <select 
                                  value={project.bia[key]} 
                                  onChange={(e) => setProject(prev => ({...prev, bia: { ...prev.bia, [key]: e.target.value }}))} 
                                  className={`text-xs font-bold p-1 rounded border outline-none w-24 cursor-pointer
                                      ${project.bia[key] === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                                        project.bia[key] === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                                        project.bia[key] === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                                        'bg-blue-50 text-blue-800 border-blue-200'}
                                  `}
                                >
                                  <option value="Low" className="bg-white text-slate-700">Low</option>
                                  <option value="Medium" className="bg-white text-slate-700">Medium</option>
                                  <option value="High" className="bg-white text-slate-700">High</option>
                                  <option value="Critical" className="bg-white text-slate-700">Critical</option>
                                </select>
                            </div>
                        ))}
                        <div className="border-t border-slate-200 my-2 pt-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-600">RTO</span>
                            <input 
                                value={project.bia.rto} 
                                onChange={(e) => setProject(prev => ({...prev, bia: { ...prev.bia, rto: e.target.value }}))} 
                                className="w-24 text-xs p-1 border rounded bg-white text-right text-slate-800" 
                                placeholder="4h"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-600">RPO</span>
                            <input 
                                value={project.bia.rpo} 
                                onChange={(e) => setProject(prev => ({...prev, bia: { ...prev.bia, rpo: e.target.value }}))} 
                                className="w-24 text-xs p-1 border rounded bg-white text-right text-slate-800" 
                                placeholder="24h"
                            />
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
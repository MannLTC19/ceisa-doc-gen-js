import React from 'react';
import { 
    FileSpreadsheet, Plus, Trash2, Calculator, Settings, User, 
    TrendingUp, Clock, AlertCircle, Briefcase, Lock
} from 'lucide-react';

import { 
    formatIDR, getUseCaseComplexity, getActorComplexity, 
    BV_OPTIONS, EFFORT_OPTIONS 
} from '../constants.js';

export const TabPenelitian = ({ 
    project, setProject, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  const updateBVEffort = (type, category, index) => {
      const options = type === 'bv' ? BV_OPTIONS : EFFORT_OPTIONS;
      const selectedOption = options[category][index];
      setProject((prev) => ({ ...prev, bvEffort: { ...prev.bvEffort, [category]: selectedOption } }));
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 pb-12">
        
        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><FileSpreadsheet className="w-6 h-6"/></div>
             <div>
                 <h2 className="text-xl font-bold text-slate-800">Dokumen Penelitian</h2>
                 <p className="text-sm text-slate-500">Perhitungan UCP, Standar TCF/EF Bea Cukai, Estimasi Biaya (RAB), dan Prioritas Proyek</p>
             </div>
        </div>

        {/* 1. SPESIFIKASI AKTOR (UAW) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-700 p-3 px-6 flex items-center justify-between text-white">
                 <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><User className="w-4 h-4"/> 1. Spesifikasi Aktor (UAW)</h3>
                 <button 
                    onClick={() => handleAddArray('actors', {id: Date.now(), name: 'Aktor Baru', type: 'GUI', desc: ''})} 
                    className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded flex items-center gap-1 transition-colors font-bold"
                 >
                    <Plus className="w-3 h-3"/> Add Actor
                 </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-3 w-16 text-center">No</th>
                            <th className="p-3 w-48">Nama Aktor</th>
                            <th className="p-3">Deskripsi</th>
                            <th className="p-3 w-40">Jenis Aktor</th>
                            <th className="p-3 w-24 text-center bg-amber-50 text-amber-900 border-l border-amber-100">UAW</th>
                            <th className="p-3 w-12 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(project.actors || []).map((item, idx) => {
                             const complexity = getActorComplexity(item.type);
                             return (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                                    <td className="p-3">
                                        <input value={item.name} onChange={e => handleUpdateArray('actors', item.id, 'name', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder-slate-300" placeholder="Nama Aktor..."/>
                                    </td>
                                    <td className="p-3">
                                        <input value={item.desc || ''} onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} className="w-full bg-transparent outline-none text-slate-600 placeholder-slate-300" placeholder="Deskripsi peran..."/>
                                    </td>
                                    <td className="p-3">
                                        <select 
                                            value={item.type} 
                                            onChange={e => handleUpdateArray('actors', item.id, 'type', e.target.value)} 
                                            className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 outline-none cursor-pointer"
                                        >
                                            <option value="API">API (Simple)</option>
                                            <option value="Protocol">Protocol (Average)</option>
                                            <option value="GUI">GUI (Complex)</option>
                                        </select>
                                    </td>
                                    <td className="p-3 text-center font-bold bg-amber-50 text-slate-800 border-l border-amber-100">{complexity.weight}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleRemoveArray('actors', item.id)}>
                                            <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500"/>
                                        </button>
                                    </td>
                                </tr>
                             );
                        })}
                        <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-600">
                            <td colSpan={4} className="p-3 text-right uppercase text-xs tracking-wider">Total Unadjusted Actor Weight (UAW)</td>
                            <td className="p-3 text-center text-amber-400 text-lg">{calc.uaw || 0}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>

        {/* 2. USE CASE DIAGRAM DAN DESKRIPSI (UUCW) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-700 p-3 px-6 flex items-center justify-between text-white">
                 <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Calculator className="w-4 h-4"/> 2. Use Case Deskripsi (UUCW)</h3>
                 <button 
                    onClick={() => handleAddArray('useCases', {id: `uc_${Date.now()}`, subSystem: 'New Sub', name: 'Fitur Baru', transactions: 1})} 
                    className="text-xs bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded flex items-center gap-1 transition-colors font-bold"
                 >
                    <Plus className="w-3 h-3"/> Add Use Case
                 </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-3 w-10 text-center">No</th>
                            <th className="p-3 w-32">Sub System</th>
                            <th className="p-3">Nama Use Case</th>
                            <th className="p-3 w-24 text-center">Trans.</th>
                            <th className="p-3 w-24 text-center">Complexity</th>
                            <th className="p-3 w-24 text-center bg-amber-50 text-amber-900 border-l border-amber-100">UUCW</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(project.useCases || []).map((uc, idx) => {
                            const complexity = getUseCaseComplexity(uc.transactions);
                            return (
                                <tr key={uc.id} className="hover:bg-slate-50">
                                    <td className="p-3 text-center text-slate-500 text-xs">{idx + 1}</td>
                                    <td className="p-3">
                                        <input 
                                        value={uc.subSystem} 
                                        onChange={e => handleUpdateArray('useCases', uc.id, 'subSystem', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs font-semibold focus:border-blue-500 outline-none" 
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input 
                                            value={uc.name} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'name', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-sm focus:border-blue-500 outline-none" 
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <input 
                                        type="number" min="1"
                                        value={uc.transactions} 
                                        onChange={e => handleUpdateArray('useCases', uc.id, 'transactions', parseInt(e.target.value) || 1)}
                                        className="w-16 text-center bg-white border border-slate-300 rounded px-1 py-1 text-slate-800 text-xs font-bold focus:border-blue-500 outline-none" 
                                        />
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold block w-full
                                        ${complexity.level === 'Simple' ? 'bg-emerald-100 text-emerald-700' : 
                                            complexity.level === 'Average' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                                        `}>
                                        {complexity.level}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center font-bold text-slate-800 bg-amber-50 border-l border-amber-100">{complexity.weight}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleRemoveArray('useCases', uc.id)} className="text-slate-300 hover:text-rose-500">
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-600">
                            <td colSpan={5} className="p-3 text-right text-xs uppercase tracking-wider">Total Unadjusted Use Case Weighting (UUCW)</td>
                            <td className="p-3 text-center text-amber-400 text-lg">{calc.uucw || 0}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
             </div>
        </div>

        {/* 3. PARAMETER PENILAIAN (TCF & EF) LOKAL BEA CUKAI */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-700 p-3 px-6 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Settings className="w-4 h-4"/> 3. Parameter Penilaian Terkunci (TCF & EF)</h3>
                 <span className="flex items-center gap-1 text-[10px] bg-slate-900 px-2 py-1 rounded-full text-slate-300 border border-slate-600">
                     <Lock className="w-3 h-3"/> IKC Standard Applied
                 </span>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                 <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center shadow-sm">
                     <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">Technical Complexity (TCF)</p>
                     <p className="text-4xl font-black text-yellow-900">{calc.tcf}</p>
                 </div>
                 <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center shadow-sm">
                     <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Environmental Factor (EF)</p>
                     <p className="text-4xl font-black text-emerald-900">{calc.ef}</p>
                 </div>
                 <div className="bg-slate-800 border border-slate-900 p-6 rounded-xl text-center shadow-xl transform scale-105">
                     <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Final UCP Score</p>
                     <p className="text-4xl font-black text-white">{(calc.ucp || 0).toFixed(2)}</p>
                     <p className="text-[10px] text-slate-400 mt-2">UUCP x TCF x EF</p>
                 </div>
             </div>
        </div>

        {/* 4. PERHITUNGAN EFFORT (MAN-MONTH) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-700 p-3 px-6 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><Clock className="w-4 h-4"/> 4. Perhitungan Effort (Man-Month)</h3>
                 <span className="flex items-center gap-1 text-[10px] bg-slate-900 px-2 py-1 rounded-full text-slate-300 border border-slate-600">
                     Decision Rule: {project.phm} Jam
                 </span>
             </div>
             <div className="overflow-x-auto p-4">
                 <table className="w-full text-sm text-center border-collapse border border-slate-300">
                     <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-tighter">
                         <tr>
                             <th className="p-3 border border-slate-300 text-left">Sub Paket</th>
                             <th className="p-3 border border-slate-300 w-16">Total UAW</th>
                             <th className="p-3 border border-slate-300 w-20">Total UUCW</th>
                             <th className="p-3 border border-slate-300 w-20">UUCP<br/><span className="font-normal text-[9px]">(UAW+UUCW)</span></th>
                             <th className="p-3 border border-slate-300 w-20">UCP<br/><span className="font-normal text-[9px]">(UUCP*TCF*EF)</span></th>
                             <th className="p-3 border border-slate-300 w-24">PHM<br/><span className="font-normal text-[9px]">(UCP*{project.phm})</span></th>
                             <th className="p-3 border border-slate-300 w-20">WD<br/><span className="font-normal text-[9px]">(PHM/8)</span></th>
                             <th className="p-3 border border-slate-300 w-20 bg-blue-100 text-blue-900">MM<br/><span className="font-normal text-[9px]">(WD/22)</span></th>
                         </tr>
                     </thead>
                     <tbody className="text-slate-800 font-medium">
                         <tr className="hover:bg-slate-50 transition-colors">
                             <td className="p-3 border border-slate-300 text-left font-bold text-slate-700">{project.nama}</td>
                             <td className="p-3 border border-slate-300">{calc.uaw}</td>
                             <td className="p-3 border border-slate-300">{calc.uucw}</td>
                             <td className="p-3 border border-slate-300 bg-amber-50">{calc.uucp}</td>
                             <td className="p-3 border border-slate-300 bg-slate-100 font-bold">{(calc.ucp || 0).toFixed(0)}</td>
                             <td className="p-3 border border-slate-300">{(calc.totalPersonHours || 0).toFixed(0)}</td>
                             <td className="p-3 border border-slate-300">{(calc.workingDays || 0).toFixed(0)}</td>
                             <td className="p-3 border border-slate-300 bg-blue-50 text-blue-700 font-black text-lg">{(calc.totalManMonths || 0).toFixed(0)}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>

        {/* 5. COST ESTIMATION (RAB) */}
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
             <div className="mb-4 flex items-start justify-between">
                 <div>
                     <h4 className="font-bold text-blue-900 text-base uppercase flex items-center gap-2">
                         <Briefcase className="w-5 h-5"/> 5. Cost Estimation (KAK Akhir Tahun)
                     </h4>
                     <p className="text-xs text-slate-500">Distribusi biaya berdasarkan fase pengembangan dan standar biaya Inkindo 2023.</p>
                 </div>
                 <span className="flex items-center gap-1.5 text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1.5 rounded-full font-bold shrink-0">
                     <Lock className="w-3 h-3"/> Standar IKC — Terkunci
                 </span>
             </div>
             <div className="overflow-x-auto border border-blue-200 rounded-lg">
                 <table className="w-full text-left text-xs border-collapse">
                     <thead className="bg-[#002f5b] text-white uppercase font-bold tracking-wider">
                         <tr>
                             <th className="p-3 border-r border-blue-800">Phase</th>
                             <th className="p-3 border-r border-blue-800 text-center w-28">Prosentase Effort</th>
                             <th className="p-3 border-r border-blue-800 text-center w-36">Effort Distribution (MM)</th>
                             <th className="p-3 border-r border-blue-800 w-40">PIC</th>
                             <th className="p-3 border-r border-blue-800 w-40 text-right">Gaji Per Bulan (Inkindo, 2023)</th>
                             <th className="p-3 w-36 text-right">Cost Estimation</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-blue-100 text-slate-800">
                         {['Software Phase Development', 'Ongoing life-cycle activity', 'Quality and testing phases'].map(group => {
                             const groupItems = (calc.kakTableData || []).filter((i) => i.group === group);
                             return (
                                 <React.Fragment key={group}>
                                     <tr className="bg-slate-100">
                                         <td colSpan={6} className="p-2 px-3 font-bold italic text-slate-700 border-b border-slate-200">
                                             {group}
                                         </td>
                                     </tr>
                                     {groupItems.map((item) => (
                                         <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                             {/* Phase name — locked */}
                                             <td className="p-2 px-3 border-r border-slate-200 italic text-slate-700">
                                                 {item.name}
                                             </td>
                                             {/* Percent — locked, display only */}
                                             <td className="p-2 px-3 border-r border-slate-200 text-center">
                                                 <span className="inline-flex items-center justify-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 select-none">
                                                     {item.percent}%
                                                 </span>
                                             </td>
                                             {/* Effort MM — calculated, display only */}
                                             <td className="p-2 px-3 border-r border-slate-200 text-center font-mono text-slate-700">
                                                 {(item.effortMM || 0).toFixed(3)}
                                             </td>
                                             {/* Role — locked */}
                                             <td className="p-2 px-3 border-r border-slate-200 text-slate-700">
                                                 {item.roleName}
                                             </td>
                                             {/* Rate — locked */}
                                             <td className="p-2 px-3 border-r border-slate-200 text-right font-mono text-slate-600">
                                                 {formatIDR(item.rate || 0)}
                                             </td>
                                             {/* Cost — calculated */}
                                             <td className="p-2 px-3 text-right font-mono font-bold text-slate-800">
                                                 {formatIDR(item.cost || 0)}
                                             </td>
                                         </tr>
                                     ))}
                                 </React.Fragment>
                             );
                         })}

                         {/* TOTALS */}
                         <tr className="border-t-2 border-slate-300 font-bold bg-slate-50 text-slate-700">
                             <td className="p-2 px-3 italic" colSpan={2}>Total of Effort</td>
                             <td className="p-2 px-3 text-center font-mono font-black text-slate-800">
                                 {(calc.totalManMonths || 0).toFixed(2)}
                             </td>
                             <td colSpan={2}></td>
                             <td className="p-2 px-3 text-right font-bold">{formatIDR(calc.runningTotalCost || 0)}</td>
                         </tr>
                         <tr className="text-slate-600 bg-white">
                             <td className="p-2 px-3" colSpan={5}>Estimasi Garansi 25%</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.warrantyCost || 0)}</td>
                         </tr>
                         <tr className="font-bold bg-white text-slate-700">
                             <td className="p-2 px-3" colSpan={5}>Sub Total</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.subTotal || 0)}</td>
                         </tr>
                         <tr className="text-slate-600 bg-white">
                             <td className="p-2 px-3" colSpan={5}>PPN 11%</td>
                             <td className="p-2 px-3 text-right font-mono">{formatIDR(calc.ppn || 0)}</td>
                         </tr>
                         <tr className="bg-emerald-600 text-white font-black text-sm">
                             <td className="p-3 uppercase tracking-wide" colSpan={5}>Total</td>
                             <td className="p-3 text-right text-base font-black tracking-tight">{formatIDR(calc.grandTotal || 0)}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </div>

        {/* 6. BUSINESS VALUE VS EFFORT */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-700 p-3 px-6 text-white">
                 <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><TrendingUp className="w-4 h-4"/> 6. Perhitungan Business Value vs Effort</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 border-b pb-2 flex justify-between">
                        <span>Business Value</span>
                        <span className="text-blue-600 font-black">{(calc.totalBV || 0).toFixed(2)}</span>
                    </h4>
                    {Object.keys(BV_OPTIONS || {}).map((key) => (
                        <div key={key} className="flex flex-col gap-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">{key}</label>
                             <select 
                                className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-800 cursor-pointer outline-none"
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

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 border-b pb-2 flex justify-between">
                        <span>Effort</span>
                        <span className="text-rose-600 font-black">{(calc.totalEffort || 0).toFixed(2)}</span>
                    </h4>
                     {Object.keys(EFFORT_OPTIONS || {}).map((key) => (
                        <div key={key} className="flex flex-col gap-1">
                             <label className="text-xs font-bold text-slate-500 uppercase">{key}</label>
                             <select 
                                className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-800 cursor-pointer outline-none"
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

                <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 p-4 rounded-lg flex justify-between items-center shadow-inner">
                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-tighter">Rekomendasi Prioritas</span>
                        <span className="text-lg font-black text-slate-800">{calc.priority || "P3 (Low)"}</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-tighter">Total Score (BV / Effort)</span>
                        <span className="text-lg font-bold text-blue-600">{calc.totalBV || 0}</span> / <span className="text-lg font-bold text-rose-600">{calc.totalEffort || 0}</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
  );
};
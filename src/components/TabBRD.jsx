import React from 'react';
import { 
    Briefcase, Sparkles, Plus, Trash2, LayoutList, 
    User, GitGraph, Calculator, Calendar 
} from 'lucide-react';

import { 
    getActorComplexity, getUseCaseComplexity 
} from '../constants';
import { FormInput } from './FormInput';
import { SectionHeader, SectionTitle, Button } from './UIComponents';
import { Card, CardHeader } from './TableComponents';

export const TabBRD = ({ 
    project, setProject, uploadedFile, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
        <SectionHeader 
            icon={Briefcase}
            title={`Business Requirement Document (BRD) ${uploadedFile ? '✨' : ''}`}
            subtitle="Mendefinisikan perubahan proses bisnis, kebutuhan fungsional, dan perhitungan estimasi (UCP)."
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            textColor="text-purple-900"
            iconColor="text-purple-600"
        />

        {/* 1. ANALISIS PROSES BISNIS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                <LayoutList className="w-5 h-5 text-blue-600"/> 1. Analisis Proses Bisnis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Modul</label>
                    <input 
                        value={project.brdProcessAnalysis?.modul || ''} 
                        onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, modul: e.target.value}})} 
                        className="w-full p-2 text-sm border rounded bg-white font-medium text-slate-800 outline-none focus:border-blue-500" 
                        placeholder="Nama Modul"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sub Modul</label>
                    <input 
                        value={project.brdProcessAnalysis?.subModul || ''} 
                        onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, subModul: e.target.value}})} 
                        className="w-full p-2 text-sm border rounded bg-white font-medium text-slate-800 outline-none focus:border-blue-500" 
                        placeholder="Nama Sub Modul"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Analisis pemetaan EA Kemenkeu</label>
                    <input 
                        value={project.brdProcessAnalysis?.eaMapping || ''} 
                        onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, eaMapping: e.target.value}})} 
                        className="w-full p-2 text-sm border rounded bg-white text-slate-800 outline-none focus:border-blue-500" 
                        placeholder="Kode / Nama EA"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Catatan atau Keterangan</label>
                    <input 
                        value={project.brdProcessAnalysis?.notes || ''} 
                        onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, notes: e.target.value}})} 
                        className="w-full p-2 text-sm border rounded bg-white text-slate-800 outline-none focus:border-blue-500" 
                        placeholder="Catatan Tambahan"
                    />
                </div>
            </div>
        </div>

        {/* 2. KONDISI AS-IS TO-BE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <GitGraph className="w-5 h-5 text-emerald-600"/> 2. Kondisi As-Is To-Be
                 </h3>
                 <button 
                    onClick={() => handleAddArray('asIsToBe', {id: Date.now().toString(), factor: '', asIs: '', toBe: ''})} 
                    className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                 >
                    <Plus className="w-3 h-3"/> Tambah Baris
                 </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700 text-white uppercase text-xs">
                        <tr>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 w-1/4">Faktor Pembanding</th>
                            <th className="p-3 w-1/3">As Is</th>
                            <th className="p-3 w-1/3">To Be</th>
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {/* SAFE MAPPING: Added null-check to prevent white screen error */}
                        {(project.asIsToBe ?? []).map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                                <td className="p-3">
                                    <input 
                                        value={item.factor || ''} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'factor', e.target.value)} 
                                        className="w-full bg-transparent outline-none font-medium text-slate-800 placeholder-slate-400" 
                                        placeholder="Faktor..."
                                    />
                                </td>
                                <td className="p-3 bg-slate-50/50">
                                    <input 
                                        value={item.asIs || ''} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'asIs', e.target.value)} 
                                        className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400" 
                                        placeholder="Kondisi Saat Ini..."
                                    />
                                </td>
                                <td className="p-3 bg-emerald-50/30">
                                    <input 
                                        value={item.toBe || ''} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'toBe', e.target.value)} 
                                        className="w-full bg-transparent outline-none text-emerald-900 font-medium placeholder-emerald-800/50" 
                                        placeholder="Kondisi Usulan..."
                                    />
                                </td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleRemoveArray('asIsToBe', item.id)}>
                                        <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 3. KEBUTUHAN FUNGSIONAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                <LayoutList className="w-5 h-5 text-indigo-600"/> 3. Kebutuhan Fungsional
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 w-1/3">Fungsi / Kode</th>
                            <th className="p-3">Deskripsi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.kebutuhanFungsional ?? []).map((item, idx) => (
                            <tr key={item.id}>
                                <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-3 font-mono text-xs text-blue-600 font-bold bg-slate-50">{item.id}</td>
                                <td className="p-3 text-slate-800">{item.deskripsi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 4. SPESIFIKASI AKTOR (RESUME) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                <User className="w-5 h-5 text-teal-600"/> 4. Spesifikasi Aktor
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-24">Kode Aktor</th>
                            <th className="p-3 w-1/4">Nama Aktor</th>
                            <th className="p-3">Deskripsi</th>
                            <th className="p-3 w-32 bg-amber-50 text-center border-l border-amber-100">UAW</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.actors ?? []).map((item) => {
                             const complexity = getActorComplexity(item.type);
                             return (
                                <tr key={item.id}>
                                    <td className="p-3 font-mono text-xs text-slate-500">ACT-{item.id}</td>
                                    <td className="p-3 font-bold text-slate-700">{item.name}</td>
                                    <td className="p-3">
                                        <input 
                                            value={item.desc || ''} 
                                            onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} 
                                            className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" 
                                            placeholder="Deskripsi peran aktor..."
                                        />
                                    </td>
                                    <td className="p-3 text-center font-bold bg-amber-50/50 border-l border-amber-50 text-slate-800">{complexity.weight}</td>
                                </tr>
                             );
                        })}
                        <tr className="bg-slate-700 text-white font-bold">
                            <td colSpan={3} className="p-3 text-right text-xs uppercase">Total UAW</td>
                            <td className="p-3 text-center text-amber-400">{calc.uaw}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* 5. USE CASE DIAGRAM (RESUME) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                <GitGraph className="w-5 h-5 text-pink-600"/> 5. Use Case Summary
            </h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-20">Kode UC</th>
                            <th className="p-3 w-48">Nama UC</th>
                            <th className="p-3 w-24">Aktor</th>
                            <th className="p-3 w-32">Kondisi Awal</th>
                            <th className="p-3 w-32">Kondisi Akhir</th>
                            <th className="p-3 w-24 bg-amber-50 text-center border-l border-amber-100">UUCW</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.useCases ?? []).map((uc) => {
                             const complexity = getUseCaseComplexity(uc.transactions);
                             return (
                                <tr key={uc.id} className="hover:bg-slate-50">
                                    <td className="p-2 font-mono text-slate-500">UC-{uc.id}</td>
                                    <td className="p-2 font-bold text-slate-800">{uc.name}</td>
                                    <td className="p-2">
                                        <input 
                                            value={uc.actorRef || ''} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'actorRef', e.target.value)} 
                                            className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" 
                                            placeholder="Actor"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <textarea 
                                            value={uc.preCond || ''} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'preCond', e.target.value)} 
                                            className="w-full bg-transparent outline-none resize-none h-10 text-slate-800 placeholder-slate-400" 
                                            placeholder="-"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <textarea 
                                            value={uc.postCond || ''} 
                                            onChange={e => handleUpdateArray('useCases', uc.id, 'postCond', e.target.value)} 
                                            className="w-full bg-transparent outline-none resize-none h-10 text-slate-800 placeholder-slate-400" 
                                            placeholder="-"
                                        />
                                    </td>
                                    <td className="p-2 text-center font-bold bg-amber-50/50 border-l border-amber-50 text-slate-800">{complexity.weight}</td>
                                </tr>
                             );
                        })}
                        <tr className="bg-slate-700 text-white font-bold">
                            <td colSpan={5} className="p-3 text-right uppercase">Total UUCW</td>
                            <td className="p-3 text-center text-amber-400">{calc.uucw}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* 6. MAN MONTH SUMMARY */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                <Calendar className="w-5 h-5 text-green-600"/> 6. Man Month Estimation
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse border border-slate-300">
                    <thead className="bg-slate-800 text-white uppercase text-xs">
                        <tr>
                            <th className="p-3 border border-slate-600">UCP</th>
                            <th className="p-3 border border-slate-600">PHM</th>
                            <th className="p-3 border border-slate-600">Total Person-Hours</th>
                            <th className="p-3 border border-slate-600 bg-emerald-700">Man Month (MM)</th>
                            <th className="p-3 border border-slate-600">Estimasi Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="font-bold text-lg text-slate-700">
                            <td className="p-4 border border-slate-300 text-slate-800">{calc.ucp.toFixed(2)}</td>
                            <td className="p-4 border border-slate-300 text-slate-800">{project.phm}</td>
                            <td className="p-4 border border-slate-300 text-amber-600">{calc.totalPersonHours?.toFixed(0) || '0'} Jam</td>
                            <td className="p-4 border border-slate-300 bg-emerald-50 text-emerald-700 text-2xl">{calc.totalManMonths?.toFixed(2) || '0.00'}</td>
                            <td className="p-4 border border-slate-300 text-blue-600">~ {Math.ceil(calc.totalManMonths || 0)} Bulan</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
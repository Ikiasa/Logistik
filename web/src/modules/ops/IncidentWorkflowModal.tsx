'use client';
import React, { useState } from 'react';
import { X, AlertCircle, ChevronRight, CheckCircle2, Upload, Loader2, Camera, MapPin, Clock, User } from 'lucide-react';

type Step = 'TYPE' | 'DETAILS' | 'EVIDENCE' | 'CONFIRM' | 'DONE';

const INCIDENT_TYPES = [
    { id: 'ACCIDENT', label: 'Vehicle Accident', icon: '🚗', color: 'border-rose-500/30 hover:border-rose-500/60 text-rose-400' },
    { id: 'BREAKDOWN', label: 'Mechanical Breakdown', icon: '🔧', color: 'border-amber-500/30 hover:border-amber-500/60 text-amber-400' },
    { id: 'ROUTE_BLOCK', label: 'Route Blockage', icon: '🚧', color: 'border-orange-500/30 hover:border-orange-500/60 text-orange-400' },
    { id: 'THEFT', label: 'Cargo Theft / Loss', icon: '📦', color: 'border-red-500/30 hover:border-red-500/60 text-red-400' },
    { id: 'HEALTH', label: 'Driver Health Issue', icon: '🏥', color: 'border-blue-500/30 hover:border-blue-500/60 text-blue-400' },
    { id: 'OTHER', label: 'Other Incident', icon: '⚠️', color: 'border-zinc-700 hover:border-zinc-500 text-zinc-400' },
];

interface Props {
    onClose: () => void;
}

export const IncidentWorkflowModal: React.FC<Props> = ({ onClose }) => {
    const [step, setStep] = useState<Step>('TYPE');
    const [incidentType, setIncidentType] = useState('');
    const [form, setForm] = useState({ vehicle: '', location: '', description: '', severity: 'HIGH' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' });
    const [submitting, setSubmitting] = useState(false);

    const steps: Step[] = ['TYPE', 'DETAILS', 'EVIDENCE', 'CONFIRM'];
    const stepIdx = steps.indexOf(step);

    const handleSubmit = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1800)); // simulate API call
        setSubmitting(false);
        setStep('DONE');
    };

    return (
        <div className="fixed inset-0 z-[3000] bg-black/40 dark:bg-black/85 backdrop-blur-sm dark:backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">

                {step !== 'DONE' ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                                    <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Incident_Workflow</h2>
                                    <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">Emergency Protocol System</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Step progress */}
                        <div className="flex items-center px-6 py-4 border-b border-zinc-50 dark:border-zinc-900 space-x-2">
                            {steps.map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center space-x-2 ${i <= stepIdx ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${i < stepIdx ? 'bg-emerald-500 text-white' : i === stepIdx ? 'bg-indigo-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'}`}>
                                            {i < stepIdx ? <CheckCircle2 size={12} /> : i + 1}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hidden sm:block">{s}</span>
                                    </div>
                                    {i < steps.length - 1 && <div className={`flex-1 h-px ${i < stepIdx ? 'bg-emerald-500/40' : 'bg-zinc-100 dark:bg-zinc-800'}`} />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Step content */}
                        <div className="p-6 min-h-[280px]">
                            {step === 'TYPE' && (
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Select Incident Type</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {INCIDENT_TYPES.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => { setIncidentType(t.id); }}
                                                className={`p-4 bg-zinc-50 dark:bg-zinc-900 border rounded-2xl text-left transition-all ${incidentType === t.id ? t.color + ' bg-white dark:bg-zinc-800 shadow-inner' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}
                                            >
                                                <div className="text-xl mb-2">{t.icon}</div>
                                                <p className={`text-xs font-bold ${incidentType === t.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>{t.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 'DETAILS' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Incident Details</p>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-1.5">Vehicle ID</label>
                                        <div className="relative">
                                            <select
                                                value={form.vehicle}
                                                onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                                            >
                                                <option value="">Select vehicle...</option>
                                                <option>B 9012 GHI — Cahyo</option>
                                                <option>B 3456 JKL — Deni</option>
                                                <option>B 7890 MNO — Eko</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-1.5">Location</label>
                                        <div className="relative">
                                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                            <input
                                                placeholder="e.g. Tol Cipularang KM 88"
                                                value={form.location}
                                                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-1.5">Description</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Describe what happened..."
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block mb-1.5">Severity</label>
                                        <div className="flex space-x-2">
                                            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(s => (
                                                <button key={s} onClick={() => setForm(f => ({ ...f, severity: s }))}
                                                    className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${form.severity === s ? s === 'CRITICAL' ? 'bg-rose-500 border-rose-500 text-white' : s === 'HIGH' ? 'bg-orange-500 border-orange-500 text-white' : s === 'MEDIUM' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-blue-500 border-blue-500 text-white' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-600'}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'EVIDENCE' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Upload Evidence</p>
                                    <div className="border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer group">
                                        <Camera size={32} className="text-zinc-200 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 mb-3 transition-all" />
                                        <p className="text-sm font-bold text-zinc-400 dark:text-zinc-500">Drag photos or tap to upload</p>
                                        <p className="text-[10px] text-zinc-300 dark:text-zinc-700 mt-1">JPG, PNG up to 20MB</p>
                                    </div>
                                    <div className="flex items-center space-x-2 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                        <CheckCircle2 size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-300">GPS coordinates auto-attached</p>
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-600">-6.2045°, 106.8227° — Jakarta</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-300 dark:text-zinc-700 text-center">Evidence is optional — you can attach files later</p>
                                </div>
                            )}

                            {step === 'CONFIRM' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Confirm & Submit</p>
                                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {[
                                            { icon: AlertCircle, label: 'Type', value: INCIDENT_TYPES.find(t => t.id === incidentType)?.label || incidentType },
                                            { icon: User, label: 'Vehicle', value: form.vehicle || 'Not specified' },
                                            { icon: MapPin, label: 'Location', value: form.location || 'Not specified' },
                                            { icon: Clock, label: 'Severity', value: form.severity },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="flex items-center px-4 py-3 space-x-3">
                                                <Icon size={14} className="text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
                                                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider w-20">{label}</span>
                                                <span className="text-sm font-bold text-zinc-900 dark:text-white">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-center">Submitting will notify the dispatcher and log this incident in the system.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <button onClick={stepIdx > 0 ? () => setStep(steps[stepIdx - 1]) : onClose} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all">
                                {stepIdx === 0 ? 'Cancel' : '← Back'}
                            </button>
                            {step === 'CONFIRM' ? (
                                <button onClick={handleSubmit} disabled={submitting} className="flex items-center space-x-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60">
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    <span>{submitting ? 'Filing...' : 'File Incident'}</span>
                                </button>
                            ) : (
                                <button onClick={() => setStep(steps[stepIdx + 1])} disabled={step === 'TYPE' && !incidentType} className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30">
                                    <span>Next</span>
                                    <ChevronRight size={14} />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    /* Success state */
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Incident Filed</h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2 mb-1">Reference: <span className="font-mono text-zinc-900 dark:text-white">INC-{Math.floor(Math.random() * 9000) + 1000}</span></p>
                        <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mb-8">Dispatcher has been notified. Evidence can be added later.</p>
                        <button onClick={onClose} className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest transition-all">
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [role, setRole] = useState('UM'); // UM, HM, or AUTH
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (role === 'UM') endpoint = '/api/um/pending';
            if (role === 'HM') endpoint = '/api/hm/pending';
            if (role === 'AUTH') endpoint = '/api/authorities/anonymous-reports';

            const res = await fetch(`http://localhost:8000${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                setTickets(data);
            }
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, [role]);

    const handleAction = async (ticketId, action) => {
        const endpoint = role === 'UM' ? '/api/um/process' : '/api/hm/process';
        try {
            await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_id: ticketId, action: action })
            });
            fetchTickets(); 
        } catch (err) {
            console.error("Failed to process action", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-200 p-6 relative overflow-hidden pb-32">
            
            {/* Glowing Cyber Background Mesh */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
                <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]"></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-10 border-b border-slate-800/80 pb-6 flex justify-between items-end">
                    <div>
                        <div className="flex items-center mb-2">
                            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 mr-4">
                                <i className="fas fa-server text-indigo-400 text-xl"></i>
                            </div>
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-700/50">SYSTEM SECURE • ACTIVE</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">Amrita Service System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Command Center</span></h1>
                        <p className="text-slate-400 mt-2 text-lg">Multi-Node Workflow & Autonomous LLM Verification Dashboard</p>
                    </div>
                </header>

                {/* Role Switcher */}
                <div className="flex space-x-4 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-md inline-flex">
                    <button onClick={() => setRole('UM')} className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${role === 'UM' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <i className="fas fa-university mr-2"></i> University Node (UM)
                    </button>
                    <button onClick={() => setRole('HM')} className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${role === 'HM' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-105' : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <i className="fas fa-bed mr-2"></i> Hostel Node (HM)
                    </button>
                    <button onClick={() => setRole('AUTH')} className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${role === 'AUTH' ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 scale-105' : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <i className="fas fa-shield-alt mr-2"></i> Authorities
                    </button>
                </div>

                {/* Ticket Feed */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            {role === 'AUTH' ? <><i className="fas fa-search text-rose-500 mr-3"></i> AI Investigation Queue</> : <><i className="fas fa-layer-group text-indigo-500 mr-3"></i> Pending Approvals Queue</>}
                        </h2>
                        <button onClick={fetchTickets} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg border border-slate-700 transition">
                            <i className="fas fa-sync-alt"></i>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-20">
                            <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
                            <p className="text-slate-400 animate-pulse font-mono">Decrypting Node Data...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-slate-800/30 backdrop-blur-xl p-12 rounded-3xl text-center border border-slate-700/50 border-dashed">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                <i className="fas fa-check text-3xl text-emerald-500"></i>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Queue is Empty</h3>
                            <p className="text-slate-400">All tasks have been processed for this node.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-7 shadow-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
                                    
                                    {/* Status Ribbon */}
                                    <div className={`absolute top-0 right-0 px-5 py-1.5 text-xs font-black tracking-widest uppercase rounded-bl-xl ${ticket.dispatch_status === 'DISPATCHED' ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/20'}`}>
                                        {ticket.dispatch_status}
                                    </div>

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-xs font-mono text-slate-400 mb-2">ID: {ticket.id}</p>
                                            <h3 className="text-2xl font-bold text-white capitalize flex items-center">
                                                {ticket.ticket_type} Issue
                                            </h3>
                                            <p className="text-sm text-cyan-400 mt-2 font-medium bg-cyan-900/20 inline-block px-2 py-1 rounded border border-cyan-800/50">
                                                <i className="fas fa-map-marker-alt mr-1"></i> {ticket.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/80 p-5 rounded-xl mb-6 text-sm text-slate-300 border border-slate-800 shadow-inner">
                                        <p className="font-bold text-slate-500 mb-2 text-xs uppercase tracking-wider">Student Description</p>
                                        <p className="leading-relaxed">"{ticket.description}"</p>
                                    </div>

                                    {/* AI Verification Block (The Highlight) */}
                                    <div className="bg-indigo-900/20 border border-indigo-500/30 p-5 rounded-xl mb-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                                        <div className="flex items-center mb-3">
                                            <i className="fas fa-robot text-indigo-400 text-xl mr-3"></i>
                                            <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">Gemini Vision AI Analysis</p>
                                        </div>
                                        
                                        <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-800/50 mb-3">
                                            <p className="text-sm font-semibold text-indigo-100">{ticket.llm_primary_check}</p>
                                        </div>
                                        
                                        <div className="flex items-center space-x-6 mt-4">
                                            <div>
                                                <p className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Detected Category</p>
                                                <p className="text-sm font-bold text-white">{ticket.ai_category}</p>
                                            </div>
                                            {ticket.allocated_worker && ticket.allocated_worker !== "REQUIRES_AUTHORITY_REVIEW" && (
                                                <div>
                                                    <p className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Pre-Allocated Worker</p>
                                                    <p className="text-sm font-bold text-emerald-400"><i className="fas fa-hard-hat mr-1"></i> {ticket.allocated_worker}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {role !== 'AUTH' && (
                                        <div className="flex space-x-4 pt-2">
                                            <button onClick={() => handleAction(ticket.id, 'APPROVE')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/50 transition-all hover:-translate-y-0.5 border border-emerald-500 flex items-center justify-center">
                                                <i className="fas fa-check-circle mr-2"></i> Approve
                                            </button>
                                            <button onClick={() => handleAction(ticket.id, 'REJECT')} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 border border-slate-600 flex items-center justify-center">
                                                <i className="fas fa-times-circle mr-2"></i> Reject
                                            </button>
                                        </div>
                                    )}
                                    {role === 'AUTH' && (
                                        <div className="flex space-x-4 pt-2">
                                            <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-rose-900/50 transition-all hover:-translate-y-0.5 border border-rose-500 flex items-center justify-center">
                                                <i className="fas fa-gavel mr-2 text-xl"></i> Initiate Investigation
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

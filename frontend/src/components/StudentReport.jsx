import React, { useState, useEffect } from 'react';

export default function StudentReport() {
    const [activeTab, setActiveTab] = useState('infrastructure');
    
    // Form State
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [imageBase64, setImageBase64] = useState(null); 
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null);
    
    // Dashboard State
    const [myTickets, setMyTickets] = useState([]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchMyTickets = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/student/my-tickets");
            if (res.ok) {
                const data = await res.json();
                setMyTickets(data);
            }
        } catch (err) {
            console.error("Failed to fetch tickets");
        }
    };

    useEffect(() => {
        if (activeTab === 'dashboard') fetchMyTickets();
    }, [activeTab]);

    const getTabClass = (tabName) => {
        const isActive = activeTab === tabName;
        return `px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center cursor-pointer shadow-sm border ${
            isActive 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent scale-105 shadow-blue-500/30' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-indigo-600'
        }`;
    };

    const handleSubmit = async (ticketType) => {
        if (!description) {
            setAlertMsg({ type: 'error', text: 'Please provide a description of the issue.' });
            return;
        }

        setIsSubmitting(true);
        setAlertMsg(null);

        try {
            const response = await fetch("http://localhost:8000/api/student/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticket_type: ticketType,
                    description: description,
                    location: location || "Not Specified",
                    image_base64: imageBase64
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAlertMsg({ type: 'success', text: `Success! Ticket Created: ${data.id}` });
                setDescription('');
                setLocation('');
                setImageBase64(null);
            } else {
                setAlertMsg({ type: 'error', text: 'Server error. Is the backend running?' });
            }
        } catch (error) {
            setAlertMsg({ type: 'error', text: 'Failed to connect to the backend server.' });
        }
        
        setIsSubmitting(false);
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen font-sans relative overflow-hidden pb-24">
            
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-48 -left-24 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Premium Navbar */}
            <nav className="bg-gradient-to-r from-indigo-700 to-blue-800 shadow-lg relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm border border-white/30">
                                <i className="fas fa-university text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white tracking-tight">Amrita Service System</h1>
                                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Student Request Portal</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-3 bg-black/10 px-4 py-2 rounded-full border border-white/10">
                            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                                S
                            </div>
                            <span className="text-white text-sm font-medium">Student User</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                
                {alertMsg && (
                    <div className={`p-4 mb-8 rounded-xl flex items-center shadow-sm border ${alertMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-fadeIn`}>
                        <i className={`fas ${alertMsg.type === 'success' ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-circle text-rose-500'} text-xl mr-3`}></i>
                        <span className="font-medium">{alertMsg.text}</span>
                    </div>
                )}

                {/* Pill Tabs */}
                <div className="mb-8 flex flex-wrap gap-3">
                    <button onClick={() => {setActiveTab('infrastructure'); setAlertMsg(null);}} className={getTabClass('infrastructure')}>
                        <i className="fas fa-tools mr-2 text-lg"></i> Infrastructure
                    </button>
                    <button onClick={() => {setActiveTab('hostel'); setAlertMsg(null);}} className={getTabClass('hostel')}>
                        <i className="fas fa-bed mr-2 text-lg"></i> Hostel
                    </button>
                    <button onClick={() => {setActiveTab('anonymous'); setAlertMsg(null);}} className={getTabClass('anonymous')}>
                        <i className="fas fa-user-secret mr-2 text-lg"></i> Anonymous
                    </button>
                    <div className="flex-grow"></div>
                    <button onClick={() => {setActiveTab('dashboard'); setAlertMsg(null);}} className={getTabClass('dashboard')}>
                        <i className="fas fa-chart-pie mr-2 text-lg"></i> My Dashboard
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white p-8 min-h-[500px]">
                    
                    {/* Infrastructure Tab */}
                    {activeTab === 'infrastructure' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-8">
                                <div className="bg-blue-100 p-3 rounded-xl mr-4 text-blue-600">
                                    <i className="fas fa-hammer text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report Infrastructure Issue</h2>
                                    <p className="text-gray-500 mt-1">Campus academic blocks, libraries, and sports complexes.</p>
                                </div>
                            </div>
                            
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Location / Building</label>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Main Academic Block, Room 304" className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-inner py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Issue Description</label>
                                    <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail so our AI can categorize it..." className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-inner py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"></textarea>
                                </div>
                                
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5">
                                    <label className="block text-sm font-bold text-indigo-900 mb-2"><i className="fas fa-camera-retro mr-2"></i>Attach Photo (Vision AI)</label>
                                    <p className="text-xs text-indigo-600 mb-3">Upload a photo. Our Gemini Vision AI will automatically detect if it's plumbing, electrical, or carpentry.</p>
                                    
                                    <div className="flex items-center space-x-4">
                                        <div className="relative overflow-hidden inline-block">
                                            <button type="button" className="bg-white border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors">
                                                Choose File
                                            </button>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute left-0 top-0 opacity-0 cursor-pointer h-full w-full" />
                                        </div>
                                        {imageBase64 && <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm"><i className="fas fa-check-circle mr-2"></i> Image Attached</span>}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="button" onClick={() => handleSubmit('infrastructure')} disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center">
                                        {isSubmitting ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Analyzing & Submitting...</> : <><i className="fas fa-paper-plane mr-2"></i> Submit Request</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Hostel Facilities Tab */}
                    {activeTab === 'hostel' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-8">
                                <div className="bg-purple-100 p-3 rounded-xl mr-4 text-purple-600">
                                    <i className="fas fa-building text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hostel Maintenance</h2>
                                    <p className="text-gray-500 mt-1">Issues within student living quarters and mess halls.</p>
                                </div>
                            </div>

                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Hostel Block & Room</label>
                                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Boys Hostel 1, Room B-214" className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-inner py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Issue Description</label>
                                    <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be fixed?" className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-inner py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"></textarea>
                                </div>

                                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
                                    <label className="block text-sm font-bold text-purple-900 mb-2"><i className="fas fa-camera-retro mr-2"></i>Attach Photo</label>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative overflow-hidden inline-block">
                                            <button type="button" className="bg-white border-2 border-dashed border-purple-300 text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors">
                                                Choose File
                                            </button>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute left-0 top-0 opacity-0 cursor-pointer h-full w-full" />
                                        </div>
                                        {imageBase64 && <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center shadow-sm"><i className="fas fa-check-circle mr-2"></i> Image Attached</span>}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="button" onClick={() => handleSubmit('hostel')} disabled={isSubmitting} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center">
                                        {isSubmitting ? <><i className="fas fa-circle-notch fa-spin mr-2"></i> Submitting...</> : <><i className="fas fa-paper-plane mr-2"></i> Submit Request</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Anonymous Tab */}
                    {activeTab === 'anonymous' && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-6">
                                <div className="bg-slate-800 p-3 rounded-xl mr-4 text-white shadow-lg">
                                    <i className="fas fa-user-ninja text-2xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ghost Mode Reporting</h2>
                                    <p className="text-gray-500 mt-1">100% anonymous channel for sensitive issues.</p>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start">
                                <i className="fas fa-shield-alt text-amber-600 text-2xl mr-4 mt-1"></i>
                                <p className="text-sm text-amber-900 font-medium">
                                    This form does not collect your name or IP. Our AI will conduct a primary verification check on the text for severity before securely alerting the Disciplinary Authorities.
                                </p>
                            </div>
                            
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Report</label>
                                    <textarea rows="6" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide specific details to help the AI verify the issue without exposing your identity..." className="w-full bg-gray-50 border border-gray-200 rounded-xl shadow-inner py-3 px-4 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"></textarea>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button type="button" onClick={() => handleSubmit('anonymous')} disabled={isSubmitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center">
                                        <i className={`fas ${isSubmitting ? 'fa-circle-notch fa-spin' : 'fa-lock'} mr-2`}></i> 
                                        {isSubmitting ? 'Encrypting & Sending...' : 'Submit Anonymously'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* MY DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Ticket Dashboard</h2>
                                    <p className="text-gray-500 mt-1">Track the real-time status and AI categorization of your requests.</p>
                                </div>
                                <button onClick={fetchMyTickets} className="bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl shadow-sm transition-colors">
                                    <i className="fas fa-sync-alt"></i>
                                </button>
                            </div>
                            
                            {myTickets.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                                        <i className="fas fa-inbox text-2xl text-gray-300"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700">No tickets found</h3>
                                    <p className="text-gray-500 mt-1">You haven't submitted any service requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {myTickets.map(ticket => (
                                        <div key={ticket.id} className="border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all bg-white relative overflow-hidden group">
                                            
                                            {/* Status Accent Bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ticket.dispatch_status === 'DISPATCHED' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded-md">{ticket.id}</span>
                                                    <h3 className="text-xl font-bold text-gray-800 capitalize mt-2">{ticket.ticket_type} Issue</h3>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm border ${ticket.dispatch_status === 'DISPATCHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                    {ticket.dispatch_status === 'DISPATCHED' ? <><i className="fas fa-truck-fast mr-1"></i> Dispatched</> : <><i className="fas fa-hourglass-half mr-1"></i> Waiting</>}
                                                </div>
                                            </div>

                                            <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 italic">
                                                "{ticket.description}"
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">AI Category</p>
                                                    <p className="font-bold text-indigo-700 truncate"><i className="fas fa-robot mr-1"></i> {ticket.ai_category}</p>
                                                </div>
                                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Allocated Worker</p>
                                                    <p className="font-bold text-gray-800 truncate"><i className="fas fa-hard-hat mr-1 text-gray-400"></i> {ticket.allocated_worker}</p>
                                                </div>
                                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">UM Approval</p>
                                                    <p className={`font-bold ${ticket.um_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {ticket.um_status === 'APPROVED' ? <i className="fas fa-check-circle mr-1"></i> : <i className="fas fa-clock mr-1"></i>}
                                                        {ticket.um_status}
                                                    </p>
                                                </div>
                                                <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">HM Approval</p>
                                                    <p className={`font-bold ${ticket.hm_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {ticket.hm_status === 'APPROVED' ? <i className="fas fa-check-circle mr-1"></i> : <i className="fas fa-clock mr-1"></i>}
                                                        {ticket.hm_status}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

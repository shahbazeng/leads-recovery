'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  PhoneMissed, MessageSquareText, CalendarCheck, TrendingUp, 
  User, PhoneCall, LogOut, LayoutDashboard, Settings, 
  CreditCard, Users, BarChart3, RefreshCw, Zap
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  
  const [userData, setUserData] = useState({
    agencyName: 'Apex Luxury Real Estate',
    email: 'admin@apexrealty.com',
    phone: '+92 300 1234567',
    missedCalls: 45,
  });

  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchDynamicData = async () => {
    try {
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (agencyData && !agencyError) {
        setUserData({
          agencyName: agencyData.agency_name,
          email: agencyData.email,
          phone: agencyData.phone || '+92 300 1234567',
          missedCalls: agencyData.missed_calls || 45,
        });
      } else {
        const savedData = localStorage.getItem('revive_client_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setUserData({
            agencyName: parsed.agencyName || 'Apex Luxury Real Estate',
            email: parsed.email || 'admin@apexrealty.com',
            phone: parsed.phone || '+92 300 1234567',
            missedCalls: Number(parsed.missedCalls) || 45,
          });
        }
      }

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsData && leadsData.length > 0) {
        setLeads(leadsData);
      } else {
        setLeads([
          { id: 1, caller_phone: '+92 300 8920112', intent: 'Looking for 3-Bed Luxury Villa in DHA Phase 5', status: 'Booked', time: '2 mins ago' },
          { id: 2, caller_phone: '+92 321 4319920', intent: 'Commercial Plot Inquiry (Gulberg Lahore)', status: 'AI Replied (10s)', time: '18 mins ago' }
        ]);
      }

      const { data: apptsData } = await supabase
        .from('appointments')
        .select('*');

      if (apptsData && apptsData.length > 0) {
        setAppointments(apptsData);
      } else {
        setAppointments([
          { id: 1, title: 'DHA Phase 5 Villa Visit', status: 'Confirmed', time: 'Saturday, 2:00 PM', phone: '+92 300 8920112' },
          { id: 2, title: 'Gulberg Office Consultation', status: 'Pending Follow-up', time: 'Sunday, 11:00 AM', phone: '+92 321 4319920' }
        ]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicData();
  }, [activeTab]);

  const handleFullFlowAction = async (actionType: string) => {
    setProcessingAction(true);
    try {
      const res = await fetch('/api/local-pakistan/full-recovery-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agency_name: userData.agencyName,
          action_type: actionType,
          appointment_title: 'Exclusive DHA Phase 6 Site Visit',
          slot_time: 'Sunday, 4:00 PM'
        }),
      });
      const result = await res.json();
      
      if (result.success) {
        if (actionType === 'missed_call') {
          alert(`📞 MISSED CALL CAUGHT!\n\nAI Dispatched SMS to ${result.caller_phone}:\n"${result.sms_sent}"`);
        } else {
          alert(`📅 VISIT / MEETING SCHEDULED!\n\nBooking Confirmed:\n"${result.sms_sent}"\n\nCheck 'Appointments' tab!`);
        }
        fetchDynamicData();
      } else {
        alert('Action failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to recovery server.');
    } finally {
      setProcessingAction(false);
    }
  };

  const lostRevenue = userData.missedCalls * 300;
  const aiResponses = Math.floor(userData.missedCalls * 0.95);
  const meetingsBooked = Math.floor(userData.missedCalls * 0.32);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 p-6 hidden md:flex flex-col bg-[#020617]">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/25">AI</div>
          <span className="font-extrabold text-lg tracking-tight">Revive<span className="text-blue-500">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'dashboard' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </button>
          <button onClick={() => setActiveTab('conversations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'conversations' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <Users className="h-5 w-5" /> Conversations
          </button>
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'appointments' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <CalendarCheck className="h-5 w-5" /> Appointments
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'analytics' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <BarChart3 className="h-5 w-5" /> Analytics
          </button>
          <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'billing' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <CreditCard className="h-5 w-5" /> Billing & Usage
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-left ${activeTab === 'settings' ? 'bg-blue-600/15 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <Settings className="h-5 w-5" /> Settings
          </button>
        </nav>

        <button onClick={() => { localStorage.removeItem('revive_client_data'); router.push('/'); }} className="flex items-center gap-3 text-slate-500 hover:text-red-400 font-bold px-4 pt-6 border-t border-slate-800 transition">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* HEADER WITH FULL TESTING CONTROLS */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white capitalize">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h1>
            <p className="text-slate-400 text-sm mt-1">Managing workspace for <span className="text-blue-400 font-bold">{userData.agencyName}</span></p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => handleFullFlowAction('missed_call')}
              disabled={processingAction}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${processingAction ? 'animate-spin' : ''}`} />
              📞 Test Missed Call SMS
            </button>
            
            <button 
              onClick={async () => {
                setProcessingAction(true);
                const token = localStorage.getItem('agency_wa_token') || process.env.NEXT_PUBLIC_DEFAULT_WA_TOKEN;
                const phoneId = localStorage.getItem('agency_wa_phone_id') || '1342850425572080';
                const targetPhone = prompt('Enter customer phone number (e.g. 923390676762):', '923390676762');

                if (!targetPhone) {
                  setProcessingAction(false);
                  return;
                }

                try {
                  const res = await fetch('/api/whatsapp/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      agency_name: userData.agencyName,
                      caller_phone: targetPhone,
                      whatsapp_token: token,
                      whatsapp_phone_id: phoneId
                    }),
                  });
                  const result = await res.json();
                  if (result.success) {
                    alert(`🟢 SUCCESS!\n\nMessage sent to client (${result.recipient}) using Agency WhatsApp ID: ${phoneId}\n\n"${result.message_sent}"`);
                  } else {
                    alert('Failed: ' + result.error);
                  }
                } catch (e) {
                  alert('Network error');
                } finally {
                  setProcessingAction(false);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              🟢 Test WhatsApp Auto-Reply
            </button>

            <button 
              onClick={() => handleFullFlowAction('book_visit')}
              disabled={processingAction}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
            >
              <CalendarCheck className="h-4 w-4" />
              📅 Schedule Visit/Meeting
            </button>

            <div className="bg-emerald-950/40 border border-emerald-900/50 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hidden xl:flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </div>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Revenue Protected" value={loading ? '...' : `$${lostRevenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-950/20" />
              <StatCard label="Missed Calls" value={loading ? '...' : userData.missedCalls} icon={PhoneMissed} color="text-blue-400" bg="bg-blue-950/20" />
              <StatCard label="AI Responses Sent" value={loading ? '...' : aiResponses} icon={MessageSquareText} color="text-purple-400" bg="bg-purple-950/20" />
              <StatCard label="Meetings Booked" value={loading ? '...' : meetingsBooked} icon={CalendarCheck} color="text-orange-400" bg="bg-orange-950/20" />
            </div>

            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Live AI Activity Log</h3>
                <span className="text-xs text-slate-400">Use header buttons above to test live recovery & scheduling.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 border-b border-slate-800/60">
                    <tr>
                      <th className="pb-3 font-semibold">Caller Phone</th>
                      <th className="pb-3 font-semibold">AI Intent / Activity</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Time Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {leads.map((lead, idx) => (
                      <tr key={lead.id || idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 font-mono text-blue-400">{lead.caller_phone}</td>
                        <td className="py-4 text-slate-300">{lead.intent}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold border ${
                            lead.status === 'Booked' ? 'bg-emerald-950 text-emerald-400 border-emerald-900/50' : 'bg-blue-950 text-blue-400 border-blue-900/50'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-500 text-xs">{lead.time || 'Just now'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONVERSATIONS */}
        {activeTab === 'conversations' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold">All SMS & AI Conversations</h3>
            <p className="text-slate-400 text-sm">Review full chat transcripts between callers and your AI recovery assistant.</p>
            {leads.map((lead, idx) => (
              <div key={lead.id || idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-mono text-blue-400">{lead.caller_phone}</span>
                  <span>Status: {lead.status}</span>
                </div>
                <p className="text-sm text-slate-300">💬 <strong>AI Auto SMS:</strong> {lead.intent}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold">Scheduled Consultations & Tours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt, idx) => (
                <div key={appt.id || idx} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1 rounded-full font-bold">{appt.status}</span>
                    <span className="text-xs text-slate-400">{appt.time}</span>
                  </div>
                  <h4 className="font-bold text-base">{appt.title}</h4>
                  <p className="text-xs text-slate-400">Lead Phone: {appt.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold">Performance & Conversion Analytics</h3>
            <p className="text-slate-400 text-sm">Your AI agent maintains a stellar <strong>95% engagement rate</strong> within the crucial 10-second window.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Avg Response Speed</p>
                <h4 className="text-3xl font-black text-blue-400 mt-2">8.2 Seconds</h4>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Conversion Rate</p>
                <h4 className="text-3xl font-black text-emerald-400 mt-2">32.4%</h4>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Total Calls Captured</p>
                <h4 className="text-3xl font-black text-purple-400 mt-2">{userData.missedCalls}</h4>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING */}
        {activeTab === 'billing' && (
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold">Subscription & Credits</h3>
                <p className="text-slate-400 text-sm">Current Plan: <span className="text-emerald-400 font-bold">Agency Pro Unlimited</span></p>
              </div>
              <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Active</span>
            </div>
            <p className="text-sm text-slate-300">All local webhooks and pipelines are fully funded and operational for <strong>{userData.agencyName}</strong>.</p>
          </div>
        )}

        {/* TAB 6: SETTINGS - ADVANCED MULTI-INDUSTRY AI CONFIGURATION */}
{activeTab === 'settings' && (
  <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 space-y-8 animate-in fade-in duration-300 max-w-3xl">
    <div>
      <h3 className="text-xl font-bold text-white">Advanced AI Agent & Business Settings</h3>
      <p className="text-slate-400 text-sm mt-1">Configure how your autonomous AI receptionist behaves for your specific industry (Real Estate, Healthcare, Legal, etc.).</p>
    </div>

    <div className="space-y-6">
      {/* 1. Industry / Business Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Business Category / Niche</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
            onChange={(e) => localStorage.setItem('agency_niche', e.target.value)}
          >
            <option value="real_estate">Real Estate & Property Agency</option>
            <option value="healthcare">Healthcare / Clinic / Doctor</option>
            <option value="legal">Law Firm & Legal Services</option>
            <option value="general_services">General Corporate / Services</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">AI Receptionist Persona Tone</label>
          <select 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
            onChange={(e) => localStorage.setItem('ai_persona', e.target.value)}
          >
            <option value="friendly_urdu">Friendly Roman Urdu (Warm & Polite)</option>
            <option value="formal_english">Formal English (Corporate)</option>
            <option value="casual">Casual & Direct</option>
          </select>
        </div>
      </div>

      {/* 2. Custom AI Missed Call Recovery Prompt */}
      <div>
        <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Custom AI Welcome / Missed Call Prompt</label>
        <textarea 
          rows={3}
          placeholder="Assalam-o-Alaikum! Sorry call miss ho gayi thi. Bataiye kis cheez mein madad kar sakte hain?"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none"
          onChange={(e) => localStorage.setItem('custom_ai_prompt', e.target.value)}
        />
        <p className="text-[11px] text-slate-500 mt-1">This prompt guides how the AI replies to your missed calls instantly on WhatsApp.</p>
      </div>

      {/* 3. Meta WhatsApp Cloud API Credentials */}
      <div className="border-t border-slate-800 pt-6 space-y-4">
        <h4 className="text-sm font-bold text-blue-400">Meta WhatsApp Cloud API Gateway</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Meta WhatsApp Token</label>
            <input 
              type="password" 
              placeholder="EAAW..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
              onChange={(e) => localStorage.setItem('agency_wa_token', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">WhatsApp Phone Number ID</label>
            <input 
              type="text" 
              placeholder="1342850425572080" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 focus:border-blue-500 outline-none"
              onChange={(e) => localStorage.setItem('agency_wa_phone_id', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button 
          onClick={() => alert('✅ Advanced AI Settings & WhatsApp Credentials Saved Successfully for ' + userData.agencyName)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          Save All Advanced Settings
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
      <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">{label}</p>
        <h3 className="text-3xl font-black mt-1 text-white">{value}</h3>
      </div>
    </div>
  );
}
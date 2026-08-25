'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Bot, Send, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: 'Apex Luxury Real Estate',
    email: 'admin@apexrealty.com',
    phone: '+1 (555) 392-0192',
    missedCalls: '45'
  });

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '👋 Hello! Sorry we missed your call. Are you looking to buy, sell, or rent a property?' }
  ]);

  const estimatedLoss = Number(formData.missedCalls) * 300;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && formData.agencyName) setStep(2);
  };

  const handleFunnelSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsDeploying(true);

  try {
    // API Route ko data bhejna
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    
    // Backup ke liye localStorage mein bhi save kar lein taake dashboard ko foran data mil jaye
    localStorage.setItem('revive_client_data', JSON.stringify(formData));
  } catch (err) {
    console.error('Database connection error:', err);
  }

  setTimeout(() => {
    router.push('/dashboard');
  }, 1500);
};

  const handleSimulatedChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let aiReply = `Got it! Let's schedule a quick call with our senior agent at ${formData.agencyName}.`;
      if (userText.toLowerCase().includes('buy') || userText.toLowerCase().includes('budget')) {
        aiReply = `Wonderful! We have matching properties in our inventory. Would you like a private tour this weekend?`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="border-b border-slate-900/80 sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/25">AI</div>
            <span className="font-extrabold text-xl tracking-tight text-white">Revive<span className="text-blue-500">AI</span></span>
          </div>
          <button onClick={() => router.push('/dashboard')} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            Dashboard
          </button>
        </div>
      </header>

      {/* HERO & FUNNEL */}
      <section className="relative pt-20 pb-24 px-6">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-400 text-xs font-semibold shadow-inner">
              <Zap className="h-3.5 w-3.5 animate-pulse" /> Autonomous Voice & SMS Recovery
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08]">
              Turn Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Missed Call</span> Into a Booked Client in 10s.
            </h1>

            <div className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
              
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
                <div className={`h-full bg-blue-500 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
              </div>

              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-6 pt-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-white">Step 1: Calculate Leakage</h3>
                      <p className="text-xs text-slate-400">How many calls do you miss?</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400 font-mono">${estimatedLoss.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Lost Monthly</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input 
                      type="range" min="10" max="150" 
                      value={formData.missedCalls} 
                      onChange={(e) => setFormData({...formData, missedCalls: e.target.value})}
                      className="w-full accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <p className="text-sm font-bold text-blue-400 text-center">{formData.missedCalls} Missed Calls / month</p>
                  </div>

                  <input 
                    type="text" required placeholder="Your Agency Name" 
                    value={formData.agencyName} onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:border-blue-500 outline-none text-slate-200" 
                  />

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    Continue to Setup <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              )}

              {step === 2 && !isDeploying && (
                <form onSubmit={handleFunnelSubmit} className="space-y-5 pt-2">
                  <div className="border-b border-slate-800 pb-4">
                    <h3 className="font-bold text-lg text-white">Step 2: Account Details</h3>
                    <p className="text-xs text-slate-400">Where should we send the AI leads?</p>
                  </div>

                  <input 
                    type="email" required placeholder="Business Email" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:border-blue-500 outline-none text-slate-200" 
                  />
                  <input 
                    type="tel" required placeholder="Phone Number (for SMS alerts)" 
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:border-blue-500 outline-none text-slate-200" 
                  />

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700">Back</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                      Deploy AI Dashboard <Zap className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}

              {isDeploying && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                  <h3 className="text-xl font-bold text-white">Provisioning AI Workspace...</h3>
                  <p className="text-sm text-slate-400">Configuring SMS Webhooks for {formData.agencyName}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Simulator */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
              <div className="absolute -top-3 right-6 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" /> AI Simulator
              </div>
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4 pt-2">
                <div className="h-9 w-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">AI</div>
                <div>
                  <h4 className="text-sm font-bold text-white">{formData.agencyName || 'Your Agency'} Assistant</h4>
                  <p className="text-[11px] text-emerald-400">Online & Listening</p>
                </div>
              </div>
              <div className="h-[280px] overflow-y-auto space-y-3 pr-1 text-xs mb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSimulatedChat} className="flex gap-2 bg-slate-950 border border-slate-800 p-2 rounded-2xl">
                <input 
                  type="text" placeholder="Type a message..." 
                  value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs px-3 py-2 flex-1 text-slate-200"
                />
                <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-xl"><Send className="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
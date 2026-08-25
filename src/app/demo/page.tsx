'use client';

import { useState } from 'react';
import { PhoneMissed, Sparkles, Send } from 'lucide-react';

export default function DemoPage() {
  const [phone, setPhone] = useState('+15550199283');
  const [business, setBusiness] = useState('Apex Luxury Real Estate');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<any>(null);

  const triggerMissedCallSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerPhone: phone, businessName: business, customerMessage: '[Missed Call Event]' }),
      });
      const data = await res.json();
      setLog(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Zero-Cost Demo Mode
          </div>
          <h1 className="text-2xl font-black">AI Missed-Call Simulator</h1>
          <p className="text-slate-400 text-sm">Test the 10-second AI recovery response without paying for Twilio.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Business Name</label>
            <input 
              type="text" 
              value={business} 
              onChange={(e) => setBusiness(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Caller Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          <button 
            onClick={triggerMissedCallSimulation}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-sm"
          >
            <PhoneMissed className="h-4 w-4" /> {loading ? 'Simulating AI Response...' : 'Simulate Missed Call & Trigger AI'}
          </button>
        </div>

        {log && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Status: <strong className="text-emerald-400">Success (Simulated)</strong></span>
              <span>Target: {log.leadPhone}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Generated AI SMS Response:</p>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl mt-1 text-sm text-blue-300 font-medium">
                💬 &ldquo;{log.sentMessage}&rdquo;
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
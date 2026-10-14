import type { FC } from 'react';
import { getCurrentPersonaKey, switchPersona } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { Users, Database, Sparkles, ShieldCheck } from 'lucide-react';

export const DemoBanner: FC = () => {
  const currentKey = getCurrentPersonaKey();
  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold bg-amber-400 text-slate-950 uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3" /> Hackathon Demo Mode
          </span>
          <span className="text-slate-300 hidden md:inline">
            Sample records are transparently labeled <strong className="text-white">[DEMO DATA]</strong>.
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 pl-2 border-l border-slate-700">
            <Database className="w-3 h-3 text-emerald-400" />
            {supabaseActive ? (
              <span className="text-emerald-300">Supabase: Connected</span>
            ) : (
              <span className="text-slate-300">Storage: Local Persistent (Offline Ready)</span>
            )}
          </span>
        </div>

        {/* Demo Persona Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Switch Profile:
          </span>
          <button
            onClick={() => switchPersona('student-priya')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              currentKey === 'student-priya'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="3rd Year Computer Science student specialized in React & TypeScript"
          >
            Priya (CS 3rd Yr • Web)
          </button>

          <button
            onClick={() => switchPersona('student-aarav')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              currentKey === 'student-aarav'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="2nd Year Data Science student specialized in Python, SQL & ML"
          >
            Aarav (DS 2nd Yr • AI)
          </button>

          <button
            onClick={() => switchPersona('admin-user')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              currentKey === 'admin-user'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Administrator role for verifying and curating opportunities"
          >
            <ShieldCheck className="w-3 h-3" /> Admin
          </button>
        </div>
      </div>
    </div>
  );
};

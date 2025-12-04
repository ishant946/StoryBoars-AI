import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';

interface ScriptInputProps {
  onAnalyze: (script: string) => void;
  isAnalyzing: boolean;
}

export const ScriptInput: React.FC<ScriptInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [script, setScript] = useState('');

  const handleAnalyze = () => {
    if (!script.trim()) return;
    onAnalyze(script);
  };

  const placeholderText = `Paste your script here...

Example:
A man walks into a dark alley. Suddenly, he hears footsteps. A shadowy figure appears.

Scene 2:
The figure steps into the light. It's an old friend holding a map. The tension breaks.
`;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-8">
      <div className="bg-slate-800 rounded-2xl p-1 shadow-2xl border border-slate-700/50">
        <div className="bg-slate-900 rounded-xl overflow-hidden relative group">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
               <FileText className="w-5 h-5 text-indigo-400" />
               <span className="font-semibold text-sm tracking-wide">Script Input</span>
            </div>
            <button 
              onClick={() => setScript('')} 
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-64 bg-slate-900 text-slate-200 p-6 focus:outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder={placeholderText}
          />

          <div className="p-4 bg-slate-800/50 flex justify-end">
             <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !script.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/20"
             >
               {isAnalyzing ? (
                 <>
                   <Sparkles className="w-4 h-4 animate-spin" /> Analyzing Script...
                 </>
               ) : (
                 <>
                   Analyze & Generate Plan <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-6 text-slate-500 text-xs">
        <p>Supports raw text, screenplays, and timestamped logs.</p>
      </div>
    </div>
  );
};
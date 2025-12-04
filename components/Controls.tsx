import React from 'react';
import { AspectRatio, ImageStyle } from '../types';
import { Settings, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ControlsProps {
  currentStyle: ImageStyle;
  currentRatio: AspectRatio;
  onStyleChange: (style: ImageStyle) => void;
  onRatioChange: (ratio: AspectRatio) => void;
  onDownloadAll: () => void;
  canDownload: boolean;
  totalScenes: number;
}

const STYLES: ImageStyle[] = [
  'Cinematic', 'Realistic', 'Anime', 'Watercolor', 'Cyberpunk', 'Noir', 'Sketch', '3D Render'
];

const RATIOS: AspectRatio[] = ['16:9', '1:1', '9:16', '4:3', '3:4'];

export const Controls: React.FC<ControlsProps> = ({
  currentStyle,
  currentRatio,
  onStyleChange,
  onRatioChange,
  onDownloadAll,
  canDownload,
  totalScenes
}) => {
  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 py-4 px-4 md:px-6 shadow-lg mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo / Title Area */}
        <div className="flex items-center gap-2 text-indigo-400">
          <ImageIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight text-white">StoryBoard AI</h1>
          {totalScenes > 0 && (
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
              {totalScenes} Scenes
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 justify-center">
          
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <span className="pl-2 text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Style
            </span>
            <select 
              value={currentStyle}
              onChange={(e) => onStyleChange(e.target.value as ImageStyle)}
              className="bg-transparent text-sm text-white focus:outline-none p-1.5 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {STYLES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <span className="pl-2 text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3" /> Ratio
            </span>
            <select 
              value={currentRatio}
              onChange={(e) => onRatioChange(e.target.value as AspectRatio)}
              className="bg-transparent text-sm text-white focus:outline-none p-1.5 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {RATIOS.map(r => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div>
           <button
            onClick={onDownloadAll}
            disabled={!canDownload}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              canDownload 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
};
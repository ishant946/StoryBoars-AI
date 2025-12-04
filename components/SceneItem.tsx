import React, { useState, useEffect } from 'react';
import { Scene, ImageStyle, AspectRatio } from '../types';
import { generateSceneImage } from '../services/gemini';
import { RefreshCw, Download, Edit2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface SceneItemProps {
  scene: Scene;
  index: number;
  globalStyle: ImageStyle;
  aspectRatio: AspectRatio;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
}

export const SceneItem: React.FC<SceneItemProps> = ({
  scene,
  index,
  globalStyle,
  aspectRatio,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(scene.visualPrompt);

  const handleGenerate = async () => {
    onUpdate(scene.id, { status: 'generating_image', error: undefined });
    try {
      const imageUrl = await generateSceneImage(scene.visualPrompt, globalStyle, aspectRatio);
      onUpdate(scene.id, { imageUrl, status: 'completed' });
    } catch (err) {
      onUpdate(scene.id, { 
        status: 'error', 
        error: 'Failed to generate image. Please try again.' 
      });
    }
  };

  const handleSavePrompt = () => {
    onUpdate(scene.id, { visualPrompt: editedPrompt });
    setIsEditing(false);
  };

  // Auto-generate on first load if ready
  useEffect(() => {
    if (scene.status === 'ready_to_generate') {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.status]); 

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-300 group flex flex-col md:flex-row h-full">
      
      {/* Scene Content (Left/Top) */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2 py-1 rounded border border-indigo-500/20">
              SCENE {index + 1}
            </span>
            <div className="h-px w-8 bg-slate-700"></div>
          </div>
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            {scene.status.replace('_', ' ')}
          </div>
        </div>

        {/* Original Script */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "{scene.originalText}"
          </p>
        </div>

        {/* Visual Prompt Editor */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
              <SparklesIcon className="w-3 h-3 text-amber-400" />
              Visual Prompt
            </label>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => { setIsEditing(false); setEditedPrompt(scene.visualPrompt); }}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePrompt}
                  className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-500"
                >
                  Save Prompt
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-slate-700 pl-3">
              {scene.visualPrompt}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-auto border-t border-slate-800 flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={scene.status === 'generating_image'}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {scene.status === 'generating_image' ? (
               <RefreshCw className="w-3 h-3 animate-spin" />
             ) : (
               <RefreshCw className="w-3 h-3" />
             )}
             {scene.imageUrl ? 'Regenerate' : 'Generate Image'}
          </button>
        </div>
      </div>

      {/* Image Preview (Right/Bottom) */}
      <div className="md:w-1/3 min-h-[250px] bg-black relative border-l border-slate-700 flex items-center justify-center group/image">
        {scene.status === 'generating_image' ? (
           <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
             <span className="text-xs text-indigo-400 animate-pulse">Creating Visuals...</span>
           </div>
        ) : scene.imageUrl ? (
          <>
            <img 
              src={scene.imageUrl} 
              alt={`Scene ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button 
                 onClick={() => {
                   const link = document.createElement('a');
                   link.href = scene.imageUrl!;
                   link.download = `scene-${index+1}.png`;
                   link.click();
                 }}
                 className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm text-white transition-all transform hover:scale-110"
                 title="Download Image"
               >
                 <Download className="w-5 h-5" />
               </button>
               <button 
                 onClick={() => window.open(scene.imageUrl, '_blank')}
                 className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm text-white transition-all transform hover:scale-110"
                 title="View Fullscreen"
               >
                 <ImageIcon className="w-5 h-5" />
               </button>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/50 text-white/80 text-[10px] px-2 py-0.5 rounded backdrop-blur-md">
                {aspectRatio}
              </span>
            </div>
          </>
        ) : scene.status === 'error' ? (
          <div className="text-red-400 flex flex-col items-center gap-2 text-center p-4">
            <AlertCircle className="w-8 h-8" />
            <p className="text-xs">{scene.error || 'Error generating image'}</p>
          </div>
        ) : (
          <div className="text-slate-600 flex flex-col items-center gap-2">
            <ImageIcon className="w-10 h-10 opacity-20" />
            <span className="text-xs uppercase tracking-widest opacity-50">Waiting for Gen</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icon
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

import React, { useState, useCallback } from 'react';
import { Controls } from './components/Controls';
import { ScriptInput } from './components/ScriptInput';
import { SceneItem } from './components/SceneItem';
import { analyzeScript } from './services/gemini';
import { Scene, ImageStyle, AspectRatio } from './types';
import { v4 as uuidv4 } from 'uuid'; // Using simple random fallback if uuid not available, but let's implement simple ID gen

// Simple ID generator to avoid 'uuid' dependency if not installed
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalStyle, setGlobalStyle] = useState<ImageStyle>('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async (script: string) => {
    setIsAnalyzing(true);
    try {
      const analyzedScenes = await analyzeScript(script);
      
      const newScenes: Scene[] = analyzedScenes.map(s => ({
        ...s,
        id: generateId(),
        status: 'ready_to_generate' // Automatically mark ready to trigger effect in item
      }));
      
      setScenes(newScenes);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze script. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (!window.JSZip || !window.saveAs) {
      alert("ZIP library not loaded. Please refresh the page.");
      return;
    }

    const zip = new window.JSZip();
    const folder = zip.folder("storyboard_images");
    let count = 0;

    scenes.forEach((scene, index) => {
      if (scene.imageUrl) {
        // Convert data URL to blob
        const base64Data = scene.imageUrl.split(',')[1];
        folder.file(`scene_${index + 1}.png`, base64Data, { base64: true });
        count++;
      }
    });

    if (count === 0) {
      alert("No images generated yet to download.");
      return;
    }

    const content = await zip.generateAsync({ type: "blob" });
    window.saveAs(content, "storyboard.zip");
  }, [scenes]);

  // Restart flow
  const handleReset = () => {
    if(confirm("Start over? This will clear all generated images.")) {
      setScenes([]);
      setHasAnalyzed(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Header / Controls */}
      <Controls 
        currentStyle={globalStyle}
        currentRatio={aspectRatio}
        onStyleChange={setGlobalStyle}
        onRatioChange={setAspectRatio}
        onDownloadAll={handleDownloadAll}
        canDownload={scenes.some(s => s.imageUrl)}
        totalScenes={scenes.length}
      />

      <main className="container mx-auto px-4 md:px-6">
        
        {/* State 1: Input */}
        {!hasAnalyzed && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
            <div className="text-center mb-8 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-4 tracking-tight">
                Turn Scripts into Storyboards
              </h2>
              <p className="text-slate-400 text-lg">
                Paste your video script, and our AI will detect scenes and generate production-ready visuals instantly.
              </p>
            </div>
            <ScriptInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {/* State 2: Results Grid */}
        {hasAnalyzed && (
          <div className="animate-slideUp">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Generated Scenes</h3>
                <button 
                  onClick={handleReset}
                  className="text-sm text-slate-500 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
                >
                  Analyze New Script
                </button>
             </div>

             <div className="grid grid-cols-1 gap-6">
               {scenes.map((scene, index) => (
                 <SceneItem 
                   key={scene.id}
                   index={index}
                   scene={scene}
                   globalStyle={globalStyle}
                   aspectRatio={aspectRatio}
                   onUpdate={handleUpdateScene}
                 />
               ))}
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
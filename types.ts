export interface Scene {
  id: string;
  originalText: string;
  visualPrompt: string;
  imageUrl?: string;
  status: 'pending' | 'generating_prompt' | 'ready_to_generate' | 'generating_image' | 'completed' | 'error';
  error?: string;
}

export type AspectRatio = '16:9' | '1:1' | '9:16' | '4:3' | '3:4';

export type ImageStyle = 
  | 'Cinematic'
  | 'Realistic'
  | 'Anime'
  | 'Watercolor'
  | 'Cyberpunk'
  | 'Noir'
  | 'Sketch'
  | '3D Render';

export interface AppState {
  script: string;
  scenes: Scene[];
  globalStyle: ImageStyle;
  aspectRatio: AspectRatio;
  isAnalyzing: boolean;
}

// Global definition for JSZip and saveAs since we load them via CDN
declare global {
  interface Window {
    JSZip: any;
    saveAs: any;
  }
}
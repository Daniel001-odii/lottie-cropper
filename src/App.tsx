import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, UploadCloud, FileEdit, MonitorPlay, Trash2 } from 'lucide-react';
import { LottiePlayer } from './components/LottiePlayer';
import { CropperStage, CropState } from './components/CropperStage';
import { cropLottieJSON } from './utils/lottieCrop';

function App() {
  const [lottieJson, setLottieJson] = useState<any>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Crop state in percentages (0-100)
  const [crop, setCrop] = useState<CropState>({ x: 10, y: 10, w: 80, h: 80 });
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (typeof json.w === 'number' && typeof json.h === 'number') {
            setLottieJson(json);
            setFileName(file.name);
            setCrop({ x: 10, y: 10, w: 80, h: 80 });
            setPreviewMode(false);
          } else {
            alert('Invalid Lottie JSON: Missing width (w) or height (h) properties.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
  } as any);

  const croppedJson = useMemo(() => {
    if (!lottieJson) return null;
    return cropLottieJSON(lottieJson, crop);
  }, [lottieJson, crop]);

  const handleDownload = () => {
    if (!croppedJson) return;
    
    const blob = new Blob([JSON.stringify(croppedJson)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.json', '-cropped.json') || 'cropped.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setLottieJson(null);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileEdit className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lottie Cropper</h1>
          </div>
        </div>
        {lottieJson && (
          <button 
            onClick={clearFile}
            className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear File
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {!lottieJson ? (
          /* Empty State / Upload */
          <div className="flex-1 flex items-center justify-center p-8">
            <div 
              {...getRootProps()} 
              className={`w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-200">Upload Lottie JSON</h3>
                <p className="text-sm text-slate-500 mt-1">Drag and drop your file here, or click to browse</p>
              </div>
            </div>
          </div>
        ) : (
          /* Editor Layout */
          <>
            {/* Stage Area */}
            <div className="flex-1 flex flex-col bg-slate-900/20 items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden relative">
              <div className="flex items-center gap-2 absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 p-1.5 rounded-full border border-white/5 shadow-xl z-20">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !previewMode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2"><FileEdit className="w-4 h-4"/> Edit Crop</span>
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    previewMode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2"><MonitorPlay className="w-4 h-4"/> Preview</span>
                </button>
              </div>
              
              <div className="flex-1 w-full h-full flex items-center justify-center p-8 mt-12 min-h-0 min-w-0">
                {/* Visual containment to preserve aspect ratio strictly */}
                <div 
                  className="bg-transparent shadow-2xl rounded-sm border border-white/10 relative flex-none"
                  style={{ 
                     // We size the wrapper to maximize filling available space while keeping aspect ratio.
                     aspectRatio: previewMode ? `${croppedJson.w} / ${croppedJson.h}` : `${lottieJson.w} / ${lottieJson.h}`,
                     maxHeight: '100%',
                     maxWidth: '100%',
                     height: previewMode ? (croppedJson.w > croppedJson.h ? 'auto' : '100%') : (lottieJson.w > lottieJson.h ? 'auto' : '100%'),
                     width: previewMode ? (croppedJson.w > croppedJson.h ? '100%' : 'auto') : (lottieJson.w > lottieJson.h ? '100%' : 'auto')
                  }}
                >
                  {!previewMode ? (
                     <CropperStage crop={crop} onChange={setCrop}>
                       <LottiePlayer 
                         animationData={lottieJson} 
                         className="absolute inset-0 w-full h-full pointer-events-none" 
                       />
                     </CropperStage>
                  ) : (
                     <LottiePlayer 
                       animationData={croppedJson} 
                       className="absolute inset-0 w-full h-full pointer-events-none z-10" 
                     />
                  )}
                  {/* Subtle checkerboard backing for transparency */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] z-[-1] rounded" />
                </div>
              </div>
            </div>

            {/* Right Sidebar Toolbar */}
            <div className="w-full lg:w-80 bg-slate-950 flex flex-col p-6 gap-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Original Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Width</div>
                    <div className="text-lg font-mono">{lottieJson.w}px</div>
                  </div>
                  <div className="bg-slate-900 border border-white/5 p-3 rounded-xl">
                    <div className="text-xs text-slate-500 mb-1">Height</div>
                    <div className="text-lg font-mono">{lottieJson.h}px</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Export Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl">
                    <div className="text-xs text-emerald-500 mb-1">New Width</div>
                    <div className="text-lg font-mono text-emerald-400">{croppedJson?.w}px</div>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl">
                    <div className="text-xs text-emerald-500 mb-1">New Height</div>
                    <div className="text-lg font-mono text-emerald-400">{croppedJson?.h}px</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                >
                  <Download className="w-5 h-5" /> Download Cropped JSON
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

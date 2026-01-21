import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Upload, ArrowLeft, FileImage, Loader2, AlertCircle, Sparkles, Image as ImageIcon, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { analyzeScreenshotWithAI } from '../utils/aiAnalysis';

interface UploadPageProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function UploadPage({ onNavigate }: UploadPageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setIsImageLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setUploadedImage(imageDataUrl);
      setIsImageLoading(false);
      startAnalysis(imageDataUrl);
    };
    reader.onerror = () => {
      setIsImageLoading(false);
      setError('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const downsampleImage = (dataUrl: string, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const startAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 5;
      });
    }, 600);

    try {
      const processedImage = await downsampleImage(imageDataUrl, 1200);
      const result = await analyzeScreenshotWithAI(processedImage, analysisContext);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const analysisData = {
        screenshot: imageDataUrl,
        annotations: result.annotations,
        designType: result.designType,
        analysisMode: result.mode,
      };

      setTimeout(() => {
        setIsAnalyzing(false);
        onNavigate('dashboard', analysisData);
      }, 1200);

    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      setProgress(0);
      setIsAnalyzing(false);
      setError('Analysis failed. Try a smaller file.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => onNavigate('landing')}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-semibold">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">V3 Engine Active</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isAnalyzing ? (
            <motion.div
              key="upload-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <div className="text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Audit Your Design</h1>
                <p className="text-slate-500 font-medium">Get instant accessibility & UX feedback.</p>
              </div>

              {/* Minimal Upload Card */}
              <Card 
                className={`relative group p-1 w-full border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white rounded-[40px] overflow-hidden transition-all duration-500 ${
                  isDragOver ? 'scale-[1.02]' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-12 border-2 border-dashed border-slate-100 rounded-[39px] flex flex-col items-center group-hover:border-indigo-200 transition-colors">
                  <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-8 group-hover:bg-indigo-50 transition-colors duration-500">
                    <FileImage className="w-10 h-10 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="text-center mb-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Drop your design here</h3>
                    <p className="text-sm text-slate-400 font-medium">Supports High-Res PNG or JPG</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                        Choose File
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </Card>

              {/* Subtle Context Field */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-slate-50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional Intent</span>
                </div>
                <input 
                  type="text"
                  placeholder="e.g. 'Audit this for accessibility'..."
                  className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder:text-slate-300 text-slate-600"
                  value={analysisContext}
                  onChange={(e) => setAnalysisContext(e.target.value)}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analyzing-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Card className="w-full p-10 bg-white border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] rounded-[48px] overflow-hidden relative">
                {/* Scanning Light Effect */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent z-10 pointer-events-none"
                />

                <div className="flex flex-col items-center relative z-20">
                  <div className="w-32 h-44 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-10 shadow-inner flex items-center justify-center relative">
                    {uploadedImage && (
                      <ImageWithFallback 
                        src={uploadedImage} 
                        alt="Scanning" 
                        className="w-full h-full object-cover opacity-60 blur-[1px]" 
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Analyzing Pixels</h2>
                  <p className="text-slate-400 font-medium text-sm mb-10 text-center max-w-xs">
                    Our AI is running 18-point WCAG checks and visual hierarchy simulations.
                  </p>

                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Progress</span>
                      <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full bg-slate-50" />
                  </div>
                </div>
              </Card>

              {/* Subtle status messages */}
              <motion.p 
                key={Math.floor(progress / 25)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest"
              >
                {progress < 30 && "Mapping visual structure..."}
                {progress >= 30 && progress < 60 && "Calculating contrast ratios..."}
                {progress >= 60 && progress < 90 && "Simulating ocular focus..."}
                {progress >= 90 && "Generating remediation fixes..."}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mt-12 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">{error}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:bg-red-100"
              onClick={() => { setUploadedImage(null); setIsAnalyzing(false); setError(null); }}
            >
              Reset
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

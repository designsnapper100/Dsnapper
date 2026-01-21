import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  Eye,
  Accessibility,
  Layout,
  Palette,
  Megaphone,
  Sparkles,
  Flame,
  MousePointer2,
  Loader2,
  Copy,
  Check,
  X,
  Printer
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeatmapCanvas } from './HeatmapCanvas';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner@2.0.3";

interface Annotation {
  id: number;
  x: number;
  y: number;
  type: 'accessibility' | 'usability' | 'consistency' | 'visual' | 'marketing';
  severity: 'critical' | 'minor';
  title: string;
  description: string;
  fix: string;
}

interface AnnotationDashboardProps {
  onNavigate: (screen: string, data?: any) => void;
  data: {
    screenshot: string;
    annotations: Annotation[];
    designType: string;
    analysisMode?: string;
  };
}

export function AnnotationDashboard({ onNavigate, data }: AnnotationDashboardProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'annotations' | 'heatmap'>('annotations');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          setDimensions({ width, height });
        }
      };
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      const img = containerRef.current.querySelector('img');
      if (img) {
        if (img.complete) updateDimensions();
        else img.onload = updateDimensions;
      }
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [data.screenshot]);

  useEffect(() => {
    if (selectedAnnotation !== null) {
      const element = document.getElementById(`annotation-${selectedAnnotation}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedAnnotation]);

  const copyToClipboard = async (text: string) => {
    try {
      // Primary method: Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback method: Temporary textarea (works in many restricted environments)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            screenshot: data.screenshot,
            annotations: data.annotations,
            designType: data.designType,
            analysisMode: data.analysisMode
          })
        }
      );

      if (!response.ok) throw new Error('Failed to share');

      const { shareId } = await response.json();
      const baseUrl = window.location.origin + window.location.pathname;
      const fullShareUrl = `${baseUrl}?reportId=${shareId}`;
      
      setShareUrl(fullShareUrl);
      setShowShareModal(true);
      
      const success = await copyToClipboard(fullShareUrl);
      if (success) {
        toast.success("Sharable link ready and copied!");
      } else {
        toast.info("Link generated! View share options below.");
      }
    } catch (err) {
      console.error('Sharing error:', err);
      toast.error("Could not generate share link.");
    } finally {
      setIsSharing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'minor': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'minor': return 'Minor';
      default: return severity;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accessibility': return <Accessibility className="w-4 h-4" />;
      case 'usability': return <Eye className="w-4 h-4" />;
      case 'consistency': return <Layout className="w-4 h-4" />;
      case 'visual': return <Palette className="w-4 h-4" />;
      case 'marketing': return <Megaphone className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredAnnotations = activeTab === 'all' 
    ? data.annotations 
    : data.annotations.filter(annotation => annotation.type === activeTab);

  const stats = {
    total: data.annotations.length,
    critical: data.annotations.filter(a => a.severity === 'critical').length,
    minor: data.annotations.filter(a => a.severity === 'minor').length,
    accessibility: data.annotations.filter(a => a.type === 'accessibility').length,
    usability: data.annotations.filter(a => a.type === 'usability').length,
    consistency: data.annotations.filter(a => a.type === 'consistency').length,
    visual: data.annotations.filter(a => a.type === 'visual').length,
    marketing: data.annotations.filter(a => a.type === 'marketing').length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 shadow-2xl border-primary/20 bg-background relative">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-slate-900">
              <Share2 className="w-5 h-5 text-primary" />
              Report Link Ready
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this link with your team to view the interactive audit.
            </p>
            <div className="flex gap-2 mb-6">
              <div className="flex-1 bg-muted p-3 rounded-lg border border-border overflow-hidden">
                <code className="text-[11px] break-all text-primary font-mono">{shareUrl}</code>
              </div>
              <Button 
                variant="default" 
                size="icon" 
                className="shrink-0 h-auto"
                onClick={async () => {
                  const success = await copyToClipboard(shareUrl);
                  if (success) toast.success("Copied to clipboard!");
                  else toast.error("Please copy the link manually");
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background sticky top-0 z-50">
        <div className="max-w-full px-6 py-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Upload New
          </Button>
          <div className="flex items-center gap-4">
            {data.analysisMode === 'simulated' || data.analysisMode === 'mock' || data.analysisMode === 'demo' ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1 font-medium">
                <Info className="w-3 h-3" />
                Demo Mode
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1 font-medium">
                <Sparkles className="w-3 h-3" />
                Live AI
              </Badge>
            )}
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              <Button 
                variant={viewMode === 'annotations' ? 'default' : 'ghost'} 
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setViewMode('annotations')}
              >
                <MousePointer2 className="w-3.5 h-3.5" />
                Annotations
              </Button>
              <Button 
                variant={viewMode === 'heatmap' ? 'default' : 'ghost'} 
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setViewMode('heatmap')}
              >
                <Flame className="w-3.5 h-3.5" />
                Spectral Heatmap
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onNavigate('report', data)} className="h-9">
                <Printer className="w-4 h-4 mr-2" />
                Generate 1-Page PDF
              </Button>
              <Button 
                variant="outline" 
                className="h-9 min-w-[120px]" 
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share Link
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Screenshot Panel */}
        <div className="flex-1 p-6 bg-muted/20 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-semibold mb-2">
                  {viewMode === 'annotations' ? 'Design Analysis Results' : 'Visual Attention Heatmap'}
                </h1>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-100">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">{stats.critical} Critical</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">{stats.minor} Minor</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Display Mode</p>
                <p className="text-sm font-medium">{viewMode === 'annotations' ? 'Issue Markers' : 'Ocular Heatmap'}</p>
              </div>
            </div>
            
            <Card className={`p-8 shadow-xl border-border/40 relative overflow-hidden group transition-colors duration-500 ${
              viewMode === 'heatmap' ? 'bg-slate-900' : 'bg-white'
            }`}>
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] pointer-events-none" />
              <div className="relative inline-block max-w-full" ref={containerRef}>
                <ImageWithFallback 
                  src={data.screenshot}
                  alt="Analyzed design asset"
                  className={`max-w-full w-auto h-auto rounded-lg shadow-sm border border-border/10 transition-all duration-700 ${
                    viewMode === 'heatmap' ? 'opacity-80' : ''
                  }`}
                  style={{ maxWidth: '100%' }}
                />
                
                {/* High Quality Canvas Heatmap */}
                {viewMode === 'heatmap' && dimensions.width > 0 && (
                  <HeatmapCanvas 
                    annotations={data.annotations}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="absolute inset-0 pointer-events-none rounded-lg transition-opacity duration-700 animate-in fade-in"
                  />
                )}

                {/* Annotation Pins */}
                {viewMode === 'annotations' && filteredAnnotations.map((annotation) => (
                  <button
                    key={annotation.id}
                    className={`absolute w-9 h-9 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-125 z-10 ${
                      getSeverityColor(annotation.severity)
                    } ${
                      selectedAnnotation === annotation.id ? 'ring-4 ring-primary/40 scale-125 z-20' : 'opacity-90'
                    }`}
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedAnnotation(
                      selectedAnnotation === annotation.id ? null : annotation.id
                    )}
                  >
                    <span className="text-sm text-white font-bold">{annotation.id}</span>
                  </button>
                ))}
              </div>
            </Card>
            
            {viewMode === 'heatmap' && (
              <div className="mt-6 p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Spectral Attention Analytics</h2>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      Our AI-driven spectral analysis visualizes visual friction. <span className="text-red-500 font-extrabold">Red areas</span> signify high-severity issue density where design failure is likely. <span className="text-blue-400 font-extrabold">Blue/Green zones</span> represent moderate points of interest.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-border bg-background shadow-2xl z-40">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">AI Insights Sidebar</h2>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-tight">Real-time</Badge>
              </div>
              
              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                  <TabsTrigger value="all" className="text-[10px] uppercase font-bold">All ({stats.total})</TabsTrigger>
                  <TabsTrigger value="accessibility" className="text-[10px] uppercase font-bold">A11y ({stats.accessibility})</TabsTrigger>
                  <TabsTrigger value="usability" className="text-[10px] uppercase font-bold">Design ({stats.usability})</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="consistency" className="text-[10px] uppercase font-bold">Style ({stats.consistency})</TabsTrigger>
                  <TabsTrigger value="visual" className="text-[10px] uppercase font-bold">Visual ({stats.visual})</TabsTrigger>
                  <TabsTrigger value="marketing" className="text-[10px] uppercase font-bold">Ads ({stats.marketing})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Issues List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
              {filteredAnnotations.length > 0 ? (
                filteredAnnotations.map((annotation) => (
                  <Card
                    key={annotation.id}
                    id={`annotation-${annotation.id}`}
                    className={`p-5 cursor-pointer transition-all duration-300 border-l-4 ${
                      annotation.severity === 'critical' ? 'border-l-red-500' : 'border-l-blue-500'
                    } ${
                      selectedAnnotation === annotation.id ? 'bg-primary/10 shadow-lg scale-[1.02] border-transparent' : 'hover:bg-muted/30'
                    }`}
                    onClick={() => {
                      setSelectedAnnotation(
                        selectedAnnotation === annotation.id ? null : annotation.id
                      );
                      setViewMode('annotations'); 
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-7 h-7 rounded-full ${getSeverityColor(annotation.severity)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <span className="text-xs text-white font-bold">{annotation.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="p-1 bg-muted rounded">
                            {getTypeIcon(annotation.type)}
                          </div>
                          <h3 className="font-semibold text-sm leading-tight flex-1">{annotation.title}</h3>
                          <Badge variant={getSeverityBadgeVariant(annotation.severity)} className="text-[10px] px-1.5 py-0 h-5">
                            {getSeverityLabel(annotation.severity)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                          {annotation.description}
                        </p>
                        <div className="p-3 bg-green-50/50 border border-green-100 rounded-md">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3 h-3 text-green-600" />
                            <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Solution</p>
                          </div>
                          <p className="text-xs text-green-800 leading-relaxed">
                            {annotation.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-6 border-2 border-dashed border-border rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Info className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No {activeTab} issues found</p>
                  <p className="text-xs text-muted-foreground mt-1">This area of your design looks solid.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3 pt-4 border-t border-border">
              <Button 
                className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors" 
                onClick={() => onNavigate('report', data)}
              >
                <Download className="w-4 h-4 mr-2" />
                View Full Summary
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-11"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share Report with Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
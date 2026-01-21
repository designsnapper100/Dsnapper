import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { LandingPage } from './components/LandingPage';
import { UploadPage } from './components/UploadPage';
import { AnnotationDashboard } from './components/AnnotationDashboard';
import { ReportPage } from './components/ReportPage';
import { supabase } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';

type Screen = 'landing' | 'upload' | 'dashboard' | 'report';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedReport = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get('reportId');

      if (reportId) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/make-server-cdc57b20/share/${reportId}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (!response.ok) {
            throw new Error('Report not found');
          }

          const data = await response.json();
          setAnalysisData(data);
          setCurrentScreen('dashboard');
        } catch (err) {
          console.error('Error fetching report:', err);
          setError('The shared report could not be found or has expired.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchSharedReport();
  }, []);

  const navigateToScreen = (screen: Screen, data?: any) => {
    if (data) {
      setAnalysisData(data);
    }
    // Clear URL when navigating normally (optional, but cleaner)
    if (window.location.search.includes('reportId')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading analysis report...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold">Report Not Found</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <button 
            onClick={() => { setError(null); setCurrentScreen('landing'); }}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </button>
        </div>
      );
    }

    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={navigateToScreen} />;
      case 'upload':
        return <UploadPage onNavigate={navigateToScreen} />;
      case 'dashboard':
        return <AnnotationDashboard onNavigate={navigateToScreen} data={analysisData} />;
      case 'report':
        return <ReportPage onNavigate={navigateToScreen} data={analysisData} />;
      default:
        return <LandingPage onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderScreen()}
    </div>
  );
}
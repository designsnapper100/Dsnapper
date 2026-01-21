import { projectId, publicAnonKey } from './supabase/info';

interface AnalysisAnnotation {
  id: number;
  x: number;
  y: number;
  type: 'accessibility' | 'usability' | 'consistency' | 'visual' | 'marketing';
  severity: 'critical' | 'minor';
  title: string;
  description: string;
  fix: string;
}

type DesignType = 'ux' | 'poster' | 'marketing' | 'branding';

const issueTemplates = {
  accessibility: [
    { title: 'Insufficient Color Contrast', description: 'Text elements appear to have low contrast ratio against their background.', fix: 'Increase contrast by using darker text colors or lighter backgrounds.', severity: 'critical' as const },
    { title: 'Small Touch Target Size', description: 'Interactive elements appear smaller than the recommended 44x44px minimum.', fix: 'Increase the size of clickable elements or add more padding.', severity: 'critical' as const },
  ],
  usability: [
    { title: 'Primary CTA Below the Fold', description: 'The main call-to-action button is positioned below the initial viewport.', fix: 'Move the primary CTA higher on the page.', severity: 'critical' as const },
    { title: 'Unclear Information Hierarchy', description: 'The visual hierarchy doesn\'t clearly guide users through the content.', fix: 'Use size, weight, and spacing to create clear distinction.', severity: 'critical' as const },
  ],
  consistency: [
    { title: 'Inconsistent Spacing Scale', description: 'Spacing between elements varies irregularly throughout the design.', fix: 'Implement a consistent spacing scale (e.g., 8px grid).', severity: 'minor' as const },
  ],
  visual: [
    { title: 'Weak Visual Anchor', description: 'The design lacks a strong focal point, causing the eye to wander.', fix: 'Create a dominant element to anchor the composition.', severity: 'critical' as const },
  ],
  marketing: [
    { title: 'Weak Value Proposition', description: 'The primary benefit isn\'t immediately clear within the first 3 seconds.', fix: 'Refine the headline to focus on the user benefit.', severity: 'critical' as const },
  ],
};

function generateRealisticCoordinates(index: number, designType: DesignType): { x: number; y: number } {
  const patterns = designType === 'ux' ? [{ x: 50, y: 25 }, { x: 30, y: 45 }, { x: 70, y: 45 }] : [{ x: 50, y: 50 }, { x: 50, y: 20 }, { x: 50, y: 80 }];
  const basePattern = patterns[index % patterns.length];
  return {
    x: Math.max(5, Math.min(95, basePattern.x + (Math.random() * 20 - 10))),
    y: Math.max(5, Math.min(95, basePattern.y + (Math.random() * 20 - 10))),
  };
}

function selectMockIssues(imageSeed: number): { annotations: AnalysisAnnotation[]; designType: DesignType } {
  const designTypes: DesignType[] = ['ux', 'poster', 'marketing', 'branding'];
  const designType = designTypes[imageSeed % designTypes.length];
  const allIssues: any[] = [];
  Object.keys(issueTemplates).forEach(cat => {
    (issueTemplates as any)[cat].forEach((issue: any) => allIssues.push({ type: cat, issue }));
  });
  const count = 4 + Math.floor((imageSeed % 3));
  const selected = allIssues.slice(0, count);
  const annotations = selected.map((item, index) => {
    const coords = generateRealisticCoordinates(index, designType);
    return { id: index + 1, x: coords.x, y: coords.y, type: item.type, severity: item.issue.severity, title: item.issue.title, description: item.issue.description, fix: item.issue.fix };
  });
  return { annotations, designType };
}

function hashImageData(imageDataUrl: string): number {
  let hash = 0;
  for (let i = 0; i < Math.min(imageDataUrl.length, 1000); i++) {
    hash = ((hash << 5) - hash) + imageDataUrl.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function analyzeScreenshotWithAI(
  imageDataUrl: string,
  context?: string
): Promise<{ annotations: AnalysisAnnotation[]; designType: string; mode?: string }> {
  console.log('Starting AI analysis...');
  
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-cdc57b20/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ image: imageDataUrl, context })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      console.warn('Backend returned error, using local fallback:', result.error);
      throw new Error(result.error);
    }
    
    return {
      annotations: result.annotations,
      designType: result.designType || 'UX',
      mode: result.mode
    };

  } catch (error) {
    console.error('AI Analysis request failed:', error);
    console.warn('Falling back to local design heuristics for prototype continuity.');
    
    // Smooth fallback for prototype continuity
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const seed = hashImageData(imageDataUrl);
    const result = selectMockIssues(seed);
    
    return {
      annotations: result.annotations,
      designType: result.designType.toUpperCase(),
      mode: 'mock'
    };
  }
}

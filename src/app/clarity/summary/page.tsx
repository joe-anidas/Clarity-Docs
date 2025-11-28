'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { summarizeDocumentAction, generateRiskScoreAction, generateContractTimelineAction, generateNegotiationSuggestionsAction, generateExamplesAction } from '@/lib/actions';
import type { GeneratePlainLanguageSummaryOutput } from '@/ai/flows/generate-plain-language-summary';
import type { GenerateRiskScoreOutput } from '@/ai/flows/generate-risk-score';

import SummaryView from '@/components/clarity-docs/summary-view';
import SummarySkeleton from '@/components/clarity-docs/summary-skeleton';
import { useAuth } from '@/components/auth/auth-provider';
import { saveDocumentToHistory, updateDocumentInHistory } from '@/lib/firestore-actions';

function SummaryPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [summaryData, setSummaryData] = useState<GeneratePlainLanguageSummaryOutput | null>(null);
  const [agreementType, setAgreementType] = useState<string | undefined>();

  // State for pre-fetched analysis data
  const [riskScore, setRiskScore] = useState<GenerateRiskScoreOutput | undefined>();
  const [timeline, setTimeline] = useState<any[] | undefined>();
  const [negotiationSuggestions, setNegotiationSuggestions] = useState<any[] | undefined>();
  const [examples, setExamples] = useState<any[] | undefined>();

  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const processDocument = async () => {
      // Try to load existing summary data from localStorage first
      const savedSummaryData = localStorage.getItem('claritySummaryData');
      const savedDocumentText = localStorage.getItem('clarityDocumentText');
      const savedAgreementType = localStorage.getItem('clarityAgreementType');

      // Load pre-fetched analysis data
      const savedRiskScore = localStorage.getItem('clarityRiskScore');
      const savedTimeline = localStorage.getItem('clarityTimeline');
      const savedNegotiation = localStorage.getItem('clarityNegotiation');
      const savedExamples = localStorage.getItem('clarityExamples');

      // If we have saved summary data, use it (for page reloads)
      if (savedSummaryData && savedDocumentText) {
        try {
          const parsedSummary = JSON.parse(savedSummaryData);
          setDocumentText(savedDocumentText);
          setAgreementType(savedAgreementType || undefined);
          setSummaryData(parsedSummary);

          if (savedRiskScore) setRiskScore(JSON.parse(savedRiskScore));
          if (savedTimeline) setTimeline(JSON.parse(savedTimeline));
          if (savedNegotiation) setNegotiationSuggestions(JSON.parse(savedNegotiation));
          if (savedExamples) setExamples(JSON.parse(savedExamples));

          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing saved summary data:', error);
          // If parsing fails, continue to regenerate
        }
      }

      // If no saved summary, check for document text to process
      let text = savedDocumentText;
      let type = savedAgreementType || undefined;

      if (!text) {
        // No document found, redirect to upload page
        router.push('/clarity');
        return;
      }

      setDocumentText(text);
      setAgreementType(type);

      // First, generate just the summary to show the page quickly
      const summaryResult = await summarizeDocumentAction({ documentText: text, agreementType: type });

      if (summaryResult.error) {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Summarization Failed',
          description: summaryResult.error,
        });
        router.push('/clarity');
        return;
      }

      if (summaryResult.summary) {
        const summary = summaryResult as GeneratePlainLanguageSummaryOutput & { maskedText?: string };
        setSummaryData(summary);

        const maskedText = summary.maskedText || text;
        setDocumentText(maskedText);

        // Save summary data immediately
        localStorage.setItem('claritySummaryData', JSON.stringify(summary));
        localStorage.setItem('clarityDocumentText', maskedText);

        // Show the page now
        setIsLoading(false);

        // Save to Firestore history
        const editingDocumentId = localStorage.getItem('clarityEditingDocumentId');
        if (user) {
          try {
            const docData = {
              documentName: `Document - ${new Date().toLocaleString()}`,
              documentType: type || 'Other',
              content: maskedText,
              summary: summary,
              fileType: 'text',
            };

            if (editingDocumentId) {
              await updateDocumentInHistory(editingDocumentId, docData);
              localStorage.removeItem('clarityEditingDocumentId');
              toast({
                title: 'Document Updated',
                description: 'Your document has been updated successfully.',
              });
            } else {
              await saveDocumentToHistory(user.uid, docData);
            }
          } catch (error) {
            console.error('Failed to save to history:', error);
          }
        }

        // Now process the rest in the background
        (async () => {
          try {
            const [riskResult, timelineResult, negotiationResult, examplesResult] = await Promise.all([
              generateRiskScoreAction({ documentText: maskedText, agreementType: type }),
              generateContractTimelineAction({ documentText: maskedText, agreementType: type }),
              generateNegotiationSuggestionsAction({ documentText: maskedText }),
              generateExamplesAction({ documentText: maskedText })
            ]);

            // Update state with background results
            if (riskResult.riskScore) {
              setRiskScore(riskResult.riskScore);
              localStorage.setItem('clarityRiskScore', JSON.stringify(riskResult.riskScore));
            }
            if (timelineResult.timeline) {
              setTimeline(timelineResult.timeline);
              localStorage.setItem('clarityTimeline', JSON.stringify(timelineResult.timeline));
            }
            if (negotiationResult.suggestions) {
              setNegotiationSuggestions(negotiationResult.suggestions);
              localStorage.setItem('clarityNegotiation', JSON.stringify(negotiationResult.suggestions));
            }
            if (examplesResult.examples) {
              setExamples(examplesResult.examples);
              localStorage.setItem('clarityExamples', JSON.stringify(examplesResult.examples));
            }
          } catch (error) {
            console.error('Background analysis failed:', error);
          }
        })();
      }
    };

    if (!loading && user) {
      processDocument();
    }
  }, [user, loading, router, toast]);

  const handleReset = () => {
    // Clear all stored data when user clicks "New" or goes back
    localStorage.removeItem('clarityDocumentText');
    localStorage.removeItem('clarityAgreementType');
    localStorage.removeItem('claritySummaryData');
    localStorage.removeItem('clarityEditingDocumentId');
    localStorage.removeItem('clarityRiskScore');
    localStorage.removeItem('clarityTimeline');
    localStorage.removeItem('clarityNegotiation');
    localStorage.removeItem('clarityExamples');
    router.push('/clarity');
  };

  if (loading || !user) {
    return (
      <div className="w-full p-16">
        <SummarySkeleton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-16">
        <SummarySkeleton />
      </div>
    );
  }

  if (!summaryData) {
    return null;
  }

  return (
    <div className="w-full p-16">
      <SummaryView
        originalText={documentText}
        summaryData={summaryData}
        onReset={handleReset}
        agreementType={agreementType}
        initialRiskScore={riskScore}
        initialTimeline={timeline}
        initialNegotiationSuggestions={negotiationSuggestions}
        initialExamples={examples}
      />
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={
      <div className="w-full p-16">
        <SummarySkeleton />
      </div>
    }>
      <SummaryPageContent />
    </Suspense>
  );
}

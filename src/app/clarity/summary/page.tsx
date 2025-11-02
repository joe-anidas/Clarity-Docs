'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { summarizeDocumentAction } from '@/lib/actions';
import type { GeneratePlainLanguageSummaryOutput } from '@/ai/flows/generate-plain-language-summary';

import SummaryView from '@/components/clarity-docs/summary-view';
import SummarySkeleton from '@/components/clarity-docs/summary-skeleton';
import { useAuth } from '@/components/auth/auth-provider';
import { saveDocumentToHistory, updateDocumentInHistory } from '@/lib/firestore-actions';

function SummaryPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [summaryData, setSummaryData] = useState<GeneratePlainLanguageSummaryOutput | null>(null);
  const [agreementType, setAgreementType] = useState<string | undefined>();
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

      // If we have saved summary data, use it (for page reloads)
      if (savedSummaryData && savedDocumentText) {
        try {
          const parsedSummary = JSON.parse(savedSummaryData);
          setDocumentText(savedDocumentText);
          setAgreementType(savedAgreementType || undefined);
          setSummaryData(parsedSummary);
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

      // Generate summary (this will also mask the text)
      const result = await summarizeDocumentAction({ documentText: text, agreementType: type });

      setIsLoading(false);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Summarization Failed',
          description: result.error,
        });
        router.push('/clarity');
      } else if (result.summary) {
        const summaryResult = result as GeneratePlainLanguageSummaryOutput & { maskedText?: string };
        setSummaryData(summaryResult);
        
        // Use masked text for display and storage
        const maskedText = summaryResult.maskedText || text;
        setDocumentText(maskedText); // Update the state with masked text
        
        // Save summary data to localStorage for persistence across reloads
        localStorage.setItem('claritySummaryData', JSON.stringify(summaryResult));
        // Also update the stored document text with masked version
        localStorage.setItem('clarityDocumentText', maskedText);
        
        // Check if we're editing an existing document
        const editingDocumentId = localStorage.getItem('clarityEditingDocumentId');
        
        // Save or update document to Firestore history (with masked content)
        if (user) {
          try {
            if (editingDocumentId) {
              // Update existing document
              await updateDocumentInHistory(editingDocumentId, {
                documentName: `Document - ${new Date().toLocaleString()}`,
                documentType: type || 'Other',
                content: maskedText, // Store masked content
                summary: summaryResult,
                fileType: 'text',
              });
              // Clear the editing flag
              localStorage.removeItem('clarityEditingDocumentId');
              toast({
                title: 'Document Updated',
                description: 'Your document has been updated successfully.',
              });
            } else {
              // Create new document
              await saveDocumentToHistory(user.uid, {
                documentName: `Document - ${new Date().toLocaleString()}`,
                documentType: type || 'Other',
                content: maskedText, // Store masked content
                summary: summaryResult,
                fileType: 'text',
              });
            }
          } catch (error) {
            console.error('Failed to save to history:', error);
            // Don't show error to user, just log it
          }
        }
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


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Menu, Edit, Trash2, FileText } from 'lucide-react';

import DocumentUpload from '@/components/clarity-docs/document-upload';
import SummarySkeleton from '@/components/clarity-docs/summary-skeleton';
import { useAuth } from '@/components/auth/auth-provider';
import { getUserDocumentHistory, deleteDocumentFromHistory, type DocumentHistory } from '@/lib/firestore-actions';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ClarityPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [editingDocument, setEditingDocument] = useState<DocumentHistory | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && isHistoryOpen) {
      loadDocumentHistory();
    }
  }, [user, isHistoryOpen]);

  const loadDocumentHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const history = await getUserDocumentHistory(user.uid);
      setDocuments(history);
    } catch (error) {
      console.error('Error loading document history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document history',
        variant: 'destructive',
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSummarize = (text: string, agreementType?: string) => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Document',
        description: 'Please paste some text to summarize.',
      });
      return;
    }

    // Store document data in localStorage for the summary page (persists across reloads)
    localStorage.setItem('clarityDocumentText', text);
    if (agreementType) {
      localStorage.setItem('clarityAgreementType', agreementType);
    } else {
      localStorage.removeItem('clarityAgreementType');
    }
    
    // Store the document ID if we're editing an existing document
    if (editingDocument?.id) {
      localStorage.setItem('clarityEditingDocumentId', editingDocument.id);
    } else {
      localStorage.removeItem('clarityEditingDocumentId');
    }
    
    // Clear any existing summary data to force regeneration
    localStorage.removeItem('claritySummaryData');

    // Navigate to summary page
    router.push('/clarity/summary');
  };

  const handleEditDocument = (document: DocumentHistory) => {
    setEditingDocument(document);
    setIsHistoryOpen(false); // Close the side panel when editing
    toast({
      title: 'Editing Document',
      description: `You are now editing "${document.documentName}". Changes will update the existing document.`,
    });
  };

  const handleViewDocument = (document: DocumentHistory) => {
    // Store document data and navigate to summary
    localStorage.setItem('clarityDocumentText', document.content);
    if (document.documentType) {
      localStorage.setItem('clarityAgreementType', document.documentType);
    }
    if (document.id) {
      localStorage.setItem('clarityEditingDocumentId', document.id);
    }
    router.push('/clarity/summary');
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete || !user) return;
    
    try {
      await deleteDocumentFromHistory(documentToDelete);
      setDocuments(documents.filter(doc => doc.id !== documentToDelete));
      toast({
        title: 'Document Deleted',
        description: 'Document has been removed from history',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SummarySkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Hamburger Menu */}
      <div className="flex items-center gap-4 mb-6">
        {/* Document History Side Panel - Hamburger Menu */}
        <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Document History</SheetTitle>
              <SheetDescription>
                Click a document to view, or use the icons to edit or delete
              </SheetDescription>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-180px)] mt-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading...</div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No documents yet</p>
                  <p className="text-sm text-muted-foreground">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                    >
                      <button
                        onClick={() => doc.id && handleViewDocument(doc)}
                        className="flex-1 text-left flex items-center gap-3 min-w-0"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{doc.documentName}</span>
                      </button>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDocument(doc);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            doc.id && handleDeleteClick(doc.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground mt-1">Analyze your legal documents with AI</p>
        </div>
      </div>

      {/* Main upload section */}
      <DocumentUpload 
        onSummarize={handleSummarize} 
        initialDocument={editingDocument}
        onClearEdit={() => setEditingDocument(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

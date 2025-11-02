
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CalendarPlus, CheckCircle, ChevronDown, Copy, FileText, Languages, Loader2, MessageSquareQuote, Mic, MicOff, Milestone, MinusCircle, Pause, Play, PlusCircle, RotateCcw, Send, ThumbsDown, ThumbsUp, Volume2, VolumeX, X, XCircle, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractiveText from './interactive-text';
import { translateTextAction, answerWhatIfQuestionAction, generateExamplesAction, generateRiskScoreAction, generateContractTimelineAction, generateNegotiationSuggestionsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { GeneratePlainLanguageSummaryOutput } from '@/ai/flows/generate-plain-language-summary';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { GenerateRiskScoreOutput } from '@/ai/flows/generate-risk-score';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type SummaryViewProps = {
  originalText: string;
  summaryData: GeneratePlainLanguageSummaryOutput;
  onReset: () => void;
  agreementType?: string;
};

// A small list of common languages for translation
const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
];

type Scenario = {
    question: string;
    answer: string;
};

type ExampleItem = {
    clause: string;
    example: string;
};

type TimelineEvent = {
    date: string;
    event: string;
};

type NegotiationSuggestion = {
    clause: string;
    suggestion: string;
}

const scenarioSuggestions = [
    'What happens if I terminate the contract early?',
    'What are the penalties for a late payment?',
    'Are there any restrictions on how I can use this?',
    'What does it say about automatic renewals?',
];

const chartConfig = {
  score: {
    label: 'Score',
  },
  remainder: {
    label: 'Remainder',
  },
} satisfies ChartConfig;

const SummaryView = ({ originalText, summaryData, onReset, agreementType }: SummaryViewProps) => {
  const router = useRouter();
  const [translatedSummary, setTranslatedSummary] = useState<GeneratePlainLanguageSummaryOutput['summary'] | null>(null);
  const [translatedDos, setTranslatedDos] = useState<string[] | null>(null);
  const [translatedDonts, setTranslatedDonts] = useState<string[] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioQuestion, setScenarioQuestion] = useState('');
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [examples, setExamples] = useState<ExampleItem[]>([]);
  const [isExamplesLoading, setIsExamplesLoading] = useState(false);
  const [riskScore, setRiskScore] = useState<GenerateRiskScoreOutput | null>(null);
  const [isRisksLoading, setIsRisksLoading] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);
  const [negotiationSuggestions, setNegotiationSuggestions] = useState<NegotiationSuggestion[]>([]);
  const [isNegotiationLoading, setIsNegotiationLoading] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVoiceSection, setActiveVoiceSection] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  // Progressive disclosure configuration
  const PREVIEW_CHARACTERS = 1000; // Show first 1000 characters in preview
  const getPreviewText = (text: string) => {
    if (text.length <= PREVIEW_CHARACTERS) {
      return text;
    }
    return text.slice(0, PREVIEW_CHARACTERS) + '...';
  };

  const resetAllTranslations = () => {
    setTranslatedSummary(null);
    setTranslatedDos(null);
    setTranslatedDonts(null);
  };

  const handleCopyDocument = async () => {
    try {
      await navigator.clipboard.writeText(originalText);
      toast({
        title: 'Copied!',
        description: 'Document text copied to clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Failed to copy document text.',
      });
    }
  };

  // Language code mapping for speech synthesis
  const getLanguageCode = (langValue: string): string => {
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ml': 'ml-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
    };
    return langMap[langValue] || 'en-US';
  };

  // Generic voice-over function for any section
  const handleGenericVoiceOver = (textContent: string, sectionId: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Text-to-speech is not supported in your browser.',
      });
      return;
    }

    const synth = window.speechSynthesis;

    // If not speaking or different section, start speaking
    if (!isSpeaking && !isPaused) {
      const utterance = new SpeechSynthesisUtterance(textContent);
      
      // Set language based on current selection or default to English
      const currentLang = targetLanguage || 'en';
      utterance.lang = getLanguageCode(currentLang);
      
      // Set voice properties
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a voice that matches the language
      const voices = synth.getVoices();
      const matchingVoice = voices.find(voice => voice.lang.startsWith(currentLang));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setActiveVoiceSection(sectionId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveVoiceSection(null);
      };

      utterance.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          setIsSpeaking(false);
          setIsPaused(false);
          setActiveVoiceSection(null);
          toast({
            variant: 'destructive',
            title: 'Voice-over Failed',
            description: 'There was an error playing the voice-over.',
          });
        }
      };

      synth.speak(utterance);
    }
  };

  const handleVoiceOver = () => {
    // Get the text to speak
    const displayedSummary = translatedSummary || summaryData.summary;
    const textToSpeak = displayedSummary
      .map(item => `${item.keyPoint}. ${item.description}`)
      .join('. ');
    
    handleGenericVoiceOver(textToSpeak, 'summary');
  };

  const handlePauseResume = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const synth = window.speechSynthesis;

    if (isSpeaking && !isPaused) {
      // Pause
      synth.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      // Resume
      synth.resume();
      setIsPaused(false);
    }
  };

  const handleStopVoiceOver = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const synth = window.speechSynthesis;
    
    if (isSpeaking || isPaused) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveVoiceSection(null);
    }
  };

  // Speech recognition for voice-to-text
  const handleVoiceToText = () => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser. Try Chrome or Edge.',
      });
      return;
    }

    if (isListening && recognition) {
      // Stop listening
      recognition.stop();
      setIsListening(false);
      return;
    }

    // Start listening
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    
    // Set language based on current selection or default to English
    const currentLang = targetLanguage || 'en';
    recognitionInstance.lang = getLanguageCode(currentLang);

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: 'Speak your question now.',
      });
    };

    recognitionInstance.onresult = (event: any) => {
      const { transcript } = event.results[0][0];
      setScenarioQuestion(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== 'no-speech') {
        toast({
          variant: 'destructive',
          title: 'Recognition Error',
          description: 'Could not recognize speech. Please try again.',
        });
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const handleTranslate = async () => {
    if (!targetLanguage) {
      toast({
        variant: 'destructive',
        title: 'Select a Language',
        description: 'Please choose a language to translate the summary into.',
      });
      return;
    }

    if (targetLanguage === 'en') {
        resetAllTranslations();
        toast({
            title: 'Language Reset',
            description: 'Content has been reset to original English.'
        });
        return;
    }

    setIsTranslating(true);
    resetAllTranslations();

    const dataToTranslate = {
        summary: summaryData.summary,
        dos: summaryData.dos,
        donts: summaryData.donts,
    };

    const result = await translateTextAction({ data: dataToTranslate, targetLanguage });
    setIsTranslating(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Translation Failed',
        description: result.error,
      });
    } else if (result.translatedData) {
        const { translatedData } = result;
        setTranslatedSummary(translatedData.summary || null);
        setTranslatedDos(translatedData.dos || null);
        setTranslatedDonts(translatedData.donts || null);
        
        toast({
            title: 'Translation Complete',
            description: `Content has been translated to ${languages.find(l => l.value === targetLanguage)?.label}.`
        });
    }
  };

  const handleTabChange = async (value: string) => {
    if (value === 'in-simple-terms' && examples.length === 0 && !isExamplesLoading) {
        setIsExamplesLoading(true);
        const result = await generateExamplesAction({ documentText: originalText });
        setIsExamplesLoading(false);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Example Generation Failed',
                description: result.error,
            });
        } else if (result.examples) {
            setExamples(result.examples);
        }
    } else if (value === 'risks' && !riskScore && !isRisksLoading) {
        setIsRisksLoading(true);
        const result = await generateRiskScoreAction({ documentText: originalText, agreementType });
        setIsRisksLoading(false);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Risk Analysis Failed',
                description: result.error,
            });
        } else if (result.riskScore) {
            setRiskScore(result.riskScore);
        }
    } else if (value === 'timeline' && timelineEvents.length === 0 && !isTimelineLoading) {
        setIsTimelineLoading(true);
        const result = await generateContractTimelineAction({ documentText: originalText, agreementType });
        setIsTimelineLoading(false);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Timeline Generation Failed',
                description: result.error,
            });
        } else if (result.timeline) {
            setTimelineEvents(result.timeline);
        }
    } else if (value === 'negotiation' && negotiationSuggestions.length === 0 && !isNegotiationLoading) {
        setIsNegotiationLoading(true);
        const result = await generateNegotiationSuggestionsAction({ documentText: originalText });
        setIsNegotiationLoading(false);
        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Negotiation Suggestion Failed',
                description: result.error,
            });
        } else if (result.suggestions) {
            setNegotiationSuggestions(result.suggestions);
        }
    }
  };
  
  const handleCalendarClick = () => {
    const title = encodeURIComponent('Contract Notice Period Reminder');
    let description = `Reminder: Give ${summaryData.noticePeriod} notice to terminate the agreement.`;
    
    let calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}`;
    
    if (summaryData.effectiveDate) {
        const startDate = new Date(summaryData.effectiveDate);
        
        // Check if the date is valid
        if (!isNaN(startDate.getTime())) {
            const reminderDate = new Date(startDate);
            
            if (summaryData.noticePeriod?.includes('month')) {
                const months = parseInt(summaryData.noticePeriod, 10) || 0;
                reminderDate.setMonth(reminderDate.getMonth() - months);
            } else if (summaryData.noticePeriod?.includes('day')) {
                const days = parseInt(summaryData.noticePeriod, 10) || 0;
                reminderDate.setDate(reminderDate.getDate() - days);
            }

            // Validate the reminder date is also valid after calculations
            if (!isNaN(reminderDate.getTime())) {
                const dateStr = reminderDate.toISOString().split('T')[0].replace(/-/g, '');
                calendarUrl += `&dates=${dateStr}/${dateStr}`;
            }
            
            description += `\n\nContract Start Date: ${summaryData.effectiveDate}`;
        } else {
            // Invalid effective date format
            description += `\n\nNote: Please verify the contract start date format (${summaryData.effectiveDate}) and set the correct date for this recurring reminder.`;
        }
    } else {
        description += `\n\nPlease set the correct start date for this recurring reminder.`;
    }

    calendarUrl += `&details=${encodeURIComponent(description)}`;
    calendarUrl += `&recur=RRULE:FREQ=MONTHLY`;
    
    window.open(calendarUrl, '_blank', 'rel=noopener,noreferrer');
  };

  const handleTimelineEventCalendar = (date: string, event: string) => {
    const title = encodeURIComponent(event);
    const description = encodeURIComponent(`Contract Timeline Event: ${event}`);
    
    let calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}`;
    
    try {
      const eventDate = new Date(date);
      
      // Check if the date is valid
      if (!isNaN(eventDate.getTime())) {
        const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        calendarUrl += `&dates=${dateStr}/${dateStr}`;
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
    
    calendarUrl += `&details=${description}`;
    
    window.open(calendarUrl, '_blank', 'rel=noopener,noreferrer');
  };

  const submitQuestion = async (question: string) => {
    if (!question.trim()) {
      return;
    }

    setIsScenarioLoading(true);
    setScenarioQuestion(''); 
    const result = await answerWhatIfQuestionAction({ documentText: originalText, question });
    
    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Scenario Analysis Failed',
            description: result.error,
        });
    } else if (result.answer) {
        setScenarios(prev => [...prev, { question: question, answer: result.answer! }]);
    }
    setIsScenarioLoading(false);
  }

  const handleScenarioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(scenarioQuestion);
  };
  
  const displayedSummary = translatedSummary || summaryData.summary;
  const displayedDos = translatedDos || summaryData.dos;
  const displayedDonts = translatedDonts || summaryData.donts;

  const score = riskScore?.riskScore ?? 0;
  const chartData = [
    { name: 'score', value: score, fill: `hsl(var(--primary))` },
    { name: 'remainder', value: 100 - score, fill: `hsl(var(--muted))` },
  ];

  const getToneBadgeVariant = (tone: 'Friendly' | 'Neutral' | 'Strict'): 'default' | 'secondary' | 'destructive' => {
    switch (tone) {
        case 'Friendly':
            return 'default'; // Or a custom 'success' variant if you have one
        case 'Neutral':
            return 'secondary';
        case 'Strict':
            return 'destructive';
        default:
            return 'secondary';
    }
  };

  return (
    <div className="w-full">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center gap-2">
            <CardTitle>Clarity Panel</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => router.push('/lawyers')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Scale className="mr-2 h-4 w-4" />
                Consult a Lawyer
              </Button>
              <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View Original
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] [&>button]:hidden">
                  <DialogHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <DialogTitle>Original Document</DialogTitle>
                        <DialogDescription>
                          Full text of the uploaded document
                        </DialogDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyDocument}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                        <Button variant="default" size="sm" onClick={() => setIsDocumentDialogOpen(false)}>
                          <X className="mr-2 h-4 w-4" />
                          Close
                        </Button>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="max-h-[65vh] overflow-y-auto w-full rounded-md border p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {originalText}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="risks">Risk Score</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="in-simple-terms">In Simple Terms</TabsTrigger>
              <TabsTrigger value="negotiation">Negotiate</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
               <div className="flex gap-2 p-4 border-b">
                 <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-[140px] h-9" disabled={isTranslating}>
                    <SelectValue placeholder="Translate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleTranslate} disabled={isTranslating || !targetLanguage}>
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Languages className="h-4 w-4" />}
                </Button>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleVoiceOver}
                    disabled={isSpeaking || isPaused}
                    className={isSpeaking ? 'bg-primary/10' : ''}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePauseResume}
                    disabled={!isSpeaking}
                    className={isPaused ? 'bg-primary/10' : ''}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleStopVoiceOver}
                    disabled={!isSpeaking && !isPaused}
                  >
                    <VolumeX className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isTranslating && !translatedSummary && (
                <div className="flex items-center gap-2 text-muted-foreground p-4 border-b">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Translating...</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground p-4">
                {translatedSummary 
                  ? `Translated to ${languages.find(l => l.value === targetLanguage)?.label}. Click on a highlighted term to get its definition. Use the voice-over button to listen to the summary.` 
                  : 'Click on a highlighted term to get its definition. Use the voice-over button to listen to the summary.'}
              </p>
              <div className={`text-base leading-relaxed p-4 space-y-4 pb-12 ${translatedSummary ? 'break-words' : ''}`} style={translatedSummary ? { lineHeight: '1.8', wordSpacing: '0.1em' } : {}}>
                      {displayedSummary.map((item, index) => (
                        <div key={index}>
                          <h3 className="font-semibold text-md mb-1 break-words">{item.keyPoint}</h3>
                          <InteractiveText text={item.description} context={originalText} />
                        </div>
                      ))}

                      {(displayedDos?.length > 0 || displayedDonts?.length > 0) && (
                        <>
                          <Separator className='my-6' />
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Do's & Don'ts</h3>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  const dosText = displayedDos.map((item, i) => `Do number ${i + 1}. ${item}`).join('. ');
                                  const dontsText = displayedDonts.map((item, i) => `Don't number ${i + 1}. ${item}`).join('. ');
                                  const fullText = `Do's. ${dosText}. Don'ts. ${dontsText}`;
                                  handleGenericVoiceOver(fullText, 'dos-donts');
                                }}
                                disabled={isSpeaking || isPaused}
                                className={activeVoiceSection === 'dos-donts' && isSpeaking ? 'bg-primary/10' : ''}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePauseResume}
                                disabled={!isSpeaking || activeVoiceSection !== 'dos-donts'}
                                className={isPaused ? 'bg-primary/10' : ''}
                              >
                                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleStopVoiceOver}
                                disabled={!isSpeaking && !isPaused || activeVoiceSection !== 'dos-donts'}
                              >
                                <VolumeX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                           <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${translatedDos || translatedDonts ? 'break-words' : ''}`} style={translatedDos || translatedDonts ? { lineHeight: '1.8' } : {}}>
                            <div>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ThumbsUp className="text-green-500"/> Do's</h3>
                                <div className="space-y-2">
                                {displayedDos.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-muted-foreground break-words">{item}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ThumbsDown className="text-red-500"/> Don'ts</h3>
                                <div className="space-y-2">
                                {displayedDonts.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-muted-foreground break-words">{item}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                           </div>
                        </>
                      )}

                      {/* Consult a Lawyer CTA */}
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5 text-blue-600" />
                                Need Expert Legal Advice?
                              </CardTitle>
                              <CardDescription>
                                Connect with verified lawyers who can provide professional consultation on your contract
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              onClick={() => router.push('/lawyers')}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <MessageSquareQuote className="mr-2 h-4 w-4" />
                              Browse Lawyers
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => router.push('/lawyers')}
                            >
                              Learn More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                        {(summaryData.lockInPeriod || summaryData.noticePeriod || summaryData.effectiveDate) && (
                        <>
                           <Separator className='my-6' />
                          <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Reminders</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {summaryData.effectiveDate && (
                                    <div>
                                        <h4 className="font-semibold text-sm">Agreement Effective Date</h4>
                                        <p className="text-sm text-muted-foreground">{summaryData.effectiveDate}</p>
                                    </div>
                                )}
                                {summaryData.lockInPeriod && (
                                    <div>
                                        <h4 className="font-semibold text-sm">Lock-in Period</h4>
                                        <p className="text-sm text-muted-foreground">{summaryData.lockInPeriod}</p>
                                    </div>
                                )}
                                {summaryData.noticePeriod && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-sm">Notice Period</h4>
                                            <p className="text-sm text-muted-foreground">{summaryData.noticePeriod}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handleCalendarClick}>
                                            <CalendarPlus className="mr-2 h-4 w-4"/>
                                            Add Reminder
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                          </Card>
                        </>
                      )}
                </div>
            </TabsContent>
            <TabsContent value="risks" className="mt-4">
                {isRisksLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 border-b">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing document for risks...</span>
                    </div>
                )}
                    <div className="p-4 space-y-6 pb-8">
                        {riskScore ? (
                           <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <CardTitle>Risk Score & Analysis</CardTitle>
                                        <CardDescription>{riskScore.riskSummary}</CardDescription>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => {
                                            let text = `Risk Score: ${riskScore.riskScore} out of 100. ${riskScore.riskSummary}. `;
                                            if (riskScore.scoreBreakdown) {
                                              text += `Positive factors: ${riskScore.scoreBreakdown.positive.join('. ')}. `;
                                              text += `Negative factors: ${riskScore.scoreBreakdown.negative.join('. ')}. `;
                                            }
                                            if (riskScore.toneAnalysis && riskScore.toneAnalysis.length > 0) {
                                              text += `Tone Analysis: `;
                                              text += riskScore.toneAnalysis.map(t => `${t.clause}. Tone: ${t.tone}. ${t.explanation}`).join('. ');
                                            }
                                            handleGenericVoiceOver(text, 'risks');
                                          }}
                                          disabled={isSpeaking || isPaused}
                                          className={activeVoiceSection === 'risks' && isSpeaking ? 'bg-primary/10' : ''}
                                        >
                                          <Volume2 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={handlePauseResume}
                                          disabled={!isSpeaking || activeVoiceSection !== 'risks'}
                                          className={isPaused ? 'bg-primary/10' : ''}
                                        >
                                          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={handleStopVoiceOver}
                                          disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== 'risks'}
                                        >
                                          <VolumeX className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                                <Cell key="score" fill={chartData[0].fill} />
                                                <Cell key="remainder" fill={chartData[1].fill} />
                                            </Pie>
                                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-4xl font-bold">
                                                {riskScore.riskScore.toString()}
                                            </text>
                                        </PieChart>
                                    </ChartContainer>

                                    {riskScore.scoreBreakdown && (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                              <h3 className="font-semibold text-lg">Score Breakdown</h3>
                                              <div className="flex gap-1">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={() => {
                                                    const text = `Score Breakdown. Positive factors: ${riskScore.scoreBreakdown.positive.join('. ')}. Negative factors: ${riskScore.scoreBreakdown.negative.join('. ')}`;
                                                    handleGenericVoiceOver(text, 'score-breakdown');
                                                  }}
                                                  disabled={isSpeaking || isPaused}
                                                  className={activeVoiceSection === 'score-breakdown' && isSpeaking ? 'bg-primary/10' : ''}
                                                >
                                                  <Volume2 className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={handlePauseResume}
                                                  disabled={!isSpeaking || activeVoiceSection !== 'score-breakdown'}
                                                  className={isPaused ? 'bg-primary/10' : ''}
                                                >
                                                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                                </Button>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={handleStopVoiceOver}
                                                  disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== 'score-breakdown'}
                                                >
                                                  <VolumeX className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium flex items-center gap-2"><PlusCircle className="text-green-500" /> Positive Factors</h4>
                                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                                        {riskScore.scoreBreakdown.positive.map((item, index) => (
                                                            <li key={`pos-${index}`}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium flex items-center gap-2"><MinusCircle className="text-red-500" /> Negative Factors</h4>
                                                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                                        {riskScore.scoreBreakdown.negative.map((item, index) => (
                                                            <li key={`neg-${index}`}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {riskScore.toneAnalysis && riskScore.toneAnalysis.length > 0 && (
                                        <div>
                                            <Separator className="my-6" />
                                            <div className="flex items-center justify-between mb-4">
                                              <h3 className="font-semibold text-lg">Tone Analysis</h3>
                                              <div className="flex gap-1">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={() => {
                                                    const text = `Tone Analysis. ${riskScore.toneAnalysis.map(t => `${t.clause}. Tone: ${t.tone}. ${t.explanation}`).join('. ')}`;
                                                    handleGenericVoiceOver(text, 'tone-analysis');
                                                  }}
                                                  disabled={isSpeaking || isPaused}
                                                  className={activeVoiceSection === 'tone-analysis' && isSpeaking ? 'bg-primary/10' : ''}
                                                >
                                                  <Volume2 className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={handlePauseResume}
                                                  disabled={!isSpeaking || activeVoiceSection !== 'tone-analysis'}
                                                  className={isPaused ? 'bg-primary/10' : ''}
                                                >
                                                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                                </Button>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={handleStopVoiceOver}
                                                  disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== 'tone-analysis'}
                                                >
                                                  <VolumeX className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="space-y-4">
                                                {riskScore.toneAnalysis.map((item, index) => (
                                                    <Card key={index} className="border-l-4 border-l-primary">
                                                        <CardHeader className="pb-3">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant={getToneBadgeVariant(item.tone)}>{item.tone}</Badge>
                                                                <CardTitle className="text-base flex-1">{item.clause}</CardTitle>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm text-muted-foreground">{item.explanation}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                           </Card>
                        ) : (!isRisksLoading && <p className="text-sm text-muted-foreground">Could not generate risk score for this document.</p>)}
                    </div>
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
                {isTimelineLoading && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground p-4 border-b">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Scanning document for key dates...</span>
                    </div>
                )}
                    <div className="flex justify-center p-4 pb-8 mt-8">
                        <div className="w-full max-w-3xl">
                        {timelineEvents.length > 0 ? (
                            <div className="relative pl-6">
                                <div className="absolute left-6 top-0 h-full w-0.5 bg-border -translate-x-1/2"></div>
                                {timelineEvents.map((item, index) => (
                                    <div key={index} className="relative mb-8">
                                        <div className="absolute left-0 top-1.5 h-6 w-6 -translate-x-1/2 rounded-full bg-background flex items-center justify-center">
                                            <div className="h-3 w-3 rounded-full bg-primary"></div>
                                        </div>
                                        <div className="pl-8">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-primary">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                                                    <p className="text-sm text-muted-foreground">{item.event}</p>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleTimelineEventCalendar(item.date, item.event)}
                                                    className="flex-shrink-0"
                                                >
                                                    <CalendarPlus className="mr-2 h-4 w-4"/>
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (!isTimelineLoading && <p className="text-sm text-muted-foreground text-center pt-8">No specific dates or deadlines found in this document.</p>)}
                        </div>
                    </div>
            </TabsContent>
            <TabsContent value="scenarios" className="mt-4">
                {isScenarioLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 border-b">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing document...</span>
                    </div>
                )}
                <div>
                    <div className="p-4 space-y-6 pb-24 mb-20">
                        {/* Initial greeting message */}
                        {scenarios.length === 0 && !isScenarioLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div className="bg-primary/10 text-primary-foreground p-3 rounded-lg w-3/4">
                                    <p className="font-semibold text-primary">ClarityDocs AI</p>
                                    <p className="text-sm text-foreground">How can I help you understand this document better? Ask me any "what-if" questions about scenarios, obligations, or potential situations.</p>
                                </div>
                            </div>
                        )}
                        
                        {scenarios.map((scenario, index) => (
                            <div key={index} className="space-y-4">
                                <div className="flex items-start gap-3 justify-end">
                                    <div className="bg-muted p-3 rounded-lg w-3/4">
                                        <p className="font-semibold">You</p>
                                        <p className="text-sm">{scenario.question}</p>
                                    </div>
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-primary/10 text-primary-foreground p-3 rounded-lg w-3/4 relative">
                                        <div className="flex items-center justify-between mb-2">
                                          <p className="font-semibold text-primary">ClarityDocs AI</p>
                                          <div className="flex gap-1">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-7 w-7 p-0 bg-white hover:bg-white/90"
                                              onClick={() => handleGenericVoiceOver(scenario.answer, `scenario-${index}`)}
                                              disabled={isSpeaking || isPaused}
                                            >
                                              <Volume2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-7 w-7 p-0 bg-white hover:bg-white/90"
                                              onClick={handlePauseResume}
                                              disabled={!isSpeaking || activeVoiceSection !== `scenario-${index}`}
                                            >
                                              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                                            </Button>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-7 w-7 p-0 bg-white hover:bg-white/90"
                                              onClick={handleStopVoiceOver}
                                              disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== `scenario-${index}`}
                                            >
                                              <VolumeX className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                        <p className="text-sm text-foreground">{scenario.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 pt-8 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    {/* Suggested questions above input */}
                    {scenarios.length === 0 && !isScenarioLoading && (
                        <div className="mb-4 space-y-2">
                            <p className="text-sm text-muted-foreground text-center">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {scenarioSuggestions.map((suggestion, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => submitQuestion(suggestion)}
                                        disabled={isScenarioLoading}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleScenarioSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <Input 
                                type="text"
                                placeholder="Ask a what-if question or use voice..."
                                value={scenarioQuestion}
                                onChange={(e) => setScenarioQuestion(e.target.value)}
                                disabled={isScenarioLoading || isListening}
                                className="flex-1 pr-12"
                            />
                            <Button 
                                type="button"
                                size="icon"
                                variant="ghost"
                                className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : ''}`}
                                onClick={handleVoiceToText}
                                disabled={isScenarioLoading}
                            >
                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button type="submit" size="icon" disabled={isScenarioLoading || !scenarioQuestion.trim()}>
                            {isScenarioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
            </TabsContent>
             <TabsContent value="in-simple-terms" className="mt-4">
                {isExamplesLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 border-b">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating real-world examples...</span>
                    </div>
                )}
                    <div className="p-4 space-y-4 pb-8">
                        {examples.length > 0 ? (
                            <div className="space-y-4">
                                {examples.map((item, index) => (
                                    <Card key={index} className="border-l-4 border-l-primary">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-base">{item.clause}</CardTitle>
                                              <div className="flex gap-1">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={() => handleGenericVoiceOver(`${item.clause}. In simple terms: ${item.example}`, `simple-terms-${index}`)}
                                                  disabled={isSpeaking || isPaused}
                                                >
                                                  <Volume2 className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={handlePauseResume}
                                                  disabled={!isSpeaking || activeVoiceSection !== `simple-terms-${index}`}
                                                >
                                                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={handleStopVoiceOver}
                                                  disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== `simple-terms-${index}`}
                                                >
                                                  <VolumeX className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2 font-semibold text-sm">
                                                <span>In simple terms:</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.example}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (!isExamplesLoading && <p className="text-sm text-muted-foreground">Could not generate examples from this document.</p>)}
                    </div>
            </TabsContent>
             <TabsContent value="negotiation" className="mt-4">
                {isNegotiationLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 border-b">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating negotiation suggestions...</span>
                    </div>
                )}
                    <div className="p-4 space-y-4 pb-8">
                        {negotiationSuggestions.length > 0 ? (
                            <div className="space-y-4">
                                {negotiationSuggestions.map((item, index) => (
                                    <Card key={index} className="border-l-4 border-l-primary">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                              <CardTitle className="text-base">{item.clause}</CardTitle>
                                              <div className="flex gap-1">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={() => handleGenericVoiceOver(`${item.clause}. Negotiation suggestion: ${item.suggestion}`, `negotiate-${index}`)}
                                                  disabled={isSpeaking || isPaused}
                                                >
                                                  <Volume2 className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={handlePauseResume}
                                                  disabled={!isSpeaking || activeVoiceSection !== `negotiate-${index}`}
                                                >
                                                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={handleStopVoiceOver}
                                                  disabled={(!isSpeaking && !isPaused) || activeVoiceSection !== `negotiate-${index}`}
                                                >
                                                  <VolumeX className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center gap-2 font-semibold text-sm">
                                                <MessageSquareQuote className="h-5 w-5 text-primary"/>
                                                <span>Suggested Talking Point</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (!isNegotiationLoading && <p className="text-sm text-muted-foreground">No specific negotiation points were identified in this document.</p>)}
                    </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryView;

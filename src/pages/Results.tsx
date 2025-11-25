import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { executePDFWorkflow } from "@/lib/lamatic";
import { Skeleton } from "@/components/ui/skeleton";

const Results = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sessionId = (state as { sessionId?: string } | undefined)?.sessionId;
  const [pdfHtml, setPdfHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching PDF for session ID:", sessionId);
        const html = await executePDFWorkflow(sessionId);
        console.log("PDF HTML received, length:", html.length);
        if (!html || html.trim().length === 0) {
          throw new Error("Received empty HTML from API");
        }
        setPdfHtml(html);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to generate PDF";
        setError(errorMessage);
        toast.error(`Failed to generate PDF: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPDF();
  }, [sessionId]);

  const handleExportPDF = () => {
    if (!pdfHtml || !pdfContentRef.current) {
      toast.error("PDF not ready yet");
      return;
    }
    
    // Add print-specific class to body FIRST (before any toasts)
    document.body.classList.add('printing-pdf');
    
    // Small delay to ensure class is applied, then open print dialog
    setTimeout(() => {
      window.print();
      
      // Remove class after print dialog closes
      setTimeout(() => {
        document.body.classList.remove('printing-pdf');
      }, 500);
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-14">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-8">
            <header className="space-y-4 text-center text-balance">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating your result
              </div>
              <h1 className="text-4xl font-semibold text-[color:var(--color-ink)]">
                Creating your calm summary
              </h1>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
                We're preparing your personalized assessment summary. This will only take a moment.
              </p>
            </header>

            <Card className="border-[color:var(--color-border)]">
              <CardContent className="p-12">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                  <div className="pt-8 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-14">
          <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-8">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Error loading results
                </CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/assessment")} variant="outline">
                  Go back to assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:px-8">
          <header className="space-y-4 text-center text-balance">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 text-sm font-medium text-success">
              Calm summary ready
            </div>
            <h1 className="text-4xl font-semibold text-[color:var(--color-ink)]">
              Here's your personalized assessment summary
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Review your results below or export as PDF to share with your team.
            </p>
          </header>

          <section className="relative">
            <div className="sm:absolute sm:right-6 sm:top-6 z-10">
              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                aria-label="Export PDF" 
                className="shadow-[var(--shadow-card)]"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export PDF
                  </>
                )}
              </Button>
            </div>

            <Card className="border-[color:var(--color-border)] bg-[color:var(--color-card)] pr-0 sm:pr-40">
              <CardContent className="p-6">
                <div 
                  ref={pdfContentRef}
                  className="prose prose-sm max-w-none pdf-content results-content"
                  style={{
                    lineHeight: '1.7',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                  dangerouslySetInnerHTML={{ __html: pdfHtml }}
                />
              </CardContent>
            </Card>
          </section>

          <section className="flex justify-center">
            <Button 
              onClick={handleExportPDF} 
              className="sm:hidden"
              variant="outline"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export PDF
                </>
              )}
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;

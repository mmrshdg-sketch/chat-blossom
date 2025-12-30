import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Menu, X, Download, Home, Eye, Code, 
  Loader2, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { Project, Message } from '@/types/project';
import { getProvider, generateCodePrompt, pollinationsAI, isImageRequest } from '@/lib/ai-providers';
import { ChatMessage } from './ChatMessage';
import { VersionHistory } from './VersionHistory';
import { PreviewFrame } from './PreviewFrame';
import { CodeEditor } from './CodeEditor';

interface ChatDashboardProps {
  project: Project;
  currentFiles: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
  onAddVersion: (prompt: string, files: Record<string, string>, snapshot?: string) => void;
  onLoadVersion: (versionId: string) => void;
  onExit: () => void;
  isNewProject?: boolean;
  typingText?: string;
}

export const ChatDashboard = ({
  project,
  currentFiles,
  onFilesChange,
  onAddVersion,
  onLoadVersion,
  onExit,
  isNewProject = false,
  typingText = '',
}: ChatDashboardProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showVersions, setShowVersions] = useState(!isNewProject);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [progress, setProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseResponse = (raw: string): { files: Record<string, string>; talk: string } => {
    const fileSection = raw.split('[FILES]')[1]?.split('[TALK]')[0] || "";
    const talk = raw.split('[TALK]')[1]?.split('[END]')[0] || "Update applied.";
    
    const files: Record<string, string> = {};
    fileSection.split('FILENAME: ').filter(Boolean).forEach(block => {
      const parts = block.split('CODE: ');
      if (parts.length === 2) {
        files[parts[0].trim()] = parts[1].trim();
      }
    });

    return { files, talk: talk.trim() };
  };

  const captureSnapshot = async (): Promise<string | undefined> => {
    if (!previewRef.current?.contentWindow?.document?.body) return undefined;
    
    try {
      const canvas = await html2canvas(previewRef.current.contentWindow.document.body, {
        scale: 0.5,
        useCORS: true,
        logging: false,
      });
      return canvas.toDataURL('image/webp', 0.3);
    } catch (e) {
      console.error('Failed to capture snapshot:', e);
      return undefined;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setProgress(20);

    // Check if this is an image request
    if (isImageRequest(userInput)) {
      try {
        const imageUrl = await pollinationsAI.generateImage!(userInput);
        
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'Here\'s your generated image!',
          timestamp: Date.now(),
          imageUrl,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Image generation error:', error);
        const errorMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'Failed to generate image. Please try again.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setProgress(0);
      }
      return;
    }

    // Text/code generation
    try {
      const provider = getProvider();
      const prompt = generateCodePrompt(userInput, JSON.stringify(currentFiles));
      
      setProgress(50);
      const response = await provider.generate(prompt);
      setProgress(85);

      const { files, talk } = parseResponse(response);

      if (!files['index.html']) {
        throw new Error('No valid code generated');
      }

      onFilesChange(files);

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: talk,
        timestamp: Date.now(),
        files,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Capture snapshot after render
      setTimeout(async () => {
        const snapshot = await captureSnapshot();
        onAddVersion(userInput, files, snapshot);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. The API might be rate-limited. Please wait a moment and try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    Object.entries(currentFiles).forEach(([name, content]) => {
      zip.file(name, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.slice(0, 20).replace(/\s+/g, '-')}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Progress Bar */}
      <AnimatePresence>
        {progress > 0 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-info origin-left z-50 glow-primary"
            style={{ width: '100%' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-80 glass-card z-50 p-6 flex flex-col lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-primary">ENGINE MENU</span>
                <button onClick={() => setShowSidebar(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2 flex-1">
                <button
                  onClick={() => { setViewMode('preview'); setShowSidebar(false); }}
                  className="w-full text-left p-4 rounded-xl hover:bg-secondary transition flex items-center gap-3"
                >
                  <Eye className="w-4 h-4" /> Preview Mode
                </button>
                <button
                  onClick={() => { setViewMode('code'); setShowSidebar(false); }}
                  className="w-full text-left p-4 rounded-xl hover:bg-secondary transition flex items-center gap-3"
                >
                  <Code className="w-4 h-4" /> Code Editor
                </button>
                <hr className="border-border my-4" />
                <button
                  onClick={handleDownload}
                  className="w-full text-left p-4 rounded-xl hover:bg-secondary transition flex items-center gap-3 text-success font-bold"
                >
                  <Download className="w-4 h-4" /> Download .ZIP
                </button>
                <button
                  onClick={onExit}
                  className="w-full text-left p-4 rounded-xl hover:bg-secondary transition flex items-center gap-3 text-destructive"
                >
                  <Home className="w-4 h-4" /> Exit to Home
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Version History Sidebar */}
        {!isNewProject && (
          <>
            <motion.aside
              initial={false}
              animate={{ width: showVersions ? 280 : 0, opacity: showVersions ? 1 : 0 }}
              className="hidden lg:flex flex-col border-r border-border bg-card/30 overflow-hidden"
            >
              <div className="p-4 flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 hover:bg-secondary rounded-lg text-muted-foreground lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <VersionHistory
                    versions={project.versions}
                    currentVersionId={project.versions[0]?.id}
                    onLoadVersion={onLoadVersion}
                  />
                </div>
              </div>
              
              {/* AI Status */}
              <div className="p-4 border-t border-border">
                <div className="text-[10px] uppercase text-primary font-bold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI Status
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isLoading ? 'Generating...' : 'Ready for your next prompt.'}
                </p>
              </div>
            </motion.aside>

            {/* Toggle Versions Button */}
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="hidden lg:flex items-center justify-center w-6 hover:bg-secondary border-r border-border transition-colors"
            >
              {showVersions ? (
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - only show for existing projects */}
          {!isNewProject && (
            <header className="flex items-center justify-between p-4 border-b border-border bg-card/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-secondary rounded-lg text-muted-foreground lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="font-semibold text-sm truncate max-w-[200px]">{project.title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-secondary">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'code' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-success transition-colors"
                  title="Download ZIP"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={onExit}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  title="Exit"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chat Panel */}
            <div className="w-full lg:w-96 flex flex-col border-r border-border">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Sparkles className="w-12 h-12 text-primary/30 mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {isNewProject ? 'What would you like to build?' : 'Start Creating'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isNewProject 
                        ? 'Describe your project and I\'ll generate it. Say "image" or "photo" for AI images.'
                        : 'Ask for changes or generate images. The AI will update your project in real-time.'}
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onViewCode={() => setViewMode('code')}
                  />
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="glass-card rounded-2xl p-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-2 outline-none text-sm placeholder:text-muted-foreground"
                    placeholder={isNewProject ? "Describe what to build..." : "Ask for a change..."}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tip: Say "image", "photo", or "draw" to generate images
                </p>
              </div>
            </div>

            {/* Preview/Code Area */}
            <div className="hidden lg:flex flex-1 p-4 bg-background">
              {viewMode === 'preview' ? (
                <PreviewFrame ref={previewRef} files={currentFiles} />
              ) : (
                <CodeEditor files={currentFiles} onFilesChange={onFilesChange} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

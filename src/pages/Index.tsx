import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatDashboard } from '@/components/ChatDashboard';
import { AuthModal } from '@/components/AuthModal';
import { useProjects } from '@/hooks/useProjects';
import { getProvider, generateCodePrompt } from '@/lib/ai-providers';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

const phrases = [
  "Building the future, one prompt at a time.",
  "Clean code. Instant results. No bloat.",
  "Unlimited virtual architecture engine.",
  "Free AI. No signup. No limits.",
];

// Fake auth state for prototype
interface User {
  id: string;
  email: string;
  name?: string;
}

const Index = () => {
  const {
    projects,
    currentProject,
    currentFiles,
    setCurrentFiles,
    createProject,
    addVersion,
    loadVersion,
    openProject,
    deleteProject,
  } = useProjects();

  const [isStarting, setIsStarting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [user, setUser] = useState<User | null>(null);
  
  // Typing animation state
  const [typingText, setTypingText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typing effect
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typingText.length < currentPhrase.length) {
          setTypingText(currentPhrase.slice(0, typingText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (typingText.length > 0) {
          setTypingText(typingText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, phraseIndex]);

  const handleStart = async (prompt: string) => {
    setIsStarting(true);
    const project = createProject(prompt);

    try {
      const provider = getProvider();
      const fullPrompt = generateCodePrompt(prompt);
      const response = await provider.generate(fullPrompt);

      // Parse response
      const fileSection = response.split('[FILES]')[1]?.split('[TALK]')[0] || "";
      const files: Record<string, string> = {};
      
      fileSection.split('FILENAME: ').filter(Boolean).forEach(block => {
        const parts = block.split('CODE: ');
        if (parts.length === 2) {
          files[parts[0].trim()] = parts[1].trim();
        }
      });

      if (files['index.html']) {
        setCurrentFiles(files);
        addVersion(prompt, files);
      } else {
        // Fallback with basic template
        const fallbackFiles = {
          'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome</h1>
    <p>Your project is ready. Ask the AI to build something!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
          'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fafafa; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.container { text-align: center; padding: 2rem; }
h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { color: #a1a1aa; }`,
          'script.js': `console.log('Project initialized');`,
        };
        setCurrentFiles(fallbackFiles);
        addVersion(prompt, fallbackFiles);
      }
    } catch (error) {
      console.error('Failed to generate initial project:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    openProject(projectId);
  };

  const handleExit = () => {
    window.location.reload();
  };

  const handleGoogleAuth = () => {
    // Prototype: fake Google auth
    console.log('Google auth would happen here');
    setUser({
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
    });
  };

  const handleEmailAuth = async (email: string, password: string, name?: string) => {
    // Prototype: fake email auth
    console.log('Email auth:', { email, password, name });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setUser({
      id: 'email_' + Date.now(),
      email,
      name: name || email.split('@')[0],
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AnimatePresence mode="wait">
      {!currentProject ? (
        <motion.div
          key="chat-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen flex flex-col"
        >
          {/* Auth Buttons Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-card/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg gradient-text">EngineX</span>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Hey, <span className="text-foreground font-medium">{user.name || user.email}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>
          </header>

          {/* Main Chat Area with Typing Animation */}
          <div className="flex-1">
            <ChatDashboard
              project={{
                id: 'new',
                title: 'New Project',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                versions: [],
              }}
              currentFiles={{
                'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome, <span class="gradient">Creator</span>.</h1>
    <p class="typing">${typingText}</p>
    <p class="hint">Tell me what to build...</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
                'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: system-ui, -apple-system, sans-serif; 
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f23 100%);
  color: #fafafa; 
  min-height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.container { text-align: center; padding: 2rem; }
h1 { 
  font-size: clamp(2rem, 8vw, 4rem); 
  margin-bottom: 1rem; 
  font-weight: 700;
}
.gradient { 
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.typing { 
  color: #a1a1aa; 
  font-size: 1.25rem;
  min-height: 2rem;
}
.typing::after {
  content: '|';
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.hint {
  margin-top: 3rem;
  color: #525252;
  font-size: 0.875rem;
}`,
                'script.js': `console.log('EngineX ready');`,
              }}
              onFilesChange={setCurrentFiles}
              onAddVersion={(prompt, files, snapshot) => {
                handleStart(prompt);
              }}
              onLoadVersion={() => {}}
              onExit={handleExit}
              isNewProject={true}
              typingText={typingText}
            />
          </div>

          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            mode={authMode}
            onModeChange={setAuthMode}
            onGoogleAuth={handleGoogleAuth}
            onEmailAuth={handleEmailAuth}
          />

          {isStarting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Generating your project...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="h-screen"
        >
          <ChatDashboard
            project={currentProject}
            currentFiles={currentFiles}
            onFilesChange={setCurrentFiles}
            onAddVersion={addVersion}
            onLoadVersion={loadVersion}
            onExit={handleExit}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;

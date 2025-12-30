import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Trash2 } from 'lucide-react';
import { Project } from '@/types/project';

interface WelcomeScreenProps {
  onStart: (prompt: string) => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  projects: Project[];
}

const phrases = [
  "Building the future, one prompt at a time.",
  "Clean code. Instant results. No bloat.",
  "Unlimited virtual architecture engine.",
  "Free AI. No signup. No limits.",
];

export const WelcomeScreen = ({ onStart, onOpenProject, onDeleteProject, projects }: WelcomeScreenProps) => {
  const [prompt, setPrompt] = useState('');
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

  const handleSubmit = () => {
    if (prompt.trim()) {
      onStart(prompt.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-radial from-secondary to-background overflow-y-auto"
    >
      <div className="max-w-4xl w-full">
        {/* Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
            Welcome, <span className="gradient-text">Creator</span>.
          </h1>
          <div className="h-8 flex items-center justify-center">
            <span className="text-muted-foreground text-lg md:text-xl font-light typing-cursor">
              {typingText}
            </span>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-2 flex items-center mb-12 glow-primary"
        >
          <Sparkles className="w-5 h-5 text-primary ml-4 mr-2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1 bg-transparent px-4 py-4 outline-none text-lg placeholder:text-muted-foreground"
            placeholder="Describe your next masterpiece..."
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-colors"
          >
            Generate
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-6">
              Your Archives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card rounded-2xl p-4 cursor-pointer hover:bg-secondary/50 transition-all group border border-border hover:border-primary/30"
                  onClick={() => onOpenProject(project.id)}
                >
                  {project.versions[0]?.snapshot ? (
                    <img
                      src={project.versions[0].snapshot}
                      alt={project.title}
                      className="w-full aspect-video object-cover rounded-xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full aspect-video rounded-xl mb-4 bg-secondary flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{project.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {project.versions.length} version{project.versions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: '🌸', label: 'Pollinations AI' },
            { icon: '⚡', label: 'Instant Preview' },
            { icon: '📦', label: 'Download ZIP' },
            { icon: '🎨', label: 'Image Gen' },
          ].map((feature, index) => (
            <div
              key={feature.label}
              className="glass-card rounded-xl p-4 text-center"
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

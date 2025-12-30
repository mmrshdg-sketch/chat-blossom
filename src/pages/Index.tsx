import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ChatDashboard } from '@/components/ChatDashboard';
import { useProjects } from '@/hooks/useProjects';
import { getProvider, generateCodePrompt } from '@/lib/ai-providers';

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

  const handleStart = async (prompt: string) => {
    setIsStarting(true);
    const project = createProject(prompt);

    try {
      const provider = getProvider('pollinations');
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

  return (
    <AnimatePresence mode="wait">
      {!currentProject ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          <WelcomeScreen
            onStart={handleStart}
            onOpenProject={handleOpenProject}
            onDeleteProject={deleteProject}
            projects={projects}
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

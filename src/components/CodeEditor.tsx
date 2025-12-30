import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, FileCode, FileJson, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  files: Record<string, string>;
  onFilesChange: (files: Record<string, string>) => void;
}

export const CodeEditor = ({ files, onFilesChange }: CodeEditorProps) => {
  const [activeFile, setActiveFile] = useState<string>(Object.keys(files)[0] || 'index.html');
  const [copied, setCopied] = useState(false);

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.html')) return <FileCode className="w-3.5 h-3.5" />;
    if (filename.endsWith('.css')) return <Code className="w-3.5 h-3.5" />;
    if (filename.endsWith('.js')) return <FileJson className="w-3.5 h-3.5" />;
    return <FileCode className="w-3.5 h-3.5" />;
  };

  const handleChange = (content: string) => {
    onFilesChange({
      ...files,
      [activeFile]: content,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(files[activeFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col glass-card rounded-xl overflow-hidden"
    >
      {/* File Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30">
        {Object.keys(files).map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFile === filename
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {getFileIcon(filename)}
            {filename}
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <textarea
        value={files[activeFile] || ''}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-background/50 text-foreground p-4 outline-none font-mono text-sm resize-none scrollbar-thin"
        placeholder="// Your code here..."
      />
    </motion.div>
  );
};

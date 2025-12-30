import { useEffect, useRef, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface PreviewFrameProps {
  files: Record<string, string>;
  className?: string;
}

export const PreviewFrame = forwardRef<HTMLIFrameElement, PreviewFrameProps>(
  ({ files, className = '' }, ref) => {
    const internalRef = useRef<HTMLIFrameElement>(null);
    const iframeRef = (ref as React.RefObject<HTMLIFrameElement>) || internalRef;

    useEffect(() => {
      if (!iframeRef.current) return;

      let html = files['index.html'] || '';
      
      // Inject CSS
      if (files['style.css']) {
        html = html.replace('</head>', `<style>${files['style.css']}</style></head>`);
      }
      
      // Inject JS
      if (files['script.js']) {
        html = html.replace('</body>', `<script>${files['script.js']}<\/script></body>`);
      }

      iframeRef.current.srcdoc = html;
    }, [files, iframeRef]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full h-full ${className}`}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full bg-card rounded-xl border border-border shadow-2xl"
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
        />
      </motion.div>
    );
  }
);

PreviewFrame.displayName = 'PreviewFrame';

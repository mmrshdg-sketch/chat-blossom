import { motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { providers, AIProvider } from '@/lib/ai-providers';

interface ProviderSelectorProps {
  selectedProvider: string;
  onSelect: (providerId: string) => void;
}

export const ProviderSelector = ({ selectedProvider, onSelect }: ProviderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentProvider = providers.find(p => p.id === selectedProvider) || providers[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:bg-secondary/50 transition-colors text-sm"
      >
        <span>{currentProvider.icon}</span>
        <span className="text-foreground font-medium">{currentProvider.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl p-2 z-50 shadow-xl border border-border"
          >
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  onSelect(provider.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedProvider === provider.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary/50'
                }`}
              >
                <span className="text-xl">{provider.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-muted-foreground">{provider.description}</div>
                </div>
                {selectedProvider === provider.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

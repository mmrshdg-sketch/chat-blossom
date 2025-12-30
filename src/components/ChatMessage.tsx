import { motion } from 'framer-motion';
import { User, Bot, Code, Image } from 'lucide-react';
import { Message } from '@/types/project';

interface ChatMessageProps {
  message: Message;
  onViewCode?: () => void;
}

export const ChatMessage = ({ message, onViewCode }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary' : 'bg-secondary border border-border'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-sm' 
            : 'glass-card rounded-tl-sm'
        }`}>
          {message.imageUrl ? (
            <div className="space-y-2">
              <img 
                src={message.imageUrl} 
                alt="Generated" 
                className="rounded-lg max-w-full h-auto"
                loading="lazy"
              />
              <p className="text-sm opacity-90">{message.content}</p>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Action buttons for assistant messages with code */}
        {!isUser && message.files && Object.keys(message.files).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 flex gap-2"
          >
            <button
              onClick={onViewCode}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Code className="w-3 h-3" />
              View Code
            </button>
          </motion.div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-muted-foreground mt-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};

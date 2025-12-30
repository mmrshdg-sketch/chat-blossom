import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { ProjectVersion } from '@/types/project';

interface VersionHistoryProps {
  versions: ProjectVersion[];
  currentVersionId?: string;
  onLoadVersion: (versionId: string) => void;
}

export const VersionHistory = ({ versions, currentVersionId, onLoadVersion }: VersionHistoryProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Version History
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No versions yet</p>
          </div>
        ) : (
          versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onLoadVersion(version.id)}
              className={`glass-card rounded-xl overflow-hidden p-2 cursor-pointer group transition-all ${
                currentVersionId === version.id
                  ? 'border-primary/50 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              {version.snapshot ? (
                <img
                  src={version.snapshot}
                  alt={`Version ${versions.length - index}`}
                  className="w-full aspect-video object-cover rounded-lg mb-2 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-video rounded-lg mb-2 bg-secondary/50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="px-1">
                <div className="text-[10px] text-primary font-bold mb-1">
                  VERSION {versions.length - index}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                  {version.prompt}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

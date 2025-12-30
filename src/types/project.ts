export interface ProjectFile {
  name: string;
  content: string;
}

export interface ProjectVersion {
  id: string;
  prompt: string;
  files: Record<string, string>;
  snapshot?: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  versions: ProjectVersion[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isCode?: boolean;
  files?: Record<string, string>;
  imageUrl?: string;
}

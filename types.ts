export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  ANGRY = 'Angry'
}

export interface TicketHistoryItem {
  timestamp: string;
  action: string;
  actor: string; // 'System' | 'Admin' | 'AI'
  details?: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  email: string;
  orderId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  
  // AI Analyzed Fields
  aiPriority: TicketPriority;
  aiSentiment: Sentiment;
  aiSummary: string;
  aiSuggestedResponse: string;
  
  // Manual Overrides
  manualPriority?: TicketPriority;
  manualSentiment?: Sentiment;

  history: TicketHistoryItem[];
  tags: string[];
}

export interface AIAnalysisResult {
  priority: TicketPriority;
  sentiment: Sentiment;
  summary: string;
  suggestedResponse: string;
}

export interface MockOrder {
  id: string;
  items: string[];
  total: number;
  date: string;
  status: string;
}
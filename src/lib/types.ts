export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician';
  avatarUrl: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  aiSummary?: string;
  aiSentiment?: 'Positive' | 'Negative' | 'Neutral' | string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'customer';
  avatarUrl: string;
  status?: 'Active' | 'Blocked';
  phone?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

export type Dealer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};

export type ServiceRequest = {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  status: 'Pending' | 'In Progress' | 'Awaiting Parts' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  assignedToId?: string;
  assignedToName?: string;
  created_at: string;
  updated_at: string;
  completedAt?: string;
  aiSummary?: string;
  aiSentiment?: string;
};

import { User, Client, ServiceRequest, Dealer } from './types';
import { subDays, subHours } from 'date-fns';

// This file is now deprecated for most data, which is fetched from Supabase.
// It can be used for UI-only mock data if needed.

export const users: User[] = [];
export const clients: Client[] = [];
export const dealers: Dealer[] = [];
export const serviceRequests: ServiceRequest[] = [];

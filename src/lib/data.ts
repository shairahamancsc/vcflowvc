import { User, Client, ServiceRequest, Dealer } from './types';
import { subDays, subHours } from 'date-fns';

export const users: User[] = [
  {
    id: '1',
    name: 'Alicia Keys',
    email: 'alicia@example.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx3b21hbiUyMHBvcnRyYWl0fGVufDB8fHx8MTc2NTIzMzE2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
  },
  {
    id: '2',
    name: 'John Mayer',
    email: 'john@example.com',
    role: 'technician',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjUxODU4NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
  },
   {
    id: '3',
    name: 'Billie Eilish',
    email: 'billie@example.com',
    role: 'technician',
    avatarUrl: 'https://images.unsplash.com/photo-1525786210598-d527194d3e9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXN8ZW58MHx8fHwxNzY1MjcyOTYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Active',
  },
];

export const clients: Client[] = [
  {
    id: '1',
    name: 'Michael Scott',
    email: 'michael@dundermifflin.com',
    phone: '570-123-4567',
    address: '1725 Slough Avenue, Scranton, PA',
    created_at: subDays(new Date(), 5).toISOString(),
  },
  {
    id: '2',
    name: 'Dwight Schrute',
    email: 'dwight@dundermifflin.com',
    phone: '570-123-4568',
    address: 'Schrute Farms, Honesdale, PA',
    created_at: subDays(new Date(), 15).toISOString(),
  },
   {
    id: '3',
    name: 'Pam Beesly',
    email: 'pam@dundermifflin.com',
    phone: '570-123-4569',
    address: '2230 Wyoming Avenue, Scranton, PA',
    created_at: subDays(new Date(), 25).toISOString(),
  },
   {
    id: '4',
    name: 'Jim Halpert',
    email: 'jim@dundermifflin.com',
    phone: '570-123-4510',
    address: '1170 N. Washington Ave, Scranton, PA',
    created_at: subDays(new Date(), 40).toISOString(),
  },
];

export const dealers: Dealer[] = [
  {
    id: '1',
    name: 'Printers Inc.',
    email: 'contact@printersinc.com',
    phone: '800-555-1234',
    created_at: subDays(new Date(), 120).toISOString(),
  },
  {
    id: '2',
    name: 'Computer Parts Galore',
    email: 'sales@partsgalore.com',
    phone: '888-555-5678',
    created_at: subDays(new Date(), 90).toISOString(),
  }
];

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'REQ-001',
    title: 'Printer not printing in color',
    description: 'The main office printer, a Canon Pixma Pro-100, is failing to print in any color except black and white. We have tried replacing the ink cartridges and running the deep cleaning cycle multiple times without success. The printer is critical for marketing materials.',
    clientId: '1',
    clientName: 'Michael Scott',
    status: 'Pending',
    priority: 'High',
    assignedToId: '2',
    assignedToName: 'John Mayer',
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: subHours(new Date(), 4).toISOString(),
  },
  {
    id: 'REQ-002',
    title: 'Laptop screen is cracked',
    description: 'My personal laptop, a Dell XPS 15, fell off my desk and the screen is now cracked. The display is flickering and is mostly unusable. I need the screen replaced as soon as possible.',
    clientId: '4',
    clientName: 'Jim Halpert',
    status: 'In Progress',
    priority: 'Medium',
    assignedToId: '3',
    assignedToName: 'Billie Eilish',
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subHours(new Date(), 1).toISOString(),
  },
  {
    id: 'REQ-003',
    title: 'Server data recovery',
    description: 'Our main file server crashed over the weekend. It is not booting up and we are unable to access any files. We need to recover critical sales data from the hard drives.',
    clientId: '2',
    clientName: 'Dwight Schrute',
    status: 'Awaiting Parts',
    priority: 'High',
    assignedToId: '2',
    assignedToName: 'John Mayer',
    created_at: subDays(new Date(), 4).toISOString(),
    updated_at: subHours(new Date(), 8).toISOString(),
  },
  {
    id: 'REQ-004',
    title: 'PC running very slow',
    description: "The receptionist's PC has become extremely slow and frequently freezes. It is impacting her ability to manage calls and appointments. It might have a virus or could need a hardware upgrade.",
    clientId: '3',
    clientName: 'Pam Beesly',
    status: 'Completed',
    priority: 'Low',
    assignedToId: '3',
    assignedToName: 'Billie Eilish',
    created_at: subDays(new Date(), 10).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
];

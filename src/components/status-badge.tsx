import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ServiceRequest } from '@/lib/types';

interface StatusBadgeProps {
  status: ServiceRequest['status'];
}

const statusStyles: Record<ServiceRequest['status'], string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
  'Awaiting Parts': 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
  'Ready for Pickup': 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200',
  Completed: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
  Cancelled: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', statusStyles[status])}
    >
      {status}
    </Badge>
  );
}

import { Cable } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Cable className="h-7 w-7 text-primary" />
      <h1 className="text-xl font-bold text-foreground">
        <span className="font-bold text-destructive">VC</span> Flow
      </h1>
    </div>
  );
}

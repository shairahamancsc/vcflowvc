'use client';

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden">
      <div className="relative flex items-center justify-center text-6xl md:text-8xl font-bold">
        <div className="opacity-0 animate-splash-v">
          <span className="text-destructive">V</span>
        </div>
        <div className="opacity-0 animate-splash-c ml-2">
          <span className="text-destructive">C</span>
        </div>
        <div className="opacity-0 animate-splash-flow ml-4">
          <span>Flow</span>
        </div>
      </div>
      <div className="absolute bottom-8 text-sm text-muted-foreground opacity-0 animate-splash-credit">
        Made By Shaik Anisul Rahaman
      </div>
    </div>
  );
}

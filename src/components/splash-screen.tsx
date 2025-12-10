'use client';

import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [vVisible, setVVisible] = useState(false);
  const [cVisible, setCVisible] = useState(false);
  const [flowVisible, setFlowVisible] = useState(false);
  const [creditVisible, setCreditVisible] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setVVisible(true), 200);
    const timer2 = setTimeout(() => setCVisible(true), 400);
    const timer3 = setTimeout(() => setFlowVisible(true), 600);
    const timer4 = setTimeout(() => setCreditVisible(true), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden">
      <div className="relative flex items-center justify-center text-6xl md:text-8xl font-bold">
        <div
          className={`transition-transform duration-700 ease-out ${
            vVisible ? 'translate-x-0' : '-translate-x-48'
          }`}
        >
          <span className="text-destructive">V</span>
        </div>
        <div
          className={`transition-transform duration-700 ease-out ml-2 ${
            cVisible ? 'translate-x-0' : 'translate-x-48'
          }`}
        >
          <span className="text-destructive">C</span>
        </div>
        <div
          className={`transition-transform duration-700 ease-out ml-4 ${
            flowVisible ? 'translate-x-0' : 'translate-x-48'
          }`}
        >
          <span>Flow</span>
        </div>
      </div>
      <div
        className={`absolute bottom-8 text-sm text-muted-foreground transition-opacity duration-1000 ${
          creditVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Made By Shaik Anisul Rahaman
      </div>
    </div>
  );
}

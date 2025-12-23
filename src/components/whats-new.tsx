
'use client';

import { useEffect, useState } from 'react';
import releaseNotes from '@/lib/release-notes.json';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Rocket } from 'lucide-react';

const LAST_SEEN_VERSION_KEY = 'lastSeenVersion';

export function WhatsNew({ version }: { version: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // This code runs only on the client
    const storedVersion = localStorage.getItem(LAST_SEEN_VERSION_KEY);

    if (storedVersion !== version) {
      setIsOpen(true);
    }
  }, [version]);

  const handleClose = () => {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
    setIsOpen(false);
  };

  const notes = releaseNotes.notes.find(note => note.version === version);

  if (!isOpen || !notes) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            What's New in Version {version}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Here are the latest updates and improvements we've made to the app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="prose prose-sm max-h-60 overflow-y-auto pr-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              {notes.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>Got it, thanks!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

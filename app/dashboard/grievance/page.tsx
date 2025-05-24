'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GrievancePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Grievance Uploading</h1>
      <Alert className="bg-purple-900/20 border-purple-800 text-purple-300">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Grievance uploading system coming soon! We're working hard to bring you this feature.
        </AlertDescription>
      </Alert>
    </div>
  );
}

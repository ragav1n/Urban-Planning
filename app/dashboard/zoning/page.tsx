'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ZoningPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Optimal Zoning</h1>
      <Alert className="bg-purple-900/20 border-purple-800 text-purple-300">
        <AlertDescription>
          <AlertCircle className="h-4 w-4" />
          Optimal zoning analysis feature coming soon! We're developing advanced algorithms to help you make better zoning decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}

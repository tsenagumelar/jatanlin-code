'use client';

import { useEffect } from 'react';
import { Button, Text } from '@/src/components/atoms';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg border border-[#e0e0e0]">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-[#323130] mb-4">
          Terjadi kesalahan!
        </h2>
        <Text size={400} className="mb-6 text-[#605e5c]">
          {error.message || 'Terjadi kesalahan tak terduga.'}
        </Text>
        <Button variant="primary" onClick={() => reset()}>
          Coba lagi
        </Button>
      </div>
    </div>
  );
}

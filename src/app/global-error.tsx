'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center font-sans">
        <h2 className="text-xl font-semibold">Critical System Error</h2>
        <p className="max-w-md text-sm text-neutral-600">
          {error.message || 'A root layout failure occurred.'}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}


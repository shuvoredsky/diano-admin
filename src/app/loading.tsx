export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-muted-foreground"
    >
      Loading DIANO Admin workspace...
    </div>
  );
}


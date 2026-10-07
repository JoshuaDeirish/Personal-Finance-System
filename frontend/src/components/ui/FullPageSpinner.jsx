import Spinner from "./Spinner";

export default function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center text-brand" role="status">
      <Spinner className="size-8" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

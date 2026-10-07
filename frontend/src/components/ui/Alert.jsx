const TONES = {
  error: "border-negative/30 bg-negative/10 text-negative",
  success: "border-positive/30 bg-positive/10 text-positive",
  info: "border-line bg-surface-muted text-ink",
};

export default function Alert({ tone = "info", children }) {
  if (!children) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

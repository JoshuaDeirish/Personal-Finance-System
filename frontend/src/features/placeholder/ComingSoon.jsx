import Icon from "../../components/ui/Icon";
import PageHeader from "../../components/ui/PageHeader";

/** Placeholder for screens that arrive in a later build phase. */
export default function ComingSoon({ item }) {
  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
          <Icon name={item.icon} className="size-6" />
        </span>
        <p className="mt-4 font-semibold text-ink">Coming in Phase {item.phase}</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          The foundation is in place. This screen will be built in its planned phase.
        </p>
      </div>
    </>
  );
}

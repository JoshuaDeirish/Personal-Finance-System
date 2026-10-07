import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" description="That page doesn't exist." />
      <Link to="/" className="text-sm font-semibold text-brand hover:text-brand-strong">
        Back to Dashboard
      </Link>
    </>
  );
}

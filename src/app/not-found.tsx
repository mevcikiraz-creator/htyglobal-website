import Arrow from "@/components/arrow";
import Link from "next/link";
export default function NotFound() {
  return (
    <main className="section">
      <h1>Page not found.</h1>
      <Link className="text-link" href="/">
        Return home <Arrow />
      </Link>
    </main>
  );
}

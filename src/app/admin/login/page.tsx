import Arrow from "@/components/arrow";
import Link from "next/link";
import { redirect } from "next/navigation";
import { session } from "@/lib/auth";
import { login } from "../actions";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await session()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="login">
      <Link className="brand" href="/">
        HTY GLOBAL<small>CONTENT STUDIO</small>
      </Link>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your website.</p>
      {error && (
        <p role="alert">
          {error === "rate"
            ? "Too many attempts. Please try again later."
            : "Email or password is incorrect."}
        </p>
      )}
      <form action={login}>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="button dark">
          Sign in <Arrow direction="right" />
        </button>
      </form>
      <p className="muted" style={{ marginTop: 25 }}>
        First administrator? Follow the secure setup steps in the README.
      </p>
    </main>
  );
}

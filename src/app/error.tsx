"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="section">
      <h1>Something needs attention.</h1>
      <p>Please check your input or try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}

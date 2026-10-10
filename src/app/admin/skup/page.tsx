import SkupClient from "./SkupClient";

// ?klient=<id> (from a client card) opens the receipt form with that client filled in.
export default async function SkupPage({ searchParams }: { searchParams: Promise<{ klient?: string }> }) {
  const { klient } = await searchParams;
  return <SkupClient initialClientId={klient && /^[0-9a-f-]{36}$/i.test(klient) ? klient : null} />;
}

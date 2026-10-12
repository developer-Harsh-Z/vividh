// Shows the ?ok= / ?error= message that form actions redirect back with.
export default async function Flash({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  const ok = typeof p.ok === "string" ? p.ok : null;
  const error = typeof p.error === "string" ? p.error : null;
  if (!ok && !error) return null;
  return <p className={`flash ${error ? "error" : "ok"}`} role={error ? "alert" : "status"}>{error ?? ok}</p>;
}

export type PageProps<P = Record<string, string>> = {
  params: Promise<P>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const sp = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

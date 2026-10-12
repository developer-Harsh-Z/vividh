import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

// Validation errors carry a message the user can act on; actions send it back as ?error=.
export class FormError extends Error {}
const fail = (msg: string): never => { throw new FormError(msg); };

type Opt = { label?: string; max?: number; optional?: boolean };

export function text(fd: FormData, name: string, o: Opt = {}): string {
  const v = String(fd.get(name) ?? "").trim();
  const label = o.label ?? name;
  if (!v && !o.optional) fail(`${label} is required.`);
  if (v.length > (o.max ?? 300)) fail(`${label} can be at most ${o.max ?? 300} characters.`);
  return v;
}

export const optional = (fd: FormData, name: string, o: Opt = {}) => text(fd, name, { ...o, optional: true }) || null;

export function int(fd: FormData, name: string, min: number, max: number, label = name): number {
  const n = Number(fd.get(name));
  if (!Number.isInteger(n) || n < min || n > max) fail(`${label} must be a whole number from ${min} to ${max}.`);
  return n;
}

export function pick<T extends string>(fd: FormData, name: string, values: readonly T[], label = name): T {
  const v = String(fd.get(name) ?? "") as T;
  if (!values.includes(v)) fail(`Choose a valid ${label}.`);
  return v;
}

export function link(fd: FormData, name: string, label = name): string | null {
  const v = optional(fd, name, { label, max: 500 });
  if (v && !/^https:\/\/[^\s]+$/.test(v)) fail(`${label} must be a full https:// link.`);
  return v;
}

export function day(fd: FormData, name: string, label = name): Date {
  const d = new Date(String(fd.get(name) ?? ""));
  if (isNaN(d.getTime())) fail(`${label} needs a valid date.`);
  return d;
}

export const parseTags = (raw: string) =>
  [...new Set(raw.split(",").map((t) => t.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 20);
export const tags = (fd: FormData, name: string) => parseTags(String(fd.get(name) ?? ""));

const withMsg = (path: string, key: "ok" | "error", msg: string) =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(msg)}`;

// Runs a form action, then redirects back to `path` with a success or error message.
// Works without JavaScript: the page reads ?ok= / ?error= and shows <Flash>.
export async function act(path: string, fn: () => Promise<string | void>): Promise<never> {
  let msg: string | void;
  try {
    msg = await fn();
  } catch (e) {
    if (e instanceof FormError) redirect(withMsg(path, "error", e.message));
    throw e;
  }
  redirect(withMsg(path, "ok", msg || "Saved."));
}

// Append-only record of admin changes (PRD F6).
export function audit(actorId: string, action: string, targetType: string, targetId: string, before?: unknown, after?: unknown) {
  return db.activityLog.create({
    data: {
      actorId, action, targetType, targetId,
      before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
      after: (after ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

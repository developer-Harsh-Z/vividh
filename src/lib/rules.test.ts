import { test } from "node:test";
import assert from "node:assert/strict";
import { atLeast, allowedEmail, canSignIn, isUset, checkUpload, slugify, driveFolderId, signSession, verifySession, canSeeMedia } from "./rules.ts";

test("roles rank in order", () => {
  assert.ok(atLeast("owner", "admin"));
  assert.ok(!atLeast("member", "admin"));
  assert.ok(!atLeast(undefined, "student"));
});

test("only college addresses may sign in", () => {
  assert.ok(allowedEmail("Riya.uset@LTSU.ac.in", "ltsu.ac.in"));
  assert.ok(!allowedEmail("riya@gmail.com", "ltsu.ac.in"));
  assert.ok(!allowedEmail("evil@ltsu.ac.in.attacker.com", "ltsu.ac.in"));
  assert.ok(canSignIn("Owner@Gmail.com", "ltsu.ac.in", ["owner@gmail.com"]));
  assert.ok(!canSignIn("other@gmail.com", "ltsu.ac.in", ["owner@gmail.com"]));
  assert.ok(!canSignIn("x@gmail.com", "ltsu.ac.in", [""]));
  assert.ok(isUset("riya.uset@ltsu.ac.in", ".uset@ltsu.ac.in"));
  assert.ok(!isUset("prof@ltsu.ac.in", ".uset@ltsu.ac.in"));
});

test("upload limits", () => {
  assert.equal(checkUpload("image/jpeg", 1000), null);
  assert.match(checkUpload("image/jpeg", 26 * 1024 * 1024)!, /25 MB/);
  assert.match(checkUpload("video/mp4", 51 * 1024 * 1024)!, /50 MB/);
  assert.match(checkUpload("image/heic", 10)!, /Only/);
  assert.match(checkUpload("application/pdf", 10)!, /Only/);
});

test("slugs and Drive folder links", () => {
  assert.equal(slugify("USET Annual Fest: Night 2!", new Date("2026-03-12")), "uset-annual-fest-night-2-2026");
  assert.equal(slugify("USET Annual Fest 2026", new Date("2026-03-12")), "uset-annual-fest-2026");
  assert.equal(driveFolderId("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMn?usp=sharing"), "1AbCdEfGhIjKlMn");
  assert.equal(driveFolderId("1AbCdEfGhIjKlMn"), "1AbCdEfGhIjKlMn");
  assert.equal(driveFolderId("not a link"), null);
});

test("sessions reject tampering and expiry", () => {
  const t = signSession({ uid: "u1", exp: Date.now() + 1000 }, "secret");
  assert.equal(verifySession(t, "secret")?.uid, "u1");
  assert.equal(verifySession(t, "other-secret"), null);
  assert.equal(verifySession(t.replace(/^./, "x"), "secret"), null);
  assert.equal(verifySession(t, "secret", Date.now() + 5000), null);
  assert.equal(verifySession("garbage", "secret"), null);
});

test("media visibility", () => {
  const m = { status: "approved", eventPublic: true, eventArchived: false, uploaderId: "u1" };
  assert.equal(canSeeMedia(m, null), "public");
  assert.equal(canSeeMedia({ ...m, eventPublic: false }, null), false);
  assert.equal(canSeeMedia({ ...m, eventPublic: false }, { id: "u2", role: "member" }), "private");
  assert.equal(canSeeMedia({ ...m, status: "pending" }, { id: "u2", role: "member" }), false);
  assert.equal(canSeeMedia({ ...m, status: "pending" }, { id: "u1", role: "student" }), "private");
  assert.equal(canSeeMedia({ ...m, status: "pending" }, { id: "u3", role: "admin" }), "private");
});

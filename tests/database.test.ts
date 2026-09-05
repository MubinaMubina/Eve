import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const alice = "00000000-0000-4000-8000-000000000001";
const beth = "00000000-0000-4000-8000-000000000002";
let db: PGlite;

async function asUser(
  id: string,
  sql: string,
  params: unknown[] = [],
  role = "authenticated",
) {
  await db.exec(`set role ${role}`);
  try {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      id,
    ]);
    return await db.query(sql, params);
  } finally {
    await db.exec("reset role");
  }
}

const onboarding =
  "select public.eve_complete_onboarding($1, $2, $3::date, $4, $5)";
const details = ["alice", "Alice", "2000-01-01", true, "private"];

beforeAll(async () => {
  db = new PGlite();
  // Model Supabase's authenticated identity context, not its token-verification service.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  await db.exec(
    await readFile(
      new URL(
        "../supabase/migrations/202609060001_admission_foundation.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
});

beforeEach(async () => {
  await db.exec(
    "truncate private.admission_requests, private.accounts, auth.users cascade",
  );
  await db.exec(
    "update private.release_config set member_access_enabled = false",
  );
  await db.query("insert into auth.users values ($1, now()), ($2, null)", [
    alice,
    beth,
  ]);
});
afterAll(async () => {
  await db?.close();
});

describe("admission database foundation", () => {
  it("creates only a Tier 1 applicant and never opens member access", async () => {
    await asUser(alice, onboarding, details);
    const result = await asUser(
      alice,
      "select * from public.eve_my_application()",
    );
    expect(result.rows).toEqual([
      {
        handle: "alice",
        display_name: "Alice",
        privacy: "private",
        account_status: "active",
        review_status: null,
        member_access: false,
      },
    ]);
    expect(
      (await db.query("select tier, admitted_at from private.accounts")).rows,
    ).toEqual([{ tier: 1, admitted_at: null }]);
  });
  it("rejects unverified email, missing privacy, underage DOB and false declarations", async () => {
    await expect(asUser(beth, onboarding, details)).rejects.toThrow(
      "Verified email required",
    );
    await expect(
      asUser(alice, onboarding, [...details.slice(0, 4), null]),
    ).rejects.toThrow("Choose account privacy");
    await expect(
      asUser(alice, onboarding, [
        "alice",
        "Alice",
        "2020-01-01",
        true,
        "private",
      ]),
    ).rejects.toThrow("Adult eligibility");
    await expect(
      asUser(alice, onboarding, [
        "alice",
        "Alice",
        "2000-01-01",
        false,
        "private",
      ]),
    ).rejects.toThrow("Adult eligibility");
  });
  it("normalizes handles and reserves anonymous case-insensitively", async () => {
    await expect(
      asUser(alice, onboarding, [" AnOnYmOuS ", ...details.slice(1)]),
    ).rejects.toThrow();
    await asUser(alice, onboarding, [" ALICE ", ...details.slice(1)]);
    expect(
      (await asUser(alice, "select handle from public.eve_my_application()"))
        .rows,
    ).toEqual([{ handle: "alice" }]);
  });
  it("requires completed onboarding to request review; repeat requests are idempotent", async () => {
    await expect(
      asUser(alice, "select public.eve_request_team_review()"),
    ).rejects.toThrow();
    await asUser(alice, onboarding, details);
    await asUser(alice, "select public.eve_request_team_review()");
    await asUser(alice, "select public.eve_request_team_review()");
    expect(
      (await db.query("select status from private.admission_requests")).rows,
    ).toEqual([{ status: "pending" }]);
  });
  it("does not allow suspended applicants to request review", async () => {
    await asUser(alice, onboarding, details);
    await db.exec("update private.accounts set status = 'suspended'");
    await expect(
      asUser(alice, "select public.eve_request_team_review()"),
    ).rejects.toThrow();
  });
  it("keeps review notes and other applicant statuses private", async () => {
    await asUser(alice, onboarding, details);
    await asUser(alice, "select public.eve_request_team_review()");
    await db.exec(
      "update private.admission_requests set review_notes = 'Confidential finding'",
    );
    expect(
      (await asUser(beth, "select * from public.eve_my_application()")).rows,
    ).toEqual([]);
    expect(
      JSON.stringify(
        (await asUser(alice, "select * from public.eve_my_application()")).rows,
      ),
    ).not.toContain("Confidential");
  });
  it("blocks all direct tables and self-approval", async () => {
    await asUser(alice, onboarding, details);
    for (const sql of [
      "select * from private.accounts",
      "select * from private.admission_requests",
      "update private.accounts set tier = 3, admitted_at = now()",
      "update private.release_config set member_access_enabled = true",
      "insert into private.admission_requests(applicant_id, status) values ('" +
        alice +
        "', 'approved')",
    ])
      await expect(asUser(alice, sql)).rejects.toThrow("permission denied");
  });
  it("denies anonymous callers access to the entire RPC allowlist", async () => {
    for (const sql of [
      "select public.eve_my_application()",
      "select public.eve_request_team_review()",
    ]) {
      await expect(asUser("", sql, [], "anon")).rejects.toThrow(
        "permission denied",
      );
    }
    await expect(asUser("", onboarding, details, "anon")).rejects.toThrow(
      "permission denied",
    );
  });
  it("keeps the release gate closed even for an administratively admitted account", async () => {
    await asUser(alice, onboarding, details);
    await db.exec("update private.accounts set tier = 2, admitted_at = now()");
    expect(
      (
        await asUser(
          alice,
          "select member_access from public.eve_my_application()",
        )
      ).rows,
    ).toEqual([{ member_access: false }]);
  });
  it("gives API owners no login, bypass, membership-admin or reviewer-note privileges", async () => {
    const role = await db.query(
      "select rolcanlogin, rolbypassrls, rolsuper from pg_roles where rolname = 'eve_member_api'",
    );
    expect(role.rows).toEqual([
      { rolcanlogin: false, rolbypassrls: false, rolsuper: false },
    ]);
    expect(
      (
        await db.query(
          "select has_column_privilege('eve_member_api', 'private.accounts', 'tier', 'UPDATE') as admin, has_column_privilege('eve_member_api', 'private.admission_requests', 'review_notes', 'SELECT') as notes",
        )
      ).rows,
    ).toEqual([{ admin: false, notes: false }]);
  });
});

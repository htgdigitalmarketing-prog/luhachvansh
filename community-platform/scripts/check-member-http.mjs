import assert from "node:assert/strict";
const base = "http://127.0.0.1:3021";
for (const action of ["state", "search&q=Ananya", "family&id=archive-a"]) {
  const r = await fetch(base + "/api/members?action=" + action);
  assert.equal(r.status, 401);
  assert(!JSON.stringify(await r.json()).includes("Ananya"));
}
const csrf = await fetch(base + "/api/members", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://invalid.example",
  },
  body: JSON.stringify({
    action: "signin",
    username: "qa.owner",
    password: "Only for synthetic local UI tests 2026",
  }),
});
assert.equal(csrf.status, 403);
const spoof = await fetch(base + "/api/members", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ action: "login", account: "admin" }),
});
assert.equal(spoof.status, 401);
const auth = await fetch(base + "/api/members", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({
    action: "signin",
    username: "qa.member",
    password: "Only for synthetic local UI tests 2026",
  }),
});
assert.equal(auth.status, 200);
const cookie = auth.headers.get("set-cookie");
assert(cookie.includes("HttpOnly"));
assert(cookie.includes("SameSite=strict"));
const state = await fetch(base + "/api/members?action=state", {
  headers: { Cookie: cookie.split(";")[0] },
});
assert.equal(state.status, 200);
assert.equal((await state.json()).actor.role, "member");
const denied = await fetch(base + "/api/members", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: base,
    Cookie: cookie.split(";")[0],
  },
  body: JSON.stringify({ action: "invite", label: "Forbidden" }),
});
assert.equal(denied.status, 403);
const logout = await fetch(base + "/api/members", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: base,
    Cookie: cookie.split(";")[0],
  },
  body: JSON.stringify({ action: "logout" }),
});
assert.equal(logout.status, 200);
assert.equal(
  (
    await fetch(base + "/api/members?action=state", {
      headers: { Cookie: cookie.split(";")[0] },
    })
  ).status,
  401,
);
console.log(
  "HTTP checks passed: anonymous data denied, CSRF denied, persona bypass denied, real login/cookie accepted, role escalation denied, logout revokes server session.",
);

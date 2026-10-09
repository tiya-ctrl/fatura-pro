import { isExistingAccountSignUp, needsEmailConfirmation } from "./auth";

test("sign-up for an email that already has an account is recognised", () => {
  // Supabase returns a user without identities and no session (and sends no email).
  expect(isExistingAccountSignUp({ user: { id: "x", identities: [] }, session: null })).toBe(true);
});

test("a real new sign-up is not mistaken for an existing account", () => {
  const res = { user: { id: "x", identities: [{ provider: "email" }] }, session: null };
  expect(isExistingAccountSignUp(res)).toBe(false);
  expect(needsEmailConfirmation(res)).toBe(true);
  expect(isExistingAccountSignUp({ user: { id: "x" }, session: null })).toBe(false);
  expect(isExistingAccountSignUp(null)).toBe(false);
});

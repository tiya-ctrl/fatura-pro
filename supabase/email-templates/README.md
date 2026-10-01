# Supabase Auth email templates

Paste each file into Supabase → Authentication → Emails → Templates → <template>, with this subject, then Save changes.
These use the same layout as server/email.js (brandedEmail). Keep the {{ ... }} variables.

| Template | Subject | File |
|---|---|---|
| confirm-sign-up | Confirm your email for FaturaPro | confirm-sign-up.html |
| reset-password | Reset your FaturaPro password | reset-password.html |
| magic-link | Your FaturaPro sign-in link | magic-link.html |
| change-email-address | Confirm your new email address | change-email-address.html |
| invite-user | You're invited to FaturaPro | invite-user.html |
| reauthentication | Your FaturaPro verification code | reauthentication.html |

# Ambassador application endpoint

Ambassador applications are handled by `api/waitlist-confirm.js` with `?intent=ambassador`. The shared handler keeps validation, email notifications and server-side rate limiting in one Vercel Function.

This documentation file intentionally does not create an additional Vercel Function.

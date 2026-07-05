---
name: Made Super AI outbound features (email / social posting)
description: The done-for-you model behind real outbound features and why per-customer sending isn't wired up
---

# Outbound features — "done-for-you" single-account model

Real outbound features (email sending; later Facebook Page posting) send from ONE
account connected at the app/owner level via Replit connectors — NOT from each
customer's own account.

**Why:** Replit connectors attach the OWNER's authorized account (e.g. the
`google-mail` connector = owner's Gmail), not each end-user's. There is no
per-customer OAuth in v1. So the honest capability is: the app composes and sends
outbound mail from the app's single connected mailbox. It canNOT read an inbox,
reply to incoming mail, or send as an arbitrary customer's personal account.

**How to apply:**
- Describe email as "sends from the connected email account", never "from your inbox".
- The Email Sender UI gates the Send button on `GET /email/status.connected`; if no
  account is connected, drafting still works but sending is off. Never claim a send
  that didn't happen (the trust-broken owner demands this).
- Facebook Page posting will need the same framing PLUS a bring-your-own Meta app
  (connector requires_setup) and Meta app review (~1-3 weeks) before it can post for
  real — it is blocked on setup the user must do, so don't ship send-UI that can't send.

# Raw-MIME email safety

When building Gmail `messages.send` raw MIME by hand, header values (`To`, `Subject`,
`From`) must reject CR/LF or a caller can inject extra headers (hidden Bcc, etc.).
Validate the recipient as a real email and strip/verify newlines both in the route
and in the encoder (defense in depth).

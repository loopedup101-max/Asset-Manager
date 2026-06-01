import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import {
  CreateConversationBody,
  GetConversationParams,
  UpdateConversationParams,
  UpdateConversationBody,
  DeleteConversationParams,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.match(/api|endpoint|rest|graphql|webhook|http|fetch|axios|request/)) {
    return `Great question about APIs! Here's how I can help:

**Building REST APIs:**
- Define your endpoints (GET, POST, PUT, PATCH, DELETE)
- Use Express, FastAPI, or Next.js API routes depending on your stack
- Always validate inputs with Zod, Joi, or Pydantic
- Return consistent JSON response shapes with proper HTTP status codes

**Example Express endpoint:**
\`\`\`js
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await db.users.create({ name, email });
  res.status(201).json(user);
});
\`\`\`

**API Best Practices:**
- Version your APIs (/api/v1/)
- Use authentication (JWT or API keys)
- Rate limit to prevent abuse
- Document with OpenAPI/Swagger

What specific API are you building?`;
  }

  if (msg.match(/domain|dns|subdomain|hosting|deploy|production|server|vps|nginx|ssl|https|certificate/)) {
    return `Here's everything you need to know about domains and deployment:

**Custom Domain Setup:**
1. Buy a domain (Namecheap, GoDaddy, or Cloudflare)
2. Add DNS records:
   - \`A record\` → points to your server IP
   - \`CNAME record\` → points a subdomain to another domain
3. Wait 10–48 hours for DNS propagation

**SSL/HTTPS (Free with Let's Encrypt):**
\`\`\`bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

**Nginx Config Example:**
\`\`\`nginx
server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$host$request_uri;
}
server {
  listen 443 ssl;
  server_name yourdomain.com;
  proxy_pass http://localhost:3000;
}
\`\`\`

**Quick Deploy Options:**
- **Replit** — deploy directly from this app
- **Vercel** — great for frontends (zero config)
- **Railway / Render** — backend + database
- **DigitalOcean / AWS** — full control VPS

What platform are you deploying to?`;
  }

  if (msg.match(/database|sql|postgres|mysql|mongodb|drizzle|prisma|schema|table|query|orm/)) {
    return `Let me walk you through database setup and queries:

**Choosing a Database:**
- **PostgreSQL** — best for structured data, relationships, and scale
- **MongoDB** — flexible documents, great for variable schemas
- **SQLite** — simple file-based DB for small apps or dev

**Schema Design Example (Drizzle ORM):**
\`\`\`ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
\`\`\`

**Common SQL Queries:**
\`\`\`sql
-- Select with filter
SELECT * FROM users WHERE email = 'user@example.com';

-- Join tables
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;

-- Index for performance
CREATE INDEX idx_users_email ON users(email);
\`\`\`

**Performance Tips:**
- Always index columns you filter/sort by
- Use connection pooling in production
- Paginate large result sets (LIMIT + OFFSET)

What's your database setup?`;
  }

  if (msg.match(/auth|login|signup|jwt|token|session|password|oauth|user/)) {
    return `Here's how to implement authentication properly:

**JWT Authentication Flow:**
1. User logs in → server validates credentials
2. Server issues a signed JWT token
3. Client stores token (httpOnly cookie recommended)
4. Client sends token with each request
5. Server verifies token on protected routes

**Example (Node.js + JWT):**
\`\`\`js
// Login route
app.post('/auth/login', async (req, res) => {
  const user = await db.users.findByEmail(req.body.email);
  const valid = await bcrypt.compare(req.body.password, user.hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
  res.json({ token });
});

// Protected middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload;
  next();
};
\`\`\`

**Security Rules:**
- Never store plain-text passwords (use bcrypt)
- Use httpOnly cookies to prevent XSS
- Set short token expiry + refresh tokens
- Always use HTTPS in production

Need help with OAuth (Google, GitHub) or another auth method?`;
  }

  if (msg.match(/build|app|website|frontend|react|vue|next|vite|component|ui|interface/)) {
    return `Here's how to build a modern web app:

**Recommended Stack (2024):**
- **Frontend:** React + Vite or Next.js
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query for server state, Zustand for local
- **Backend:** Express or Next.js API routes
- **Database:** PostgreSQL + Drizzle ORM
- **Deploy:** Vercel (frontend) + Railway (backend)

**Project Structure:**
\`\`\`
src/
├── components/     # Reusable UI components
├── pages/          # Route-level components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and helpers
└── api/            # API client functions
\`\`\`

**React Component Example:**
\`\`\`tsx
export function UserCard({ userId }: { userId: number }) {
  const { data: user, isLoading } = useGetUser(userId);

  if (isLoading) return <Skeleton />;

  return (
    <div className="rounded-xl border p-4">
      <h2 className="font-bold">{user.name}</h2>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}
\`\`\`

What kind of app are you building?`;
  }

  if (msg.match(/code|debug|error|bug|fix|issue|problem|crash|exception|stack trace/)) {
    return `I can help you debug that. Here's my approach:

**Debugging Checklist:**
1. Read the full error message carefully — the stack trace shows exactly where it failed
2. Check the most recently changed code first
3. Add \`console.log\` before the error point to inspect values
4. Isolate the problem — comment out code until it works, then add back

**Common Errors & Fixes:**
- \`Cannot read property of undefined\` → check if data loaded before rendering
- \`CORS error\` → add CORS headers on your server or use a proxy
- \`404 on API routes\` → check your route paths and HTTP method
- \`Module not found\` → run \`npm install\` or check import paths

**Browser DevTools Tips:**
- Network tab → see all API calls and their responses
- Console tab → see JavaScript errors
- Sources tab → set breakpoints and step through code

Paste your error message or code and I'll give you a specific fix.`;
  }

  if (msg.match(/what can you|help me|capabilities|features|do you know|what do you/)) {
    return `I'm **Made Super AI Agent** — here's what I can do for you:

**Code & Development:**
- Build REST APIs and GraphQL endpoints
- Write frontend components (React, Vue, etc.)
- Set up databases and write SQL queries
- Debug errors and fix code issues
- Review and improve existing code

**Infrastructure & Deployment:**
- Configure custom domains and DNS
- Set up SSL certificates
- Deploy to Vercel, Railway, AWS, or VPS
- Configure Nginx and reverse proxies

**Architecture & Design:**
- Design database schemas
- Plan API structures
- Choose the right tech stack for your project
- Security best practices

**AI & Automation:**
- Build AI-powered features
- Set up webhooks and automation
- Integrate third-party APIs (Stripe, Twilio, etc.)

**Just ask me anything** — paste your code, describe your problem, or tell me what you want to build.`;
  }

  // Default thoughtful response
  const defaults = [
    `I'm analyzing your request. Here's my take:\n\nThat's a solid topic to dig into. To give you the most useful answer, could you share a bit more context? For example:\n- What tech stack are you using?\n- What have you tried so far?\n- What's the specific outcome you're looking for?\n\nI can help with code, APIs, databases, deployment, debugging, and architecture — just point me in the right direction.`,
    `Good question. Let me break this down:\n\nThe key things to consider here are the underlying goal, the constraints you're working with, and the best approach given your stack.\n\nShare more details and I'll give you a concrete, actionable answer — including code examples if needed.`,
    `I'm on it. Here's how I'd approach this:\n\n1. Clarify the exact requirement\n2. Choose the right tool or pattern for the job\n3. Implement with clean, maintainable code\n4. Test and validate the result\n\nTell me more about your specific situation and I'll give you step-by-step guidance with real code.`,
  ];

  const idx = userMessage.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % defaults.length;
  return defaults[idx];
}

router.get("/conversations", async (req, res): Promise<void> => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, req.appUser!.id))
    .orderBy(desc(conversationsTable.updatedAt));
  res.json(conversations.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title, userId: req.appUser!.id })
    .returning();
  res.status(201).json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.get("/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, params.data.id),
        eq(conversationsTable.userId, req.appUser!.id),
      ),
    );
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.patch("/conversations/:id", async (req, res): Promise<void> => {
  const params = UpdateConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .update(conversationsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(conversationsTable.id, params.data.id),
        eq(conversationsTable.userId, req.appUser!.id),
      ),
    )
    .returning();
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.delete("/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [owned] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, params.data.id),
        eq(conversationsTable.userId, req.appUser!.id),
      ),
    );
  if (!owned) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, params.data.id));
  await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, params.data.id),
        eq(conversationsTable.userId, req.appUser!.id),
      ),
    );
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json(messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, params.data.id),
        eq(conversationsTable.userId, req.appUser!.id),
      ),
    );
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const [userMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "user", content: parsed.data.content })
    .returning();

  const aiContent = getAIResponse(parsed.data.content);

  const [assistantMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "assistant", content: aiContent })
    .returning();

  const newTitle =
    convo.title === "New Conversation" && parsed.data.content.length > 3
      ? parsed.data.content.substring(0, 40)
      : convo.title;

  await db
    .update(conversationsTable)
    .set({
      lastMessage: parsed.data.content.substring(0, 100),
      messageCount: (convo.messageCount || 0) + 2,
      title: newTitle,
      updatedAt: new Date(),
    })
    .where(eq(conversationsTable.id, params.data.id));

  res.status(201).json({
    userMessage: { ...userMessage, createdAt: userMessage.createdAt.toISOString() },
    assistantMessage: { ...assistantMessage, createdAt: assistantMessage.createdAt.toISOString() },
  });
});

export default router;

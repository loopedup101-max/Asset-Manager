---
name: OpenAI proxy supports web_search
description: The Replit-managed OpenAI integration proxy DOES forward the Responses API and its hosted web_search tool.
---

The Replit-managed OpenAI integration (`@workspace/integrations-openai-ai-server`, standard `openai` SDK pointed at `AI_INTEGRATIONS_OPENAI_BASE_URL`) supports `openai.responses.create({ model, tools: [{ type: "web_search" }], input, stream: true })` — verified live with a real cited result (gpt-5.1).

**Why:** Agents can do REAL web research with no separate search API key. `searchIntegrations` returns nothing for Brave/Tavily/Exa/SerpAPI, so this hosted tool is the only managed web-search path.

**How to apply:** For a streaming chat that needs live info, use the Responses API (not chat.completions). Stream by reading events where `event.type === "response.output_text.delta"` (use `event.delta`). Put the system prompt in `instructions`, history in `input` as `{role,content}[]`, and `max_output_tokens` (not `max_completion_tokens`). web_search tool-call events produce no output_text and are simply ignored.

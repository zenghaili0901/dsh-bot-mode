/**
 * dsh-bot-mode — host (node) half.
 *
 * IMPLEMENTED: per-bot CONTINUABLE chat over the profile's HTTP server.
 *   POST /bot-mode/chat  { sessionId, bot, message }
 *     → finds the calling agent (parent) by session,
 *     → first message: ctx.subagents.startContinuable (child keeps the
 *       conversation and persona for the bot's lifetime);
 *     → later messages: ctx.subagents.followup on the same child;
 *     → the reply is polled from the child session's event log
 *       (assistant/message content after the turn/end of that round).
 * One bot = one subagent session → no session pile-up, real memory.
 *
 * NOT IMPLEMENTED (roadmap, deliberately absent — do not half-wire):
 *   - bot-to-bot messaging (@mention relay between bots)
 *   - group chats (round-robin coordination)
 *   - per-bot routines (dsh-schedule cron)
 *   - persona via system-prompt/assemble (currently prompt-prefixed instead)
 *   - Typert remote endpoint (plain HTTP route used instead)
 *   - child disposal: DSH exposes no public session-delete API; a bot's
 *     continuable child stays as one durable session (acceptable vs pile-up)
 */

const TIMEOUT_MS = 120_000;
const POLL_MS = 400;

/** Read a JSON request body (node IncomingMessage). */
function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', (chunk) => { data += chunk; if (data.length > 1_000_000) reject(new Error('body too large')); });
    request.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(new Error('invalid JSON body')); }
    });
    request.on('error', reject);
  });
}

function sendJson(response, code, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

/** Parse ContentBlocks into the client-facing shape (thinking/tools/reply/cards). */
function parseOutput(blocks) {
  const reasoning = blocks
    .filter((b) => b && b.type === 'reasoning' && b.text)
    .map((b) => b.text)
    .join('\n')
    .trim();
  const tools = blocks
    .filter((b) => b && b.type === 'tool-call' && b.name)
    .map((b) => b.name)
    .filter((v, i, a) => a.indexOf(v) === i);
  let reply = blocks
    .filter((b) => b && b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('\n')
    .trim();
  const uiSpec = [];
  blocks.forEach((b) => {
    if (b && b.type === 'tool-call' && b.name === 'render_ui' && b.arguments) {
      try { uiSpec.push(JSON.parse(b.arguments)); } catch {}
    }
  });
  const UI_FENCE = /```dsh-ui\s*([\s\S]*?)```/g;
  reply = reply.replace(UI_FENCE, (_, json) => {
    try {
      const spec = JSON.parse(json.trim());
      if (spec && typeof spec === 'object') uiSpec.push(spec);
    } catch {}
    return '';
  });
  return { reasoning: reasoning || undefined, tools, reply, ui: uiSpec };
}

/** Poll the child session's event log until this round's turn/end appears.
 *  Returns { blocks, timedOut, turnEndSeq, lastSeq } for diagnosis. */
function waitForTurn(hostCtx, childId, lastSeq) {
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setInterval(() => {
      try {
        const sess = hostCtx.sessions.get(childId);
        const events = sess && Array.isArray(sess.events) ? sess.events : [];
        let turnEndSeq = -1;
        for (const e of events) {
          if (e && e.seq > lastSeq && e.type === 'turn/end') turnEndSeq = e.seq;
        }
        if (turnEndSeq !== -1) {
          clearInterval(timer);
          const blocks = [];
          for (const e of events) {
            if (e && e.seq > lastSeq && e.seq <= turnEndSeq && e.type === 'assistant/message'
              && e.message && Array.isArray(e.message.content)) {
              blocks.push(...e.message.content);
            }
          }
          resolve({ blocks, timedOut: false, turnEndSeq, lastSeq });
          return;
        }
      } catch {}
      if (Date.now() - started > TIMEOUT_MS) {
        clearInterval(timer);
        console.warn('[bot-mode] waitForTurn 超时', { childId, lastSeq, elapsed: Date.now() - started });
        resolve({ blocks: [], timedOut: true, turnEndSeq: -1, lastSeq });
      }
    }, POLL_MS);
  });
}

export function apply(ctx, config) {
  ctx.inject(['webServer', 'subagents', 'agents', 'sessions'], (hostCtx) => {
    hostCtx.effect(() => {
      /* botId -> { childId, lastSeq } — one durable child per bot (in-memory;
         a server restart simply starts a fresh child, old one stays as a
         single orphaned session instead of piling up per message). */
      const continuable = new Map();
      /* serialize chat requests per bot so lastSeq cannot race under
         rapid / parallel sends to the same bot */
      const locks = new Map();
      function withLock(botId, fn) {
        const prev = locks.get(botId) || Promise.resolve();
        const next = prev.then(fn, fn);
        locks.set(botId, next.catch(() => {}));
        return next;
      }
      const disposers = [
        hostCtx.webServer.register({
          kind: 'exact',
          path: '/bot-mode/chat',
          handler: async (request, response) => {
            if (request.method !== 'POST') {
              response.writeHead(405, { allow: 'POST' });
              response.end();
              return;
            }
            try {
              const body = await readJsonBody(request);
              const { sessionId, bot, message } = body ?? {};
              if (!bot || !bot.name || typeof message !== 'string' || !message.trim()) {
                sendJson(response, 400, { ok: false, error: '需要 bot 与 message' });
                return;
              }
              await withLock(String(bot.id), async () => {
              const parent = typeof sessionId === 'string' ? hostCtx.agents.get(sessionId) : undefined;
              if (!parent) {
                sendJson(response, 400, { ok: false, error: '找不到当前会话的 agent（sessionId 无效或会话未激活）' });
                return;
              }

              const persona = typeof bot.persona === 'string' && bot.persona.trim()
                ? bot.persona.trim()
                : '你是一位乐于助人的助手。';
              const personaBlock = {
                type: 'text',
                text: `你是「${bot.name}」，一个运行在 DeepSeek Harness 里的 Bot。\n人格设定：${persona}\n\n保持这个角色，用中文回复用户。不要提到你是子 Agent 或 subagent。\n请直接输出最终回答的文本，不要只输出思考过程。\n\n结构化输出约定：当需要展示表格、键值对、提示框等结构化内容时，在回复中输出一个 fenced code block，语言标签为 dsh-ui，内容是 JSON 卡片 spec（items 数组，支持 type: text / list / keyvalue / table / callout / stat）。示例：\n\`\`\`dsh-ui\n{"title":"标题","items":[{"type":"table","columns":["月份","价格"],"rows":[["2月","264"],["3月","253"]]}]}\n\`\`\`\n该卡片会直接显示在用户界面。普通文本正常输出即可。`,
              };
              const msgBlock = { type: 'text', text: message.trim() };
              const signal = AbortSignal.timeout(TIMEOUT_MS);
              const agentOptions = config?.model ? { model: config.model } : undefined;

              let entry = continuable.get(bot.id);
              if (!entry) {
                const started = await hostCtx.subagents.startContinuable({
                  provider: 'spawn',
                  label: `bot:${bot.name}`,
                  request: { parent, prompt: [personaBlock, msgBlock], ...(agentOptions ? { agentOptions } : {}) },
                  signal,
                });
                entry = { childId: started.childId, lastSeq: 0 };
                /* baseline: events already present at creation must not be
                   mistaken for this round's output */
                const fresh = hostCtx.sessions.get(entry.childId);
                entry.lastSeq = fresh && Array.isArray(fresh.events) ? fresh.events.length : 0;
                continuable.set(bot.id, entry);
              } else {
                await hostCtx.subagents.followup(parent, entry.childId, [msgBlock], {
                  source: { kind: 'coordinator', form: 'relay', senderSessionId: sessionId },
                  signal,
                });
              }

              const outcome = await waitForTurn(hostCtx, entry.childId, entry.lastSeq);
              const sess = hostCtx.sessions.get(entry.childId);
              if (sess && Array.isArray(sess.events)) entry.lastSeq = sess.events.length;
              let blocks = outcome.blocks;
              if (!outcome.timedOut && blocks.length === 0 && sess && Array.isArray(sess.events)) {
                /* fallback: surface the child's last assistant content (e.g. a
                   reasoning-only round) so the floating window can still show
                   the thinking fold instead of a bare "no reply" */
                let last = null;
                for (const e of sess.events) {
                  if (e.type === 'assistant/message' && e.message && Array.isArray(e.message.content)) last = e;
                }
                if (last) blocks = last.message.content;
                console.warn('[bot-mode] 回合无文本，已用最后 assistant 内容兜底', { childId: entry.childId, blockCount: blocks.length });
              }
              sendJson(response, 200, { ok: true, ...parseOutput(blocks) });
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              sendJson(response, 500, { ok: false, error: message });
            }
          },
        }),
      ];
      return () => { for (const dispose of disposers) dispose(); };
    }, 'bot-mode: http routes');
  });
}

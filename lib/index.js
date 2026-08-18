/**
 * dsh-bot-mode — host (node) half.
 *
 * IMPLEMENTED: stateless per-turn bot chat over the profile's HTTP server.
 *   POST /bot-mode/chat  { sessionId, bot, message }
 *     → finds the calling agent (parent) by session,
 *     → starts a one-shot subagent (provider "spawn") whose prompt carries
 *       the bot persona + conversation context,
 *     → settles the run and returns the bot's reply.
 * Conversation history is owned by the client; each turn is self-contained.
 *
 * NOT IMPLEMENTED (roadmap, deliberately absent — do not half-wire):
 *   - bot-to-bot messaging (@mention relay between bots)
 *   - group chats (round-robin coordination)
 *   - per-bot routines (dsh-schedule cron)
 *   - persona via system-prompt/assemble (currently prompt-prefixed instead)
 *   - Typert remote endpoint (plain HTTP route used instead)
 */
import { settleRun } from '@deepseek-ai/dsh-subagent';

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

const TIMEOUT_MS = 120_000;

export function apply(ctx, config) {
  ctx.inject(['webServer', 'subagents', 'agents'], (hostCtx) => {
    hostCtx.effect(() => {
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
              // The calling (parent) agent: the session the user is viewing.
              const parent = typeof sessionId === 'string' ? hostCtx.agents.get(sessionId) : undefined;
              if (!parent) {
                sendJson(response, 400, { ok: false, error: '找不到当前会话的 agent（sessionId 无效或会话未激活）' });
                return;
              }

              const persona = typeof bot.persona === 'string' && bot.persona.trim()
                ? bot.persona.trim()
                : '你是一位乐于助人的助手。';
              const prompt = [
                { type: 'text', text: `你是「${bot.name}」，一个运行在 DeepSeek Harness 里的 Bot。\n人格设定：${persona}\n\n保持这个角色，用中文回复用户。不要提到你是子 Agent 或 subagent。` },
                { type: 'text', text: message.trim() },
              ];

              const run = await hostCtx.subagents.start('spawn', {
                parent,
                prompt,
                signal: AbortSignal.timeout(TIMEOUT_MS),
                agentOptions: config?.model ? { model: config.model } : undefined,
                label: `bot:${bot.name}`,
              });
              const outcome = await settleRun(run);
              let reply;
              if (!outcome || outcome.status === 'failed') {
                reply = '⚠️ Bot 运行失败: ' + (outcome?.detail || outcome?.output || '未知错误');
              } else {
                reply = typeof outcome.output === 'string' && outcome.output.trim()
                  ? outcome.output.trim()
                  : '(Bot 没有产生文本回复)';
              }
              sendJson(response, 200, { ok: true, reply });
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

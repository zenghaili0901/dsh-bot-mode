/* dsh-bot-mode — client bundle (web).
 * Hand-authored __ModuleLoader__ format. Line-icon UI (DSH-skin vocabulary):
 * entry, roster, capsule row, chat windows all use 16px stroke icons.
 * Interaction: roster popover above entry (right edge = sidebar edge),
 * floating chat windows (drag/resize/minimize), capsule row on minimize.
 * Host route: POST /bot-mode/chat.
 */
window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-bot-mode",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    let runtimeClient = require("@deepseek-ai/dsh-client-runtime/client");

    const h = react.createElement;
    const { useState, useRef, useEffect } = react;
    const { defineStore } = runtimeClient;

    /* ---------------- styles ---------------- */
    const css = [
      ".bm-entry-btn{display:flex;align-items:center;gap:8px;width:100%;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 55%,transparent);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:6px 10px;border-radius:9px;font-size:12px;font-weight:600;transition:border-color .2s,color .2s,background .2s,transform .12s}",
      ".bm-entry-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,var(--dsw-alias-border-l2))}",
      ".bm-entry-btn:active{transform:scale(.96)}",
      ".bm-entry-btn .bm-whale{display:inline-flex;animation:bm-bob 2.6s ease-in-out infinite}",
      ".bm-entry-btn:hover .bm-whale{animation-duration:1.1s}",
      "@keyframes bm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}",
      ".bm-overlay{position:fixed;bottom:52px;width:246px;max-height:56vh;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:13px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 96%,transparent);backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(2,6,20,.3);z-index:10003;overflow:hidden;pointer-events:auto;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-overlay-head{display:flex;align-items:center;gap:8px;padding:9px 11px 7px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent),color-mix(in srgb,#7b5cff 8%,transparent))}",
      ".bm-overlay-title{font-weight:700;font-size:12.5px;display:flex;align-items:center;gap:6px;letter-spacing:.3px;flex:1;min-width:0}",
      ".bm-icon-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:7px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:none}",
      ".bm-icon-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-brand-primary)}",
      ".bm-overlay-body{padding:8px 9px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;flex:1}",
      ".bm-search{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:6px 9px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-search:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-search::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-grid{display:flex;flex-wrap:wrap;gap:8px;padding:2px}",
      ".bm-chip{display:flex;flex-direction:column;align-items:center;gap:3px;width:50px;cursor:pointer;border:none;background:none;padding:4px 2px;border-radius:9px;position:relative}",
      ".bm-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-chip-avatar{font-size:15px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;position:relative}",
      ".bm-chip-name{color:var(--dsw-alias-label-secondary);font-size:10px;max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".bm-status-dot{position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;border:2px solid var(--dsw-alias-bg-layer-2)}",
      ".bm-status-idle{background:var(--dsw-alias-label-secondary);opacity:.5}",
      ".bm-status-running{background:#ef4444;animation:bm-pulse 1s ease-in-out infinite}",
      ".bm-status-done{background:#22c55e}",
      ".bm-status-pending{background:#f59e0b;animation:bm-pulse 1.4s ease-in-out infinite}",
      "@keyframes bm-pulse{0%,100%{opacity:1}50%{opacity:.45}}",
      ".bm-results{display:flex;flex-direction:column;gap:6px}",
      ".bm-result{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);cursor:pointer}",
      ".bm-result:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-result-text{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:12px 0;font-size:11.5px}",
      ".bm-caprow{position:fixed;bottom:88px;display:flex;gap:6px;z-index:10002;pointer-events:auto;max-width:420px;flex-wrap:wrap}",
      ".bm-capsule{display:flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 95%,transparent);backdrop-filter:blur(14px);box-shadow:0 6px 18px rgba(2,6,20,.25);padding:3px 9px 3px 3px;cursor:pointer;font-size:10.5px;color:var(--dsw-alias-label-primary);transition:transform .15s,border-color .15s,box-shadow .15s}",
      ".bm-capsule:hover{transform:translateY(-1.5px);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,var(--dsw-alias-border-l2));box-shadow:0 9px 24px rgba(2,6,20,.35)}",
      ".bm-capsule:active{transform:translateY(0) scale(.97)}",
      ".bm-capsule .bm-chip-avatar{width:22px;height:22px;font-size:11px}",
      ".bm-capsule .bm-status-dot{width:7px;height:7px;border-width:1.5px}",
      ".bm-capsule-label{color:var(--dsw-alias-label-secondary)}",
      ".bm-capsule-label.busy{color:var(--dsw-alias-state-error-primary)}",
      ".bm-chat-win{position:fixed;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 96%,transparent);backdrop-filter:blur(20px);box-shadow:0 18px 50px rgba(2,6,20,.4);z-index:10000;overflow:hidden;pointer-events:auto;font-size:12.5px;color:var(--dsw-alias-label-primary);min-width:260px;min-height:200px}",
      ".bm-chat-titlebar{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:move;user-select:none;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent),color-mix(in srgb,#7b5cff 9%,transparent))}",
      ".bm-chat-title{display:flex;align-items:center;gap:7px;font-weight:600;font-size:12.5px;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".bm-chat-status{display:flex;align-items:center;gap:5px;color:var(--dsw-alias-label-secondary);font-size:10px;flex:none;transition:color .2s}",
      ".bm-chat-status .bm-status-dot{position:static;border:none;width:8px;height:8px}",
      ".bm-chat-status.busy{color:var(--dsw-alias-state-error-primary)}",
      ".bm-chat-status.done{color:var(--dsw-alias-state-success-primary)}",
      ".bm-win-btn{border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:6px;padding:0;flex:none}",
      ".bm-win-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-win-btn.close:hover{color:#fff;background:var(--dsw-alias-state-error-primary)}",
      ".bm-msgs{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding:8px 10px}",
      ".bm-msg-row{display:flex;gap:6px;align-items:flex-start;max-width:94%;align-self:flex-start}",
      ".bm-msg-row .bm-msg{max-width:100%}",
      ".bm-msg{max-width:92%;padding:7px 10px;border-radius:11px;line-height:18px;white-space:pre-wrap;word-break:break-word;font-size:12px}",
      ".bm-msg-user{align-self:flex-end;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-bottom-right-radius:3px}",
      ".bm-msg-bot{align-self:flex-start;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-bottom-left-radius:3px}",
      ".bm-msg-sys{align-self:center;color:var(--dsw-alias-label-secondary);font-size:10.5px;padding:2px 0}",
      ".bm-msg-meta{font-size:9.5px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:16px 10px;font-size:11.5px;line-height:19px;border:1px dashed var(--dsw-alias-border-l2);border-radius:10px}",
      ".bm-composer{display:flex;gap:6px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l1)}",
      ".bm-composer .bm-input{flex:1;padding:6px 9px;font-size:12px}",
      ".bm-resize-handle{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize}",
      ".bm-resize-handle::before,.bm-resize-handle::after{content:'';position:absolute;right:4px;width:10px;height:1.4px;background:var(--dsw-alias-label-secondary);border-radius:1px;transform:rotate(-45deg);transform-origin:right center}",
      ".bm-resize-handle::before{bottom:9px;opacity:.4}",
      ".bm-resize-handle::after{bottom:5px;opacity:.75}",
      ".bm-modal{position:fixed;inset:0;background:rgba(2,6,20,.45);backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;pointer-events:auto}",
      ".bm-modal-card{width:400px;max-width:92vw;max-height:84vh;overflow-y:auto;display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-layer-2);box-shadow:0 24px 60px rgba(2,6,20,.5);padding:16px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-modal-title{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px}",
      ".bm-modal-sub{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}",
      ".bm-field{display:flex;flex-direction:column;gap:4px}",
      ".bm-field label{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}",
      ".bm-avatar-pick{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".bm-avatar-pick .bm-chip-avatar{cursor:pointer;border:2px solid transparent;color:#fff}",
      ".bm-avatar-pick .sel{border-color:var(--dsw-alias-label-primary)}",
      ".bm-color-pick{display:flex;gap:6px;flex-wrap:wrap}",
      ".bm-color-pick button{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer}",
      ".bm-color-pick button.sel{border-color:var(--dsw-alias-label-primary)}",
      ".bm-input{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-input:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-input::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none;resize:vertical;min-height:64px;font-family:inherit}",
      ".bm-textarea::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}",
      ".bm-btn{border:1px solid transparent;background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-radius:10px;padding:7px 13px;font-size:12px;cursor:pointer;font-weight:600}",
      ".bm-btn:hover{filter:brightness(1.1)}",
      ".bm-btn:disabled{opacity:.5;cursor:default}",
      ".bm-btn-ghost{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}",
      ".bm-advanced{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;overflow:hidden}",
      ".bm-advanced-head{display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:7px 10px;font-size:12px;font-weight:600}",
      ".bm-advanced-body{padding:10px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:8px}",
      ".bm-card{border:1px solid var(--dsw-alias-border-l2);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent),color-mix(in srgb,#7b5cff 6%,transparent));border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}",
      ".bm-card-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}",
      ".bm-card-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
      ".bm-toggle{margin-left:auto;border:1px solid var(--dsw-alias-border-l2);height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex:none;align-items:center;gap:6px;padding:0 10px 0 6px;font-size:12px;display:inline-flex}",
      ".bm-toggle[aria-pressed=true]{background:linear-gradient(135deg,#4d6bfe,#7b5cff);color:#fff;border-color:transparent}",
    ].join("");

    const CSS_TAG = "@deepseek-ai/dsh-client-ui-bot-mode/botmode.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_TAG) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-bot-mode";
      tag.dataset.pluginCss = CSS_TAG;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    /* ---------------- line icons (16px stroke vocabulary) ---------------- */
    const BOT_ICON_PATHS = {
      bot: ["M8 2.2v1.4", "M3.5 5h9a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 10.5v-4A1.5 1.5 0 0 1 3.5 5z", "M5.4 8.6h.01", "M10.6 8.6h.01"],
      search: ["M10.7 10.7l2.8 2.8", "M11 6.5a4.5 4.5 0 1 1-.01 0z"],
      code: ["M6 5.5L3.5 8 6 10.5", "M10 5.5l2.5 2.5L10 10.5"],
      chart: ["M3 12.5v-3", "M8 12.5v-7", "M13 12.5v-5", "M2 13h12"],
      pen: ["M4 12l.9-2.6 6.4-6.4a1.3 1.3 0 0 1 1.9 1.9l-6.4 6.4L4 12z"],
      shield: ["M8 2.6l5 1.9v3.7c0 2.9-2.1 4.7-5 5.2-2.9-.5-5-2.3-5-5.2V4.5z"],
      spark: ["M8 2.5l1.3 4.2 4.2 1.3-4.2 1.3L8 13.5l-1.3-4.2L2.5 8l4.2-1.3z"],
      clock: ["M8 3a5 5 0 1 1-.01 0z", "M8 5.5V8l1.8 1.2"],
    };
    const BOT_ICON_IDS = ["bot", "search", "code", "chart", "pen", "shield", "spark", "clock"];

    function renderIcon(id, size) {
      const paths = BOT_ICON_PATHS[id] || BOT_ICON_PATHS.bot;
      return h("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" },
        paths.map((d, i) => h("path", { key: i, d })));
    }
    function IconBot() { return renderIcon("bot", 14); }
    function IconMin() { return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" }, h("path", { d: "M2 6h8" })); }
    function IconClose() { return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" }, h("path", { d: "M3 3l6 6M9 3l-6 6" })); }
    function IconPlus() { return h("svg", { width: 13, height: 13, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" }, h("path", { d: "M6 2v8M2 6h8" })); }

    /* ---------------- persistence ---------------- */
    const BOTS_KEY = "dsh-bot-mode.bots";
    const CHATS_KEY = "dsh-bot-mode.chats";
    const CHATWIN_KEY = "dsh-bot-mode.chatwin.";
    const AVATAR_COLORS = ["#4d6bfe", "#7b5cff", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];
    const DEFAULT_BOTS = [
      { id: "researcher", name: "研究员", icon: "search", color: "#4d6bfe", persona: "你是一位严谨的研究助理：擅长检索资料、交叉验证多个来源，并输出带引用的结构化报告。", createdAt: Date.now() },
      { id: "reviewer", name: "代码评审", icon: "code", color: "#22c55e", persona: "你是一位资深代码评审员：关注正确性、可读性与性能，每次给出可执行的具体建议。", createdAt: Date.now() },
    ];
    function loadJSON(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        const val = raw ? JSON.parse(raw) : null;
        return val !== null && val !== undefined ? val : fallback;
      } catch { return fallback; }
    }
    function saveJSON(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    }
    function loadBots() {
      const arr = loadJSON(BOTS_KEY, null);
      return Array.isArray(arr) && arr.length ? arr : DEFAULT_BOTS;
    }
    function loadChats() { return loadJSON(CHATS_KEY, {}); }
    function loadChatWin(botId) { return loadJSON(CHATWIN_KEY + botId, null); }
    function saveChatWin(botId, p) { saveJSON(CHATWIN_KEY + botId, p); }

    /* track the draggable sidebar width (sidebarCol element) */
    function useSidebarWidth() {
      const [w, setW] = useState(256);
      useEffect(() => {
        let ro = null;
        const update = () => {
          const el = document.querySelector('[class*="sidebarCol"]');
          if (el) {
            const bw = el.getBoundingClientRect().width;
            if (bw > 40 && bw < 900) setW(bw);
          }
        };
        update();
        const t = setTimeout(() => {
          const el = document.querySelector('[class*="sidebarCol"]');
          if (el && typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(update);
            ro.observe(el);
          }
        }, 250);
        window.addEventListener("resize", update);
        return () => { clearTimeout(t); if (ro) ro.disconnect(); window.removeEventListener("resize", update); };
      }, []);
      return w;
    }

    /* ---------------- shared store ---------------- */
    const uiStore = defineStore({
      init: () => ({ overlayOpen: false, bots: loadBots(), chats: loadChats(), busyBotId: null, chatWins: {}, revision: -1 }),
      actions: {
        toggleOverlay: (d, open) => { d.overlayOpen = open; },
        addBot: (d, bot) => { d.bots = d.bots.concat([bot]); saveJSON(BOTS_KEY, d.bots); },
        removeBot: (d, id) => { d.bots = d.bots.filter((b) => b.id !== id); saveJSON(BOTS_KEY, d.bots); },
        appendMessage: (d, botId, msg) => {
          const list = d.chats[botId] ? d.chats[botId].concat([msg]) : [msg];
          d.chats = Object.assign({}, d.chats, { [botId]: list });
          saveJSON(CHATS_KEY, d.chats);
        },
        setBusy: (d, botId) => { d.busyBotId = botId; },
        openChat: (d, botId) => { d.overlayOpen = false; d.chatWins = Object.assign({}, d.chatWins, { [botId]: "open" }); },
        closeChat: (d, botId) => {
          const w = Object.assign({}, d.chatWins);
          delete w[botId];
          d.chatWins = w;
        },
        minimizeChat: (d, botId) => { d.chatWins = Object.assign({}, d.chatWins, { [botId]: "minimized" }); },
        restoreChat: (d, botId) => { d.chatWins = Object.assign({}, d.chatWins, { [botId]: "open" }); },
        sync: (d, next, revision) => {
          if (revision <= d.revision) return;
          d.overlayOpen = next.overlayOpen;
          d.bots = next.bots;
          d.chats = next.chats;
          d.busyBotId = next.busyBotId;
          d.chatWins = next.chatWins;
          d.revision = revision;
        },
      },
    });

    /* ---------------- helpers ---------------- */
    function avatarBg(color) {
      return color ? "linear-gradient(135deg," + color + "," + color + "44)" : "linear-gradient(135deg,#4d6bfe,#7b5cff)";
    }
    function statusClass(state) {
      if (state === "running") return "bm-status-running";
      if (state === "pending") return "bm-status-pending";
      if (state === "done") return "bm-status-done";
      return "bm-status-idle";
    }
    /* avatar: line icon on a colored disc (legacy emoji fallback) */
    function BotAvatar(props) {
      const { icon, emoji, color, size, className } = props;
      const sz = size || 36;
      if (emoji && !icon) {
        return h("span", { className: className || "bm-chip-avatar", style: { background: avatarBg(color), fontSize: sz * 0.5 } }, emoji);
      }
      return h("span", { className: className || "bm-chip-avatar", style: { background: avatarBg(color), color: "#fff" } },
        renderIcon(icon || "bot", sz * 0.5));
    }

    /* ---------------- components ---------------- */
    function BotModeCard(props) {
      const { useStore, toggleOverlay } = props;
      const state = useStore((s) => s);
      return h("li", { className: "bm-card" },
        h("div", { style: { display: "flex", alignItems: "center" } },
          h("span", { className: "bm-card-title" }, h(IconBot), "Bot Mode"),
          h("button", { className: "bm-toggle", "aria-pressed": state.overlayOpen ? "true" : "false", onClick: () => toggleOverlay(!state.overlayOpen) },
            state.overlayOpen ? "面板已开" : "打开面板")
        ),
        h("div", { className: "bm-card-desc" }, "把 DeepSeek Harness 的子 Agent 变成一群有名字、有性格的 Bot，各聊各的，还能互相协作。"),
        h("div", { className: "bm-card-desc" }, h("strong", null, "点击侧边栏底部入口打开 Bot 面板。"))
      );
    }

    function BotModeEntry(props) {
      const { wide, useStore, toggleOverlay } = props;
      const state = useStore((s) => s);
      return h("button", {
        className: "bm-entry-btn",
        onClick: () => toggleOverlay(!state.overlayOpen),
      }, h("span", { className: "bm-whale" }, h(IconBot)), wide ? h("span", null, "Bot Mode") : null);
    }

    /* ————— root: roster + chat windows + capsule row ————— */
    function BotModeOverlay(props) {
      const { useStore, useSessions, addBot, removeBot, appendMessage, toggleOverlay, setBusy, openChat, closeChat, minimizeChat, restoreChat } = props;
      const state = useStore((s) => s);
      const [creating, setCreating] = useState(false);
      const sbW = useSidebarWidth();
      const sessions = useSessions ? useSessions((s) => s) : null;
      const sessionId = sessions && sessions.current ? sessions.current : undefined;
      const openBots = Object.keys(state.chatWins).filter((k) => state.chatWins[k] === "open");
      const minBots = Object.keys(state.chatWins).filter((k) => state.chatWins[k] === "minimized");
      const wide = sbW > 150;
      const panelStyle = wide
        ? { right: (typeof window !== "undefined" ? window.innerWidth : 0) - sbW + 10 }
        : { left: sbW + 8 };

      return h("div", null,
        state.overlayOpen ? h("div", { className: "bm-overlay", style: panelStyle },
          h("div", { className: "bm-overlay-head" },
            h("span", { className: "bm-overlay-title" }, h(IconBot), "BOTS"),
            h("span", { style: { color: "var(--dsw-alias-label-secondary)", fontSize: 10.5, fontWeight: 600 } }, state.bots.length + " 个"),
            h("button", { className: "bm-icon-btn", title: "新建 Agent", onClick: () => setCreating(true) }, h(IconPlus)),
            h("button", { className: "bm-icon-btn", title: "关闭", onClick: () => toggleOverlay(false) }, h(IconClose))
          ),
          h("div", { className: "bm-overlay-body" },
            h(BotRoster, {
              bots: state.bots,
              chats: state.chats,
              busyBotId: state.busyBotId,
              onPick: (bot) => openChat(bot.id),
              onNew: () => setCreating(true),
              onRemove: (id) => removeBot(id),
            })
          )
        ) : null,
        openBots.map((botId) => {
          const bot = state.bots.find((b) => b.id === botId);
          if (!bot) return null;
          return h(BotChatWindow, {
            key: botId,
            bot,
            chats: state.chats,
            busy: state.busyBotId === botId,
            sessionId,
            defaultX: sbW + 24,
            onClose: () => closeChat(botId),
            onMinimize: () => minimizeChat(botId),
            onAppend: (msg) => appendMessage(botId, msg),
            setBusy,
          });
        }),
        minBots.length > 0 ? h("div", { className: "bm-caprow", style: panelStyle },
          minBots.map((botId) => {
            const bot = state.bots.find((b) => b.id === botId);
            if (!bot) return null;
            const busy = state.busyBotId === botId;
            return h("div", { key: botId, className: "bm-capsule", onClick: () => restoreChat(botId), title: bot.name },
              h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 22 }),
              h("span", { className: "bm-status-dot " + statusClass(busy ? "running" : "pending") }),
              h("span", { className: "bm-capsule-label" + (busy ? " busy" : "") }, busy ? "进行中" : "待命")
            );
          })
        ) : null,
        creating ? h(NewBotModal, {
          onClose: () => setCreating(false),
          onCreate: (bot) => { addBot(bot); setCreating(false); },
        }) : null
      );
    }

    function BotRoster(props) {
      const { bots, chats, busyBotId, onPick, onNew, onRemove } = props;
      const [query, setQuery] = useState("");
      const [confirmId, setConfirmId] = useState(null);
      useEffect(() => {
        if (confirmId === null) return;
        const timer = setTimeout(() => setConfirmId(null), 3000);
        return () => clearTimeout(timer);
      }, [confirmId]);
      const q = query.trim().toLowerCase();
      const searching = q.length > 0;
      const results = [];
      if (searching) {
        bots.forEach((bot) => {
          if ((bot.name || "").toLowerCase().includes(q) || (bot.persona || "").toLowerCase().includes(q)) {
            results.push({ bot, label: "Bot：" + bot.name, text: bot.persona });
          }
          (chats[bot.id] || []).forEach((m) => {
            if ((m.text || "").toLowerCase().includes(q)) {
              results.push({ bot, label: bot.name + " 的对话", text: m.text });
            }
          });
        });
      }
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1 } },
        h("input", { className: "bm-search", placeholder: "搜索历史对话…", value: query, onChange: (e) => setQuery(e.target.value) }),
        searching
          ? (results.length === 0
              ? h("div", { className: "bm-empty" }, "没有匹配的对话")
              : h("div", { className: "bm-results" },
                  results.slice(0, 20).map((r, i) =>
                    h("div", { key: i, className: "bm-result", onClick: () => onPick(r.bot) },
                      h(BotAvatar, { icon: r.bot.icon, emoji: r.bot.emoji, color: r.bot.color, size: 26 }),
                      h("div", { style: { minWidth: 0, flex: 1 } },
                        h("div", { style: { fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, r.label),
                        h("div", { className: "bm-result-text" }, r.text)
                      )
                    )
                  )
                ))
          : (bots.length === 0
              ? h("div", { className: "bm-empty" },
                  "还没有 Bot ✨\n点右上角 + 新建你的第一个团队成员。")
              : h("div", { className: "bm-grid" },
                  bots.map((bot) =>
                    h("button", { key: bot.id, className: "bm-chip", onClick: () => onPick(bot), title: bot.name },
                      h("span", { className: "bm-chip-avatar", style: { position: "relative" } },
                        h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 36 }),
                        h("span", { className: "bm-status-dot " + statusClass(bot.id === busyBotId ? "running" : "idle") })
                      ),
                      h("span", { className: "bm-chip-name" }, bot.name)
                    )
                  )
                ))
      );
    }

    /* floating chat window */
    function BotChatWindow(props) {
      const { bot, chats, busy, sessionId, defaultX, onClose, onMinimize, onAppend, setBusy } = props;
      const [input, setInput] = useState("");
      const [sending, setSending] = useState(false);
      const [rect, setRect] = useState(loadChatWin(bot.id) || { x: defaultX, y: 110, w: 380, h: 360 });
      const listRef = useRef(null);
      const messages = chats[bot.id] || [];

      useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      }, [messages, sending]);

      const updateRect = (patch) => {
        setRect((r) => {
          const next = Object.assign({}, r, patch);
          saveChatWin(bot.id, next);
          return next;
        });
      };

      const onTitleDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const start = { mx: e.clientX, my: e.clientY, x: rect.x, y: rect.y };
        const move = (ev) => updateRect({ x: start.x + ev.clientX - start.mx, y: start.y + ev.clientY - start.my });
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      };
      const onResizeDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const start = { mx: e.clientX, my: e.clientY, w: rect.w, h: rect.h };
        const move = (ev) => updateRect({ w: Math.max(260, start.w + ev.clientX - start.mx), h: Math.max(200, start.h + ev.clientY - start.my) });
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      };

      const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        onAppend({ role: "user", text, ts: Date.now() });
        setInput("");
        setSending(true);
        setBusy(bot.id);
        try {
          const res = await fetch("/bot-mode/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, bot, message: text }),
          });
          const data = await res.json();
          const reply = data && data.ok ? data.reply : (data && data.error ? "⚠️ " + data.error : "（无回复）");
          onAppend({ role: "bot", text: reply, ts: Date.now(), done: true });
        } catch (err) {
          onAppend({ role: "bot", text: "请求失败: " + (err.message || err), ts: Date.now(), done: true });
        }
        setSending(false);
        setBusy(null);
      };

      const lastDone = messages.length ? messages[messages.length - 1] : null;
      const statusLabel = busy || sending ? "任务进行中…" : (lastDone && lastDone.done ? "任务完成" : "空闲");

      return h("div", { className: "bm-chat-win", style: { left: rect.x, top: rect.y, width: rect.w, height: rect.h } },
        h("div", { className: "bm-chat-titlebar", onMouseDown: onTitleDown },
          h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 26 }),
          h("span", { className: "bm-chat-title" }, bot.name),
          h("span", { className: "bm-chat-status" + (busy ? " busy" : (lastDone && lastDone.done ? " done" : "")) },
            h("span", { className: "bm-status-dot " + statusClass(busy ? "running" : (lastDone && lastDone.done ? "done" : "idle")) }),
            statusLabel
          ),
          h("button", { className: "bm-win-btn", title: "最小化", onClick: (e) => { e.stopPropagation(); onMinimize(); } }, h(IconMin)),
          h("button", { className: "bm-win-btn close", title: "关闭", onClick: (e) => { e.stopPropagation(); onClose(); } }, h(IconClose))
        ),
        h("div", { className: "bm-msgs", ref: listRef },
          messages.length === 0
            ? h("div", { className: "bm-msg-sys" }, "临时任务，聊完即走")
            : messages.map((m, i) =>
                m.role === "bot"
                  ? h("div", { key: i, className: "bm-msg-row" },
                      h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 20 }),
                      h("div", { className: "bm-msg bm-msg-bot" },
                        m.done ? h("div", { className: "bm-msg-meta" }, "✓ 完成") : null,
                        m.text
                      )
                    )
                  : h("div", { key: i, className: "bm-msg bm-msg-user" }, m.text)
              ),
          sending ? h("div", { className: "bm-msg-sys" }, bot.name + " 思考中…") : null
        ),
        h("div", { className: "bm-composer" },
          h("input", {
            className: "bm-input",
            placeholder: "给 " + bot.name + " 发消息…",
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } },
          }),
          h("button", { className: "bm-btn", onClick: send, disabled: sending || !input.trim() }, "发送")
        ),
        h("div", { className: "bm-resize-handle", onMouseDown: onResizeDown })
      );
    }

    /* modal create */
    function NewBotModal(props) {
      const [name, setName] = useState("");
      const [persona, setPersona] = useState("");
      const [icon, setIcon] = useState("bot");
      const [color, setColor] = useState(AVATAR_COLORS[0]);
      const [advanced, setAdvanced] = useState(false);
      const submit = () => {
        const n = name.trim();
        if (!n) return;
        props.onCreate({ id: "bot-" + Date.now(), name: n, icon, color, persona: persona.trim() || "你是一位乐于助人的助手。", createdAt: Date.now() });
      };
      return h("div", { className: "bm-modal", onClick: (e) => { if (e.target === e.currentTarget) props.onClose(); } },
        h("div", { className: "bm-modal-card" },
          h("div", { className: "bm-modal-title" }, h(IconBot), "New Agent"),
          h("div", { className: "bm-modal-sub" }, "一个有名字、有性格的团队成员，拥有自己的记忆、技能和对话。"),
          h("div", { className: "bm-field" },
            h("label", null, "头像"),
            h("div", { className: "bm-avatar-pick" },
              BOT_ICON_IDS.map((id) =>
                h("span", { key: id, className: "bm-chip-avatar" + (id === icon ? " sel" : ""), style: { background: avatarBg(color) }, onClick: () => setIcon(id) },
                  renderIcon(id, 15))
              )
            )
          ),
          h("div", { className: "bm-field" },
            h("label", null, "头像颜色"),
            h("div", { className: "bm-color-pick" },
              AVATAR_COLORS.map((c) => h("button", { key: c, className: c === color ? "sel" : "", style: { background: c }, onClick: () => setColor(c) }, ""))
            )
          ),
          h("div", { className: "bm-field" },
            h("label", null, "名字"),
            h("input", { className: "bm-input", placeholder: "如：数据分析师", value: name, onChange: (e) => setName(e.target.value) })
          ),
          h("div", { className: "bm-field" },
            h("label", null, "人格设定（system prompt）"),
            h("textarea", { className: "bm-textarea", placeholder: "如：你是精通 SQL 的数据分析师…", value: persona, onChange: (e) => setPersona(e.target.value) })
          ),
          h("div", { className: "bm-advanced" },
            h("button", { className: "bm-advanced-head", onClick: () => setAdvanced(!advanced) },
              h("span", null, "高级"),
              h("span", null, advanced ? "▾" : "▸")
            ),
            advanced ? h("div", { className: "bm-advanced-body" },
              h("div", { className: "bm-field" },
                h("label", null, "行为提示（补充）"),
                h("input", { className: "bm-input", placeholder: "可选：语气、输出格式等额外约束" })
              )
            ) : null
          ),
          h("div", { className: "bm-modal-actions" },
            h("button", { className: "bm-btn bm-btn-ghost", onClick: props.onClose }, "取消"),
            h("button", { className: "bm-btn", onClick: submit, disabled: !name.trim() }, "创建 Bot")
          )
        )
      );
    }

    /* ---------------- registration ---------------- */
    const cardInjected = (actions) => ({ toggleOverlay: (open) => actions.toggleOverlay(open) });
    const entryInjected = (actions) => ({ toggleOverlay: (open) => actions.toggleOverlay(open) });
    const overlayInjected = (actions) => ({
      addBot: (bot) => actions.addBot(bot),
      removeBot: (id) => actions.removeBot(id),
      appendMessage: (botId, msg) => actions.appendMessage(botId, msg),
      toggleOverlay: (open) => actions.toggleOverlay(open),
      setBusy: (botId) => actions.setBusy(botId),
      openChat: (botId) => actions.openChat(botId),
      closeChat: (botId) => actions.closeChat(botId),
      minimizeChat: (botId) => actions.minimizeChat(botId),
      restoreChat: (botId) => actions.restoreChat(botId),
    });

    function apply(ctx) {
      /* Register core slots first and isolate each one: a failing slot
         (e.g. a keyed-slot contract drift in the host bundle) must never
         take down the entry / roster / chat windows. */
      const safe = (label, fn) => {
        try { fn(); }
        catch (e) { console.warn("[bot-mode] slot " + label + " failed:", e && e.message); }
      };
      safe("sidebar.footer.action", () =>
        ctx.slots.inject("sidebar.footer.action", () =>
          ctx.slots.register({
            name: "sidebar.footer.action",
            id: "bot-mode",
            key: "bot-mode",
            order: 1,
            store: uiStore,
            inject: entryInjected,
          }, BotModeEntry)
        )
      );
      safe("shell.overlay", () =>
        ctx.slots.inject("shell.overlay", () =>
          ctx.slots.register({
            name: "shell.overlay",
            id: "bot-mode",
            key: "bot-mode",
            order: 1,
            store: uiStore,
            inject: overlayInjected,
          }, BotModeOverlay)
        )
      );
      safe("settings.plugin.item", () =>
        ctx.slots.inject("settings.plugin.item", () =>
          ctx.slots.register({
            name: "settings.plugin.item",
            id: "bot-mode",
            key: "bot-mode",
            order: 5,
            store: uiStore,
            inject: cardInjected,
          }, BotModeCard)
        )
      );
    }

    module.exports = { apply, inject: ["slots"] };
    return module.exports;
  },
});

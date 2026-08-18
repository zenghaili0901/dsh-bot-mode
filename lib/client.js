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
    let primitives = require("@deepseek-ai/dsh-client-ui-primitives");

    const h = react.createElement;
    const { useState, useRef, useEffect } = react;
    const { defineStore } = runtimeClient;

    /* Hardening: if the official runtime seam moved/changed, degrade to the
       stock UI instead of failing mid-boot. Never leave a half-applied skin. */
    if (typeof defineStore !== "function") {
      console.error("[bot-mode] 官方运行时接口缺失（defineStore）——插件已停用，落回官方界面");
      module.exports = { apply() {}, inject: [] };
      return module.exports;
    }

    /* ---------------- styles ---------------- */
    /* Colors: primary/state tokens come from the official --dsw-alias-* theme
       variables so the plugin follows the user's theme and survives DSH updates.
       #7b5cff is the DeepSeek brand violet used only as the gradient partner of
       --dsw-alias-brand-primary (the official theme exposes no violet token). */
    const css = [
      ".bm-entry-btn{display:flex;align-items:center;gap:8px;width:100%;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 55%,transparent);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;transition:border-color .2s,color .2s,background .2s,transform .12s}",
      ".bm-entry-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,var(--dsw-alias-border-l2))}",
      ".bm-entry-btn:active{transform:scale(.96)}",
      ".bm-entry-btn .bm-whale{display:inline-flex;animation:bm-bob 2.6s ease-in-out infinite}",
      ".bm-entry-btn:hover .bm-whale{animation-duration:1.1s}",
      "@keyframes bm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}",
      ".bm-overlay{position:fixed;bottom:130px;width:246px;max-height:56vh;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 96%,transparent);backdrop-filter:blur(20px);box-shadow:0 12px 40px rgba(2,6,20,.3);z-index:10003;overflow:hidden;pointer-events:auto;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-overlay-head{display:flex;align-items:center;gap:8px;padding:9px 11px 7px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}",
      ".bm-overlay-title{font-weight:700;font-size:12.5px;display:flex;align-items:center;gap:6px;letter-spacing:.3px;flex:1;min-width:0}",
      ".bm-icon-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:none}",
      ".bm-icon-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-brand-primary)}",
      ".bm-overlay-body{padding:8px 9px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;flex:1}",
      ".bm-search{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:6px 9px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-search:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-search::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-grid{display:flex;flex-wrap:wrap;gap:8px;padding:2px}",
      ".bm-chip{display:flex;flex-direction:column;align-items:center;gap:3px;width:50px;cursor:pointer;border:none;background:none;padding:4px 2px;border-radius:8px;position:relative}",
      ".bm-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-chip-new .bm-chip-avatar{width:36px;height:36px;border:1.5px dashed var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-secondary)}",
      ".bm-chip-new:hover .bm-chip-avatar{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}",
      ".bm-chip-new.on .bm-chip-avatar{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}",
      ".bm-grid-sep{width:1px;align-self:center;height:34px;background:var(--dsw-alias-border-l1);margin:0 2px}",
      ".bm-chip-blank{width:50px;height:52px;pointer-events:none;opacity:0}",
      ".bm-chip-del-badge{position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:var(--dsw-alias-state-error-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;line-height:1;z-index:2;box-shadow:0 1px 3px rgba(2,6,20,.3)}",
      ".bm-chip-del .bm-chip-avatar{filter:grayscale(.3)}",
      ".bm-chip-confirm{border:1.5px solid var(--dsw-alias-state-error-primary)!important;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)!important}",
      ".bm-chip-confirm .bm-chip-avatar{animation:none;filter:none}",
      /* confirm dialog */
      ".bm-confirm{position:fixed;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 40%,transparent);backdrop-filter:blur(1.5px);z-index:10004;display:flex;align-items:center;justify-content:center;pointer-events:auto}",
      ".bm-confirm-card{width:280px;display:flex;flex-direction:column;gap:8px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-2);box-shadow:0 18px 48px rgba(2,6,20,.5);padding:16px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-confirm-title{font-weight:700;font-size:14px;color:var(--dsw-alias-state-error-primary)}",
      ".bm-confirm-sub{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
      ".bm-confirm-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px}",
      ".bm-chip-avatar{display:inline-flex;align-items:center;justify-content:center;position:relative;flex:none}",
      ".bm-chip-name{color:var(--dsw-alias-label-secondary);font-size:10px;max-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".bm-status-dot{position:absolute;right:-1px;bottom:-1px;width:9px;height:9px;border-radius:50%;border:2px solid var(--dsw-alias-bg-layer-2)}",
      ".bm-status-idle{background:var(--dsw-alias-label-secondary);opacity:.5}",
      ".bm-status-running{background:var(--dsw-alias-state-error-primary);animation:bm-pulse 1s ease-in-out infinite}",
      ".bm-status-done{background:var(--dsw-alias-state-success-primary)}",
      ".bm-status-pending{background:var(--dsw-alias-state-warn-primary);animation:bm-pulse 1.4s ease-in-out infinite}",
      "@keyframes bm-pulse{0%,100%{opacity:1}50%{opacity:.45}}",
      /* animated status icons (official glyphs + CSS motion) */
      ".bm-spin{display:inline-block;animation:bm-rot 1s linear infinite}",
      "@keyframes bm-rot{to{transform:rotate(360deg)}}",
      ".bm-breathe{display:inline-block;animation:bm-pulse 1.4s ease-in-out infinite}",
      ".bm-results{display:flex;flex-direction:column;gap:6px}",
      ".bm-result{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;outline:none}",
      ".bm-result:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-result.sel{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,var(--dsw-alias-bg-layer-1))}",
      ".bm-result:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".bm-result-text{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:12px 0;font-size:11.5px}",
      ".bm-caprow{position:fixed;bottom:88px;display:flex;gap:6px;z-index:10002;pointer-events:auto;max-width:420px;flex-wrap:wrap}",
      ".bm-capsule{display:flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 95%,transparent);backdrop-filter:blur(14px);box-shadow:0 6px 18px rgba(2,6,20,.25);padding:4px 10px 4px 4px;cursor:pointer;font-size:10.5px;color:var(--dsw-alias-label-primary);transition:transform .15s,border-color .15s,box-shadow .15s}",
      ".bm-capsule:hover{transform:translateY(-1.5px);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 60%,var(--dsw-alias-border-l2));box-shadow:0 9px 24px rgba(2,6,20,.35)}",
      ".bm-capsule:active{transform:translateY(0) scale(.97)}",
      ".bm-capsule .bm-chip-avatar{width:22px;height:22px;font-size:11px}",
      ".bm-capsule .bm-status-dot{width:7px;height:7px;border-width:1.5px}",
      ".bm-capsule-label{color:var(--dsw-alias-label-secondary)}",
      ".bm-capsule-label.busy{color:var(--dsw-alias-state-error-primary)}",
      ".bm-chat-win{position:fixed;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 96%,transparent);backdrop-filter:blur(20px);box-shadow:0 18px 50px rgba(2,6,20,.4);z-index:10000;overflow:hidden;pointer-events:auto;font-size:12.5px;color:var(--dsw-alias-label-primary);min-width:260px;min-height:200px}",
      ".bm-chat-titlebar{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:move;user-select:none;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}",
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
      ".bm-msg{max-width:92%;padding:7px 10px;border-radius:10px;line-height:18px;white-space:pre-wrap;word-break:break-word;font-size:12px}",
      ".bm-msg-user{align-self:flex-end;background:var(--dsw-specific-bubble);color:var(--dsw-alias-label-primary);border-bottom-right-radius:3px}",
      ".bm-msg-bot{align-self:flex-start;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-bottom-left-radius:3px}",
      ".bm-msg-error{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent)!important;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 6%,var(--dsw-alias-bg-layer-1))!important}",
      ".bm-msg-error-icon{display:inline-flex}",
      ".bm-msg-sys{align-self:center;color:var(--dsw-alias-label-secondary);font-size:10.5px;padding:2px 0}",
      ".bm-msg-meta{font-size:9.5px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}",
      /* main-window style message flow: thinking fold + tool chips + reply */
      ".bm-reason{border-left:2px solid var(--dsw-alias-border-l2);padding:2px 0 2px 8px;margin:2px 0 5px}",
      ".bm-reason-head{border:none;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:10.5px;padding:0;display:inline-flex;align-items:center;gap:4px}",
      ".bm-reason-head:hover{color:var(--dsw-alias-label-primary)}",
      ".bm-reason-body{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px;white-space:pre-wrap;margin-top:4px}",
      ".bm-msg-tools{display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 5px}",
      ".bm-tool-chip{font-size:10px;color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-state-business-primary) 25%,transparent);border-radius:6px;padding:2px 7px}",
      /* lightweight render_ui card renderer (bot's structured output) */
      ".bm-ui{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:10px;display:flex;flex-direction:column;gap:8px;max-width:100%;box-sizing:border-box}",
      ".bm-ui-title{font-weight:700;font-size:12px;color:var(--dsw-alias-label-primary)}",
      ".bm-ui-text{font-size:11.5px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word}",
      ".bm-ui-li{font-size:11.5px;line-height:17px;color:var(--dsw-alias-label-primary)}",
      ".bm-ui-kv{display:flex;flex-direction:column;gap:4px}",
      ".bm-ui-kv-row{display:flex;justify-content:space-between;gap:10px;font-size:11.5px}",
      ".bm-ui-kv-k{color:var(--dsw-alias-label-secondary);flex:none}",
      ".bm-ui-kv-v{color:var(--dsw-alias-label-primary);text-align:right;word-break:break-word}",
      ".bm-ui-table{width:100%;border-collapse:collapse;font-size:11px}",
      ".bm-ui-table th{color:var(--dsw-alias-label-secondary);font-weight:600;text-align:left;padding:4px 6px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}",
      ".bm-ui-table td{padding:4px 6px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}",
      ".bm-ui-callout{border:1px solid var(--dsw-alias-border-l2);border-left:3px solid var(--dsw-alias-brand-primary);border-radius:8px;padding:8px 10px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 6%,transparent)}",
      ".bm-ui-callout-t{font-weight:600;font-size:11.5px;color:var(--dsw-alias-label-primary);margin-bottom:2px}",
      ".bm-ui-callout-c{font-size:11.5px;color:var(--dsw-alias-label-secondary);line-height:17px}",
      ".bm-ui-stat{font-size:11.5px;color:var(--dsw-alias-label-primary)}",
      ".bm-ui-steps{display:flex;flex-direction:column;gap:6px}",
      ".bm-ui-step{display:flex;gap:8px;align-items:flex-start}",
      ".bm-ui-step-n{width:18px;height:18px;border-radius:50%;background:var(--dsw-alias-brand-primary);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;flex:none;margin-top:1px}",
      ".bm-ui-step-title{font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".bm-ui-step-desc{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:16px;margin-top:1px}",
      ".bm-empty{color:var(--dsw-alias-label-secondary);text-align:center;padding:16px 10px;font-size:11.5px;line-height:19px;border:1px dashed var(--dsw-alias-border-l2);border-radius:8px}",
      ".bm-composer{display:flex;gap:6px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l1)}",
      ".bm-composer .bm-input{flex:1;padding:6px 9px;font-size:12px}",
      ".bm-resize-handle{position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize}",
      ".bm-resize-handle::before,.bm-resize-handle::after{content:'';position:absolute;right:4px;width:10px;height:1.4px;background:var(--dsw-alias-label-secondary);border-radius:1px;transform:rotate(-45deg);transform-origin:right center}",
      ".bm-resize-handle::before{bottom:9px;opacity:.4}",
      ".bm-resize-handle::after{bottom:5px;opacity:.75}",
      ".bm-modal{position:fixed;inset:0;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 55%,transparent);backdrop-filter:blur(3px);z-index:10001;display:flex;align-items:center;justify-content:center;pointer-events:auto}",
      ".bm-modal-card{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:400px;max-width:92vw;max-height:84vh;overflow-y:auto;display:flex;flex-direction:column;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-2);box-shadow:0 24px 60px rgba(2,6,20,.5);padding:16px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".bm-modal-title{font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px}",
      ".bm-modal-sub{color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}",
      ".bm-field{display:flex;flex-direction:column;gap:4px}",
      ".bm-field label{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}",
      ".bm-avatar-pick{display:flex;gap:4px;align-items:center;flex-wrap:wrap}",
      ".bm-avatar-pick .bm-chip-avatar{cursor:pointer;border:1.5px solid transparent;border-radius:8px;padding:5px}",
      ".bm-avatar-pick .used{pointer-events:none}",
      ".bm-avatar-pick .bm-chip-avatar:hover{border-color:var(--dsw-alias-border-l2)}",
      ".bm-avatar-pick .sel{border-color:var(--dsw-alias-brand-primary)!important;color:var(--dsw-alias-brand-primary)!important;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent)}",
      ".bm-color-pick{display:flex;gap:6px;flex-wrap:wrap}",
      ".bm-color-pick button{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer}",
      ".bm-color-pick button.sel{border-color:var(--dsw-alias-label-primary)}",
      ".bm-input{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none}",
      ".bm-input:focus{border-color:var(--dsw-alias-brand-primary)}",
      ".bm-input::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-textarea{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:8px 10px;color:var(--dsw-alias-label-primary);font-size:12px;outline:none;resize:vertical;min-height:64px;font-family:inherit}",
      ".bm-textarea::placeholder{color:var(--dsw-alias-label-secondary)}",
      ".bm-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}",
      ".bm-btn{border:1px solid transparent;background:var(--dsw-alias-state-business-primary);color:#fff;border-radius:8px;padding:7px 13px;font-size:12px;cursor:pointer;font-weight:600}",
      ".bm-btn:hover{filter:brightness(1.1)}",
      ".bm-btn:disabled{opacity:.5;cursor:default}",
      ".bm-btn-ghost{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}",
      ".bm-advanced{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden}",
      ".bm-advanced-head{display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:7px 10px;font-size:12px;font-weight:600}",
      ".bm-advanced-body{padding:10px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;flex-direction:column;gap:8px}",
      ".bm-card{border:1px solid var(--dsw-alias-border-l2);background:linear-gradient(120deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent),color-mix(in srgb,#7b5cff 6%,transparent));border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px}",
      ".bm-card-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}",
      ".bm-card-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}",
      ".bm-toggle{margin-left:auto;border:1px solid var(--dsw-alias-border-l2);height:28px;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-bg-layer-1);border-radius:999px;flex:none;align-items:center;gap:6px;padding:0 10px 0 6px;font-size:12px;display:inline-flex}",
      ".bm-toggle[aria-pressed=true]{background:linear-gradient(135deg,var(--dsw-alias-brand-primary),#7b5cff);color:#fff;border-color:transparent}",
    ].join("");

    const CSS_TAG = "@deepseek-ai/dsh-client-ui-bot-mode/botmode.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(CSS_TAG) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-bot-mode";
      tag.dataset.pluginCss = CSS_TAG;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    /* ---------------- role icon pool (official primitives) ----------------
       Every role binds a recommended color so bots look designed, not random.
       Used roles are greyed out in the picker; colors auto-assigned. */
    const ROLE_POOL = [
      { id: "agent", Icon: primitives.IconAgentPresetOutline16, color: "#4d6bfe" },
      { id: "user", Icon: primitives.IconUserOutline16, color: "#06b6d4" },
      { id: "chat", Icon: primitives.IconNewChatOutline16, color: "#7b5cff" },
      { id: "search", Icon: primitives.IconSearchOutline16, color: "#3b82f6" },
      { id: "code", Icon: primitives.IconCodeOutline16, color: "#22c55e" },
      { id: "data", Icon: primitives.IconDataOutline16, color: "#f59e0b" },
      { id: "pen", Icon: primitives.IconListPenOutline16, color: "#ec4899" },
      { id: "spark", Icon: primitives.IconSparkle16, color: "#eab308" },
      { id: "globe", Icon: primitives.IconGlobeOutline14, color: "#0ea5e9" },
      { id: "check", Icon: primitives.IconChecklistOutline14, color: "#16a34a" },
      { id: "queue", Icon: primitives.IconQueueOutline14, color: "#64748b" },
      { id: "goal", Icon: primitives.IconGoalOutline16, color: "#2563eb" },
      { id: "think", Icon: primitives.IconThinkOutline14, color: "#8b5cf6" },
      { id: "skill", Icon: primitives.IconSkillOutline16, color: "#14b8a6" },
      { id: "browse", Icon: primitives.IconBrowseOutline16, color: "#ea580c" },
      { id: "branch", Icon: primitives.IconBranchOutline16, color: "#10b981" },
      { id: "share", Icon: primitives.IconShareOutline16, color: "#6366f1" },
      { id: "project", Icon: primitives.IconProjectAddOutline16, color: "#a855f7" },
      { id: "persona", Icon: primitives.IconPersonalizationOutline16, color: "#f472b6" },
      { id: "enhance", Icon: primitives.IconEnhanceOutline16, color: "#06b6d4" },
      { id: "inspect", Icon: primitives.IconInspectOutline12, color: "#f97316" },
    ];
    function roleOf(id) {
      return ROLE_POOL.find((r) => r.id === id) || ROLE_POOL[0];
    }
    function renderRoleIcon(id, size) {
      const role = roleOf(id);
      return h(role.Icon, { size });
    }
    /* window chrome icons — official primitives (minus has no official glyph,
       so the minimize line stays hand-drawn; delete uses the official trash) */
    function IconBot() { return h(primitives.IconNewChatOutline16, { size: 14 }); }
    function IconMin() { return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" }, h("path", { d: "M2 6h8" })); }
    function IconClose() { return h(primitives.IconCloseOutline16, { size: 12 }); }
    function IconPlus() { return h(primitives.IconPlusOutline16, { size: 18 }); }
    function IconMinus() { return h(primitives.IconTrashOutline16, { size: 18 }); }

    /* ---------------- persistence ---------------- */
    const BOTS_KEY = "dsh-bot-mode.bots";
    const CHATS_KEY = "dsh-bot-mode.chats";
    const CHATWIN_KEY = "dsh-bot-mode.chatwin.";
    const DEFAULT_BOTS = [
      { id: "researcher", name: "研究员", icon: "search", color: roleOf("search").color, persona: "你是一位严谨的研究助理：擅长检索资料、交叉验证多个来源，并输出带引用的结构化报告。", createdAt: Date.now() },
      { id: "reviewer", name: "代码评审", icon: "code", color: roleOf("code").color, persona: "你是一位资深代码评审员：关注正确性、可读性与性能，每次给出可执行的具体建议。", createdAt: Date.now() },
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
      const warned = useRef(false);
      useEffect(() => {
        let ro = null;
        const update = () => {
          const el = document.querySelector('[class*="sidebarCol"]');
          if (el) {
            const bw = el.getBoundingClientRect().width;
            if (bw > 40 && bw < 900) setW(bw);
          } else if (!warned.current) {
            /* Hardening: official layout DOM moved — keep a sane default and
               warn once instead of breaking the roster/capsule anchoring. */
            warned.current = true;
            console.warn("[bot-mode] 未找到官方侧边栏元素（sidebarCol），面板锚定使用默认宽度");
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
      init: () => ({ overlayOpen: false, bots: loadBots(), chats: loadChats(), busyIds: {}, chatWins: {}, activeChatId: null, revision: -1 }),
      actions: {
        toggleOverlay: (d, open) => { d.overlayOpen = open; },
        addBot: (d, bot) => { d.bots = d.bots.concat([bot]); saveJSON(BOTS_KEY, d.bots); },
        removeBot: (d, id) => {
          d.bots = d.bots.filter((b) => b.id !== id);
          saveJSON(BOTS_KEY, d.bots);
          /* clean the bot's profile completely: chats, open windows, position */
          const chats = Object.assign({}, d.chats);
          delete chats[id];
          d.chats = chats;
          saveJSON(CHATS_KEY, d.chats);
          const wins = Object.assign({}, d.chatWins);
          delete wins[id];
          d.chatWins = wins;
          try { localStorage.removeItem(CHATWIN_KEY + id); } catch {}
          /* tell the host to release the continuable entry + lock (fire-and-forget) */
          try {
            fetch("/bot-mode/cleanup", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ botId: id }),
            }).catch(() => {});
          } catch {}
        },
        appendMessage: (d, botId, msg) => {
          const list = d.chats[botId] ? d.chats[botId].concat([msg]) : [msg];
          d.chats = Object.assign({}, d.chats, { [botId]: list });
          /* reasoning is a visual hint only — keep it in memory for the live
             window, drop it from persistence (refresh = gone) */
          const persist = {};
          Object.keys(d.chats).forEach((id) => {
            persist[id] = d.chats[id].map((m) => {
              const copy = Object.assign({}, m);
              delete copy.reasoning;
              return copy;
            });
          });
          saveJSON(CHATS_KEY, persist);
        },
        setBusy: (d, botId, on) => { const next = Object.assign({}, d.busyIds); if (on) next[botId] = true; else delete next[botId]; d.busyIds = next; },
        activateChat: (d, botId) => { d.activeChatId = botId; },
        openChat: (d, botId) => { d.overlayOpen = false; d.chatWins = Object.assign({}, d.chatWins, { [botId]: "open" }); d.activeChatId = botId; },
        closeChat: (d, botId) => {
          const w = Object.assign({}, d.chatWins);
          delete w[botId];
          d.chatWins = w;
          if (d.activeChatId === botId) d.activeChatId = null;
        },
        minimizeChat: (d, botId) => { d.chatWins = Object.assign({}, d.chatWins, { [botId]: "minimized" }); if (d.activeChatId === botId) d.activeChatId = null; },
        restoreChat: (d, botId) => { d.chatWins = Object.assign({}, d.chatWins, { [botId]: "open" }); d.activeChatId = botId; },
        sync: (d, next, revision) => {
          if (revision <= d.revision) return;
          d.overlayOpen = next.overlayOpen;
          d.bots = next.bots;
          d.chats = next.chats;
          d.busyIds = next.busyIds || {};
          d.chatWins = next.chatWins;
          d.activeChatId = next.activeChatId || null;
          d.revision = revision;
        },
      },
    });

    /* ---------------- helpers ---------------- */
    /* animated status glyphs: loading spin / question breathe / check done */
    function StatusIcon(props) {
      const { state, size } = props;
      const sz = size || 10;
      if (state === "running") return h(primitives.IconLoadingOutline16, { size: sz, className: "bm-spin", style: { color: "var(--dsw-alias-state-error-primary)" } });
      if (state === "pending") return h(primitives.IconQuestionOutline14, { size: sz, className: "bm-breathe", style: { color: "var(--dsw-alias-state-warn-primary)" } });
      if (state === "done") return h(primitives.IconCheckOutline16, { size: sz, style: { color: "var(--dsw-alias-state-success-primary)" } });
      return null;
    }
    /* avatar: official role icon, colored via currentColor, flex-locked size */
    function BotAvatar(props) {
      const { icon, emoji, color, size, className } = props;
      const sz = size || 36;
      if (emoji && !icon) {
        return h("span", { className: className || "bm-chip-avatar", style: { fontSize: sz * 0.5, width: sz, height: sz, flex: "none" } }, emoji);
      }
      return h("span", { className: className || "bm-chip-avatar", style: { width: sz, height: sz, flex: "none", color: color || "var(--dsw-alias-label-secondary)" } },
        renderRoleIcon(icon || "agent", Math.round(sz * 0.62)));
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
      const { useStore, useSessions, addBot, removeBot, appendMessage, toggleOverlay, setBusy, openChat, closeChat, minimizeChat, restoreChat, activateChat } = props;
      const state = useStore((s) => s);
      const [creating, setCreating] = useState(false);
      const [capH, setCapH] = useState(0);
      const capRef = useRef(null);
      const sbW = useSidebarWidth();
      const sessions = useSessions ? useSessions((s) => s) : null;
      const sessionId = sessions && sessions.current ? sessions.current : undefined;
      const openBots = Object.keys(state.chatWins).filter((k) => state.chatWins[k] === "open");
      const minBots = Object.keys(state.chatWins).filter((k) => state.chatWins[k] === "minimized");
      /* track the capsule row's live height so the roster can rise above it
         when capsules wrap into multiple rows */
      useEffect(() => {
        if (typeof ResizeObserver === "undefined" || !capRef.current) return;
        const ro = new ResizeObserver(() => {
          if (capRef.current) setCapH(capRef.current.getBoundingClientRect().height);
        });
        ro.observe(capRef.current);
        return () => ro.disconnect();
      }, [minBots.length]);
      const wide = sbW > 150;
      const panelW = wide ? Math.max(220, Math.min(sbW - 24, 320)) : 246;
      const panelStyle = wide
        ? { right: Math.max(8, (typeof window !== "undefined" ? window.innerWidth : 0) - sbW + 10), width: panelW, bottom: Math.max(130, 88 + capH + 8) }
        : { left: sbW + 8, width: panelW, bottom: Math.max(130, 88 + capH + 8) };
      /* capsule row is LEFT-aligned inside the sidebar, width clamped to the
         sidebar so it never spills past the drag-adjusted edge */
      const capStyle = wide
        ? { left: 10, maxWidth: Math.max(120, sbW - 20) }
        : { left: sbW + 8, maxWidth: 420 };

      return h("div", null,
        state.overlayOpen ? h("div", { className: "bm-overlay", style: panelStyle },
          h("div", { className: "bm-overlay-head" },
            h("span", { className: "bm-overlay-title", style: { fontSize: 11.5, whiteSpace: "nowrap" } }, h(IconBot), "使用中的Bots共有：" + state.bots.length + " 个"),
            h("button", { className: "bm-icon-btn", title: "关闭", onClick: () => toggleOverlay(false) }, h(IconClose))
          ),
          h("div", { className: "bm-overlay-body" },
            h(BotRoster, {
              bots: state.bots,
              chats: state.chats,
              busyIds: state.busyIds,
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
            busy: !!state.busyIds[botId],
            active: state.activeChatId === botId,
            sessionId,
            defaultX: sbW + 24,
            onClose: () => closeChat(botId),
            onMinimize: () => minimizeChat(botId),
            onAppend: (msg) => appendMessage(botId, msg),
            setBusy,
            onActivate: () => activateChat(botId),
          });
        }),
        minBots.length > 0 ? h("div", { ref: capRef, className: "bm-caprow", style: capStyle },
          minBots.map((botId) => {
            const bot = state.bots.find((b) => b.id === botId);
            if (!bot) return null;
            const busy = !!state.busyIds[botId];
            return h("div", { key: botId, className: "bm-capsule", onClick: () => restoreChat(botId), title: bot.name },
              h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 22 }),
              h(StatusIcon, { state: busy ? "running" : "pending", size: 11 }),
              h("span", { className: "bm-capsule-label" + (busy ? " busy" : "") }, busy ? "进行中" : "待命中")
            );
          })
        ) : null,
        creating ? h(NewBotModal, {
          onClose: () => setCreating(false),
          usedIcons: state.bots.map((b) => b.icon),
          onCreate: (bot) => { addBot(bot); setCreating(false); },
        }) : null
      );
    }

    function BotRoster(props) {
      const { bots, chats, busyIds, onPick, onNew, onRemove } = props;
      const [query, setQuery] = useState("");
      const [confirmBot, setConfirmBot] = useState(null);
      const [deleteMode, setDeleteMode] = useState(false);
      const [selIdx, setSelIdx] = useState(-1);
      useEffect(() => { setSelIdx(-1); }, [query]);
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
      const shown = results.slice(0, 20);
      /* keyboard navigation over search results */
      const onSearchKey = (e) => {
        if (!searching || shown.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx((i) => Math.min(i + 1, shown.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setSelIdx((i) => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); if (selIdx >= 0 && shown[selIdx]) onPick(shown[selIdx].bot); }
      };
      /* delete mode: tapping a bot shakes ONLY that bot and opens a Yes/No dialog */
      const handleChipClick = (bot) => {
        if (!deleteMode) { onPick(bot); return; }
        setConfirmBot(bot);
      };
      return h("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1 } },
        h("input", { className: "bm-search", placeholder: "搜索历史对话…", value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: onSearchKey }),
        searching
          ? (shown.length === 0
              ? h("div", { className: "bm-empty" }, "没有匹配的对话")
              : h("div", { className: "bm-results" },
                  shown.map((r, i) =>
                    h("div", { key: i, className: "bm-result" + (i === selIdx ? " sel" : ""), onClick: () => onPick(r.bot), onMouseEnter: () => setSelIdx(i) },
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
                  "还没有 Bot ✨\n点下方 + 新建你的第一个团队成员。")
              : h("div", { className: "bm-grid" },
                  bots.map((bot) =>
                    h("button", {
                      key: bot.id,
                      className: "bm-chip",
                      onClick: () => handleChipClick(bot),
                      title: deleteMode ? "点击删除此 Bot" : bot.name,
                    },
                      h("span", { className: "bm-chip-avatar", style: { position: "relative" } },
                        h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 36 }),
                        deleteMode ? h("span", { className: "bm-chip-del-badge" }, "–") : null,
                        h(StatusIcon, { state: !!busyIds[bot.id] ? "running" : "idle", size: 10 }),
                      ),
                      h("span", { className: "bm-chip-name" }, bot.name)
                    )
                  ),
                  /* trailing: blank placeholder + separator + new/delete chips */
                  h("span", { key: "__blank", className: "bm-chip bm-chip-blank" }),
                  h("span", { key: "__sep", className: "bm-grid-sep" }),
                  h("button", { key: "__new", className: "bm-chip bm-chip-new", onClick: onNew, title: "新建 Bot" },
                    h("span", { className: "bm-chip-avatar" }, h(IconPlus)),
                    h("span", { className: "bm-chip-name" }, "新建Bot")
                  ),
                  h("button", { key: "__del", className: "bm-chip bm-chip-new" + (deleteMode ? " on" : ""), onClick: () => { setDeleteMode(!deleteMode); setConfirmBot(null); }, title: deleteMode ? "退出删除模式" : "删除 Bot" },
                    h("span", { className: "bm-chip-avatar" }, h(IconMinus)),
                    h("span", { className: "bm-chip-name" }, "删除Bot")
                  )
                )),
              /* delete confirmation dialog */
              confirmBot ? h("div", { className: "bm-confirm", onClick: (e) => { if (e.target === e.currentTarget) setConfirmBot(null); } },
                h("div", { className: "bm-confirm-card" },
                  h("div", { className: "bm-confirm-title" }, "确认删除？"),
                  h("div", { className: "bm-confirm-sub" }, "将删除「" + confirmBot.name + "」及其全部对话记录，此操作不可撤销。"),
                  h("div", { className: "bm-confirm-actions" },
                    h("button", { className: "bm-btn bm-btn-ghost", onClick: () => setConfirmBot(null) }, "No"),
                    h("button", { className: "bm-btn", style: { background: "var(--dsw-alias-state-error-primary)" }, onClick: () => { onRemove(confirmBot.id); setConfirmBot(null); setDeleteMode(false); } }, "Yes")
                  )
                )
              ) : null
      );
    }

    /* collapsible thinking block, main-window style */
    function ReasoningBlock(props) {
      const [open, setOpen] = useState(false);
      const text = props.text || "";
      const brief = text.length > 90 ? text.slice(0, 90) + "…" : text;
      return h("div", { className: "bm-reason" },
        h("button", { className: "bm-reason-head", onClick: () => setOpen(!open), title: text },
          h("span", null, open ? "▾" : "▸"),
          h("span", null, "思考过程")
        ),
        open ? h("div", { className: "bm-reason-body" }, text) : null
      );
    }

    /* lightweight renderer for the bot's render_ui specs (floating window) */
    function UIRender(props) {
      const spec = props.spec;
      if (!spec || !Array.isArray(spec.items)) return null;
      return h("div", { className: "bm-ui" },
        spec.title ? h("div", { className: "bm-ui-title" }, spec.title) : null,
        spec.items.map((item, i) => renderUiItem(item, i))
      );
    }
    function renderUiItem(item, key) {
      if (!item || typeof item !== "object") return null;
      switch (item.type) {
        case "text":
          return h("div", { key, className: "bm-ui-text" }, item.content || "");
        case "list":
          return h("div", { key, style: { display: "flex", flexDirection: "column", gap: 3 } },
            (item.items || []).map((li, j) =>
              h("div", { key: j, className: "bm-ui-li" }, "• " + (li.title || li.content || li.desc || ""))
            )
          );
        case "keyvalue": {
          /* accept four shapes: pairs:[{key,value}], rows:[[k,v]],
             items:[{key,value}], and data:{key:value} — bots emit all */
          const itemList = Array.isArray(item.pairs)
            ? item.pairs
            : Array.isArray(item.rows)
              ? item.rows.map((r) => ({ key: r && r[0], value: r && r[1] }))
              : Array.isArray(item.items) && item.items[0] && ("key" in item.items[0] || "value" in item.items[0])
                ? item.items
                : (item.data && typeof item.data === "object"
                    ? Object.keys(item.data).map((k) => ({ key: k, value: item.data[k] }))
                    : []);
          return h("div", { key, className: "bm-ui-kv" },
            itemList.map((p, j) =>
              h("div", { key: j, className: "bm-ui-kv-row" },
                h("span", { className: "bm-ui-kv-k" }, p.key != null ? String(p.key) : ""),
                h("span", { className: "bm-ui-kv-v" }, String(p.value != null ? p.value : ""))
              )
            )
          );
        }
        case "table": {
          const cols = item.columns || [];
          const rows = item.rows || [];
          return h("table", { key, className: "bm-ui-table" },
            h("thead", null, h("tr", null, cols.map((c, j) => h("th", { key: j }, c)))),
            h("tbody", null, rows.map((r, j) =>
              h("tr", { key: j }, cols.map((c, k) => h("td", { key: k }, typeof r[k] === "object" && r[k] !== null ? JSON.stringify(r[k]) : (r && r[k] != null ? r[k] : ""))))
            ))
          );
        }
        case "steps":
          return h("div", { key, className: "bm-ui-steps" },
            (item.items || []).map((s, j) =>
              h("div", { key: j, className: "bm-ui-step" },
                h("span", { className: "bm-ui-step-n" }, String(j + 1)),
                h("div", { style: { minWidth: 0 } },
                  s.title ? h("div", { className: "bm-ui-step-title" }, s.title) : null,
                  (s.description || s.content) ? h("div", { className: "bm-ui-step-desc" }, s.description || s.content) : null
                )
              )
            )
          );
        case "callout":
          return h("div", { key, className: "bm-ui-callout" },
            item.title ? h("div", { className: "bm-ui-callout-t" }, item.title) : null,
            (item.content || item.text) ? h("div", { className: "bm-ui-callout-c" }, item.content || item.text) : null
          );
        case "stat":
          return h("div", { key, className: "bm-ui-stat" },
            item.label ? item.label + "：" : "", String(item.value != null ? item.value : "")
          );
        case "grid":
          return h("div", { key, style: { display: "flex", flexWrap: "wrap", gap: 6 } },
            (item.items || []).map((g, j) => h("div", { key: j, style: { flex: "1 1 45%", minWidth: 90 } }, renderUiItem(g, j)))
          );
        default:
          return null;
      }
    }

    /* floating chat window */
    function BotChatWindow(props) {
      const { bot, chats, busy, active, sessionId, defaultX, onClose, onMinimize, onAppend, setBusy, onActivate } = props;
      const [input, setInput] = useState("");
      const [sending, setSending] = useState(false);
      const [rect, setRect] = useState(loadChatWin(bot.id) || { x: defaultX, y: 110, w: 380, h: 360 });
      const listRef = useRef(null);
      const inputRef = useRef(null);
      const messages = chats[bot.id] || [];

      /* clamp the window inside the viewport so the title bar can never be
         stranded off-screen (e.g. after maximizing / resizing the browser) */
      const clamp = (r) => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const x = Math.min(Math.max(r.x, 8), Math.max(8, vw - 60));
        const y = Math.min(Math.max(r.y, 8), Math.max(8, vh - 40));
        if (x === r.x && y === r.y) return r;
        const next = Object.assign({}, r, { x, y });
        saveChatWin(bot.id, next);
        return next;
      };
      useEffect(() => {
        const onResize = () => setRect(clamp);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }, []);
      const safeRect = clamp(rect);

      /* click anywhere in the window raises it to front and grabs input focus */
      const onWindowMouseDown = (e) => {
        onActivate();
        const t = e.target;
        if (t && t.tagName !== "INPUT" && t.tagName !== "TEXTAREA" && inputRef.current && document.activeElement !== inputRef.current) {
          setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
        }
      };

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
        setBusy(bot.id, true);
        /* client-side timeout guard — if the host hangs, never leave the
           composer stuck in "thinking" forever */
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 130000);
        try {
          /* the host keeps a continuable child per bot — the bot remembers
             the conversation natively, no history shipping needed */
          const res = await fetch("/bot-mode/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ sessionId, bot, message: text }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          const data = await res.json();
          const ok = data && data.ok && typeof data.reply === "string" && data.reply.trim().length > 0;
          const noReply = data && data.ok && !ok;
          const reply = data && data.ok
            ? (ok ? data.reply : "无文本回复，结果见主对话区")
            : (data && data.error ? "⚠️ " + data.error : "（无回复）");
          onAppend({
            role: "bot",
            text: reply,
            error: noReply,
            reasoning: data && data.reasoning,
            tools: (data && data.tools) || [],
            ui: (data && data.ui) || [],
            ts: Date.now(),
            done: ok,
          });
        } catch (err) {
          clearTimeout(timeout);
          const timedOut = err && (err.name === "AbortError" || /abort/i.test(err.message || ""));
          onAppend({ role: "bot", text: timedOut ? "请求超时（130s），请重试或查看主对话区" : "请求失败: " + (err.message || err), ts: Date.now(), done: false });
        }
        setSending(false);
        setBusy(bot.id, false);
      };

      const lastDone = messages.length ? messages[messages.length - 1] : null;
      const statusLabel = busy || sending ? "任务进行中…" : (lastDone && lastDone.done ? "任务完成" : "空闲");

      return h("div", { className: "bm-chat-win", style: { left: safeRect.x, top: safeRect.y, width: rect.w, height: rect.h, zIndex: active ? 10001 : 10000 }, onMouseDown: onWindowMouseDown },
        h("div", { className: "bm-chat-titlebar", onMouseDown: onTitleDown },
          h(BotAvatar, { icon: bot.icon, emoji: bot.emoji, color: bot.color, size: 26 }),
          h("span", { className: "bm-chat-title" }, bot.name),
          h("span", { className: "bm-chat-status" + (busy ? " busy" : (lastDone && lastDone.done ? " done" : "")) },
            h(StatusIcon, { state: busy ? "running" : (lastDone && lastDone.done ? "done" : "idle"), size: 11 }),
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
                      h("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 } },
                        h("div", { className: "bm-msg bm-msg-bot" + (m.error ? " bm-msg-error" : "") },
                          m.error ? h("span", { className: "bm-msg-error-icon" },
                            h(primitives.IconWarningOutline16, { size: 14, className: "bm-breathe", style: { color: "var(--dsw-alias-state-error-primary)", verticalAlign: "-2px", marginRight: 5 } })
                          ) : null,
                          m.done ? h("div", { className: "bm-msg-meta" }, "✓ 完成") : null,
                          m.reasoning ? h(ReasoningBlock, { text: m.reasoning }) : null,
                          m.tools && m.tools.length
                            ? h("div", { className: "bm-msg-tools" }, m.tools.map((t, j) => h("span", { key: j, className: "bm-tool-chip" }, "🔧 " + t)))
                            : null,
                          m.text
                        ),
                        m.ui && m.ui.length ? m.ui.map((s, j) => h(UIRender, { key: "ui" + j, spec: s })) : null
                      )
                    )
                  : h("div", { key: i, className: "bm-msg bm-msg-user" }, m.text)
              ),
          sending ? h("div", { className: "bm-msg-sys" }, bot.name + " 思考中…") : null
        ),
        h("div", { className: "bm-composer" },
          h("input", {
            ref: inputRef,
            className: "bm-input",
            placeholder: "给 " + bot.name + " 发消息…",
            value: input,
            onChange: (e) => setInput(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey && !(e.nativeEvent && e.nativeEvent.isComposing)) { e.preventDefault(); send(); } },
          }),
          h("button", { className: "bm-btn", onClick: send, disabled: sending || !input.trim() }, "发送")
        ),
        h("div", { className: "bm-resize-handle", onMouseDown: onResizeDown })
      );
    }

    /* modal create */
    const MODAL_POS_KEY = "dsh-bot-mode.newmodal-pos";
    function NewBotModal(props) {
      const [name, setName] = useState("");
      const [persona, setPersona] = useState("");
      const usedIcons = props.usedIcons || [];
      const [icon, setIcon] = useState(() => {
        const free = ROLE_POOL.find((r) => usedIcons.indexOf(r.id) === -1);
        return free ? free.id : ROLE_POOL[0].id;
      });
      const [advanced, setAdvanced] = useState(false);
      const [pos, setPos] = useState(loadJSON(MODAL_POS_KEY, null));
      const cardRef = useRef(null);
      /* draggable via the title bar, position remembered — same as chat windows */
      const onTitleDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const rect = cardRef.current ? cardRef.current.getBoundingClientRect() : { left: 0, top: 0 };
        const start = { mx: e.clientX, my: e.clientY, x: rect.left, y: rect.top };
        const move = (ev) => {
          const next = { x: start.x + ev.clientX - start.mx, y: start.y + ev.clientY - start.my };
          setPos(next);
          saveJSON(MODAL_POS_KEY, next);
        };
        const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      };
      const submit = () => {
        const n = name.trim();
        if (!n) return;
        props.onCreate({ id: "bot-" + Date.now(), name: n, icon, color: roleOf(icon).color, persona: persona.trim() || "你是一位乐于助人的助手。", createdAt: Date.now() });
      };
      return h("div", { className: "bm-modal", onClick: (e) => { if (e.target === e.currentTarget) props.onClose(); } },
        h("div", {
          ref: cardRef,
          className: "bm-modal-card",
          style: pos ? (() => {
            const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
            const vh = typeof window !== "undefined" ? window.innerHeight : 800;
            return { left: Math.min(Math.max(pos.x, 8), Math.max(8, vw - 120)), top: Math.min(Math.max(pos.y, 8), Math.max(8, vh - 80)), transform: "none" };
          })() : undefined,
        },
          h("div", { className: "bm-modal-title", style: { cursor: "move", userSelect: "none" }, onMouseDown: onTitleDown },
            h(IconBot), "New Agent", h("span", { style: { marginLeft: "auto", cursor: "pointer", color: "var(--dsw-alias-label-secondary)" }, title: "关闭", onClick: props.onClose }, h(IconClose))
          ),
          h("div", { className: "bm-modal-sub" }, "选择一个角色形象（每个形象同一时间只服务一个 Bot），名字与人格可自定义。"),
          h("div", { className: "bm-field" },
            h("label", null, "角色形象"),
            h("div", { className: "bm-avatar-pick" },
              ROLE_POOL.map((role) => {
                const used = usedIcons.indexOf(role.id) !== -1;
                return h("span", {
                  key: role.id,
                  className: "bm-chip-avatar" + (role.id === icon ? " sel" : "") + (used ? " used" : ""),
                  style: { width: 36, height: 36, color: role.id === icon ? role.color : "var(--dsw-alias-label-secondary)", cursor: used ? "not-allowed" : "pointer", opacity: used ? 0.35 : 1 },
                  onClick: used ? null : () => setIcon(role.id),
                  title: used ? "已被其他 Bot 使用" : "选择此形象",
                }, h(role.Icon, { size: 18 }));
              })
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
              /* TODO(未实现): 行为提示/额外约束暂未接入 bot 数据模型与 host prompt 组装。
                 Hermes 参考里的「高级配置（克隆 profile / provider·model / SOUL.md）」同样未实现，
                 验证插件阶段只保留折叠结构。后续路线：见 README Roadmap。 */
              h("div", { className: "bm-field" },
                h("label", null, "行为提示（补充）"),
                h("input", { className: "bm-input", placeholder: "可选：语气、输出格式等额外约束（待实现）", disabled: true })
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
      setBusy: (botId, on) => actions.setBusy(botId, on),
      openChat: (botId) => actions.openChat(botId),
      closeChat: (botId) => actions.closeChat(botId),
      minimizeChat: (botId) => actions.minimizeChat(botId),
      restoreChat: (botId) => actions.restoreChat(botId),
      activateChat: (botId) => actions.activateChat(botId),
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

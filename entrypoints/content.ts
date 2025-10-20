export default defineContentScript({
  matches: ["*://github.com/*"],

  main() {
    console.log("✅ 写作助手：Content script 已加载");
    console.log("✅ 当前页面URL:", window.location.href);

    // 注入样式
    injectStyles();

    // 延迟执行，确保页面DOM加载完成
    setTimeout(() => {
      console.log("✅ 开始监听文本选中...");
      initTextSelectionListener();
    }, 1000);
  },
});

// 注入麦金塔风格样式
function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes macFadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes macPulse {
      0%, 100% {
        box-shadow: 0 4px 20px rgba(0, 122, 255, 0.25),
                    0 1px 3px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      50% {
        box-shadow: 0 6px 25px rgba(0, 122, 255, 0.35),
                    0 2px 5px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
    }

    .mac-tooltip {
      position: absolute;
      z-index: 10000;
      animation: macFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
    }

    .mac-tooltip-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 12px;
      padding: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1),
                  0 1px 3px rgba(0, 0, 0, 0.06),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 0.5px solid rgba(255, 255, 255, 0.8);
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .mac-tooltip-btn {
      background: linear-gradient(180deg, #007AFF 0%, #0051D5 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
      letter-spacing: -0.01em;
      box-shadow: 0 1px 3px rgba(0, 122, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .mac-tooltip-btn:hover {
      background: linear-gradient(180deg, #0071E3 0%, #0040B8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }

    .mac-tooltip-btn:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 122, 255, 0.3),
                  inset 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .mac-tooltip-btn:disabled {
      background: linear-gradient(180deg, #A0A0A0 0%, #888888 100%);
      cursor: not-allowed;
      animation: macPulse 1.5s ease-in-out infinite;
    }

    .mac-tooltip-arrow {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 6px;
      overflow: hidden;
    }

    .mac-tooltip-arrow::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-right: 0.5px solid rgba(255, 255, 255, 0.8);
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.8);
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.08);
    }

    @media (prefers-color-scheme: dark) {
      .mac-tooltip-content {
        background: rgba(50, 50, 55, 0.95);
        border: 0.5px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
                    0 1px 3px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .mac-tooltip-arrow::before {
        background: rgba(50, 50, 55, 0.95);
        border-right: 0.5px solid rgba(255, 255, 255, 0.1);
        border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
      }
    }

    .mac-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                  0 2px 8px rgba(0, 0, 0, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8);
      border: 0.5px solid rgba(255, 255, 255, 0.8);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #1d1d1f;
      animation: macFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.01em;
      min-width: 200px;
    }

    .mac-notification.success {
      color: #1d1d1f;
    }

    .mac-notification.error {
      color: #ff3b30;
    }

    .mac-notification.warning {
      color: #ff9500;
    }

    .mac-notification-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    @media (prefers-color-scheme: dark) {
      .mac-notification {
        background: rgba(50, 50, 55, 0.95);
        border: 0.5px solid rgba(255, 255, 255, 0.1);
        color: #f5f5f7;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                    0 2px 8px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .mac-notification.error {
        color: #ff453a;
      }

      .mac-notification.warning {
        color: #ffd60a;
      }
    }
  `;
  document.head.appendChild(style);
  console.log("✅ 麦金塔风格样式已注入");
}

// 全局变量
let currentTooltip: HTMLElement | null = null;
let currentTextarea: HTMLTextAreaElement | null = null;
let selectionRange: { start: number; end: number } | null = null;

// 初始化文本选中监听
function initTextSelectionListener() {
  // 监听所有 textarea 的选中事件
  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("keyup", handleTextSelection);

  // 点击页面其他地方时隐藏 tooltip
  document.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLElement;
    if (
      currentTooltip &&
      !currentTooltip.contains(target) &&
      target.tagName !== "TEXTAREA"
    ) {
      hideTooltip();
    }
  });

  console.log("✅ 文本选中监听已启动");
}

// 处理文本选中
function handleTextSelection(e: Event) {
  const target = e.target as HTMLElement;

  // 只处理 GitHub 的 textarea
  if (target.tagName !== "TEXTAREA") {
    return;
  }

  const textarea = target as HTMLTextAreaElement;
  const selectedText = textarea.value.substring(
    textarea.selectionStart,
    textarea.selectionEnd
  );

  console.log("🔍 检测到选中操作:", {
    hasSelection: selectedText.length > 0,
    text: selectedText,
  });

  // 如果有选中文本，显示 tooltip
  if (selectedText.trim().length > 0) {
    currentTextarea = textarea;
    selectionRange = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
    showTooltip(textarea, selectedText);
  } else {
    hideTooltip();
  }
}

// 显示 tooltip
function showTooltip(textarea: HTMLTextAreaElement, selectedText: string) {
  // 移除已存在的 tooltip
  hideTooltip();

  console.log("✨ 显示翻译工具条");

  // 创建 tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "mac-tooltip";

  const content = document.createElement("div");
  content.className = "mac-tooltip-content";

  const button = document.createElement("button");
  button.className = "mac-tooltip-btn";
  button.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1.5C3.96 1.5 1.5 3.96 1.5 7C1.5 10.04 3.96 12.5 7 12.5C10.04 12.5 12.5 10.04 12.5 7C12.5 3.96 10.04 1.5 7 1.5ZM7 11C4.79 11 3 9.21 3 7C3 4.79 4.79 3 7 3C9.21 3 11 4.79 11 7C11 9.21 9.21 11 7 11Z" fill="white" fill-opacity="0.9"/>
      <path d="M6.5 4.5H7.5V7.5H6.5V4.5Z" fill="white"/>
      <path d="M6.5 8.5H7.5V9.5H6.5V8.5Z" fill="white"/>
    </svg>
    <span>翻译为英文</span>
  `;

  button.addEventListener("click", async () => {
    await handleTranslate(selectedText);
  });

  content.appendChild(button);
  tooltip.appendChild(content);

  // 添加箭头
  const arrow = document.createElement("div");
  arrow.className = "mac-tooltip-arrow";
  tooltip.appendChild(arrow);

  document.body.appendChild(tooltip);
  currentTooltip = tooltip;

  // 计算位置
  positionTooltip(tooltip, textarea);
}

// 定位 tooltip
function positionTooltip(tooltip: HTMLElement, textarea: HTMLTextAreaElement) {
  const rect = textarea.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // 计算选中文本的大概位置（在 textarea 上方居中）
  let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
  let top = rect.top - tooltipRect.height - 12;

  // 确保不超出视口
  const padding = 10;
  left = Math.max(
    padding,
    Math.min(left, window.innerWidth - tooltipRect.width - padding)
  );
  top = Math.max(padding, top);

  // 如果上方空间不够，显示在下方
  if (top < padding) {
    top = rect.bottom + 12;
    // 箭头翻转（可选）
  }

  tooltip.style.left = `${left + window.scrollX}px`;
  tooltip.style.top = `${top + window.scrollY}px`;
}

// 隐藏 tooltip
function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

// 翻译处理
async function handleTranslate(text: string) {
  if (!currentTextarea || !selectionRange) return;

  console.log("🌐 开始翻译:", text);

  // 更新按钮状态
  const button = currentTooltip?.querySelector(
    ".mac-tooltip-btn"
  ) as HTMLButtonElement;
  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="7" r="5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 2" fill="none">
          <animateTransform attributeName="transform" type="rotate" from="0 7 7" to="360 7 7" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <span>翻译中...</span>
    `;
  }

  try {
    // 调用翻译 API
    const response = await browser.runtime.sendMessage({
      type: "TRANSLATE",
      text: text,
    });

    if (response.success && response.result) {
      // 替换选中的文本
      const textarea = currentTextarea;
      const before = textarea.value.substring(0, selectionRange.start);
      const after = textarea.value.substring(selectionRange.end);
      textarea.value = before + response.result + after;

      // 触发 input 事件
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));

      // 设置新的光标位置
      const newEnd = selectionRange.start + response.result.length;
      textarea.setSelectionRange(newEnd, newEnd);
      textarea.focus();

      showNotification("翻译完成！", "success");
      hideTooltip();
      console.log("✅ 翻译成功");
    } else {
      throw new Error(response.error || "翻译失败");
    }
  } catch (error) {
    console.error("❌ 翻译错误:", error);
    showNotification("翻译失败，请重试", "error");

    // 恢复按钮状态
    if (button) {
      button.disabled = false;
      button.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 1.5C3.96 1.5 1.5 3.96 1.5 7C1.5 10.04 3.96 12.5 7 12.5C10.04 12.5 12.5 10.04 12.5 7C12.5 3.96 10.04 1.5 7 1.5ZM7 11C4.79 11 3 9.21 3 7C3 4.79 4.79 3 7 3C9.21 3 11 4.79 11 7C11 9.21 9.21 11 7 11Z" fill="white" fill-opacity="0.9"/>
          <path d="M6.5 4.5H7.5V7.5H6.5V4.5Z" fill="white"/>
          <path d="M6.5 8.5H7.5V9.5H6.5V8.5Z" fill="white"/>
        </svg>
        <span>翻译为英文</span>
      `;
    }
  }
}

// 显示通知
function showNotification(
  message: string,
  type: "success" | "error" | "warning" = "success"
) {
  const notification = document.createElement("div");
  notification.className = `mac-notification ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
  };

  notification.innerHTML = `
    <span class="mac-notification-icon">${icons[type]}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation =
      "macFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) reverse";
    setTimeout(() => notification.remove(), 200);
  }, 3000);
}

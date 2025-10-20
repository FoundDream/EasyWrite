export default defineContentScript({
  matches: ["*://github.com/*"],

  main() {
    console.log("当前页面URL:", window.location.href);

    // 延迟执行，确保页面DOM加载完成
    setTimeout(() => {
      console.log("✅ 开始监听文本选中...");
      initTextSelectionListener();
    }, 1000);
  },
});

// 全局变量
let currentTooltip: HTMLElement | null = null;
let currentTextarea: HTMLTextAreaElement | null = null;
let selectionRange: { start: number; end: number } | null = null;
let lastMouseX: number = 0;
let lastMouseY: number = 0;

// 初始化文本选中监听
function initTextSelectionListener() {
  // 记录鼠标位置
  document.addEventListener("mousemove", (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  // 监听所有 textarea/input 的选中事件
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
  if (target.tagName !== "TEXTAREA" && target.tagName !== "INPUT") {
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

  // 创建 tooltip 容器
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position: fixed;
    z-index: 9999;
    pointer-events: auto;
  `;

  // 创建内容容器（使用内联样式，不依赖 Tailwind）
  const content = document.createElement("div");
  content.style.cssText = `
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.08);
  `;

  // 创建按钮
  const button = document.createElement("button");
  button.style.cssText = `
    background: linear-gradient(180deg, #007AFF 0%, #0051D5 100%);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    transition: all 0.2s;
  `;

  button.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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

  document.body.appendChild(tooltip);
  currentTooltip = tooltip;

  // 计算位置
  positionTooltip(tooltip, textarea);
}

// 定位 tooltip
function positionTooltip(tooltip: HTMLElement, textarea: HTMLTextAreaElement) {
  const rect = textarea.getBoundingClientRect();

  // 先让 tooltip 渲染，获取其实际尺寸
  requestAnimationFrame(() => {
    const tooltipRect = tooltip.getBoundingClientRect();

    // 获取选中区域的起始和结束位置
    const startPos = Math.min(textarea.selectionStart, textarea.selectionEnd);
    const endPos = Math.max(textarea.selectionStart, textarea.selectionEnd);

    // 获取起始和结束位置的坐标
    const startCoords = getCaretCoordinates(textarea, startPos);
    const endCoords = getCaretCoordinates(textarea, endPos);

    // 判断选择方向：通过比较鼠标位置和起始/结束坐标来判断
    // 如果鼠标更靠近结束位置，说明是从左到右选择；反之从右到左
    const startX = rect.left + startCoords.left;
    const endX = rect.left + endCoords.left;
    const distToStart = Math.abs(lastMouseX - startX);
    const distToEnd = Math.abs(lastMouseX - endX);

    // 选择鼠标更靠近的那一端作为光标位置
    const isLeftToRight = distToEnd < distToStart;
    const cursorPosition = isLeftToRight ? endCoords : startCoords;

    console.log(`🎯 选择方向: ${isLeftToRight ? "从左到右" : "从右到左"}`);

    // 计算 tooltip 位置：光标右侧
    let left = rect.left + cursorPosition.left + 8; // 光标右侧 8px
    let top = rect.top + cursorPosition.top - tooltipRect.height / 2; // 垂直居中对齐光标

    // 确保不超出视口
    const padding = 10;

    // 水平方向：如果右侧空间不够，显示在光标左侧
    if (left + tooltipRect.width + padding > window.innerWidth) {
      left = rect.left + cursorPosition.left - tooltipRect.width - 8;
    }

    // 如果左侧也不够，至少保证不超出屏幕
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipRect.width - padding)
    );

    // 垂直方向：确保不超出视口
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipRect.height - padding)
    );

    // 设置最终位置
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    console.log(`📍 工具条位置: left=${left}px, top=${top}px (光标位置)`);
  });
}

// 获取光标在 textarea 中的坐标位置
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  // 创建一个镜像 div 来计算位置
  const div = document.createElement("div");
  const style = getComputedStyle(element);

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";

  // 添加文本内容
  const textContent = element.value.substring(0, position);
  div.textContent = textContent;

  // 创建一个 span 来标记光标位置
  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);

  const coordinates = {
    top: span.offsetTop,
    left: span.offsetLeft,
  };

  document.body.removeChild(div);

  return coordinates;
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
  const button = currentTooltip?.querySelector("button") as HTMLButtonElement;
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

      hideTooltip();
      console.log("✅ 翻译成功");
    } else {
      throw new Error(response.error || "翻译失败");
    }
  } catch (error) {
    console.error("❌ 翻译错误:", error);

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

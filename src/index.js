// ==UserScript==
// @name         ChatGPT Degraded
// @name:zh-CN   ChatGPT 服务降级监控
// @namespace    https://github.com/lroolle/chatgpt-degraded
// @version      0.2.4
// @description  Monitor ChatGPT service level, IP quality and PoW difficulty
// @description:zh-CN  监控 ChatGPT 服务状态、IP 质量和 PoW 难度
// @author       lroolle
// @license      AGPL-3.0
// @match        *://chat.openai.com/*
// @match        *://chatgpt.com/*
// @connect      status.openai.com
// @connect      scamalytics.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmE5ZDhmO3N0b3Atb3BhY2l0eToxIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJhOWQ4ZjtzdG9wLW9wYWNpdHk6MC44Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Zz4KICAgIDxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI4IiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KPCEtLU91dGVyIGNpcmNsZSBtb2RpZmllZCB0byBsb29rIGxpa2UgIkMiLS0+CiAgICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjEyNSA1NSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjIwIi8+CiAgICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjQiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPg==
// @homepageURL  https://github.com/lroolle/chatgpt-degraded
// @supportURL   https://github.com/lroolle/chatgpt-degraded/issues
// @downloadURL  https://update.greasyfork.org/scripts/522323/ChatGPT%20Degraded.user.js
// @updateURL    https://update.greasyfork.org/scripts/522323/ChatGPT%20Degraded.meta.js
// ==/UserScript==

(function () {
  "use strict";

  let displayBox, collapsedIndicator;

  function updateUserType(type) {
    const userTypeElement = document.getElementById("user-type");
    if (!userTypeElement) return;
    const isPaid =
      type &&
      (type === "plus" ||
        type === "chatgpt-paid" ||
        type.includes("paid") ||
        type.includes("premium") ||
        type.includes("pro"));
    userTypeElement.textContent = isPaid ? "Paid" : "Free";
    userTypeElement.dataset.tooltip = `ChatGPT Account Type: ${isPaid ? "Paid" : "Free"}`;
    userTypeElement.style.color = isPaid
      ? "var(--success-color, #10a37f)"
      : "var(--text-primary, #374151)";
  }

  function getRiskColorAndLevel(difficulty) {
    if (!difficulty || difficulty === "N/A") {
      return { color: "#e63946", level: "Unknown", percentage: 0 };
    }
    const cleanDifficulty = difficulty.replace(/^0x/, "").replace(/^0+/, "");
    const hexLength = cleanDifficulty.length;
    if (hexLength <= 2) {
      return { color: "#e63946", level: "Critical", percentage: 100 };
    } else if (hexLength <= 3) {
      return { color: "#FAB12F", level: "Hard", percentage: 75 };
    } else if (hexLength <= 4) {
      return { color: "#859F3D", level: "Medium", percentage: 50 };
    } else if (hexLength <= 5) {
      return { color: "#2a9d8f", level: "Easy", percentage: 25 };
    } else {
      return { color: "#4CAF50", level: "Very Easy", percentage: 0 };
    }
  }

  function setProgressBar(bar, label, percentage, text, gradient, title) {
    bar.style.width = "100%";
    bar.style.background = gradient;
    bar.dataset.tooltip = title;
    label.innerText = text;
  }

  function updateProgressBars(difficulty) {
    const powBar = document.getElementById("pow-bar");
    const powLevel = document.getElementById("pow-level");
    const difficultyElement = document.getElementById("difficulty");
    if (!powBar || !powLevel || !difficultyElement) return;
    const { color, level, percentage } = getRiskColorAndLevel(difficulty);
    const gradient = `linear-gradient(90deg, ${color} ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%)`;
    setProgressBar(
      powBar,
      powLevel,
      percentage,
      level,
      gradient,
      "PoW Difficulty: Lower (green) means faster responses.",
    );
    difficultyElement.style.color = color;
    powLevel.style.color = color;
    if (collapsedIndicator) {
      const gradientStops = collapsedIndicator.querySelector("#gradient");
      if (gradientStops) {
        gradientStops.innerHTML = `
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
        `;
      }
    }
  }

  const originalFetch = unsafeWindow.fetch;
  unsafeWindow.fetch = async function (resource, options) {
    const response = await originalFetch(resource, options);
    const url = typeof resource === "string" ? resource : resource?.url;
    const isChatRequirements =
      url &&
      (url.includes("/backend-api/sentinel/chat-requirements") ||
        url.includes("/backend-anon/sentinel/chat-requirements") ||
        url.includes("/api/sentinel/chat-requirements")) &&
      options?.method === "POST";
    if (isChatRequirements) {
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        const difficulty = data?.proofofwork?.difficulty;
        const userType = data?.persona || data?.user_type || data?.account_type;
        const difficultyElement = document.getElementById("difficulty");
        if (difficultyElement) {
          if (difficulty) {
            difficultyElement.innerText = difficulty;
            difficultyElement.dataset.tooltip = `Raw Difficulty Value: ${difficulty}`;
          } else {
            difficultyElement.innerText = "N/A";
            difficultyElement.dataset.tooltip = "No difficulty value found";
          }
        }
        updateUserType(userType || "free");
        updateProgressBars(difficulty || "N/A");
      } catch (error) {
        const difficultyElement = document.getElementById("difficulty");
        if (difficultyElement) {
          difficultyElement.innerText = "N/A";
          difficultyElement.dataset.tooltip = `Error: ${error.message}`;
        }
        updateUserType("free");
        updateProgressBars("N/A");
      }
    }
    return response;
  };

  function initUI() {
    displayBox = document.createElement("div");
    displayBox.style.position = "fixed";
    displayBox.style.bottom = "10px";
    displayBox.style.right = "80px";
    displayBox.style.width = "360px";
    displayBox.style.padding = "24px";
    displayBox.style.backgroundColor =
      "var(--surface-primary, rgb(255, 255, 255))";
    displayBox.style.color = "var(--text-primary, #374151)";
    displayBox.style.fontSize = "14px";
    displayBox.style.borderRadius = "16px";
    displayBox.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.08)";
    displayBox.style.zIndex = "10000";
    displayBox.style.transition = "opacity 0.15s ease, transform 0.15s ease";
    displayBox.style.display = "none";
    displayBox.style.opacity = "0";
    displayBox.style.transform = "translateX(10px)";
    displayBox.style.border =
      "1px solid var(--border-light, rgba(0, 0, 0, 0.05))";

    // Reordered: PoW block before IP block
    displayBox.innerHTML = `
      <div id="content">
        <div class="monitor-item">
          <div class="monitor-row">
            <span class="label">ChatGPT</span>
            <span id="user-type" class="value" data-tooltip="ChatGPT Account Type"></span>
          </div>
        </div>

        <!-- Proof of Work Difficulty -->
        <div class="monitor-item">
          <div class="monitor-row">
            <span class="label">PoW</span>
            <div class="pow-container">
              <span id="difficulty" class="value monospace" data-tooltip="PoW Difficulty Value"></span>
              <span id="pow-level" class="value-tag" data-tooltip="Difficulty Level"></span>
            </div>
          </div>
          <div class="progress-wrapper" data-tooltip="PoW Difficulty: Lower (green) means faster responses.">
            <div class="progress-container">
              <div id="pow-bar" class="progress-bar"></div>
            </div>
            <div class="progress-background"></div>
          </div>
        </div>

        <!-- IP + IP Quality -->
        <div class="monitor-item">
          <div class="monitor-row">
            <span class="label">IP</span>
            <div class="ip-container">
              <span id="ip-address" class="value monospace" data-tooltip="Click to copy IP address"></span>
              <span id="warp-badge" class="warp-badge"></span>
              <span id="ip-quality" class="value-tag" data-tooltip="IP Risk Info (Scamlytics)"></span>
            </div>
          </div>
        </div>

        <!-- OpenAI System Status -->
        <div class="monitor-item">
          <div class="monitor-row">
            <span class="label">Status</span>
            <a id="status-description"
               href="https://status.openai.com"
               target="_blank"
               class="value"
               data-tooltip="OpenAI System Status">
               Checking status...
            </a>
          </div>
        </div>
      </div>

      <style>
        .monitor-item {
          margin-bottom: 16px;
        }
        .monitor-item:last-child {
          margin-bottom: 0;
        }
        .monitor-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }
        .monitor-row:last-child {
          margin-bottom: 4px;
        }
        .label {
          font-size: 14px;
          color: var(--text-secondary, #6B7280);
          flex-shrink: 0;
          min-width: 40px;
        }
        .value {
          font-size: 14px;
          color: var(--text-primary, #374151);
          flex: 1;
        }
        .monospace {
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
        }
        .value-tag {
          font-size: 14px;
          color: var(--success-color, #10a37f);
          white-space: nowrap;
          font-weight: 500;
          transition: opacity 0.15s ease;
          cursor: pointer;
          display: inline-block;
        }
        .value-tag:hover {
          opacity: 0.8;
        }
        .progress-wrapper {
          position: relative;
          margin-left: 40px;
          margin-top: 4px;
        }
        .progress-container {
          position: relative;
          height: 4px;
          background: transparent;
          border-radius: 2px;
          overflow: hidden;
          z-index: 1;
        }
        .progress-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--surface-secondary, rgba(0, 0, 0, 0.08));
          border-radius: 2px;
        }
        .progress-bar {
          height: 100%;
          width: 0%;
          transition: all 0.3s ease;
          background: var(--success-color, #10a37f);
        }
        #status-description {
          text-decoration: none;
          color: inherit;
        }
        #status-description:hover {
          text-decoration: underline;
        }
        #ip-address {
          cursor: pointer;
        }
        #ip-address:hover {
          opacity: 0.7;
        }
        #user-type {
          font-weight: 500;
        }
        .ip-container,
        .pow-container {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
        }
        .warp-badge {
          font-size: 12px;
          color: var(--success-color, #10a37f);
          background-color: var(--surface-secondary, rgba(16, 163, 127, 0.1));
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 500;
          cursor: help;
          display: none;
        }

        [data-tooltip] {
          position: relative;
          cursor: help;
        }
        [data-tooltip]::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          background: var(--surface-primary, rgba(0, 0, 0, 0.8));
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: pre-line;
          width: max-content;
          max-width: 300px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          pointer-events: none;
          margin-bottom: 8px;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        [data-tooltip]::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          border: 6px solid transparent;
          border-top-color: var(--surface-primary, rgba(0, 0, 0, 0.8));
          margin-bottom: -4px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        [data-tooltip]:hover::after {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          left: calc(min(50%, calc(var(--viewport-width, 100vw) - 100% - 24px)));
        }
        [data-tooltip]:hover::before {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          left: calc(min(50%, calc(var(--viewport-width, 100vw) - 100% - 24px)));
        }
      </style>
    `;
    document.body.appendChild(displayBox);

    collapsedIndicator = document.createElement("div");
    collapsedIndicator.style.position = "fixed";
    collapsedIndicator.style.bottom = "10px";
    collapsedIndicator.style.right = "40px";
    collapsedIndicator.style.width = "24px";
    collapsedIndicator.style.height = "24px";
    collapsedIndicator.style.backgroundColor = "transparent";
    collapsedIndicator.style.border =
      "1px solid var(--token-border-light, rgba(0, 0, 0, 0.1))";
    collapsedIndicator.style.borderRadius = "50%";
    collapsedIndicator.style.cursor = "pointer";
    collapsedIndicator.style.zIndex = "10000";
    collapsedIndicator.style.display = "flex";
    collapsedIndicator.style.alignItems = "center";
    collapsedIndicator.style.justifyContent = "center";
    collapsedIndicator.style.transition = "all 0.3s ease";

    collapsedIndicator.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#666;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#666;stop-opacity:0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g id="icon-group" filter="url(#glow)" transform="rotate(165, 32, 32)">
          <circle cx="32" cy="32" r="28" fill="url(#gradient)" stroke="#fff" stroke-width="1"/>
          <circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="1"
                  stroke-dasharray="80 40" transform="rotate(-90, 32, 32)">
            <animate
              attributeName="r"
              values="20;22;20"
              dur="4s"
              repeatCount="indefinite"/>
          </circle>
          <circle cx="32" cy="32" r="12" fill="none" stroke="#fff" stroke-width="1">
            <animate
              attributeName="r"
              values="12;14;12"
              dur="4s"
              repeatCount="indefinite"/>
          </circle>
          <circle id="center-dot" cx="32" cy="32" r="4" fill="#fff">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="4s"
              repeatCount="indefinite"/>
          </circle>
        </g>
      </svg>
    `;
    document.body.appendChild(collapsedIndicator);

    collapsedIndicator.addEventListener("mouseenter", () => {
      displayBox.style.display = "block";
      requestAnimationFrame(() => {
        displayBox.style.opacity = "1";
        displayBox.style.transform = "translateX(0)";
      });
    });

    displayBox.addEventListener("mouseleave", () => {
      displayBox.style.opacity = "0";
      displayBox.style.transform = "translateX(10px)";
      setTimeout(() => {
        displayBox.style.display = "none";
      }, 150);
    });

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    fetchIPInfo();
    fetchChatGPTStatus();
    updateTheme();
    const statusCheckInterval = 60 * 60 * 1000;
    let statusCheckTimer = setInterval(fetchChatGPTStatus, statusCheckInterval);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        clearInterval(statusCheckTimer);
        fetchChatGPTStatus();
        statusCheckTimer = setInterval(fetchChatGPTStatus, statusCheckInterval);
      }
    });
  }

  if (document.readyState !== "loading") {
    initUI();
  } else {
    document.addEventListener("DOMContentLoaded", initUI);
  }

  function maskIP(ip) {
    if (!ip || ip === "Unknown") return ip;
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) {
        return `${parts[0]}.*.*.${parts[3]}`;
      }
    }
    if (ip.includes(":")) {
      const parts = ip.split(":");
      // Shorten IPv6 to just show first and last part
      if (parts.length > 2) {
        return `${parts[0]}:*:${parts[parts.length - 1]}`;
      }
    }
    return ip;
  }

  async function fetchIPQuality(ip) {
    try {
      const response = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: `https://scamalytics.com/ip/${ip}`,
          timeout: 3000,
          onload: (r) =>
            r.status === 200
              ? resolve(r.responseText)
              : reject(new Error(`HTTP ${r.status}`)),
          onerror: reject,
          ontimeout: () => reject(new Error("Request timed out")),
        });
      });
      const parser = new DOMParser();
      const doc = parser.parseFromString(response, "text/html");
      const scoreElement = doc.querySelector(".score_bar .score");
      const scoreMatch =
        scoreElement?.textContent.match(/Fraud Score:\s*(\d+)/i);
      if (!scoreMatch) {
        return {
          label: "Unknown",
          color: "#aaa",
          tooltip: "Could not determine IP quality",
          score: null
        };
      }
      const score = parseInt(scoreMatch[1], 10);
      const riskElement = doc.querySelector(".panel_title");
      const riskText = riskElement?.textContent.trim() || "Unknown Risk";
      const panelColor = riskElement?.style.backgroundColor || "#aaa";
      const descriptionElement = doc.querySelector(".panel_body");
      const description = descriptionElement?.textContent.trim() || "";
      const trimmedDescription =
        description.length > 150
          ? `${description.substring(0, 147)}...`
          : description;

      function extractTableValue(header) {
        const row = Array.from(doc.querySelectorAll("th")).find(
          (th) => th.textContent.trim() === header,
        )?.parentElement;
        return row?.querySelector("td")?.textContent.trim() || null;
      }
      function isRiskYes(header) {
        const row = Array.from(doc.querySelectorAll("th")).find(
          (th) => th.textContent.trim() === header,
        )?.parentElement;
        return row?.querySelector(".risk.yes") !== null;
      }
      const details = {
        location: extractTableValue("City") || "Unknown",
        state: extractTableValue("State / Province"),
        country: extractTableValue("Country Name"),
        isp: extractTableValue("ISP Name") || "Unknown",
        organization: extractTableValue("Organization Name"),
        isVPN: isRiskYes("Anonymizing VPN"),
        isTor: isRiskYes("Tor Exit Node"),
        isServer: isRiskYes("Server"),
        isProxy:
          isRiskYes("Public Proxy") ||
          isRiskYes("Web Proxy") ||
          isRiskYes("Proxy"),
      };
      let label, color;
      if (riskText && riskText !== "Unknown Risk") {
        label = riskText;
        color = panelColor !== "#aaa" ? panelColor : getColorForScore(score);
      } else {
        ({ label, color } = getLabelAndColorForScore(score));
      }
      const warnings = [];
      if (details.isVPN) warnings.push("VPN");
      if (details.isTor) warnings.push("Tor");
      if (details.isServer) warnings.push("Server");
      if (details.isProxy) warnings.push("Proxy");
      const location = [details.location, details.state, details.country]
        .filter(Boolean)
        .join(", ");
      const tooltip = [
        "IP Risk Info (Scamlytics):",
        label !== "Unknown" ? `Risk: ${label} (${score}/100)` : "",
        `Location: ${location}`,
        `ISP: ${details.isp}${details.organization ? ` (${details.organization})` : ""}`,
        warnings.length ? `Warnings: ${warnings.join(", ")}` : "",
        trimmedDescription ? `\n${trimmedDescription}` : "",
        "\nClick to view full analysis",
      ]
        .filter(Boolean)
        .join("\n");
      return { label, color, tooltip, score };
    } catch (error) {
      return {
        label: "Unknown",
        color: "#aaa",
        tooltip: "Could not check IP quality",
        score: null
      };
    }
  }

  function getColorForScore(score) {
    if (score < 25) return "#4CAF50";
    if (score < 50) return "#859F3D";
    if (score < 75) return "#FAB12F";
    return "#e63946";
  }

  function getLabelAndColorForScore(score) {
    if (score < 25) return { label: "Low Risk", color: "#4CAF50" };
    if (score < 50) return { label: "Medium Risk", color: "#859F3D" };
    if (score < 75) return { label: "High Risk", color: "#FAB12F" };
    return { label: "Very High Risk", color: "#e63946" };
  }

  async function fetchIPInfo() {
    try {
      const response = await fetch("https://chatgpt.com/cdn-cgi/trace");
      const text = await response.text();
      const data = text.split("\n").reduce((obj, line) => {
        const [key, value] = line.split("=");
        if (key && value) obj[key.trim()] = value.trim();
        return obj;
      }, {});
      const ipElement = document.getElementById("ip-address");
      const warpBadge = document.getElementById("warp-badge");
      const ipQualityElement = document.getElementById("ip-quality");
      if (!ipElement || !warpBadge || !ipQualityElement) return;

      const maskedIP = maskIP(data.ip);
      const fullIP = data.ip || "Unknown";
      const warpStatus = data.warp || "off";
      ipElement.innerText = maskedIP;

      if (warpStatus === "on" || warpStatus === "plus") {
        warpBadge.style.display = "inline-flex";
        warpBadge.innerText = warpStatus === "plus" ? "warp+" : "warp";
        warpBadge.dataset.tooltip = `Protected by Cloudflare WARP${warpStatus === "plus" ? "+" : ""}`;
      } else {
        warpBadge.style.display = "none";
      }

      const { label, color, tooltip, score } = await fetchIPQuality(fullIP);
      ipElement.style.color = color;
      ipQualityElement.innerText = score !== null ? `${label} (${score})` : label;
      ipQualityElement.style.color = color;
      ipQualityElement.dataset.tooltip = tooltip;
      ipElement.dataset.tooltip = `IP Address: ${fullIP}`;

      ipQualityElement.onclick = () =>
        window.open(`https://scamalytics.com/ip/${fullIP}`, "_blank");

      const copyHandler = async () => {
        try {
          await navigator.clipboard.writeText(fullIP);
          const originalText = ipElement.innerText;
          ipElement.innerText = "Copied!";
          setTimeout(() => {
            ipElement.innerText = originalText;
          }, 1000);
        } catch (err) {
          ipElement.innerText = "Copy failed";
          setTimeout(() => {
            ipElement.innerText = maskedIP;
          }, 1000);
        }
      };
      ipElement.removeEventListener("click", copyHandler);
      ipElement.addEventListener("click", copyHandler);
    } catch (error) {
      const ipElement = document.getElementById("ip-address");
      const warpBadge = document.getElementById("warp-badge");
      const ipQualityElement = document.getElementById("ip-quality");
      if (ipElement) ipElement.innerText = "Failed to fetch";
      if (warpBadge) warpBadge.style.display = "none";
      if (ipQualityElement) {
        ipQualityElement.innerText = "Unknown";
        ipQualityElement.style.color = "#aaa";
        ipQualityElement.dataset.tooltip = "Could not check IP quality";
      }
    }
  }

  async function fetchChatGPTStatus() {
    try {
      if (typeof GM_xmlhttpRequest === "undefined") {
        throw new Error("GM_xmlhttpRequest not supported");
      }
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://status.openai.com/api/v2/status.json",
          timeout: 3000,
          ontimeout: () => reject(new Error("Status check timed out")),
          onload: (response) => {
            if (response.status === 200) {
              try {
                const data = JSON.parse(response.responseText);
                const status = data.status;
                const statusDescription =
                  document.getElementById("status-description");
                const statusMonitorItem =
                  statusDescription?.closest(".monitor-item");
                if (!statusDescription || !statusMonitorItem) {
                  reject(new Error("Status UI elements not found"));
                  return;
                }
                statusMonitorItem.style.display = "block";
                if (status) {
                  const indicator = (status.indicator || "").toLowerCase();
                  const description =
                    status.description || "All Systems Operational";
                  const indicatorColors = {
                    none: "var(--success-color, #10a37f)",
                    minor: "#FAB12F",
                    major: "#FFA500",
                    critical: "#e63946",
                  };
                  if (description === "All Systems Operational") {
                    statusDescription.style.color =
                      "var(--success-color, #10a37f)";
                  } else {
                    statusDescription.style.color =
                      indicatorColors[indicator] || "#aaa";
                  }
                  statusDescription.textContent = description;
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error(`HTTP error: ${response.status}`));
            }
          },
          onerror: (err) => reject(err),
        });
      });
    } catch (error) {
      const statusDescription = document.getElementById("status-description");
      const statusMonitorItem = statusDescription?.closest(".monitor-item");
      if (statusMonitorItem) statusMonitorItem.style.display = "none";
    }
  }

  function updateTheme() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.dataset.theme === "dark";
    displayBox.style.backgroundColor = isDark
      ? "var(--surface-primary, rgba(0, 0, 0, 0.8))"
      : "var(--surface-primary, rgba(255, 255, 255, 0.9))";
    displayBox.style.color = isDark
      ? "var(--text-primary, #fff)"
      : "var(--text-primary, #000)";
    displayBox.querySelectorAll(".label").forEach((label) => {
      label.style.color = isDark
        ? "var(--text-secondary, #aaa)"
        : "var(--text-secondary, #666)";
    });
  }
})();

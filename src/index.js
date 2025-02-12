// ==UserScript==
// @name         ChatGPT Degraded
// @name:zh-CN   ChatGPT 服务降级监控
// @namespace    https://github.com/lroolle/chatgpt-degraded
// @version      0.2.2
// @description  Monitor ChatGPT service level, IP quality and PoW difficulty
// @description:zh-CN  监控 ChatGPT 服务状态、IP 质量和 PoW 难度
// @author       lroolle
// @license      AGPL-3.0
// @match        *://chat.openai.com/*
// @match        *://chatgpt.com/*
// @connect      status.openai.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMmE5ZDhmO3N0b3Atb3BhY2l0eToxIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzJhOWQ4ZjtzdG9wLW9wYWNpdHk6MC44Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8Zz4KICAgIDxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjI4IiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KPCEtLU91dGVyIGNpcmNsZSBtb2RpZmllZCB0byBsb29rIGxpa2UgIkMiLS0+CiAgICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjEyNSA1NSIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjIwIi8+CiAgICA8Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIxMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjQiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPg==
// @homepageURL  https://github.com/lroolle/chatgpt-degraded
// @supportURL   https://github.com/lroolle/chatgpt-degraded/issues
// @downloadURL https://update.greasyfork.org/scripts/522323/ChatGPT%20Degraded.user.js
// @updateURL https://update.greasyfork.org/scripts/522323/ChatGPT%20Degraded.meta.js
// ==/UserScript==

// Reference: https://github.com/KoriIku/chatgpt-degrade-checker (by KoriIku)

(function () {
  "use strict";

  // Global variables to store UI elements
  let displayBox, collapsedIndicator;

  // Placeholder functions for UI updates that will be properly initialized later
  function updateUserType(type) {
    const userTypeElement = document.getElementById("user-type");
    if (!userTypeElement) return;

    // More robust user type detection with fallback colors
    const isPaid =
      type &&
      (type === "plus" ||
        type === "chatgpt-paid" ||
        type.includes("paid") ||
        type.includes("premium") ||
        type.includes("pro"));

    userTypeElement.textContent = isPaid ? "Paid" : "Free";
    userTypeElement.style.color = "var(--success-color, #10a37f)";
  }

  function updateProgressBars(difficulty) {
    const powBar = document.getElementById("pow-bar");
    const powLevel = document.getElementById("pow-level");
    const ipQualityBar = document.getElementById("ip-quality-bar");
    const ipQuality = document.getElementById("ip-quality");
    const difficultyElement = document.getElementById("difficulty");
    const ipAddressElement = document.getElementById("ip-address");

    if (
      !powBar ||
      !powLevel ||
      !ipQualityBar ||
      !ipQuality ||
      !difficultyElement ||
      !ipAddressElement
    )
      return;

    const {
      color,
      level,
      ipQuality: quality,
      percentage,
    } = getRiskColorAndLevel(difficulty);

    const gradient = `linear-gradient(90deg,
            ${color} ${percentage}%,
            rgba(255, 255, 255, 0.1) ${percentage}%
        )`;

    setProgressBar(
      powBar,
      powLevel,
      percentage,
      level,
      gradient,
      "PoW Difficulty: Required computational work before sending messages. Lower (green) means faster responses.",
    );
    setProgressBar(
      ipQualityBar,
      ipQuality,
      percentage,
      quality,
      gradient,
      "IP Quality: Indicates the risk associated with your IP as assessed by ChatGPT. Lower(green) is better.",
    );

    difficultyElement.style.color = color;
    ipAddressElement.style.color = color;
    ipQuality.style.color = color;
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

  // Override fetch immediately at document-start
  const originalFetch = unsafeWindow.fetch;
  unsafeWindow.fetch = async function (resource, options) {
    const response = await originalFetch(resource, options);
    const url = typeof resource === "string" ? resource : resource?.url;

    // More robust endpoint detection
    const isChatRequirements =
      url &&
      (url.includes("/backend-api/sentinel/chat-requirements") ||
        url.includes("/backend-anon/sentinel/chat-requirements") ||
        url.includes("/api/sentinel/chat-requirements")) && // Future-proofing
      options?.method === "POST";

    if (isChatRequirements) {
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        console.debug("ChatGPT requirements response:", data);

        // More robust data extraction with optional chaining
        const difficulty = data?.proofofwork?.difficulty;
        const userType = data?.persona || data?.user_type || data?.account_type;

        console.debug("Extracted values:", {
          difficulty: difficulty || "undefined",
          userType: userType || "undefined",
          proofofwork: data?.proofofwork || "undefined",
          hasProofOfWork: !!data?.proofofwork,
          responseKeys: Object.keys(data || {}),
        });

        // Update UI only if elements exist
        const difficultyElement = document.getElementById("difficulty");
        if (difficultyElement) {
          if (difficulty) {
            difficultyElement.innerText = difficulty;
            difficultyElement.title = `Raw value: ${difficulty}`;
          } else {
            difficultyElement.innerText = "N/A";
            difficultyElement.title = "No difficulty value found in response";
          }
        }

        updateUserType(userType || "free");
        updateProgressBars(difficulty || "N/A");
      } catch (error) {
        console.error("Error processing response:", error);
        const difficultyElement = document.getElementById("difficulty");
        if (difficultyElement) {
          difficultyElement.innerText = "N/A";
          difficultyElement.title = `Error: ${error.message}`;
        }
        updateUserType("free");
        updateProgressBars("N/A");
      }
    }
    return response;
  };

  // Initialize UI only after DOM is ready
  function initUI() {
    // Create display box
    displayBox = document.createElement("div");
    displayBox.style.position = "fixed";
    displayBox.style.bottom = "10px";
    displayBox.style.right = "80px";
    displayBox.style.transform = "none";
    displayBox.style.width = "320px";
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

    displayBox.innerHTML = `
          <div id="content">
              <div class="monitor-item">
                  <div class="monitor-row">
                      <span class="label" title="ChatGPT Account Type">ChatGPT</span>
                      <span id="user-type" class="value"></span>
                  </div>
              </div>
              <div class="monitor-item">
                  <div class="monitor-row">
                      <span class="label" title="Your IP Address">IP</span>
                      <div class="ip-container">
                          <span id="ip-address" class="value monospace" title="Click to copy"></span>
                          <span id="warp-badge" class="warp-badge" title=""></span>
                          <span id="ip-quality" class="value-tag"></span>
                      </div>
                  </div>
                  <div class="progress-wrapper" data-tooltip="Risk Level: Indicates the risk associated with your connection. Lower is better, higher may indicate VPN/proxy detection.">
                      <div class="progress-container">
                          <div id="ip-quality-bar" class="progress-bar"></div>
                      </div>
                      <div class="progress-background"></div>
                  </div>
              </div>
              <div class="monitor-item">
                  <div class="monitor-row">
                      <span class="label" title="Proof of Work Difficulty">PoW</span>
                      <div class="pow-container">
                          <span id="difficulty" class="value monospace"></span>
                          <span id="pow-level" class="value-tag"></span>
                      </div>
                  </div>
                  <div class="progress-wrapper" data-tooltip="PoW Difficulty: Required computational work before sending messages. Lower (green) means faster responses.">
                      <div class="progress-container">
                          <div id="pow-bar" class="progress-bar"></div>
                      </div>
                      <div class="progress-background"></div>
                  </div>
              </div>
              <div class="monitor-item">
                  <div class="monitor-row">
                      <span class="label" title="OpenAI System Status">Status</span>
                      <a id="status-description" href="https://status.openai.com" target="_blank" class="value">
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
              .label {
                  font-size: 14px;
                  color: var(--text-secondary, #6B7280);
                  flex-shrink: 0;
                  min-width: 40px;
                  font-weight: 400;
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
              }
              .progress-wrapper {
                  position: relative;
                  margin-left: 40px;
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
              .ip-container, .pow-container {
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
          </style>`;
    document.body.appendChild(displayBox);

    // Create collapsed indicator
    collapsedIndicator = document.createElement("div");
    collapsedIndicator.style.position = "fixed";
    collapsedIndicator.style.bottom = "10px";
    collapsedIndicator.style.right = "40px";
    collapsedIndicator.style.transform = "none";
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
                  <stop offset="0%" style="stop-color:var(--token-text-secondary, #666);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:var(--token-text-secondary, #666);stop-opacity:0.8" />
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
      </svg>`;
    document.body.appendChild(collapsedIndicator);

    // Add event listeners
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

    // Initialize theme observer
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    document.querySelectorAll("[title]").forEach((element) => {
      element.addEventListener("mouseenter", () => {
        element.style.transitionDelay = "0s";
      });
    });

    // Start periodic status checks
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

  // Wait for DOM to be ready before initializing UI
  if (document.readyState !== "loading") {
    initUI();
  } else {
    document.addEventListener("DOMContentLoaded", initUI);
  }

  // Add IP masking function
  function maskIP(ip) {
    if (!ip || ip === "Unknown") return ip;

    // For IPv4: 192.168.1.1 -> 192.*.*.1
    if (ip.includes(".")) {
      const parts = ip.split(".");
      return `${parts[0]}.*.*.${parts[3]}`;
    }

    // For IPv6: 2a09:bac5:6248:183c::26a:1a -> 2a09:*:*:183c
    if (ip.includes(":")) {
      const parts = ip.split(":");
      return `${parts[0]}:*:*:${parts[3]}`;
    }

    return ip;
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
      if (!ipElement || !warpBadge) return;

      const maskedIP = maskIP(data.ip);
      const fullIP = data.ip || "Unknown";
      const warpStatus = data.warp || "off";

      ipElement.innerText = maskedIP;

      // Update WARP badge visibility and content
      if (warpStatus === "on" || warpStatus === "plus") {
        warpBadge.style.display = "inline-flex";
        warpBadge.innerText = warpStatus === "plus" ? "warp+" : "warp";
        warpBadge.title = `Protected by Cloudflare WARP${warpStatus === "plus" ? "+" : ""}`;
      } else {
        warpBadge.style.display = "none";
      }

      // Add click to copy functionality
      const copyHandler = async () => {
        try {
          await navigator.clipboard.writeText(fullIP);
          const originalText = ipElement.innerText;
          ipElement.innerText = "Copied!";
          setTimeout(() => {
            ipElement.innerText = originalText;
          }, 1000);
        } catch (err) {
          console.error("Failed to copy:", err);
          ipElement.innerText = "Copy failed";
          setTimeout(() => {
            ipElement.innerText = maskedIP;
          }, 1000);
        }
      };
      ipElement.removeEventListener("click", copyHandler);
      ipElement.addEventListener("click", copyHandler);
    } catch (error) {
      console.error("IP fetch error:", error);
      const ipElement = document.getElementById("ip-address");
      const warpBadge = document.getElementById("warp-badge");
      if (ipElement) ipElement.innerText = "Failed to fetch";
      if (warpBadge) warpBadge.style.display = "none";
    }
  }

  function getRiskColorAndLevel(difficulty) {
    if (!difficulty || difficulty === "N/A") {
      return {
        color: "#e63946",
        level: "Unknown",
        ipQuality: "Unknown",
        percentage: 0,
      };
    }

    // Clean the difficulty hex string and get its length
    const cleanDifficulty = difficulty.replace("0x", "").replace(/^0+/, "");
    const hexLength = cleanDifficulty.length;
    const numericDifficulty = parseInt(difficulty.replace("0x", ""), 16);

    // Define risk levels based on hex length
    // Shorter hex = higher numeric value = lower difficulty = higher risk
    if (hexLength <= 2) {
      // 0x00 to 0xFF
      return {
        color: "#e63946", // Red
        level: "Critical",
        ipQuality: "Very High Risk",
        percentage: 100,
      };
    } else if (hexLength <= 3) {
      // 0x100 to 0xFFF
      return {
        color: "#FAB12F", // Orange
        level: "Hard",
        ipQuality: "High Risk",
        percentage: 75,
      };
    } else if (hexLength <= 4) {
      // 0x1000 to 0xFFFF
      return {
        color: "#859F3D", // Light Green
        level: "Medium",
        ipQuality: "Medium Risk",
        percentage: 50,
      };
    } else if (hexLength <= 5) {
      // 0x10000 to 0xFFFFF
      return {
        color: "#2a9d8f", // Teal
        level: "Easy",
        ipQuality: "Low Risk",
        percentage: 25,
      };
    } else {
      // 0x100000 and above
      return {
        color: "#4CAF50", // Green
        level: "Very Easy",
        ipQuality: "Minimal Risk",
        percentage: 0,
      };
    }
  }

  function setProgressBar(bar, label, percentage, text, gradient, title) {
    bar.style.width = "100%";
    bar.style.background = gradient;
    bar.title = title; // Set title for explanation
    label.innerText = text;
    label.style.color = "var(--success-color, #10a37f)";
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
          ontimeout: function () {
            reject(new Error("Status check timed out"));
          },
          onload: function (response) {
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
                  const indicator = status.indicator?.toLowerCase() || "none";
                  const description =
                    status.description || "All Systems Operational";
                  const indicatorColors = {
                    none: "#4CAF50",
                    minor: "#FAB12F",
                    major: "#FFA500",
                    critical: "#e63946",
                  };
                  statusDescription.style.color =
                    indicatorColors[indicator] || "#aaa";
                  statusDescription.textContent = description;
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error(`HTTP error! status: ${response.status}`));
            }
          },
          onerror: function (error) {
            reject(error);
          },
        });
      });
    } catch (error) {
      // Handle errors gracefully - hide the status section
      const statusDescription = document.getElementById("status-description");
      const statusMonitorItem = statusDescription?.closest(".monitor-item");
      if (statusMonitorItem) statusMonitorItem.style.display = "none";

      // Log error without exposing it in the UI
      console.debug("ChatGPT status check disabled:", error.message);
    }
  }

  function updateTheme() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.dataset.theme === "dark";

    // Use CSS variables with fallbacks for better theme support
    displayBox.style.backgroundColor = isDark
      ? "var(--surface-primary, rgba(0, 0, 0, 0.8))"
      : "var(--surface-primary, rgba(255, 255, 255, 0.9))";
    displayBox.style.color = isDark
      ? "var(--text-primary, #fff)"
      : "var(--text-primary, #000)";

    const labels = displayBox.querySelectorAll(".label");
    labels.forEach((label) => {
      label.style.color = isDark
        ? "var(--text-secondary, #aaa)"
        : "var(--text-secondary, #666)";
    });
  }
})();

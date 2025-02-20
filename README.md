# ChatGPT Degraded

Monitor ChatGPT service quality, IP status, and PoW difficulty in real-time. Lightweight userscript that helps track performance, IP quality, and Proof of Work challenges.

<p align="center">
  <img src="https://raw.githubusercontent.com/lroolle/chatgpt-degraded/main/assets/screenshot.png" width="360" alt="Screenshot">
</p>

## ✨ Features

- 🔍 **Service**: OpenAI status, account type, degradation alerts;
- 🌐 **IP**: Risk assessment, VPN detection, history tracking(via [Scamalytics](https://scamalytics.com/));
- ⚡ **PoW**: Difficulty tracking, performance metrics, alerts;

## 📦 Quick Start

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or [Violentmonkey](https://violentmonkey.github.io/)/[Greasemonkey](https://www.greasespot.net/))
2. Install script: [Greasy Fork](https://greasyfork.org/en/scripts/522323-chatgpt-degraded) or [GitHub](https://github.com/lroolle/chatgpt-degraded/raw/main/src/index.js)
3. Visit [ChatGPT](https://chatgpt.com) - look for indicator dot in bottom-right

## 🔒 Privacy

- Local monitoring only;
- Masked IPs (e.g., 192.*.*.1);
- No external API calls;
- Open source code;

## 📋 Latest Changes

### [0.2.5, 0.2.6] - 2025-02-20
- ✨ IP history tracking (last 10)
- 🎨 Enhanced tooltips and risk display
- ✨ Dynamic icon animation based on PoW difficulty

[Full Changelog](CHANGELOG.md) | [License](LICENSE) | Based on [chatgpt-degrade-checker](https://github.com/KoriIku/chatgpt-degrade-checker)

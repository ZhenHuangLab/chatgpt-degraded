# ChatGPT Degraded

A non-intrusive userscript to monitor ChatGPT service quality, IP status, and PoW difficulty.

<p align="center">
  <img src="https://raw.githubusercontent.com/lroolle/chatgpt-degraded/main/assets/screenshot.png" width="360" alt="Screenshot">
</p>

## ✨ Features

- 🔍 **Service Quality Monitoring**
  - Real-time OpenAI system status
  - Account type detection (Free/Plus)
  - Service degradation alerts

- 🌐 **IP Status**
  - IP quality assessment
  - Cloudflare WARP detection
  - One-click masked IP copying
  - Risk level visualization

- ⚡ **PoW Analysis**
  - Real-time difficulty monitoring
  - Visual difficulty indicators
  - Performance impact assessment

## 📦 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Install the script:
   - [Install from Greasy Fork](https://greasyfork.org/scripts/xxx) (Recommended)
   - [Install from GitHub](https://github.com/lroolle/chatgpt-degraded/raw/main/src/index.js)

3. Visit [chat.openai.com](https://chat.openai.com)

## 🎯 Usage

1. Look for the indicator dot in the bottom-right corner
2. Hover over it to view detailed monitoring panel
3. Click IP address to copy (automatically masked)
4. Monitor color changes for service quality alerts

## 🔒 Privacy & Security

- **No Data Collection**: All monitoring is done locally
- **IP Protection**: IPs are automatically masked (e.g., 192.*.*.1)
- **No External Calls**: Only uses ChatGPT's own API endpoints
- **Open Source**: All code is transparent and auditable

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Based on [chatgpt-degrade-checker](https://github.com/KoriIku/chatgpt-degrade-checker) by KoriIku.

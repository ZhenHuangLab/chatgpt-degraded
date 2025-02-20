# ChatGPT Degraded

A non-intrusive userscript to monitor ChatGPT service quality, IP status, and PoW difficulty. It helps users understand their ChatGPT experience by tracking service performance, IP quality, and Proof of Work challenges in real-time.

<p align="center">
  <img src="https://raw.githubusercontent.com/lroolle/chatgpt-degraded/main/assets/screenshot.png" width="360" alt="Screenshot">
</p>

## 🔍 How It Works

The script monitors three key aspects of your ChatGPT experience:

1. **Service Status**: Checks OpenAI's system status and your account type (Free/Plus) to detect service degradation
2. **IP Quality**: Analyzes your IP using Scamalytics to assess risk level and detect VPN/proxy usage
3. **PoW Difficulty**: Monitors ChatGPT's Proof of Work challenges to gauge response times and performance

All monitoring is done locally with minimal overhead. The script appears as a small indicator dot that expands into a detailed panel on hover.

## ✨ Features

- 🔍 **Real-time Monitoring**
  - OpenAI system status tracking
  - Account type detection (Free/Plus)
  - Service degradation alerts
  - Visual status indicators
  - One-click status details

- 🌐 **IP Intelligence**
  - Risk level assessment (via Scamalytics)
  - VPN/Proxy detection
  - Cloudflare WARP status
  - IP history tracking (last 10)
  - One-click risk analysis

- ⚡ **Performance Metrics**
  - PoW difficulty tracking
  - Response time estimation
  - Visual performance indicators
  - Risk level assessment
  - Impact alerts

All features work seamlessly without affecting ChatGPT's performance or requiring any configuration.

## 📦 Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Install the script:
   - [Install from Greasy Fork](https://greasyfork.org/en/scripts/522323-chatgpt-degraded) (Recommended)
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

## 📋 Changelog

### [0.2.5] - 2025-02-20
- ✨ Added IP history tracking with last 10 IPs
- 🎨 Enhanced tooltips and risk level display
- 🔧 Improved IP deduplication logic

### [0.2.4] - 2025-02-13
- 🎨 Added tooltips and enhanced IP quality check
- 🔧 Improved monitoring UI and data fetching
- 🚀 Enhanced ChatGPT status monitoring

### [0.2.1] - 2025-02-10
- 🔧 Enhanced PoW difficulty assessment
- 🐛 Fixed risk level calculations
- 🔄 Improved version handling

### [0.2.0] - 2024-12-31
- 🚀 Initial release with basic monitoring
- 📸 Added screenshot and documentation
- ✨ Implemented status monitoring display

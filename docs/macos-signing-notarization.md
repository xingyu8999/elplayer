# macOS 签名与公证说明

> 本文件先写中文。英文摘要可在需要公开给海外用户时追加。

## 结论

macOS 公开分发建议完成两件事：

1. 使用 Developer ID 证书进行代码签名。
2. 将签名后的应用上传 Apple 公证，并把公证票据 stapler 到应用或 DMG 上。

Electron 官方文档说明，准备发布 macOS 应用通常需要先代码签名，再提交 Apple 公证。Apple 官方文档说明，`notarytool` 和 `stapler` 是上传软件到 Apple notary service 并附加公证票据的主要命令行工具。

## 需要准备

- Apple Developer Program 账号
- macOS 设备
- Xcode 或 Command Line Tools
- Developer ID Application 证书
- Apple ID
- App-specific password
- Team ID

## 环境变量

```bash
export APPLE_ID="你的 Apple ID"
export APPLE_APP_SPECIFIC_PASSWORD="你的 app-specific password"
export APPLE_TEAM_ID="你的 Team ID"
```

## 构建命令

```bash
npm install
npm run release:check
npm run dist:mac
```

## 当前仓库已准备的文件

```text
build/entitlements.mac.plist
scripts/notarize.cjs
package.json build.mac 配置
package.json build.afterSign 配置
```

## 注意事项

- 没有 Apple Developer 证书时，可以构建本地测试包，但不建议直接公开分发。
- 未签名/未公证的 macOS 应用可能被 Gatekeeper 拦截。
- 公证不是 App Store 审核，它只是 Apple 对分发软件的自动安全检查。

## English Summary

For public macOS distribution, sign the app with a Developer ID certificate, submit it for Apple notarization, and staple the notarization ticket before publishing.

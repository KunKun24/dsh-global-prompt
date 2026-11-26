# dsh-global-prompt · 全局提示词

[**简体中文**](README.md) · [English](README.en.md)

![version](https://img.shields.io/badge/version-1.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-2ea44f)
![dsh](https://img.shields.io/badge/DSH-%E2%89%A50.2.0--rc.2-6f42c1)

写一次全局要求，之后每段新对话都会自动带上 —— 不用反复复制粘贴。

![侧边栏打开全局提示词面板，切换开关](assets/demo.gif)

> DeepSeek Harness（DSH）插件，需要 DSH 0.2.0-rc.2 及以上（0.2.0-rc.2 → 0.2.3 全系列实测可用）。

## 它做什么

把「每次都想让模型知道的事」收进一个地方：语气偏好、输出格式、必须遵守的规则，或者一个固定人设。设置一次，所有新对话生效，且只注入首轮，不占后续 token。

## 功能

- **全局提示词**：一段附加要求，作为 system prompt 的独立段落注入
- **全局人设**：设定 AI 的身份与语气（可选，与提示词独立开关）
- **中文回答思考**：内置一键预设（「请用中文进行思考回答」），不必手打
- **最终生效内容**：面板底部实时预览真正会注入的文本，所见即所得
- 面板里可随时关闭任一开关，改完立即生效，不需要重启

## 安装

**方式一：插件市场（推荐）**

在 DSH 的「插件市场」里搜索 `dsh-global-prompt` 直接安装。

**方式二：Release 包**

```bash
dsh plugin --profile web add https://github.com/KunKun24/dsh-global-prompt/releases/download/v1.1.1/dsh-global-prompt-1.1.1.tgz
```

**方式三：本地源码**

```bash
dsh plugin --profile web add link:/path/to/dsh-global-prompt
```

装完刷新页面，侧边栏出现「全局提示词」入口。

## 使用

1. 侧边栏 →「全局提示词」
2. 打开对应开关，写入内容（或直接开「中文回答思考」）
3. 底部「最终生效内容」确认实际注入的文本
4. 新建对话即生效

## 配置

| 选项 | 说明 |
| --- | --- |
| 中文回答思考 | 内置预设，等价于“请用中文进行思考回答” |
| 全局人设 | 自定义 AI 的身份与语气 |
| 全局提示词 | 附加要求，例如输出格式、语言、禁忌 |

限制：整体 4000 字、单段 2000 字，避免把上下文挤爆。

## 兼容性与取舍

- 只在**首轮**注入，长对话不会每轮重复占 token
- 注入段落排在部署人设之后，不覆盖部署级配置
- 作用域处理避开 Cordis 守卫代理的 `JSON.stringify` 陷阱，不会导致消息发不出去

## 数据与隐私

内容保存在本机 profile 的数据目录（`global-prompt.json`），不上传任何地方，也不做统计。

## 版本与作者

- 当前版本 **1.1.1**（[更新日志](CHANGELOG.md)）
- 作者：困困 · GitHub [@KunKun24](https://github.com/KunKun24) · Telegram [@sad1881](https://t.me/sad1881)
- 许可证：[MIT](LICENSE)

包含 AIGC 辅助编写的内容，已逐行人工审阅并在真机验证。

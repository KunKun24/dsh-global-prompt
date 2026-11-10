# dsh-global-prompt

[English](README.en.md) · DeepSeek Harness 插件 · MIT

给 DeepSeek Harness 加一段**全局提示词**：写一次，之后每段对话都会带上。

## 用法

侧边栏「全局提示词」→ 写内容 → 保存。

内容会作为 system prompt 的一个独立段落注入，优先级排在部署人设之后。

## 设计取舍

- 长度上限：整体 4000 字，单段 2000 字（防止把上下文挤爆）
- 只在**首轮**注入，避免每轮重复占 token
- 作用域用一个 `WeakMap` 计数，绝不对作用域对象做 `JSON.stringify`
  —— Cordis 的守卫代理会在 `JSON.stringify` 时读 `toJSON` 并抛错，
  那个错误会让**每条消息都发不出去**

## 存储

内容存在 profile 的数据目录里，不上传任何地方。

## 安装

### 方式一：插件市场（推荐）

在 dsh 的「插件市场」里搜索包名直接安装。

### 方式二：Release 压缩包

```bash
dsh plugin --profile web add ./dsh-global-prompt-1.0.0.tgz
```

### 方式三：手动装到 profile

```bash
# 1. 复制到 profile 的 vendor 目录
cp -r dsh-global-prompt ~/.dsh/profiles/web/vendor/dsh-global-prompt

# 2. 在 profile 的 package.json 里加一条依赖（file: 指向 vendor）
#    "dependencies": { "dsh-global-prompt": "file:./vendor/dsh-global-prompt" }

# 3. 装依赖并重启
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

## 卸载

从 `package.json` 的 `dependencies` 和 `dsh.profile.bundles` 里删掉 `dsh-global-prompt`，
再 `pnpm install` 重启即可；插件本身不写任何业务数据。

## 许可证

MIT

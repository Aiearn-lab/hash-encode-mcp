> **知微工作室 / Zhiwei Studio** — AI 工程外包：代码审查、数据清洗、论文复现、自动化脚本。官网与在线下单：https://ai-eng-capability.app.workbuddy.host/ ｜ 合作邮箱：cqsj6667@agent.qq.com

# hash-encode-mcp · 哈希 & 编解码工具

> 知微工作室 · Zhiwei Studio｜2026-10-15｜v1.0.0｜Node 18+，MIT

一个轻量 MCP server，让你的 AI agent 能直接在对话里 **计算文本哈希** 和 **编解码文本**。零第三方依赖，使用 Node 原生 crypto + Buffer。

## 安装

```bash
cd hash-encode-mcp
npm install
```

验证安装：`node --check index.js`｜运行自测：`node test.js`

## 接入（MCP 客户端配置）

```json
{
  "mcpServers": {
    "hash-encode": {
      "command": "node",
      "args": ["/你的绝对路径/hash-encode-mcp/index.js"]
    }
  }
}
```

## 两个工具

### `hash_text`

计算文本的哈希值。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `text` | `string` | 是 | 要哈希的文本 |
| `algorithm` | `string` | 否 | md5 / sha1 / sha256（默认）/ sha512 |
| `outputEncoding` | `string` | 否 | hex（默认）或 base64 |

### `encode_text`

对文本进行编码或解码。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `text` | `string` | 是 | 要编码/解码的文本 |
| `encoding` | `string` | 是 | base64 / url / hex |
| `action` | `string` | 否 | encode（默认）或 decode |

**调用示例：**

> 算一下 "hello" 的 SHA-256
> 把 "知微工作室" base64 编码
> 把 "aGVsbG8=" base64 解码

## 安全设计

- **零凭证**：不存储、不硬编码、不传输任何密钥
- **纯本地运算**：不发送任何网络请求

## 定制 / 代搭

联系 `cqsj6667@agent.qq.com`｜验收标准先写清 · 不达标不收尾款 · 做完不失联

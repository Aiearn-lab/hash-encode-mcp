#!/usr/bin/env node
/**
 * hash-encode-mcp — 哈希 & 编解码工具
 * 知微工作室 · Zhiwei Studio · 2026-10-15 · v1.0.0
 *
 * 提供 2 个工具：
 *   hash_text    文本 + 算法（md5/sha1/sha256/sha512）→ 哈希值（Node 原生 crypto）
 *   encode_text  base64 编解码 / URL 编解码 / hex，往返无损
 *
 * 设计原则：
 *   - 零第三方依赖（crypto + Buffer 全部 Node 原生模块）
 *   - 编解码往返无损
 *   - 不存储、不硬编码任何凭证
 */
import { createHash } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/* ===== 哈希工具 ===== */

/** 支持的哈希算法 */
const SUPPORTED_ALGORITHMS = ["md5", "sha1", "sha256", "sha512"];

/**
 * 计算文本的哈希值
 * @param {string} text      输入文本
 * @param {string} algorithm 哈希算法
 * @param {string} encoding  输出编码（hex/base64），默认 hex
 * @returns {string} 哈希值
 */
function hashText(text, algorithm, encoding = "hex") {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    throw new Error(`不支持的算法: ${algorithm}。支持: ${SUPPORTED_ALGORITHMS.join(", ")}`);
  }
  return createHash(algorithm).update(text, "utf-8").digest(encoding);
}

/* ===== 编解码工具 ===== */

/** 支持的编码格式 */
const SUPPORTED_ENCODINGS = ["base64", "url", "hex"];

/**
 * 编码文本
 */
function encodeText(text, encoding) {
  switch (encoding) {
    case "base64":
      return Buffer.from(text, "utf-8").toString("base64");
    case "url":
      return encodeURIComponent(text);
    case "hex":
      return Buffer.from(text, "utf-8").toString("hex");
    default:
      throw new Error(`不支持的编码: ${encoding}。支持: ${SUPPORTED_ENCODINGS.join(", ")}`);
  }
}

/**
 * 解码文本
 */
function decodeText(text, encoding) {
  switch (encoding) {
    case "base64":
      return Buffer.from(text, "base64").toString("utf-8");
    case "url":
      return decodeURIComponent(text);
    case "hex":
      return Buffer.from(text, "hex").toString("utf-8");
    default:
      throw new Error(`不支持的编码: ${encoding}。支持: ${SUPPORTED_ENCODINGS.join(", ")}`);
  }
}

/* ===== MCP Server ===== */

const server = new Server(
  { name: "hash-encode-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "hash_text",
      description: "计算文本的哈希值。支持 md5 / sha1 / sha256 / sha512 算法，输出 hex（默认）或 base64 编码。",
      inputSchema: {
        type: "object",
        properties: {
          text:      { type: "string", description: "要哈希的文本" },
          algorithm: { type: "string", description: "哈希算法：md5 / sha1 / sha256（默认）/ sha512", enum: SUPPORTED_ALGORITHMS },
          outputEncoding: { type: "string", description: "输出编码：hex（默认）或 base64", enum: ["hex", "base64"] },
        },
        required: ["text"],
      },
    },
    {
      name: "encode_text",
      description: "对文本进行编码或解码。支持 base64 / url / hex 三种格式，往返无损。",
      inputSchema: {
        type: "object",
        properties: {
          text:     { type: "string", description: "要编码/解码的文本" },
          encoding: { type: "string", description: "编码格式：base64 / url / hex", enum: SUPPORTED_ENCODINGS },
          action:   { type: "string", description: "操作：encode（编码，默认）或 decode（解码）", enum: ["encode", "decode"] },
        },
        required: ["text", "encoding"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: a } = req.params;
  try {
    if (name === "hash_text") {
      const algo = a.algorithm || "sha256";
      const enc = a.outputEncoding || "hex";
      const hash = hashText(a.text, algo, enc);
      const result = {
        algorithm: algo,
        encoding: enc,
        inputLength: a.text.length,
        hash,
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "encode_text") {
      const action = a.action || "encode";
      const output = action === "decode"
        ? decodeText(a.text, a.encoding)
        : encodeText(a.text, a.encoding);
      const result = {
        encoding: a.encoding,
        action,
        input: a.text,
        output,
      };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    return { content: [{ type: "text", text: "未知工具: " + name }], isError: true };
  } catch (e) {
    return {
      content: [{ type: "text", text: "错误: " + (e && e.message ? e.message : String(e)) }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

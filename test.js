/**
 * hash-encode-mcp 自测脚本
 * 知微工作室 · Zhiwei Studio · 2026-10-15
 * 运行：node test.js
 */
import { createHash } from "node:crypto";

/* ===== 复制核心函数 ===== */

const SUPPORTED_ALGORITHMS = ["md5", "sha1", "sha256", "sha512"];
const SUPPORTED_ENCODINGS = ["base64", "url", "hex"];

function hashText(text, algorithm, encoding = "hex") {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) throw new Error(`不支持的算法: ${algorithm}`);
  return createHash(algorithm).update(text, "utf-8").digest(encoding);
}

function encodeText(text, encoding) {
  switch (encoding) {
    case "base64": return Buffer.from(text, "utf-8").toString("base64");
    case "url": return encodeURIComponent(text);
    case "hex": return Buffer.from(text, "utf-8").toString("hex");
    default: throw new Error(`不支持的编码: ${encoding}`);
  }
}

function decodeText(text, encoding) {
  switch (encoding) {
    case "base64": return Buffer.from(text, "base64").toString("utf-8");
    case "url": return decodeURIComponent(text);
    case "hex": return Buffer.from(text, "hex").toString("utf-8");
    default: throw new Error(`不支持的编码: ${encoding}`);
  }
}

/* ===== 测试框架 ===== */

let passed = 0, failed = 0;
function assert(cond, msg) { if (cond) { console.log(`  ✓ ${msg}`); passed++; } else { console.error(`  ✗ ${msg}`); failed++; } }

/* ===== 测试用例 ===== */

// [1] SHA-256 已知向量
console.log("\n[1] SHA-256 已知向量");
{
  // "hello" 的 SHA-256 是标准测试向量
  const expected = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";
  assert(hashText("hello", "sha256") === expected, "SHA-256('hello') 匹配已知向量");
}

// [2] MD5 已知向量
console.log("\n[2] MD5 已知向量");
{
  // "hello" 的 MD5
  const expected = "5d41402abc4b2a76b9719d911017c592";
  assert(hashText("hello", "md5") === expected, "MD5('hello') 匹配已知向量");
}

// [3] SHA-1 已知向量
console.log("\n[3] SHA-1 已知向量");
{
  const expected = "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d";
  assert(hashText("hello", "sha1") === expected, "SHA-1('hello') 匹配已知向量");
}

// [4] SHA-512
console.log("\n[4] SHA-512");
{
  const hash = hashText("hello", "sha512");
  assert(hash.length === 128, `SHA-512 输出 128 个 hex 字符（实际 ${hash.length}）`);
  assert(/^[a-f0-9]+$/.test(hash), "SHA-512 输出为合法 hex");
}

// [5] base64 编码
console.log("\n[5] base64 编码");
{
  assert(encodeText("hello", "base64") === "aGVsbG8=", "base64('hello') = aGVsbG8=");
  assert(encodeText("", "base64") === "", "空字符串 base64 为空");
}

// [6] base64 往返
console.log("\n[6] base64 往返");
{
  const original = "Hello, 世界! 🌍";
  const encoded = encodeText(original, "base64");
  const decoded = decodeText(encoded, "base64");
  assert(decoded === original, "base64 往返无损（含中文 + emoji）");
}

// [7] URL 编码
console.log("\n[7] URL 编码");
{
  assert(encodeText("hello world", "url") === "hello%20world", "空格 → %20");
  assert(encodeText("a=b&c=d", "url") === "a%3Db%26c%3Dd", "特殊字符编码");
}

// [8] URL 往返
console.log("\n[8] URL 往返");
{
  const original = "搜索关键词: AI 工具&价格=100";
  const encoded = encodeText(original, "url");
  const decoded = decodeText(encoded, "url");
  assert(decoded === original, "URL 编码往返无损（含中文 + 特殊字符）");
}

// [9] hex 编码
console.log("\n[9] hex 编码");
{
  assert(encodeText("AB", "hex") === "4142", "hex('AB') = 4142");
  assert(decodeText("4142", "hex") === "AB", "hex 解码 '4142' = 'AB'");
}

// [10] hex 往返
console.log("\n[10] hex 往返");
{
  const original = "测试数据123";
  const encoded = encodeText(original, "hex");
  const decoded = decodeText(encoded, "hex");
  assert(decoded === original, "hex 往返无损");
  assert(/^[a-f0-9]+$/.test(encoded), "hex 输出为合法 hex");
}

// [11] 中文哈希
console.log("\n[11] 中文哈希");
{
  const hash1 = hashText("你好", "sha256");
  const hash2 = hashText("你好", "sha256");
  assert(hash1 === hash2, "相同中文输入哈希一致");
  const hash3 = hashText("世界", "sha256");
  assert(hash1 !== hash3, "不同中文输入哈希不同");
}

// [12] base64 中文往返
console.log("\n[12] base64 中文往返");
{
  const original = "知微工作室";
  const encoded = encodeText(original, "base64");
  const decoded = decodeText(encoded, "base64");
  assert(decoded === original, "base64 中文往返无损");
}

// [13] 不支持的算法报错
console.log("\n[13] 不支持的算法");
{
  let threw = false;
  try { hashText("test", "md4"); } catch { threw = true; }
  assert(threw, "不支持的算法抛出异常");
}

// [14] 不支持的编码报错
console.log("\n[14] 不支持的编码");
{
  let threw = false;
  try { encodeText("test", "rot13"); } catch { threw = true; }
  assert(threw, "不支持的编码抛出异常");
}

// [15] 空字符串哈希
console.log("\n[15] 空字符串哈希");
{
  // SHA-256("") 的标准值
  const expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  assert(hashText("", "sha256") === expected, "SHA-256('') 匹配已知向量");
}

// 汇总
console.log(`\n========== 结果 ==========`);
console.log(`通过: ${passed}  失败: ${failed}`);
if (failed > 0) { console.error("有测试失败！"); process.exit(1); }
else { console.log("全部通过 ✓"); }

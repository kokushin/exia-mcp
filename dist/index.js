#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
/**
 * メイン関数
 */
async function main() {
    try {
        // MCPサーバの作成
        const server = await createServer();
        // 標準入出力を使用したトランスポートの作成
        const transport = new StdioServerTransport();
        // サーバとトランスポートの接続
        await server.connect(transport);
        console.error("exia-scenario-generator MCP server is running...");
    }
    catch (error) {
        console.error("Error starting MCP server:", error);
        process.exit(1);
    }
}
// メイン関数の実行
main();

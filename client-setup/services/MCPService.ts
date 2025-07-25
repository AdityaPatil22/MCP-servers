/**
 * MCPService class for managing Model Context Protocol (MCP) clients and tools.
 * This service allows connecting to MCP servers, retrieving tools, and calling those tools.
 * It handles multiple clients and ensures tools from different servers are not overwritten.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool, ToolResult } from "../types/interfaces.js";
import { config } from "../config/config.js";

interface ToolWithClient extends Tool {
  client: Client;
}

export class MCPService {
  private clients: Client[] = [];
  private transports: StdioClientTransport[] = [];
  private _tools: ToolWithClient[] = [];

  get tools(): Tool[] {
    return this._tools;
  }

  /**
   * Connects to a MCP server using the provided script path.
   * The script can be a JavaScript or Python file.
   * It initializes the client and retrieves the tools available on the server.
   */
  async connectToServer(serverScriptPath: string): Promise<void> {
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");

    if (!isJs && !isPy) {
      throw new Error("Server script must be a .js or .py file");
    }

    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;

    const transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
    });

    const client = new Client({
      name: config.mcp.clientName,
      version: config.mcp.version,
    });

    await client.connect(transport);

    const toolsResult = await client.listTools();
    const serverTools: ToolWithClient[] = toolsResult.tools.map(
      (tool: any) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        input_schema: tool.inputSchema,
        client,
      })
    );

    this.clients.push(client);
    this.transports.push(transport);

    // Ensure tools from different servers are not overwritten
    this._tools = [...this._tools, ...serverTools];
  }

  /**
   * Calls a tool by its name with the provided arguments.
   * It finds the tool in the list of tools and invokes it using the associated client.
   * Returns the result of the tool call or an error message if the tool is not found.
   */
  async callTool(name: string, args: Record<string, any>): Promise<ToolResult> {
    const tool = this._tools.find((t) => t.name === name);
    if (!tool) {
      return {
        content: `Tool '${name}' not found.`,
        isError: true,
      };
    }

    try {
      const result = await tool.client.callTool({
        name,
        arguments: args,
      });

      return {
        content: result,
        isError: false,
      };
    } catch (error: any) {
      return {
        content: error.message || "Error calling tool",
        isError: true,
      };
    }
  }

  async cleanup(): Promise<void> {
    for (const client of this.clients) {
      await client.close();
    }
  }
}

import readline from "readline/promises";
import { MCPService } from "./services/MCPService.js";
import { LLMService } from "./services/LLMService.js";
import { ToolService } from "./services/ToolService.js";
import { ToolSelectorService } from "./services/ToolSelectorService.js";
import { formatToolResult } from "./utils/formatters.js";
import { config } from "./config/config.js";
import { ToolCall } from "./types/interfaces.js";
import { manifest } from "./start-all.js";

class MCPClient {
  private mcpService: MCPService;
  private llmService: LLMService;
  private toolService: ToolService;
  private toolSelector: ToolSelectorService;

  constructor() {
    this.mcpService = new MCPService();
    this.llmService = new LLMService(() => this.mcpService.tools);
    this.toolService = new ToolService();
    this.toolSelector = new ToolSelectorService();
  }

  /**
   * Initializes the MCP client by connecting to the server and loading tools.
   * @param serverScriptPath - The path to the server script to connect to.
   */
  async initialize(serverScriptPath: string): Promise<void> {
    await this.mcpService.connectToServer(serverScriptPath);
    console.log("Connected to server with tools:", this.mcpService.tools.map(({ name }) => name));
  }

  /**
   * Selects tools based on the user's query.
   * @param query - The user's query to determine which tools to suggest.
   * @returns A list of tool names that are suggested for the query.
   */
  private async selectTools(query: string): Promise<string[]> {
    const availableToolNames = this.mcpService.tools.map(t => t.name);
    return (await this.toolSelector.selectTool(query, availableToolNames)) || [];
  }

  /**
   * Calls a tool and analyzes its result.
   * @param toolCall - The tool call object containing the tool name and arguments.
   * @returns A formatted string with the analysis of the tool's result.
   */
  private async callAndAnalyzeTool(toolCall: ToolCall): Promise<string> {
    const toolName = toolCall.name;
    const toolArgs = this.toolService.normalizeToolArguments(toolCall.arguments);

    try {
      const result = await this.mcpService.callTool(toolName, toolArgs);
      const formattedResult = formatToolResult(result);

      const analysisPrompt = `Analyze the following data and provide insights:\n${formattedResult}`;
      const analysisResponse = await this.llmService.callModelAPI(analysisPrompt);
      const analysisContent = analysisResponse.message?.content || "No analysis provided.";

      return `[Analysis:\n${analysisContent}`;
    } catch (err) {
      return `\n\n[${toolName} Error]\n${err instanceof Error ? err.message : String(err)}`;
    }
  }

  /**
   * Handles multiple tool calls by calling each tool and analyzing the results.
   * @param toolCalls - An array of ToolCall objects to be processed.
   * @returns A concatenated string of all tool analysis results.
   */
  private async handleToolCalls(toolCalls: ToolCall[]): Promise<string> {
    const results = await Promise.all(toolCalls.map(tc => this.callAndAnalyzeTool(tc)));
    return results.join("");
  }

  /**
   * Processes a user's query by selecting tools, calling the LLM, and handling tool calls.
   * @param query - The user's query to process.
   * @returns A string response containing the LLM's response and any tool results.
   */
  async processQuery(query: string): Promise<string> {
    try {
      const selectedToolNames = await this.selectTools(query);
      console.log("Tools suggested for this query:", selectedToolNames);

      this.llmService.setSelectedTools(selectedToolNames || []);
      const ollamaResponse = await this.llmService.callModelAPI(query);
      const responseContent = ollamaResponse.message?.content || "No response";

      const toolCalls = this.toolService.parseToolCalls(ollamaResponse);

      if (!toolCalls || toolCalls.length === 0) {
        return responseContent;
      }

      const toolResults = await this.handleToolCalls(toolCalls);
      return toolResults;
    } catch (error) {
      return `An error occurred while processing your query: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Starts the chat loop, allowing users to input queries and receive responses.
   * It handles user input, processes queries, and displays results.
   */
  async chatLoop(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Client with Ollama Started!");
      console.log(`Using Ollama model: ${config.ollama.model}`);
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") break;

        const response = await this.processQuery(message);
        console.log("\n" + response);
      }

      console.log("\nAvailable tools:");
      this.mcpService.tools.forEach(tool => {
        console.log(`- ${tool.name}`);
      });

    } finally {
      rl.close();
    }
  }
}


async function main(): Promise<void> {
  const buildPaths = Object.values(manifest) as string[];
  const mcpClient = new MCPClient();

  try {
    for (const path of buildPaths) {
      await mcpClient.initialize(path);
    }

    await mcpClient.chatLoop();
  } finally {
    process.exit(0);
  }
}

main();

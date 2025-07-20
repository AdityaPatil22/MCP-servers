/**
 * Configuration for the MCP client.
 * This file loads environment variables and sets default values for the Ollama API and model.
 * It is used to configure the client for connecting to the Ollama API.
 */
import dotenv from "dotenv";
dotenv.config();

export const config = {
  ollama: {
    apiUrl: process.env.OLLAMA_API_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3.2:3b",
  },
  mcp: {
    clientName: "mcp-client-cli",
    version: "1.0.0",
  },
};

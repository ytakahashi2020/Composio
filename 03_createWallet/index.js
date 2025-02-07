import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";
dotenv.config();

const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const composio_toolset = new OpenAIToolSet({
  apiKey: process.env.COMPOSIO_API_KEY,
});

const tools = await composio_toolset.getTools({
  actions: ["COINBASE_CREATE_WALLET"],
});

const instruction = "I want to create base-sepolia wallet";

// Creating a chat completion request to the OpenAI model
const response = await openai_client.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});

const tool_response = await composio_toolset.handleToolCall(response);

console.log(tool_response);

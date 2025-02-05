import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";
dotenv.config();

const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialise the Composio Tool Set
const composio_toolset = new OpenAIToolSet({
  apiKey: process.env.COMPOSIO_API_KEY,
});
const tools = await composio_toolset.getTools({
  actions: ["github_star_a_repository_for_the_authenticated_user"],
});

const instruction = "Star the repo ytakahashi2020/test0205 on GitHub";

const response = await openai_client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});

const result = await composio_toolset.handleToolCall(response);
console.log(result);

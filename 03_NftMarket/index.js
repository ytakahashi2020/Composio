// index.js
import { ChatOpenAI } from "@langchain/openai";
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import { LangchainToolSet } from "composio-core";
import { pull } from "langchain/hub";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  // 1. OpenAI の LLM を初期化
  const llm = new ChatOpenAI({
    model: "gpt-4-turbo",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // 2. エージェント用のプロンプトを取得（Langchain Hub から）
  const prompt = await pull("hwchase17/openai-functions-agent");

  // 3. Composio のツールセットを初期化し、CHAINLINK のツールを取得
  const toolset = new LangchainToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
  const tools = await toolset.getTools({ apps: ["CHAINLINK"] });
  console.log("Retrieved Chainlink Tools:", tools);

  // 4. OpenAI Functions Agent を作成
  const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });

  // 5. AgentExecutor を生成（verbose: true で詳細ログ出力）
  const agentExecutor = new AgentExecutor({ agent, tools, verbose: true });

  // 6. タスクの実行例: Chainlink を利用して ETH/USD の最新価格を取得する
  const response = await agentExecutor.invoke({
    input: "Chainlinkを使って、ETHとUSDの最新の価格を教えてください。",
  });

  console.log("Response:", response);
})();

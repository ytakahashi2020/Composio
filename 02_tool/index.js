// index.js
import { OpenAIToolSet } from "composio-core";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  // 1. Composio ToolSet と OpenAI クライアントの初期化
  const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY, // .env に設定した COMPOSIO_API_KEY を利用
  });
  const openai_client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // .env に設定した OPENAI_API_KEY を利用
  });

  // 2. Gmail アカウントとの接続を開始
  // この接続リクエストで返される URL にアクセスして OAuth 認証を完了させてください。
  const connectionRequest = await toolset.client.connectedAccounts.initiate({
    appName: "gmail",
    entityId: "default", // エンティティIDは "default" として利用
    authMode: "OAUTH2",
    authConfig: {},
  });
  console.log(
    "Gmail アカウントを接続するため、以下の URL にアクセスしてください:"
  );
  console.log(connectionRequest.redirectUrl);

  // 3. Gmail の新着メールを監視するトリガーを設定
  const entity = toolset.client.getEntity("default");
  const triggerResponse = await entity.setupTrigger({
    appName: "gmail",
    triggerName: "gmail_new_gmail_message",
    config: {
      userId: "me",
      interval: 1,
      labelIds: "INBOX",
    },
  });
  console.log("トリガー設定完了:", triggerResponse);

  // 4. 新着メールイベントを処理するエージェント関数を定義
  const agentFunction = async (threadId, subject, senderMail) => {
    try {
      // Gmail 用のツールを取得（例：メールにラベルを追加するアクション等）
      const tools = await toolset.getTools({ apps: ["gmail"] });

      // OpenAI のチャット補完リクエストを作成
      const response = await openai_client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that can parse the email content, identify bank transactions and add the 'important' label to the email. Otherwise, don't do anything.",
          },
          {
            role: "user",
            content: `Thread ID: ${threadId}, Subject: ${subject}, Sender: ${senderMail}`,
          },
        ],
        tools: tools,
        tool_choice: "auto", // ツール選択は自動に任せる
      });

      // GPT-4 の応答に基づいて必要なツールコール（例えば、Gmail にラベルを追加する処理）を実行
      const result = await toolset.handleToolCall(response);
      console.log("エージェント関数実行結果:", result);
    } catch (error) {
      console.error("エージェント関数内でエラーが発生:", error);
    }
  };

  // 5. Gmail の新着メールトリガーのリスナーを作成
  toolset.triggers.subscribe(
    (data) => {
      console.log("受信したトリガーデータ:", data);
      // トリガーから必要な情報（スレッドID、件名、送信者）を抽出
      const {
        payload: { threadId, subject, sender },
      } = data;
      // エージェント関数を呼び出して処理を実行
      agentFunction(threadId, subject, sender);
    },
    {
      triggerName: "gmail_new_gmail_message",
    }
  );

  console.log("新着 Gmail メッセージのトリガーを監視中...");
})();

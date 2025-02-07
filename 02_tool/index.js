// index.js
import { OpenAIToolSet } from "composio-core";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
  const openai_client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 2. Initiate connection with your Gmail account using OAuth2.
  // Please visit the URL returned by this connection request to complete the OAuth authentication.
  const connectionRequest = await toolset.client.connectedAccounts.initiate({
    appName: "gmail",
    entityId: "default",
    authMode: "OAUTH2",
    authConfig: {},
  });
  console.log("Please visit the following URL to connect your Gmail account:");
  console.log(connectionRequest.redirectUrl);

  // 3. Set up a trigger to monitor new Gmail messages.
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
  console.log("Trigger setup completed:", triggerResponse);

  // 4. Define the agent function to process new email events.
  const agentFunction = async (threadId, subject, senderMail) => {
    try {
      // Get the tools for Gmail (e.g., actions such as adding labels to emails).
      const tools = await toolset.getTools({ apps: ["gmail"] });

      // Create an OpenAI chat completion request.
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
        tool_choice: "auto", // Automatically select tools.
      });

      // Execute the necessary tool calls based on GPT-4's response (for example, adding a label to the Gmail email).
      const result = await toolset.handleToolCall(response);
      console.log("Agent function execution result:", result);
    } catch (error) {
      console.error("An error occurred in the agent function:", error);
    }
  };

  // 5. Create a listener for the new Gmail message trigger.
  toolset.triggers.subscribe(
    (data) => {
      console.log("Received trigger data:", data);
      // Extract necessary information from the trigger (thread ID, subject, sender).
      const {
        payload: { threadId, subject, sender },
      } = data;
      // Call the agent function to process the event.
      agentFunction(threadId, subject, sender);
    },
    {
      triggerName: "gmail_new_gmail_message",
    }
  );

  console.log("Monitoring trigger for new Gmail messages...");
}

main();

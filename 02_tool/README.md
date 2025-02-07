# 0 preparation

- OPENAI API key
- composio API key
- integrate your github with Gmail
- set dotenv file
  OPENAI_API_KEY
  COMPOSIO_API_KEY

# 1 import

```
import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";
```

# 2 create an outline

`async function main() {}`
`main()`

# 3 create an instance

### 1 openai

```
const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### 2 toolset

```
const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
```

# 4 Connect with gmail

### 1 request

```
const connectionRequest = await toolset.client.connectedAccounts.initiate({
    appName: "gmail",
    entityId: "default",
    authMode: "OAUTH2",
    authConfig: {},
  });
```

### 2 　 show the message

```
console.log("Please visit the following URL to connect your Gmail account:");
console.log(connectionRequest.redirectUrl);
```

# 5 Set the trigger

### 1 get the entity

```
const entity = toolset.client.getEntity("default");
```

### 2 set up trigger

```
const triggerResponse = await entity.setupTrigger({
  appName: "gmail",
  triggerName: "gmail_new_gmail_message",
  config: {
    userId: "me",
    interval: 1,
    labelIds: "INBOX",
  },
});
```

# 6 create an agent function

### 1 create an outline

```
const agentFunction = async (threadId, subject, senderMail) => {
  try {} catch (error) {}
}
```

### 2 get the tool

`const tools = await toolset.getTools({ apps: ["gmail"] });`

### 3 create a response

```
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
  tool_choice: "auto",
});
```

### 4 handle the response

`const result = await toolset.handleToolCall(response);`

# 7 create a listener

### 1 create an outline

`toolset.triggers.subscribe((data) => {}, {})`

### 2 set trigger name

```
{
  triggerName: "gmail_new_gmail_message",
}
```

### 3 extract data

```
const {
  payload: { threadId, subject, sender },
} = data;
```

### 4 execute the function

`agentFunction(threadId, subject, sender);`

# 8 sample mail

```
title : [Important] [Bank Notice] February 5, 2025 Transaction Information

content:
Dear Customer, We would like to inform you that the following transaction has taken place.

Transaction Date: February 5, 2025
Price: $10
Contents: Withdrawing cash from an ATM If you have any questions, please contact our bank support center.

-- Bank Support Team
```

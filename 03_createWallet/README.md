# 0 preparation

- OPENAI API key
- composio API key
- integrate your coinbase API with composio
  -> Coinbase developer platform
- set dotenv file
  OPENAI_API_KEY
  COMPOSIO_API_KEY

# 1 import

```
import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import dotenv from "dotenv";
```

# 1 create an openai client

`const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`

# 2 create a composio toolset

```
const composio_toolset = new OpenAIToolSet({
  apiKey: process.env.COMPOSIO_API_KEY,
});
```

# 3 set the tool from toolset

```
const tools = await composio_toolset.getTools({
  actions: ["COINBASE_CREATE_WALLET"],
});
```

# 4 set the instruction

`const instruction = ""I want to create base-sepolia wallet";`

# 5 create the chat

```
const response = await openai_client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});
```

# 6 execute the action

`const result = await composio_toolset.handleToolCall(response);`

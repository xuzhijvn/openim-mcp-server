#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

interface GetGroupsArgs {
  groupID?: string;
  groupName?: string;
  pagination: {
    pageNumber: number;
    showNumber: number;
  };
}

interface GetGroupMemberListArgs {
  groupID: string;
  keyword?: string;
  pagination: {
    pageNumber: number;
    showNumber: number;
  };
}

interface GetFriendListArgs {
  userID: string;
  pagination: {
    pageNumber: number;
    showNumber: number;
  };
}

interface SearchMessageArgs {
  sendID?: string;
  recvID?: string;
  contentType?: number;
  sendTime?: string;
  sessionType?: number;
  pagination: {
    pageNumber: number;
    showNumber: number;
  };
}

interface SendMessageArgs {
  sendID: string;
  recvID?: string;
  groupID?: string;
  senderNickname?: string;
  senderFaceURL?: string;
  content: {
    content: string;
  };
  contentType: number;
  sessionType: number;
  offlinePushInfo?: {
    title?: string;
    desc?: string;
    ex?: string;
    iOSPushSound?: string;
    iOSBadgeCount?: boolean;
  };
}

interface BatchSendMessageArgs {
  recvIDs: string[];
  sendID: string;
  senderNickname?: string;
  senderFaceURL?: string;
  senderPlatformID?: number;
  content: {
    content: string;
  };
  contentType: number;
  sessionType: number;
  isOnlineOnly?: boolean;
  notOfflinePush?: boolean;
  offlinePushInfo?: {
    title?: string;
    desc?: string;
    ex?: string;
    iOSPushSound?: string;
    iOSBadgeCount?: boolean;
  };
  ex?: string;
  isSendAll?: boolean;
}

interface SendBusinessNotificationArgs {
  sendUserID: string;
  recvUserID?: string;
  recvGroupID?: string;
  key: string;
  data: string;
  sendMsg?: boolean;
  reliabilityLevel?: number;
}

// OpenIM tool definitions
const getGroupsTool: Tool = {
  name: "openim_get_groups",
  description: "Get the list of groups with optional filters",
  inputSchema: {
    type: "object",
    properties: {
      groupID: {
        type: "string",
        description: "Optional group ID to filter",
      },
      groupName: {
        type: "string",
        description: "Optional group name to filter",
      },
      pagination: {
        type: "object",
        properties: {
          pageNumber: {
            type: "number",
            description: "Current page number, starts from 1",
          },
          showNumber: {
            type: "number",
            description: "Number of entries per page",
          },
        },
        required: ["pageNumber", "showNumber"],
      },
    },
    required: ["pagination"],
  },
};

const getGroupMemberListTool: Tool = {
  name: "openim_get_group_member_list",
  description: "Get the member list of a group",
  inputSchema: {
    type: "object",
    properties: {
      groupID: {
        type: "string",
        description: "Group ID"
      },
      keyword: {
        type: "string",
        description: "Search keyword"
      },
      pagination: {
        type: "object",
        properties: {
          pageNumber: {
            type: "number",
            description: "Current page number"
          },
          showNumber: {
            type: "number",
            description: "Number of items per page"
          }
        },
        required: ["pageNumber", "showNumber"]
      }
    },
    required: ["groupID", "pagination"]
  }
};


const getFriendListTool: Tool = {
  name: "openim_get_friend_list",
  description: "Get friend list of a user",
  inputSchema: {
    type: "object",
    properties: {
      userID: {
        type: "string",
        description: "User ID",
      },
      pagination: {
        type: "object",
        properties: {
          pageNumber: {
            type: "number",
            description: "Current page number, starts from 1",
          },
          showNumber: {
            type: "number",
            description: "Number of entries per page",
          },
        },
        required: ["pageNumber", "showNumber"],
      },
    },
    required: ["userID", "pagination"],
  },
};

const searchMessageTool: Tool = {
  name: "openim_search_message",
  description: "Search messages with various filters",
  inputSchema: {
    type: "object",
    properties: {
      sendID: {
        type: "string",
        description: "Sender ID"
      },
      recvID: {
        type: "string",
        description: "Receiver ID"
      },
      contentType: {
        type: "number",
        description: "Message content type"
      },
      sendTime: {
        type: "object",
        properties: {
          start: {
            type: "number",
            description: "Start timestamp"
          },
          end: {
            type: "number",
            description: "End timestamp"
          }
        }
      },
      sessionType: {
        type: "number",
        description: "Session type"
      },
      pagination: {
        type: "object",
        properties: {
          pageNumber: {
            type: "number",
            description: "Current page number"
          },
          showNumber: {
            type: "number",
            description: "Number of items per page"
          }
        },
        required: ["pageNumber", "showNumber"]
      }
    },
    required: ["pagination"]
  }
};

const sendMessageTool: Tool = {
  name: "openim_send_message",
  description: "Send message to specific user or group",
  inputSchema: {
    type: "object",
    properties: {
      sendID: {
        type: "string",
        description: "Sender ID",
      },
      recvID: {
        type: "string",
        description: "Receiver ID, empty for group chat",
      },
      groupID: {
        type: "string",
        description: "Group ID, empty for one-to-one chat",
      },
      senderNickname: {
        type: "string",
        description: "Sender nickname",
      },
      senderFaceURL: {
        type: "string",
        description: "Sender avatar URL",
      },
      content: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Message content",
          },
        },
        required: ["content"],
      },
      contentType: {
        type: "number",
        description: "Message type",
      },
      sessionType: {
        type: "number",
        description: "Session type",
      },
      offlinePushInfo: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Push notification title",
          },
          desc: {
            type: "string",
            description: "Push notification description",
          },
          ex: {
            type: "string",
            description: "Extended field",
          },
          iOSPushSound: {
            type: "string",
            description: "iOS push sound",
          },
          iOSBadgeCount: {
            type: "boolean",
            description: "iOS badge count",
          },
        },
      },
    },
    required: ["sendID", "content", "contentType", "sessionType"],
  },
};

const batchSendMessageTool: Tool = {
  name: "openim_batch_send_message",
  description: "Batch send messages to multiple users",
  inputSchema: {
    type: "object",
    properties: {
      recvIDs: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Receiver ID list",
      },
      sendID: {
        type: "string",
        description: "Sender ID",
      },
      senderNickname: {
        type: "string",
        description: "Sender nickname",
      },
      senderFaceURL: {
        type: "string",
        description: "Sender avatar URL",
      },
      senderPlatformID: {
        type: "number",
        description: "Sender platform ID",
      },
      content: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "Message content",
          },
        },
        required: ["content"],
      },
      contentType: {
        type: "number",
        description: "Message type",
      },
      sessionType: {
        type: "number",
        description: "Session type",
      },
      isOnlineOnly: {
        type: "boolean",
        description: "Online only",
      },
      notOfflinePush: {
        type: "boolean",
        description: "Disable offline push",
      },
      offlinePushInfo: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Push notification title",
          },
          desc: {
            type: "string",
            description: "Push notification description",
          },
          ex: {
            type: "string",
            description: "Extended field",
          },
          iOSPushSound: {
            type: "string",
            description: "iOS push sound",
          },
          iOSBadgeCount: {
            type: "boolean",
            description: "iOS badge count",
          },
        },
      },
      ex: {
        type: "string",
        description: "Extended field",
      },
      isSendAll: {
        type: "boolean",
        description: "Send to all users",
      },
    },
    required: ["sendID", "content", "contentType", "sessionType"],
  },
};

const sendBusinessNotificationTool: Tool = {
  name: "openim_send_business_notification",
  description: "Send business notification message",
  inputSchema: {
    type: "object",
    properties: {
      sendUserID: {
        type: "string",
        description: "System notification ID or user ID",
      },
      recvUserID: {
        type: "string",
        description: "Receiver user ID, can only choose one from recvGroupID",
      },
      recvGroupID: {
        type: "string",
        description: "Receive group ID, can only choose one from recvUserID",
      },
      key: {
        type: "string",
        description: "Business classification key",
      },
      data: {
        type: "string",
        description: "Business data",
      },
      sendMsg: {
        type: "boolean",
        description: "Whether to send as a message, default: false",
      },
      reliabilityLevel: {
        type: "number",
        description: "Reliability level of notification messages (1: Online push, 2: Must-reach notification), default: 1",
      },
    },
    required: ["sendUserID", "key", "data"],
  },
};

class OpenIMClient {
  private apiAddr: string;
  private token: string;

  constructor(apiAddr: string, token: string) {
    this.apiAddr = apiAddr;
    this.token = token;
  }

  async getGroups(args: GetGroupsArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/group/get_groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async getGroupMemberList(args: GetGroupMemberListArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/group/get_group_member_list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async getFriendList(args: GetFriendListArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/friend/get_friend_list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async searchMessage(args: SearchMessageArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/msg/search_msg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async sendMessage(args: SendMessageArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/msg/send_msg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async batchSendMessage(args: BatchSendMessageArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/msg/batch_send_msg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }

  async sendBusinessNotification(args: SendBusinessNotificationArgs): Promise<any> {
    const response = await fetch(`${this.apiAddr}/msg/send_business_notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": this.token,
        "operationID": Date.now().toString(),
      },
      body: JSON.stringify(args),
    });

    return response.json();
  }
}

async function main() {
  const apiAddr = process.env.OPENIM_API_ADDR;
  const token = process.env.OPENIM_TOKEN;

  if (!apiAddr || !token) {
    console.error(
      "Please set OPENIM_API_ADDR and OPENIM_TOKEN environment variables"
    );
    process.exit(1);
  }

  console.error("Starting OpenIM MCP Server...");
  const server = new Server({
    name: "OpenIM MCP Server",
    version: "1.0.0"
  }, {
    capabilities: {
      tools: {}
    }
  });

  const openIMClient = new OpenIMClient(apiAddr, token);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "openim_get_groups": {
            const args = request.params.arguments as unknown as GetGroupsArgs;
            const response = await openIMClient.getGroups(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_get_group_member_list": {
            const args = request.params.arguments as unknown as GetGroupMemberListArgs;
            const response = await openIMClient.getGroupMemberList(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_get_friend_list": {
            const args = request.params.arguments as unknown as GetFriendListArgs;
            const response = await openIMClient.getFriendList(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_search_message": {
            const args = request.params.arguments as unknown as SearchMessageArgs;
            const response = await openIMClient.searchMessage(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_send_message": {
            const args = request.params.arguments as unknown as SendMessageArgs;
            const response = await openIMClient.sendMessage(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_batch_send_message": {
            const args = request.params.arguments as unknown as BatchSendMessageArgs;
            const response = await openIMClient.batchSendMessage(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "openim_send_business_notification": {
            const args = request.params.arguments as unknown as SendBusinessNotificationArgs;
            const response = await openIMClient.sendBusinessNotification(args);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        getGroupsTool,
        getGroupMemberListTool,
        getFriendListTool,
        searchMessageTool,
        sendMessageTool,
        batchSendMessageTool,
        sendBusinessNotificationTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("OpenIM MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

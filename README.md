# OpenIM MCP Server

MCP Server for the OpenIM API, enabling Claude to interact with OpenIM services.

## Tools

1. `openim_get_users`
   - Get the list of users with pagination
   - Required parameters:
     - `pagination` (object): Pagination parameters
       - `pageNumber` (number): Page number, starts from 1
       - `showNumber` (number): Number of items per page
   - Optional parameters:
     - `userID` (string): Filter by user ID
     - `nickName` (string): Filter by nickname

2. `openim_send_message`
   - Send message to specific user or group
   - Required parameters:
     - `content` (object): Message content
       - `content` (string): Message text content
     - `contentType` (number): Message type
     - `sessionType` (number): Session type
   - Optional parameters:
     - `recvID` (string): Receiver ID (for single chat)
     - `groupID` (string): Group ID (for group chat)
     - `offlinePushInfo` (object): Offline push information
       - `title` (string): Push notification title
       - `desc` (string): Push notification description
       - `ex` (string): Extended field
       - `iOSPushSound` (string): iOS push sound
       - `iOSBadgeCount` (boolean): iOS badge count

3. `openim_batch_send_message`
   - Batch send messages to multiple users
   - Required parameters:
     - `content` (object): Message content
       - `content` (string): Message text content
     - `contentType` (number): Message type
     - `sessionType` (number): Session type
   - Optional parameters:
     - `recvIDs` (string[]): List of receiver IDs
     - `isOnlineOnly` (boolean): Online only
     - `notOfflinePush` (boolean): Disable offline push
     - `offlinePushInfo` (object): Offline push information
       - `title` (string): Push notification title
       - `desc` (string): Push notification description
       - `ex` (string): Extended field
       - `iOSPushSound` (string): iOS push sound
       - `iOSBadgeCount` (boolean): iOS badge count
     - `ex` (string): Extended field
     - `isSendAll` (boolean): Send to all users

4. `openim_send_business_notification`
   - Send business notification message
   - Required parameters:
     - `key` (string): Business classification key
     - `data` (string): Business data
   - Optional parameters:
     - `recvUserID` (string): Receiver user ID, can only choose one from recvGroupID
     - `recvGroupID` (string): Receive group ID, can only choose one from recvUserID
     - `sendMsg` (boolean): Whether to send as a message, default: false
     - `reliabilityLevel` (number): Reliability level of notification messages (1: Online push, 2: Must-reach notification), default: 1

5. `openim_get_friend_list`
   - Get friend list of a user
   - Required parameters:
     - `userID` (string): User ID
     - `pagination` (object): Pagination parameters
       - `pageNumber` (number): Page number, starts from 1
       - `showNumber` (number): Number of items per page

6. `openim_get_groups`
   - Get group list
   - Required parameters:
     - `pagination` (object): Pagination parameters
       - `pageNumber` (number): Page number, starts from 1
       - `showNumber` (number): Number of items per page
   - Optional parameters:
     - `groupID` (string): Filter by group ID
     - `groupName` (string): Filter by group name

7. `openim_get_group_member_list`
   - Get group member list
   - Required parameters:
     - `groupID` (string): Group ID
     - `pagination` (object): Pagination parameters
       - `pageNumber` (number): Current page number
       - `showNumber` (number): Number of items per page
   - Optional parameters:
     - `keyword` (string): Search keyword

8. `openim_search_message`
   - Search messages
   - Required parameters:
     - `pagination` (object): Pagination parameters
       - `pageNumber` (number): Current page number
       - `showNumber` (number): Number of items per page
   - Optional parameters:
     - `sendID` (string): Sender ID
     - `recvID` (string): Receiver ID
     - `contentType` (number): Message content type: 101=Text (only text messages are supported)
     - `sendTime` (object): Message send time range
       - `start` (number): Start timestamp
       - `end` (number): End timestamp
     - `sessionType` (number): Session type: 1=Single chat, 3=Group chat

## Message Types Explanation

### Session Types
- `sessionType: 1`: Single chat (one-to-one conversation)
- `sessionType: 3`: Group chat (conversation in a group)

### Content Types
- `contentType: 101`: Text message (only text messages are supported)

## Setup

1. Get OpenIM Server Address and Admin Token:
   - Deploy OpenIM server
   - Get API address
   - Get admin token

2. Configure Environment Variables:
   - `OPENIM_API_ADDR`: OpenIM server API address
   - `OPENIM_TOKEN`: OpenIM admin token

### Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

#### npx

```json
{
  "mcpServers": {
    "openim": {
      "command": "npx",
      "args": [
        "-y",
        "@openimsdk/openim-mcp-server"
      ],
      "env": {
        "OPENIM_API_ADDR": "your-openim-server-address",
        "OPENIM_TOKEN": "your-admin-token"
      }
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "openim": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "OPENIM_API_ADDR",
        "-e",
        "OPENIM_TOKEN",
        "mcp/openim"
      ],
      "env": {
        "OPENIM_API_ADDR": "your-openim-server-address",
        "OPENIM_TOKEN": "your-admin-token"
      }
    }
  }
}
```

### Troubleshooting

If you encounter issues, verify that:
1. OpenIM server is running properly
2. API address is configured correctly
3. Token is valid and has sufficient permissions
4. Network connection is stable

## Build

Docker build command:

```bash
docker build -t mcp/openim -f Dockerfile .
```

## Testing

To run the test suite:

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
export OPENIM_API_ADDR="your-openim-server-address"
export OPENIM_TOKEN="your-admin-token"
```

3. Run tests:
```bash
npm run test
```

The test suite includes:
- Server connection test
- API functionality tests:
    - Get groups list
    - Get group member list
    - Get friend list
    - Search messages
    - Send message
    - Batch send message
    - Send business notification
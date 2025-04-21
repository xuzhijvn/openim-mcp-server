import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const serverPath = path.resolve(process.cwd(), 'dist/index.js');
  const nodePath = execSync('which node').toString().trim();
  
  // Start MCP Server
  const serverProcess = spawn(nodePath, [serverPath]);

  // Listen for server error output
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data.toString()}`);
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Create MCP client
    const transport = new StdioClientTransport({
      command: nodePath,
      args: [serverPath],
      env: {
        PATH: process.env.PATH || '',
        OPENIM_TOKEN: process.env.OPENIM_TOKEN || '',
        OPENIM_API_ADDR: process.env.OPENIM_API_ADDR || ''
      }
    });

    if (!process.env.OPENIM_TOKEN || !process.env.OPENIM_API_ADDR) {
      throw new Error('Please set OPENIM_TOKEN and OPENIM_API_ADDR environment variables');
    }

    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: {}
      }
    });

    // Connect to server
    await client.connect(transport);
    console.log('Successfully connected to MCP Server');

    // Get available tools list
    const tools = await client.listTools();
    console.log('Available tools:', JSON.stringify(tools, null, 2));

    // Test parse token
    console.log('\nTesting openim_parse_token:');
    const parseTokenResponse = await client.callTool({
      name: 'openim_parse_token',
      arguments: {
        token: process.env.OPENIM_TOKEN || ''
      }
    });
    console.log('Parse token response:', JSON.stringify(parseTokenResponse, null, 2));

    // Test get users
    console.log('\nTesting openim_get_users:');
    const usersResponse = await client.callTool({
      name: 'openim_get_users',
      arguments: {
        pagination: {
          pageNumber: 1,
          showNumber: 10
        }
      }
    });
    console.log('Get users response:', JSON.stringify(usersResponse, null, 2));

    // Test get users with filter
    console.log('\nTesting openim_get_users with filter:');
    const usersFilterResponse = await client.callTool({
      name: 'openim_get_users',
      arguments: {
        userID: "2cdf7942da0db2cbc71fcc228bbfd6ec85", // 使用从parse_token获取的用户ID
        pagination: {
          pageNumber: 1,
          showNumber: 10
        }
      }
    });
    console.log('Get filtered users response:', JSON.stringify(usersFilterResponse, null, 2));

    // Test get groups
    console.log('\nTesting openim_get_groups:');
    const groupsResponse = await client.callTool({
      name: 'openim_get_groups',
      arguments: {
        pagination: {
          pageNumber: 1,
          showNumber: 2
        }
      }
    });
    console.log('Get groups response:', JSON.stringify(groupsResponse, null, 2));

    // Test get group member list
    console.log('\nTesting openim_get_group_member_list:');
    const groupMemberResponse = await client.callTool({
      name: 'openim_get_group_member_list',
      arguments: {
        groupID: "464588223",
        pagination: {
          pageNumber: 1,
          showNumber: 30
        }
      }
    });
    console.log('Group member list response:', JSON.stringify(groupMemberResponse, null, 2));

    // Test get friend list
    console.log('\nTesting openim_get_friend_list:');
    const friendListResponse = await client.callTool({
      name: 'openim_get_friend_list',
      arguments: {
        userID: "2cdf7942da0db2cbc71fcc228bbfd6ec85",
        pagination: {
          pageNumber: 1,
          showNumber: 20
        }
      }
    });
    console.log('Friend list response:', JSON.stringify(friendListResponse, null, 2));

    // Test search message
    console.log('\nTesting openim_search_message:');
    const searchResponse = await client.callTool({
      name: 'openim_search_message',
      arguments: {
        sendID: "2cdf7942da0db2cbc71fcc228bbfd6ec85",
        recvID: "464588223",
        contentType: 101,
        sessionType: 3,
        pagination: {
          pageNumber: 1,
          showNumber: 2
        }
      }
    });
    console.log('Search message response:', JSON.stringify(searchResponse, null, 2));

    // Test send message
    console.log('\nTesting openim_send_message:');
    const sendMessageResponse = await client.callTool({
      name: 'openim_send_message',
      arguments: {
        sendID: "2cdf7942da0db2cbc71fcc228bbfd6ec85",
        recvID: "5af4c1e82e864298b93ba0e17fa07a7d19",
        content: {
          content: "Test message"
        },
        contentType: 101,
        sessionType: 1
      }
    });
    console.log('Send message response:', JSON.stringify(sendMessageResponse, null, 2));

    // Test batch send message
    console.log('\nTesting openim_batch_send_message:');
    const batchSendResponse = await client.callTool({
      name: 'openim_batch_send_message',
      arguments: {
        sendID: "2cdf7942da0db2cbc71fcc228bbfd6ec85",
        recvIDs: ["5af4c1e82e864298b93ba0e17fa07a7d19", "15ec50f9c81b561f2ae2772b22a99ad811"],
        content: {
          content: "Test batch message"
        },
        contentType: 101,
        sessionType: 1
      }
    });
    console.log('Batch send response:', JSON.stringify(batchSendResponse, null, 2));

    // Test send business notification
    console.log('\nTesting openim_send_business_notification:');
    const notificationResponse = await client.callTool({
      name: 'openim_send_business_notification',
      arguments: {
        sendUserID: "2cdf7942da0db2cbc71fcc228bbfd6ec85",
        recvUserID: "5af4c1e82e864298b93ba0e17fa07a7d19",
        key: "test_notification",
        data: "Test notification data",
        sendMsg: true,
        reliabilityLevel: 2
      }
    });
    console.log('Business notification response:', JSON.stringify(notificationResponse, null, 2));

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Clean up resources
    serverProcess.kill();
  }
}

main().catch(console.error); 
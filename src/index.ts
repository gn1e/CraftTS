import type { ServerClient, Server } from 'minecraft-protocol';
import { v4 as uuidv4 } from 'uuid';
import mc from 'minecraft-protocol';
import minecraftData from 'minecraft-data';
import nbt from 'prismarine-nbt';
import dotenv from 'dotenv';
import logger from './utils/logger';

const version = process.env.VERSION as string;

const server = mc.createServer({
    motd: 'A CraftTS server!',
    port: 25565,
    'online-mode': false,
    version: version
});

dotenv.config();

const data = minecraftData(version);
const loginPacket = data.loginPacket;

function textHandler (text: string) {
    return data.supportFeature('chatPacketsUseNbtComponents')
      ? nbt.comp({ text: nbt.string(text) })
      : JSON.stringify({ text })
}

server.on('playerJoin', function (client) {
    logger.information(`${client.username} has connected!`);
    client.on('end', function () {
        logger.information(`${client.username} has disconnected!`)
    });
    client.write('login', {
        ...loginPacket,
        enforceSecureChat: false,
        entityId: client.id,
        isHardcore: false,
        gameMode: 0,
        previousGameMode: 1,
        hashedSeed: [0, 0],
        maxPlayers: 20,
        viewDistance: 10,
        reducedDebugInfo: false,
        enableRespawnScreen: true,
        isDebug: false,
        isFlat: false
      });
    
      client.write('position', {
        x: 0,
        y: 100,
        z: 0,
        yaw: 0,
        pitch: 0,
        flags: 0x00,
      });

      function chatHandler (data: { message: string }) {
        const message = `<${client.username}> ${data.message}`;
        broadcast(message, null, client.username)
        logger.information(message)
      }

      client.on('chat', chatHandler)
});

server.on('listening', function () {
    logger.information('Server listening on port 25565') // lets just assume that its listening on 25565
})


function sendBroadcastMessage(
    server: Server,
    clients: ServerClient[],
    message: string,
    sender: string
  ) {

    const uuid = uuidv4();
    if (data.supportFeature('signedChat')) {
      server.writeToClients(clients, 'player_chat', {
        plainMessage: message,
        signedChatContent: '',
        unsignedChatContent: textHandler(message),
        type: 0,
        senderUuid: uuid,
        senderName: JSON.stringify({ text: sender }),
        senderTeam: undefined,
        timestamp: Date.now(),
        salt: 0n,
        signature: data.supportFeature('useChatSessions') ? undefined : Buffer.alloc(0),
        previousMessages: [],
        filterType: 0,
        networkName: JSON.stringify({ text: sender }),
      });
    } else {
      server.writeToClients(clients, 'chat', {
        message: JSON.stringify({ text: message }),
        position: 0,
        sender: sender || '0',
      });
    }
  }
  
  function broadcast(
    message: string,
    exclude: ServerClient | null,
    username: string
  ) {
    const recipients = Object.values(server.clients).filter(client => client !== exclude);
    sendBroadcastMessage(server, recipients, message, username);
  }
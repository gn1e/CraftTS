import mc from 'minecraft-protocol';
import minecraftData from 'minecraft-data';
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
});

server.on('listening', function () {
    logger.information('Server listening on port 25565') // lets just assume that its listening on 25565
})
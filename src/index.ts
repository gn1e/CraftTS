import net from 'net';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { MCServer } from './server/listen';

dotenv.config();

const port = Number(process.env.PORT) || 25565;

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;

  logger.information(`${clientAddress} has connected!`);

  socket.on('end', () => {
    logger.information(`${clientAddress} has disconnected!`);
  });

  socket.on('error', (err) => {
    logger.error(`Error from ${clientAddress}: ${err.message}`);
  });
});

MCServer.Listen(server, port);

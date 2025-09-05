import type { Server } from 'net';
import logger from '../utils/logger';

export namespace MCServer {
    export function Listen(server: Server, port: number) {
        server.listen(port, () => {
            logger.information(`CraftTS server listening on port ${port}!`);
        });
    }
}


import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
    namespace: 'tracking',
    cors: { origin: '*' },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(TrackingGateway.name);

    handleConnection(client: Socket) {
        const authHeader = client.handshake.headers['authorization'];
        if (!authHeader) {
            client.disconnect();
            return;
        }

        // Mock JWT validation for WebSocket
        // Format: Bearer mock-jwt|userId|tenantId|email
        const token = (authHeader as string).split(' ')[1];
        const parts = token?.split('|');

        if (!parts || parts[0] !== 'mock-jwt') {
            client.disconnect();
            return;
        }

        const tenantId = parts[2];
        const room = `tenant:${tenantId}`;
        client.join(room);
        client.join('global');
        this.logger.log(`Client ${client.id} joined tracking room: ${room} and global`);

    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client ${client.id} disconnected from tracking`);
    }

    broadcastUpdate(tenantId: string, data: any) {
        this.server.to(`tenant:${tenantId}`).emit('tracking:update', data);
        this.server.to('global').emit('tracking:update', data); // Re-added global emission based on instruction
        // The provided snippet for 'frontend logging' appears to be client-side code
        // and cannot be directly inserted into this server-side gateway method.
        // If you intended to log on the server when a global update is sent,
        // you would add a logger call here.
        // Example: this.logger.debug(`Broadcasting tracking update to global room: ${JSON.stringify(data)}`);
    }


    broadcastAlert(tenantId: string, alert: any) {
        const room = `tenant:${tenantId}`;
        this.server.to(room).emit('tracking:alert', alert);
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket): string {
        return 'pong';
    }
}

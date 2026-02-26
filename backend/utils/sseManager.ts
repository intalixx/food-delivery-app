import { Response } from 'express';

interface SSEClient {
    userId: string;
    res: Response;
}

/** Manages Server-Sent Events connections per user */
class SSEManager {
    private clients: SSEClient[] = [];

    /** Register a new SSE client */
    addClient(userId: string, res: Response): void {
        this.clients.push({ userId, res });

        // Remove client on connection close
        res.on('close', () => {
            this.clients = this.clients.filter(c => c.res !== res);
        });
    }

    /** Send an event to a specific user */
    sendToUser(userId: string, event: string, data: Record<string, unknown>): void {
        const userClients = this.clients.filter(c => c.userId === userId);
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

        for (const client of userClients) {
            client.res.write(payload);
        }
    }

    /** Get connected client count (for debugging) */
    getClientCount(): number {
        return this.clients.length;
    }
}

// Singleton instance
export const sseManager = new SSEManager();

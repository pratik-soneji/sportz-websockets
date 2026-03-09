import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { wsArcjet } from "../arcjet.js";


const sendJson = (socket, payload) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload))
}

const broadCast = (wss, payload) => {
    
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;    
        client.send(JSON.stringify(payload))
    }
}
export const attachWebSocketServer = (server) => {
    const wss= new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024, //this acts as security measure against memory abuse or flooding
    })
    server.on('upgrade', async (req, socket, head) => {
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);

        if (pathname !== '/ws') {
            return;
        }

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);

                if (decision.isDenied()) {
                    if (decision.reason.isRateLimit()) {
                        socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
                    } else {
                        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                    }
                    socket.destroy();
                    return;
                }
            } catch (e) {
                console.error('WS upgrade protection error', e);
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
                return;
            }
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });
    wss.on('connection', async (socket, req) => {
        if (wsArcjet) {
            try {
                const decision =  await wsArcjet.protect(req)
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate Limit exceeded' : 'Access Denied';
                    socket.close(code, reason);
                    return;
                }
            } catch (error) {
                console.error('WS connection error', error);
                socket.close(1011, 'Server Security Error');
                return;
            }
        }
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJson(socket, { type: 'welcome' });

        socket.on('message', (data) => {
            handleMessage(socket, data);
        });

        socket.on('error', () => {
            socket.terminate();
        });

        socket.on('close', () => {
            cleanupSubscriptions(socket);
        })

        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })}, 30000);

    wss.on('close', () => clearInterval(interval));
    const broadCastMatchCreated = (match) => {
        broadCast(wss, { type: "match_created", data : match })
    }
    return { broadCastMatchCreated }
}

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
    wss.on("connection",async(socket,req)=>{
        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req)
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit()? 1013 : 1008
                    const reason = decision.reason.isRateLimit()? `Rate limit exceeded` : `Access Denied`
                    socket.close(code,reason)
                    return
                }
            } catch (error) {
                console.log("Ws Connection Err");
                socket.close(1008, `Server Security Err`)
                return
            }
        }
        socket.isAlive = true
        socket.on("pong",()=>{socket.isAlive = true})
        sendJson(socket, { type: "WELCOME" })
        socket.on("error",console.error);        
    })
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                return ws.terminate()
            }
            ws.isAlive = false
            ws.ping()
        })
    }, 30000)
    
   wss.on("close",()=>{clearInterval(interval)}) 
    const broadCastMatchCreated = (match) => {
        broadCast(wss, { type: "match_created", data : match })
    }
    return { broadCastMatchCreated }
}

import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node"

const arcjetKey = process.env.ARCJET_KEY
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE" ; //CHange DRY_RUN to LIVE in production
if (!arcjetKey) {
    throw new Error(`Arcjet Key Enviornment Variable is missing`)
}
export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: "DRY_RUN" }),
            detectBot({ mode: "DRY_RUN", allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
            slidingWindow({ mode: "DRY_RUN", interval: '10s', max: 50 })
        ]
    }) : null
export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: "DRY_RUN" }),
            detectBot({ mode: "DRY_RUN", allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CATEGORY:TOOL"] }),
            slidingWindow({ mode: "DRY_RUN", interval: "2s", max: 5 })
        ]
    }) : null

export const securityMiddleWare = () => {
    return async (req, res, next) => {
        if (!arcjetKey) {
            return next();
        }
        try {

            const decision = await httpArcjet.protect(req);

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: 'Too many requests.' });
                }
                console.log(decision.reason);

                return res.status(403).json({ error: 'Forbidden.' });
            }
        } catch (e) {
            console.error('Arcjet middleware Err', e, e.stack);
            return res.status(503).json({ error: 'Service unavailable' });
        }
        next();
    }
}
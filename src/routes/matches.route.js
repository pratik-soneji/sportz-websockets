import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
// import { matches } from "../db/schema";
import { db } from '../db/db.js'
import { getMatchStatus } from "../utils/match-status.js";
import { matches } from "../db/schema.js";
import { desc } from "drizzle-orm";
const matchesRouter = Router();
const MAX_LIMIT =100;
matchesRouter.get('/',async(req,res)=>{ 
    const parsed = listMatchesQuerySchema.safeParse(req.query)
    if (!parsed.success) {
        res.status(404).json({ error : 'Invalid query', details : JSON.stringify(parsed.error) })
    }
    const limit =  Math.min(parsed.data.limit ?? 50 , MAX_LIMIT)
    try {
        const data  = await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit)
        res.json( { data: data })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: 'Failed to list match', details : parsed.error.issues })
    }
})

matchesRouter.post('/',async(req,res)=>{
    const parsed = createMatchSchema.safeParse(req.body)
    
    if (!parsed.success) {
        res.status(404).json({ error : 'Invalid payload', details : parsed.error.issues })
    }
    const { data : { startTime, endTime, homeScore, awayScore } } = parsed
    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime : new Date(startTime),
            endTime : new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore : awayScore ?? 0,
            status: getMatchStatus(startTime,endTime) 
        }).returning() 
        res.status(201).json({ data : event })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: 'Failed to create match', details : JSON.stringify(error) })
    }
})

export { matchesRouter }
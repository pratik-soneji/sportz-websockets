
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

if(!process.env.DATABSE_URL){
    throw new Error(`DATABSE_URL is not defined`)
}


const pool = new pg.Pool({
  connectionString: process.env.DATABSE_URL,
});

export const db = drizzle(pool);

import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
if(!process.env.DATABSE_URL){
    throw new Error(`DATABSE_URL is not set in .env`)
}
export default defineConfig({
    schema: "./src/db/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials : {
        url: process.env.DATABSE_URL,
    }
})

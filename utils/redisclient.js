import dotenv from "dotenv";
dotenv.config(); // ✅ ensure envs are loaded first


import Redis from "ioredis";
console.log(process.env.REDIS_PORT)
const redis=new Redis({
    port: process.env.REDIS_PORT, // Redis port
    host: process.env.REDIS_HOST, // Redis host
    username: process.env.REDIS_USERNAME, // needs Redis >= 6
    password: process.env.REDIS_PASSWORD,
});

export default redis

import { createClient } from 'redis';

export const client = createClient({
  socket: {
    host: '127.0.0.1', // or 'localhost'
    port: 6379,
  },
});

client.connect().then(() => {
    console.log("Redis client connected to redis at localhost:6379")
})
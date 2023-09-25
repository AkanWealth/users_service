import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    // Create a Redis client instance
    this.redisClient = new Redis({
      host: 'localhost', // Redis server host
      port: 6379, // Redis server port
      // Other configuration options as needed
    });
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    // Serialize the value to JSON before storing it in Redis
    const serializedValue = JSON.stringify(value);

    // Set the value in Redis with an optional time-to-live (TTL)
    if (ttlSeconds > 0) {
      await this.redisClient.setex(key, ttlSeconds, serializedValue);
    } else {
      await this.redisClient.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Retrieve the value from Redis
    const serializedValue = await this.redisClient.get(key);

    if (serializedValue === null) {
      return null;
    }

    // Deserialize the value from JSON
    const parsedValue = JSON.parse(serializedValue);

    return parsedValue;
  }
}

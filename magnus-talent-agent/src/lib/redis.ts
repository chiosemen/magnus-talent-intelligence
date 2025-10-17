import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL!);
export const queues = { pipeline: new Queue('mtia:pipeline', { connection }) };
export const queueEvents = { pipeline: new QueueEvents('mtia:pipeline', { connection }) };

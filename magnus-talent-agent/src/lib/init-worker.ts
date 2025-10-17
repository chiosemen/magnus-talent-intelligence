// Ensure the BullMQ worker boots when this module is loaded.
// Importing this file from any server-only module will spin up the shared worker instance.
import { worker } from './worker';

const globalWithListeners = globalThis as typeof globalThis & { mtiaWorkerListeners?: boolean };

if (process.env.NODE_ENV !== 'production' && !globalWithListeners.mtiaWorkerListeners) {
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });
  globalWithListeners.mtiaWorkerListeners = true;
}

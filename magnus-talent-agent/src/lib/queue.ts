import { queues } from './redis';
import { JDInput } from '@/types';
export async function enqueueJD(jd: JDInput) {
  const job = await queues.pipeline.add('parse_jd', jd, {
    attempts: 3,
    removeOnComplete: true
  });
  return job.id;
}

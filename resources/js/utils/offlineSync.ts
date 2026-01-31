import localforage from 'localforage';
import axios from 'axios';

const QUEUE_KEY = 'afya_offline_queue_v1';

localforage.config({ name: 'afya' });

export type SyncRecord = {
  type: 'vital' | 'inventory' | 'visit';
  payload: any;
  createdAt: string;
};

export async function enqueue(record: SyncRecord) {
  const queue = (await localforage.getItem<SyncRecord[]>(QUEUE_KEY)) || [];
  queue.push(record);
  await localforage.setItem(QUEUE_KEY, queue);
}

export async function getQueue() {
  return (await localforage.getItem<SyncRecord[]>(QUEUE_KEY)) || [];
}

export async function clearQueue() {
  await localforage.removeItem(QUEUE_KEY);
}

export async function syncQueue() {
  const queue = await getQueue();
  if (!queue.length) return { synced: 0 };

  const vitals = queue.filter(q => q.type === 'vital').map(q => q.payload);
  const inventory = queue.filter(q => q.type === 'inventory').map(q => q.payload);
  const visits = queue.filter(q => q.type === 'visit').map(q => q.payload);

  let synced = 0;

  try {
    if (vitals.length) {
      await axios.post('/api/practitioner/sync/vitals', { vitals });
      synced += vitals.length;
    }

    if (inventory.length) {
      await axios.post('/api/practitioner/sync/inventory-usage', { usages: inventory });
      synced += inventory.length;
    }

    if (visits.length) {
      await axios.post('/api/practitioner/sync/visits', { visits });
      synced += visits.length;
    }

    // Clear queue on success
    await clearQueue();
  } catch (err) {
    // Fail gracefully; items remain in queue
    console.error('Sync error:', err);
  }

  return { synced };
}

// Auto-sync when coming online
window.addEventListener('online', () => {
  syncQueue().then(res => console.log('Offline queue synced', res));
});

export default { enqueue, syncQueue, getQueue, clearQueue };

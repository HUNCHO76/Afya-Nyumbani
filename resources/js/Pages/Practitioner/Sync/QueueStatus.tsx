import React, { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { getQueue, syncQueue } from '@/utils/offlineSync';

const QueueStatus = () => {
  const [queueLength, setQueueLength] = useState(0);

  const refresh = async () => {
    const queue = await getQueue();
    setQueueLength(queue.length);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="p-4 rounded-lg border bg-card">
      <h3 className="font-semibold">Offline Queue</h3>
      <p className="text-sm text-muted-foreground mb-2">Pending items: {queueLength}</p>
      <div className="flex gap-2">
        <Button onClick={async () => { await syncQueue(); refresh(); }}>Sync Now</Button>
        <Button variant="outline" onClick={refresh}>Refresh</Button>
      </div>
    </div>
  );
};

export default QueueStatus;

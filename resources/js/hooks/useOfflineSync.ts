import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OfflineVitalSign {
  id: string;
  patient_id: string;
  recorded_by: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  weight: number | null;
  blood_glucose: number | null;
  notes: string | null;
  recorded_at: string;
  synced: boolean;
}

const OFFLINE_VITALS_KEY = 'afya_offline_vitals';
const OFFLINE_QUEUE_KEY = 'afya_sync_queue';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing offline data...",
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Data will be saved locally and synced when online",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count of pending items
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = useCallback(() => {
    const vitals = getOfflineVitals();
    const pending = vitals.filter(v => !v.synced);
    setPendingCount(pending.length);
  }, []);

  const getOfflineVitals = (): OfflineVitalSign[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_VITALS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveOfflineVital = useCallback((vital: Omit<OfflineVitalSign, 'id' | 'synced'>) => {
    const vitals = getOfflineVitals();
    const newVital: OfflineVitalSign = {
      ...vital,
      id: crypto.randomUUID(),
      synced: false,
    };
    vitals.push(newVital);
    localStorage.setItem(OFFLINE_VITALS_KEY, JSON.stringify(vitals));
    updatePendingCount();
    
    toast({
      title: "Saved Offline",
      description: "Vital signs saved locally. Will sync when online.",
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      syncPendingData();
    }

    return newVital;
  }, [updatePendingCount]);

  const syncPendingData = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    const vitals = getOfflineVitals();
    const pending = vitals.filter(v => !v.synced);

    if (pending.length === 0) {
      setIsSyncing(false);
      return;
    }

    let syncedCount = 0;

    for (const vital of pending) {
      try {
        const { error } = await supabase.from('vital_signs').insert({
          patient_id: vital.patient_id,
          recorded_by: vital.recorded_by,
          blood_pressure_systolic: vital.blood_pressure_systolic,
          blood_pressure_diastolic: vital.blood_pressure_diastolic,
          heart_rate: vital.heart_rate,
          temperature: vital.temperature,
          respiratory_rate: vital.respiratory_rate,
          oxygen_saturation: vital.oxygen_saturation,
          weight: vital.weight,
          blood_glucose: vital.blood_glucose,
          notes: vital.notes,
          recorded_at: vital.recorded_at,
        });

        if (!error) {
          vital.synced = true;
          syncedCount++;
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    // Update storage with synced items
    localStorage.setItem(OFFLINE_VITALS_KEY, JSON.stringify(vitals));
    updatePendingCount();
    setIsSyncing(false);

    if (syncedCount > 0) {
      toast({
        title: "Sync Complete",
        description: `${syncedCount} vital sign record(s) synced successfully`,
      });
    }
  }, [isSyncing, updatePendingCount]);

  const clearSyncedData = useCallback(() => {
    const vitals = getOfflineVitals();
    const pending = vitals.filter(v => !v.synced);
    localStorage.setItem(OFFLINE_VITALS_KEY, JSON.stringify(pending));
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    saveOfflineVital,
    syncPendingData,
    getOfflineVitals,
    clearSyncedData,
  };
};

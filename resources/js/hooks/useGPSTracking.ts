import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UseGPSTrackingOptions {
  practitionerProfileId: string | null;
  enableTracking?: boolean;
  updateInterval?: number; // in milliseconds
}

export const useGPSTracking = ({
  practitionerProfileId,
  enableTracking = true,
  updateInterval = 60000, // Default: update every 60 seconds
}: UseGPSTrackingOptions) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateLocationInDB = useCallback(async (location: LocationData) => {
    if (!practitionerProfileId) return;

    try {
      const { error: dbError } = await supabase
        .from('practitioner_profiles')
        .update({
          current_latitude: location.latitude,
          current_longitude: location.longitude,
        })
        .eq('id', practitionerProfileId);

      if (dbError) throw dbError;
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to update location in database:', err);
    }
  }, [practitionerProfileId]);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const newLocation: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
    setCurrentLocation(newLocation);
    setError(null);
  }, []);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Unable to get location';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }
    setError(errorMessage);
    console.error('Geolocation error:', err);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    toast({
      title: "GPS Tracking Active",
      description: "Your location is being tracked for route optimization",
    });
  }, [handlePositionUpdate, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    
    toast({
      title: "GPS Tracking Stopped",
      description: "Location tracking has been disabled",
    });
  }, []);

  const manualUpdate = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    return new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setCurrentLocation(newLocation);
          await updateLocationInDB(newLocation);
          resolve(newLocation);
          
          toast({
            title: "Location Updated",
            description: "Your current location has been saved",
          });
        },
        (err) => {
          handlePositionError(err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, [handlePositionError, updateLocationInDB]);

  // Setup periodic database updates
  useEffect(() => {
    if (isTracking && currentLocation && practitionerProfileId) {
      // Update immediately
      updateLocationInDB(currentLocation);

      // Setup interval for periodic updates
      intervalRef.current = setInterval(() => {
        if (currentLocation) {
          updateLocationInDB(currentLocation);
        }
      }, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, currentLocation, updateInterval, practitionerProfileId, updateLocationInDB]);

  // Auto-start if enabled
  useEffect(() => {
    if (enableTracking && practitionerProfileId) {
      startTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableTracking, practitionerProfileId]);

  return {
    currentLocation,
    isTracking,
    error,
    lastUpdate,
    startTracking,
    stopTracking,
    manualUpdate,
  };
};

import React, { useCallback, createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObjectCoords | null;
  errorMsg: string | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const fetchLocation = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      const res = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setLocation(res.coords)
    } catch {
      setErrorMsg('Could not find location. Is GPS enabled?')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Request location when the provider mounts so the map and home screen have it
  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  // does not allow re-renders if the fields are the same as prev
  const value = React.useMemo(
    () => ({
      location,
      errorMsg,
      isLoading,
      refreshLocation: fetchLocation,
    }),
    [location, errorMsg, isLoading, fetchLocation]
  )

  return (
    <LocationContext.Provider value={ value }>
      {children}
    </LocationContext.Provider>
  );
}
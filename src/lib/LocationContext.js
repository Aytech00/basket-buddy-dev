import React, { createContext, useEffect, useState } from "react";

const LocationContext = createContext({
  location: null,
  setLocation: () => {},
});

export const Location = ({ children }) => {
  const [location, setLocation] = useState();
  const [userLocation, setUserLocation] = useState(undefined);
  const [specificLocations, setSpecificLocations] = useState([]);

  useEffect(() => {
    if (userLocation !== undefined && specificLocations.length > 0) {
      console.log("User location and specific locations are available");
      calculateDistances();
    } else {
      console.log(
        "Either user location or specific locations are not available"
      );
    }
  }, [userLocation, specificLocations]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;

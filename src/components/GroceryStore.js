import React, { useState } from "react";
import { Marker } from "react-native-maps";

export default function GroceryStore({ store }) {
  const [coordinates, setCoordinates] = useState([]);

  let latitude = 42.9426091;
  let longitude = -81.2293494;
  let key = 0;
  return (
    <>
      {coordinates.map((coordinate) => {
        <Marker
          key={key}
          coordinate={{
            latitude: latitude,
            longitude: longitude,
          }}
          title={`Store `}
          description={`Latitude: ${latitude}, Longitude: ${longitude}`}
        />;
      })}
    </>
  );
}

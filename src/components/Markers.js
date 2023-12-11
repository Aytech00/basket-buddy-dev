import React from "rect";
import { Marker } from "react-native-maps";

export default function Markers({ coordinate }) {
  return (
    <>
      <Marker
        key={coordinate.key}
        coordinate={{
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        }}
        title="You are here"
        description="This is your current location"
      />
    </>
  );
}

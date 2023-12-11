import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import Text from "../components/ui/Text";
import uuid from "react-native-uuid";

export default function Map({
  stores,
  brands,
  handleUserLocation,
  handleSpecificLocation,
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      handleUserLocation({ latitude, longitude });
      setCurrentLocation({ latitude, longitude });
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const convertAddressesToCoordinates = async () => {
      const newCoordinates = await Promise.all(
        stores.map(async (store) => {
          const { address, city, country } = store;
          let storeAddress = `${address}, ${city}, ${country}`;
          try {
            const geocode = await Location.geocodeAsync(storeAddress);
            if (geocode.length > 0) {
              const { latitude, longitude } = geocode[0];
              const key = uuid.v4();
              handleSpecificLocation({
                latitude,
                longitude,
                key,
                brandID: store.brand_id,
              });
              return { latitude, longitude, key, brandID: store.brand_id };
            }
          } catch (error) {
            console.log("Error converting address to coordinates:", error);
          }
          return null;
        })
      );

      setCoordinates(newCoordinates.filter((coord) => coord !== null));
    };

    convertAddressesToCoordinates();
  }, [stores]);

  return (
    <View style={styles.container}>
      {currentLocation !== null ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={currentLocation}
            title="You are here"
            description="This is your current location"
          />
          {coordinates.map((coordinate) => {
            const matchedStore = stores.find(
              (store) => store.brand_id === coordinate.brandID
            );

            // Initialize matchedBrand as null
            let matchedBrand = null;

            if (matchedStore) {
              matchedBrand = brands.find(
                (brand) => brand.id === matchedStore.brand_id
              );
            } else {
              console.log(
                "No matching store found for coordinate:",
                coordinate
              );
            }

            // Check if matchedBrand is not null
            if (matchedBrand) {
              return (
                <Marker
                  key={coordinate.key}
                  coordinate={coordinate}
                  title={matchedBrand.name}
                  description={`${matchedStore.address}, ${matchedStore.city}`}
                />
              );
            }
          })}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text className="mt-5">Loading...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

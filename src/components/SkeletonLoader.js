import React from "react";
import { Dimensions } from "react-native";
import SkeletonLoader from "expo-skeleton-loader";

const { width, height } = Dimensions.get("window");

export const AvatarLayout = () => (
  <SkeletonLoader boneColor="#c2c2c2" highlightColor="#eee" duration={1000}>
    <SkeletonLoader.Container
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <SkeletonLoader.Item
        style={{
          width: 93,
          height: 93,
          // borderRadius: size / 2,
          backgroundColor: "red",
        }}
        boneColor="red"
      />

      <SkeletonLoader.Container style={{ gap: 8, flexGrow: 1 }}>
        <SkeletonLoader.Item style={{ width: "90%", height: 18 }} />
        <SkeletonLoader.Item style={{ width: "70%", height: 18 }} />
        <SkeletonLoader.Item style={{ width: 70, height: 18 }} />
      </SkeletonLoader.Container>
    </SkeletonLoader.Container>
  </SkeletonLoader>
);

export const PostLayout = () => (
  <SkeletonLoader style={{ marginVertical: 10 }}>
    <AvatarLayout style={{ marginBottom: 10 }} />

    <SkeletonLoader.Item
      style={{ width, height: height / 3.5, marginVertical: 10 }}
    />
  </SkeletonLoader>
);

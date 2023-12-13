import { useEffect, useRef } from "react";
import { Keyboard } from "react-native";

const useKeyboardDismissOnScroll = (
  scrollY,
  isSearchFocused,
  threshold = 20
) => {
  const prevScrollY = useRef(0);

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const scrollDifference = value - prevScrollY.current;

      console.log("SCROLL DIFFERENCE");
      // console.log(scrollDifference);
      // If scrolling downwards (and not just adjusting for keyboard)
      if (
        isSearchFocused &&
        scrollDifference > threshold &&
        Keyboard.isVisible
      ) {
        Keyboard.dismiss();
      }

      // Update the previous scroll value
      prevScrollY.current = value;
    });
    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, isSearchFocused, threshold]);
};

export default useKeyboardDismissOnScroll;

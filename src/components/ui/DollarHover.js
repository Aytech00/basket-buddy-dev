const DollarHover = (props) => {
  const dollarHover = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  useEffect(() => {
    Animated.timing(dollarHover, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: true,
    }).start();
  }, [dollarHover]);

  return (
    <Animated.View // Special animatable View
      style={{
        ...props.style,
        opacity: dollarHover, // Bind opacity to animated value
      }}
    >
      {props.children}
    </Animated.View>
  );
};

import React, { FC } from "react";
import { Text } from "ink";

const addZero = (num: number) =>
  Math.abs(num) < 10 ? `0${num}` : num.toString();

const Timer: FC<{ timeToCountDownTo: number }> = ({ timeToCountDownTo }) => {
  const [remainingMilliseconds, setRemainingMilliseconds] = React.useState(
    timeToCountDownTo - new Date().getTime()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMilliseconds(timeToCountDownTo - new Date().getTime());
    }, 500);
    return () => {
      clearInterval(interval);
    };
  }, [timeToCountDownTo]);

  const text = React.useMemo<string>(() => {
    if (remainingMilliseconds < 0) {
      return "00:00";
    }
    const seconds = Math.floor(remainingMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);

    return `${addZero(minutes)}:${addZero(seconds % 60)}`;
  }, [remainingMilliseconds]);

  return <Text>{text}</Text>;
};

export default Timer;

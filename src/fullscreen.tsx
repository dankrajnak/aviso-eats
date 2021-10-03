import React, { FC, useEffect } from "react";

const enterAltScreenCommand = "\x1b[?1049h";
const leaveAltScreenCommand = "\x1b[?1049l";

export const exitFullScreen = (): void => {
  process.stdout.write(leaveAltScreenCommand);
};

const FullScreen: FC = ({ children }) => {
  useEffect(() => {
    // destroy alternate screen on unmount
    return exitFullScreen;
  }, []);
  // trigger alternate screen
  process.stdout.write(enterAltScreenCommand);
  return <>{children}</>;
};

export default FullScreen;

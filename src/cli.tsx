import React from "react";
import { render } from "ink";
import { Command } from "commander";
import App from "./ui";
import { exitFullScreen } from "./fullscreen";

const program = new Command();

program.name("aviso-eats");
program.description("Hi!");

program.parse(process.argv);

const exitHandler = () => {
  exitFullScreen();
  process.exit(0);
};

process.on("uncaughtException", exitHandler);
process.on("unhandledRejection", exitHandler);
process.on("SIGTERM", exitHandler);
process.on("SIGINT", exitHandler);

render(<App />);

import React from "react";
import { render } from "ink";
import { Command } from "commander";
import App from "./ui";

const program = new Command();

program.name("aviso-eats");
program.description("Hi!");

program.parse(process.argv);

render(<App />);

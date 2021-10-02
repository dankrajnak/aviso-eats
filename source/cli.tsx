#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './ui';

const cli = meow(`
	Usage
	  $ aviso-eats

	Options
		--name  Your name

	Examples
	  $ aviso-eats --name=Jane
	  Hello, Jane
`, {
	flags: {
		name: {
			type: 'string'
		}
	}
});

render(<App name={cli.flags.name}/>);

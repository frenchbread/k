#!/usr/bin/env node
'use strict'
import clear from 'clear'
import meow from 'meow'

import K from './'

const k = new K()

meow(`
	Usage
	  ❯ k

	Options
	  --help, -h  Show help
`)

clear()
k.init()

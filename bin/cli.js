#!/usr/bin/env node

'use strict'

const cli = require('../lib/cli')

cli.run().catch(err => {
  console.error(err)
})

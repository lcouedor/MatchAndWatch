/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import { spawnSync } from 'child_process'

sourceMapSupport.install({ handleUncaughtExceptions: false })

// Run pending DB migrations before the HTTP server starts.
// This runs regardless of how Render (or any host) invokes this file.
const migration = spawnSync('node', ['ace', 'migration:run', '--force'], {
  stdio: 'inherit',
  cwd: __dirname,
})
if (migration.status !== 0) {
  console.error('Migration failed — aborting server start')
  process.exit(migration.status ?? 1)
}

new Ignitor(__dirname)
  .httpServer()
  .start()

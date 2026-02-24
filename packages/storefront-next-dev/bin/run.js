#!/usr/bin/env node

import {execute} from '@oclif/core';

// Load .env file if present (Node.js native support)
try {
  process.loadEnvFile();
} catch {
  // .env file not found or not readable, continue without it
}

await execute({dir: import.meta.url});

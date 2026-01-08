import { defineConfig } from '@synpress/test';

export default defineConfig({
  launchOptions: {
    headless: true,   // must be explicitly true
    args: ['--no-sandbox', '--disable-dev-shm-usage'], // optional, helps WSL
  },
  // other options
});

import { defineConfig, devices } from '@playwright/test';

require('dotenv').config();

export default defineConfig({
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  globalSetup: '.auth/auth-setup.ts',
  timeout: 90000,
  use: {
    baseURL: 'https://petclinic.bondaracademy.com',
    trace: 'on-first-retry',
    storageState: '.auth/user.json',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
    },
    actionTimeout: 10000,
    viewport: {height: 1080, width: 1920}
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium'
      },
    },
  ],

});

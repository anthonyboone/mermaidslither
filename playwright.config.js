import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',fullyParallel:false,workers:1,timeout:process.env.CI?60000:45000,
  forbidOnly:Boolean(process.env.CI),retries:process.env.CI?1:0,
  expect:{timeout:8000},reporter:'list',
  use:{baseURL:'http://localhost:4173',screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'npm start',url:'http://localhost:4173',reuseExistingServer:!process.env.CI},
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1080}}},
    {name:'iphone-webkit',use:{...devices['iPhone 13'],defaultBrowserType:'webkit'}},
  ],
});

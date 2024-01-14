/* eslint-disable no-undef */
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    // env for client side
    API_BASE_URL: process.env.API_BASE_URL,
    ACCOUNT_ID_PREFIX: process.env.ACCOUNT_ID_PREFIX,
  },
  serverRuntimeConfig: {
    API_BASE_URL: process.env.API_BASE_URL,
    ACCOUNT_ID_PREFIX: process.env.ACCOUNT_ID_PREFIX,
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
};

module.exports = nextConfig;

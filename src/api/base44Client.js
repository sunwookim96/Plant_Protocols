import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "686643be86840507034f3d29", 
  requiresAuth: false // Ensure authentication is required for all operations
});

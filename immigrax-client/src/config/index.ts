// Environment configuration
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5109/api',
  
  // App Configuration
  APP_NAME: 'ImmigraX',
  APP_VERSION: '1.0.0',
  
  // Development flags
  USE_MOCK_DATA: process.env.REACT_APP_USE_MOCK_DATA === 'true' || false,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};

// Export individual config values for convenience
export const API_BASE_URL = config.API_BASE_URL;
export const USE_MOCK_DATA = config.USE_MOCK_DATA;
export const DEBUG_MODE = config.DEBUG_MODE;

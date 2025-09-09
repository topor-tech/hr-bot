export { default as FileIcon } from './FileIcon';
export { default as DownloadIcon } from './DownloadIcon';

/**
 * Get the API base URL based on the current host and protocol
 * Uses https://<host> if running on https, otherwise uses http://<host>
 */
export const getApiBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  
  // If running on localhost, use port 8000 for the API
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return `${protocol}//${host.split(':')[0]}:8000`;
  }
  
  // For production, use the same host but with the appropriate protocol
  return `${protocol}//${host}`;
};
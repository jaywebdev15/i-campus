const isDevelopment = import.meta.env.MODE === 'development';

// In development, we use the Vite proxy (/api)
// In production, we use the full URL to the server directory
export const API_BASE = isDevelopment 
    ? '/api' 
    : 'https://cloudworkz.metacoresoft.net/projects/school-management/server';

// Base path for images
export const IMAGE_BASE = isDevelopment
    ? 'http://localhost:3000/images'
    : 'https://cloudworkz.metacoresoft.net/projects/school-management/server/images';

export default API_BASE;


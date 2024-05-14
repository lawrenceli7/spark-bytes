export const API_URL: string =
    process.env.NODE_ENV === "production"
        ? 'https://spark-bytes-project-team5-production-b566.up.railway.app'
        : "http://localhost:5005";

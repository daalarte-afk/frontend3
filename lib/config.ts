export const CONFIG = {
 API_BASE_URL:
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://backendtest-4-n4ex.onrender.com",

  STORAGE_KEYS: {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
  },
  ROUTES: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
  },
  ENDPOINTS: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    POSITIONS: "/positions",
  },
} as const;

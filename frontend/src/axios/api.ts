import axios from "axios"
import Cookies from "js-cookie"

export const API_END_POINT = import.meta.env.BASE_URL ?? "http://127.0.0.1:8000"

export const api = axios.create({
    baseURL : API_END_POINT,
    headers : {
        "Content-Type": "application/json"
    },
})

export const file_api =  axios.create({
    baseURL : API_END_POINT,
       headers: {
        "Content-Type": "multipart/form-data",
    },
})

//ADD COOKIE HEADER ON REQUEST
api.interceptors.request.use(
    (config) => {
        const access = Cookies.get("access");
        const csrfToken = Cookies.get("csrftoken");

        if(access){
            config.headers.Authorization = `Bearer ${access}`;
        }
        
        if(csrfToken){
            config.headers["X-CSRFToken"] = csrfToken;
        }

        return config;
    },
    (error) => Promise.reject(error)
)

file_api.interceptors.request.use(
    (config) => {
        const access = Cookies.get("access");
        const csrfToken = Cookies.get("csrftoken");
        
        if (access) {
            config.headers.Authorization = `Bearer ${access}`;
        }
        
        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get("refresh");
                
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const response = await axios.post(`${API_END_POINT}/api/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;

                // Update cookies with new tokens
                Cookies.set("access", access, {
                    secure: true,
                    sameSite: "strict",
                });
                
                Cookies.set("refresh", refresh, {
                    secure: true,
                    sameSite: "strict",
                });

                processQueue();
                isRefreshing = false;

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // Clear cookies and redirect to login
                Cookies.remove("access");
                Cookies.remove("refresh");
                            
                const LOGIN_PATH = window.location.href = "/?next=" + window.location.pathname;

                window.location.href = LOGIN_PATH;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

file_api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get("refresh");
                
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                const response = await axios.post(`${API_END_POINT}/api/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;

                // Update cookies with new tokens
                Cookies.set("access", access, {
                    secure: true,
                    sameSite: "strict",
                });
                
                Cookies.set("refresh", refresh, {
                    secure: true,
                    sameSite: "strict",
                });

                processQueue();
                isRefreshing = false;

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                isRefreshing = false;

                // Clear cookies and redirect to login
                Cookies.remove("access");
                Cookies.remove("refresh");
                            
                const LOGIN_PATH = window.location.href = "/?next=" + window.location.pathname;

                window.location.href = LOGIN_PATH;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

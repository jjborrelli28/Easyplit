import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

export default axiosInstance;

export type AuthError<T> = { response: { data: { error: string, errors: T } } }
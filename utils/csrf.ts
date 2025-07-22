import axios from "axios"
import { API_URL } from "./axiosInstance"

export const getCSRFToken = async () => {
    try {
        await axios.get(API_URL + "/sanctum/csrf-cookie")
    } catch (error) {
        console.log(error)
    }
}
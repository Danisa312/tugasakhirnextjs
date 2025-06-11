import axios from "axios"

export const getCSRFToken = async () => {
    try {
        await axios.get(process.env.NEXT_PUBLIC_API + "/sanctum/csrf-cookie")
    } catch (error) {
        console.log(error)
    }
}
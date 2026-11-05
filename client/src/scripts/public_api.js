import { API_BASE } from "../config/api";

export const publicApi = async (action, payload) => {
    try {
        const response = await fetch(`${API_BASE}/database/public_api.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ...payload })
        });
        return await response.json();
    } catch (error) {
        console.error("Public API Error:", error);
        return { status: "failed", message: "Network error. Please try again later." };
    }
};

export const apibaseurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const imgurl = import.meta.env.BASE_URL;

export function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "🔔";
    if (type === "success") icon = "✨";
    if (type === "error") icon = "⚠️";
    
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

export function callApi(reqMethod, apiUrl, jsonData, formData, responseHandler, jwtToken = "") {
    const headers = {};

    // If JSON data is available, inform backend that request body is JSON
    if (jsonData) {
        headers["Content-Type"] = "application/json";
    }

    // Send JWT token to FastAPI using Token header
    if (jwtToken) {
        headers["Token"] = jwtToken;
    }

    // Prepare fetch request options
    const options = {
        method: reqMethod,
        headers: headers,
        body: jsonData ? JSON.stringify(jsonData) : formData ? formData : undefined
    };

    fetch(apiUrl, options)
        .then(async (res) => {
            const text = await res.text();
            let data;

            // Convert server response text into JSON
            try {
                data = text ? JSON.parse(text) : {};
            } catch (error) {
                data = {
                    code: res.status,
                    message: "Server returned non-JSON response",
                    details: text
                };
            }

            // If HTTP status is not success, show exact error
            if (!res.ok) {
                console.error("API Error Status:", res.status);
                console.error("API Error Details:", data);
                showToast("API Error: " + (data.message || JSON.stringify(data)), "error");
                return;
            }

            // Send successful response to component handler
            responseHandler(data);
        })
        .catch((err) => {
            console.error("Fetch Error:", err);
            showToast(err.message || String(err), "error");
        });
}
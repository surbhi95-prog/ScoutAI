const API_BASE_URL = "http://127.0.0.1:8000";

export async function verifyJob(jobData) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}/verify-job`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
    });

    if (!response.ok) {
        throw new Error("Failed to verify job");
    }

    return await response.json();
}

export async function getHistory() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}/history`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch history");
    }

    return await response.json();
}

export async function getReportById(id){
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        // body: JSON.stringify(jobData)
    });

    if (!response.ok) {
        throw new Error("Failed to fetch report");
    }

    return await response.json();
}

export const clearHistory = async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/history`,{
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        // body: JSON.stringify(jobData)
    });
    if(!response.ok){
        throw new Error("Failed to clear history");
    }

    return await response.json();
};

export const deleteReport = async (id) => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}/history/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete report");
    }

    return await response.json();
};

export async function extractJob(text) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_BASE_URL}/extract-job`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify({text})
    });

    if(!response.ok){
        throw new Error("Failed to extract jon details");
    }
    return await  response.json();
}

// ADMIN DASHBOARD SHIT --------------------------- 
export async function getAdminReports() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/reports`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch admin reports");
    }

    return await response.json();
}

export async function getAdminUsers() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/users`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch admin users");
    }

    return await response.json();
}

export async function getAdminDashboard() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/dashboard`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch admin dashboard");
    }

    return await response.json();
}

export async function deleteAdminReport(reportId) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/reports/${reportId}`,
        {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete report");
    }

    return await response.json();
}


export async function getAdminCompanies() {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/companies`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch companies");
    }

    return await response.json();
}


export async function addAdminCompany(companyData) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/companies`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(companyData)
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.detail || "Failed to add company"
        );
    }

    return await response.json();
}


export async function updateAdminCompany(
    companyId,
    companyData
) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_BASE_URL}/admin/companies/${companyId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(companyData)
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.detail || "Failed to update company"
        );
    }

    return await response.json();
}

import { useEffect, useState } from "react";
import {
    getAdminCompanies,
    addAdminCompany,
    updateAdminCompany
} from "../services/api";

import "./AdminCompanies.css";


function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        careers_url: "",
        ats_type: "",
        ats_identifier: "",
        is_active: true
    });

    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        loadCompanies();
    }, []);


    async function loadCompanies() {
        try {
            const data = await getAdminCompanies();
            setCompanies(data);
        } catch (err) {
            setError("Failed to load companies");
        } finally {
            setLoading(false);
        }
    }


    function openAddForm() {
        setEditingCompany(null);

        setFormData({
            name: "",
            domain: "",
            careers_url: "",
            ats_type: "",
            ats_identifier: "",
            is_active: true
        });

        setFormError("");
        setShowForm(true);
    }


    function openEditForm(company) {
        setEditingCompany(company);

        setFormData({
            name: company.name,
            domain: company.domain,
            careers_url: company.careers_url || "",
            ats_type: company.ats_type || "",
            ats_identifier: company.ats_identifier || "",
            is_active: company.is_active
        });

        setFormError("");
        setShowForm(true);
    }


    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox"
                ? checked
                : value
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setFormError("");
        setSaving(true);

        try {
            if (editingCompany) {
                const updatedCompany =
                    await updateAdminCompany(
                        editingCompany.id,
                        formData
                    );

                setCompanies((current) =>
                    current.map((company) =>
                        company.id === editingCompany.id
                            ? updatedCompany
                            : company
                    )
                );
            } else {
                const newCompany =
                    await addAdminCompany(formData);

                setCompanies((current) => [
                    ...current,
                    newCompany
                ]);
            }

            setShowForm(false);
            setEditingCompany(null);
        } catch (err) {
            setFormError(
                err.message || "Failed to save company"
            );
        } finally {
            setSaving(false);
        }
    }


    if (loading) {
        return (
            <div className="admin-companies-page">
                <h1>Companies</h1>
                <p>Loading companies...</p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="admin-companies-page">
                <h1>Companies</h1>
                <p className="error-message">
                    {error}
                </p>
            </div>
        );
    }


    return (
        <div className="admin-companies-page">

            <div className="companies-header">
                <div>
                    <h1>Companies</h1>
                    <p>
                        Manage companies used by ScoutAI
                        for job verification.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-company-button"
                    onClick={openAddForm}
                >
                    + Add Company
                </button>
            </div>


            {showForm && (
                <div className="company-form-card">

                    <div className="form-header">
                        <div>
                            <h2>
                                {editingCompany
                                    ? "Edit Company"
                                    : "Add Company"}
                            </h2>

                            <p>
                                Configure the company's
                                official verification details.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="close-form-button"
                            onClick={() => setShowForm(false)}
                        >
                            ×
                        </button>
                    </div>


                    {formError && (
                        <p className="form-error">
                            {formError}
                        </p>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Domain
                                </label>

                                <input
                                    type="text"
                                    name="domain"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    placeholder="example.com"
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Careers URL
                                </label>

                                <input
                                    type="url"
                                    name="careers_url"
                                    value={formData.careers_url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    ATS Type
                                </label>

                                <select
                                    name="ats_type"
                                    value={formData.ats_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select ATS
                                    </option>

                                    <option value="greenhouse">
                                        Greenhouse
                                    </option>

                                    <option value="workday">
                                        Workday
                                    </option>

                                    <option value="lever">
                                        Lever
                                    </option>

                                    <option value="custom">
                                        Custom
                                    </option>
                                </select>
                            </div>


                            <div className="form-group">
                                <label>
                                    ATS Identifier
                                </label>

                                <input
                                    type="text"
                                    name="ats_identifier"
                                    value={formData.ats_identifier}
                                    onChange={handleChange}
                                    placeholder="e.g. airbnb"
                                />
                            </div>


                            <label className="active-toggle">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />

                                <span>
                                    Active company
                                </span>
                            </label>

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-company-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingCompany
                                    ? "Save Changes"
                                    : "Add Company"}
                            </button>

                        </div>

                    </form>
                </div>
            )}


            {companies.length === 0 ? (
                <div className="empty-state">
                    <h3>No companies configured</h3>

                    <p>
                        Add a company to configure
                        official job verification.
                    </p>
                </div>
            ) : (

                <div className="companies-table-container">

                    <table className="companies-table">

                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Domain</th>
                                <th>ATS</th>
                                <th>Identifier</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>


                        <tbody>

                            {companies.map((company) => (

                                <tr key={company.id}>

                                    <td className="company-name">
                                        {company.name}
                                    </td>

                                    <td>
                                        {company.domain}
                                    </td>

                                    <td>
                                        {company.ats_type}
                                    </td>

                                    <td>
                                        {company.ats_identifier || "—"}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                company.is_active
                                                    ? "company-status active"
                                                    : "company-status inactive"
                                            }
                                        >
                                            {company.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="edit-company-button"
                                            onClick={() =>
                                                openEditForm(company)
                                            }
                                        >
                                            Edit
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}


export default AdminCompanies;

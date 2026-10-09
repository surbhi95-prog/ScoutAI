
import { useEffect, useState } from "react";
import {
    getScamIndicators,
    addScamIndicator,
    updateScamIndicator,
    deleteScamIndicator
} from "../../services/api";


import "./AdminScamIndicators.css";

function AdminScamIndicators() {
    const [indicators, setIndicators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const emptyForm = {
        keyword: "",
        pattern: "",
        severity: "medium",
        penalty: -10,
        is_active: true
    };

    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        loadIndicators();
    }, []);

    async function loadIndicators() {
        try {
            setError("");
            const data = await getScamIndicators();
            setIndicators(data);
        } catch (err) {
            setError(err.message || "Failed to load scam indicators");
        } finally {
            setLoading(false);
        }
    }

    function openAddForm() {
        setEditingIndicator(null);
        setFormData({ ...emptyForm });
        setFormError("");
        setSuccess("");
        setShowForm(true);
    }

    function openEditForm(indicator) {
        setEditingIndicator(indicator);
        setFormData({
            keyword: indicator.keyword,
            pattern: indicator.pattern,
            severity: indicator.severity,
            penalty: indicator.penalty,
            is_active: indicator.is_active
        });
        setFormError("");
        setSuccess("");
        setShowForm(true);
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox"
                ? checked
                : name === "penalty"
                    ? value === "" ? "" : Number(value)
                    : value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");
        setSuccess("");
        setSaving(true);

        try {
            const payload = {
                ...formData,
                penalty: Number(formData.penalty)
            };

            if (editingIndicator) {
                const updated = await updateScamIndicator(
                    editingIndicator.id,
                    payload
                );

                setIndicators((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item
                    )
                );

                setSuccess("Scam indicator updated successfully.");
            } else {
                const created = await addScamIndicator(payload);

                setIndicators((current) =>
                    [...current, created].sort((a, b) => a.id - b.id)
                );

                setSuccess("Scam indicator added successfully.");
            }

            setShowForm(false);
            setEditingIndicator(null);
        } catch (err) {
            setFormError(err.message || "Failed to save scam indicator");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(indicator) {
        const confirmed = window.confirm(
            `Delete the scam indicator "${indicator.keyword}"?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteScamIndicator(indicator.id);

            setIndicators((current) =>
                current.filter((item) => item.id !== indicator.id)
            );

            setSuccess("Scam indicator deleted successfully.");
        } catch (err) {
            setError(err.message || "Failed to delete scam indicator");
        }
    }

    async function toggleIndicator(indicator) {
        setError("");
        setSuccess("");

        try {
            const updated = await updateScamIndicator(indicator.id, {
                is_active: !indicator.is_active
            });

            setIndicators((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );

            setSuccess(
                `Indicator ${updated.is_active ? "enabled" : "disabled"} successfully.`
            );
        } catch (err) {
            setError(err.message || "Failed to update indicator status");
        }
    }

    if (loading) {
        return (
            <div className="admin-indicators-page">
                <h1>Scam Indicators</h1>
                <p>Loading scam indicators...</p>
            </div>
        );
    }

    return (
        <div className="admin-indicators-page">
            <div className="indicators-header">
                <div>
                    <h1>Scam Indicators</h1>
                    <p>
                        Manage keywords and patterns used to identify
                        potentially fraudulent job listings.
                    </p>
                </div>

                <button
                    type="button"
                    className="add-indicator-button"
                    onClick={openAddForm}
                >
                    + Add Indicator
                </button>
            </div>

            {error && (
                <p className="indicator-message indicator-error">
                    {error}
                </p>
            )}

            {success && (
                <p className="indicator-message indicator-success">
                    {success}
                </p>
            )}

            {showForm && (
                <div className="indicator-form-card">
                    <div className="indicator-form-header">
                        <div>
                            <h2>
                                {editingIndicator
                                    ? "Edit Scam Indicator"
                                    : "Add Scam Indicator"}
                            </h2>
                            <p>
                                Configure the pattern and its scoring penalty.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="indicator-close-button"
                            onClick={() => setShowForm(false)}
                        >
                            ×
                        </button>
                    </div>

                    {formError && (
                        <p className="indicator-message indicator-error">
                            {formError}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="indicator-form-grid">
                            <div className="indicator-form-group">
                                <label htmlFor="indicator-keyword">
                                    Keyword
                                </label>
                                <input
                                    id="indicator-keyword"
                                    type="text"
                                    name="keyword"
                                    value={formData.keyword}
                                    onChange={handleChange}
                                    maxLength={150}
                                    placeholder="e.g. registration fee"
                                    required
                                />
                            </div>

                            <div className="indicator-form-group">
                                <label htmlFor="indicator-pattern">
                                    Regex Pattern
                                </label>
                                <input
                                    id="indicator-pattern"
                                    type="text"
                                    name="pattern"
                                    value={formData.pattern}
                                    onChange={handleChange}
                                    maxLength={500}
                                    placeholder="e.g. registration\s+fee"
                                    required
                                />
                                <small>
                                    Enter a valid Python-compatible regex.
                                </small>
                            </div>

                            <div className="indicator-form-group">
                                <label htmlFor="indicator-severity">
                                    Severity
                                </label>
                                <select
                                    id="indicator-severity"
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="weak">Weak</option>
                                    <option value="medium">Medium</option>
                                    <option value="strong">Strong</option>
                                </select>
                            </div>

                            <div className="indicator-form-group">
                                <label htmlFor="indicator-penalty">
                                    Penalty
                                </label>
                                <input
                                    id="indicator-penalty"
                                    type="number"
                                    name="penalty"
                                    value={formData.penalty}
                                    onChange={handleChange}
                                    min={-100}
                                    max={0}
                                    required
                                />
                                <small>
                                    Allowed range: -100 to 0.
                                </small>
                            </div>

                            <label className="indicator-active-toggle">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <span>Active indicator</span>
                            </label>
                        </div>

                        <div className="indicator-form-actions">
                            <button
                                type="button"
                                className="indicator-cancel-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="indicator-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingIndicator
                                        ? "Save Changes"
                                        : "Add Indicator"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {indicators.length === 0 ? (
                <div className="indicator-empty-state">
                    <h3>No scam indicators configured</h3>
                    <p>
                        Add keywords and patterns to manage scam detection
                        signals.
                    </p>
                </div>
            ) : (
                <div className="indicators-table-container">
                    <table className="indicators-table">
                        <thead>
                            <tr>
                                <th>Keyword</th>
                                <th>Pattern</th>
                                <th>Severity</th>
                                <th>Penalty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {indicators.map((indicator) => (
                                <tr key={indicator.id}>
                                    <td className="indicator-keyword">
                                        {indicator.keyword}
                                    </td>

                                    <td className="indicator-pattern">
                                        <code>{indicator.pattern}</code>
                                    </td>

                                    <td>
                                        <span
                                            className={`severity-badge ${indicator.severity}`}
                                        >
                                            {indicator.severity}
                                        </span>
                                    </td>

                                    <td>{indicator.penalty}</td>

                                    <td>
                                        <span
                                            className={
                                                indicator.is_active
                                                    ? "indicator-status active"
                                                    : "indicator-status inactive"
                                            }
                                        >
                                            {indicator.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="indicator-row-actions">
                                            <button
                                                type="button"
                                                className="edit-indicator-button"
                                                onClick={() =>
                                                    openEditForm(indicator)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="toggle-indicator-button"
                                                onClick={() =>
                                                    toggleIndicator(indicator)
                                                }
                                            >
                                                {indicator.is_active
                                                    ? "Disable"
                                                    : "Enable"}
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-indicator-button"
                                                onClick={() =>
                                                    handleDelete(indicator)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default AdminScamIndicators;

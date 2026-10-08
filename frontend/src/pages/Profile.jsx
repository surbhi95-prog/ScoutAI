import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/api";
import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();

            setProfile(data);
            setName(data.name);
            setEmail(data.email);
        } catch (error) {
            console.error("PROFILE ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const data = await updateProfile({
                name,
                email
            });

            setProfile((previous) => ({
                ...previous,
                name: data.name,
                email: data.email
            }));

            setEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setName(profile.name);
        setEmail(profile.email);
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Unable to load profile.
                </div>
            </div>
        );
    }

    const memberSince = new Date(
        profile.created_at
    ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="profile-page">

            <div className="profile-container">

                <div className="profile-header">
                    <div>
                        <p className="profile-eyebrow">
                            ACCOUNT
                        </p>

                        <h1>My Profile</h1>

                        <p>
                            Manage your ScoutAI account and
                            view your activity.
                        </p>
                    </div>

                    {!editing && (
                        <button
                            className="edit-profile-btn"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>


                <div className="profile-grid">

                    <div className="profile-card personal-card">

                        <div className="avatar">
                            {profile.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="personal-info">

                            {editing ? (
                                <>
                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div className="profile-actions">

                                        <button
                                            className="save-btn"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>

                                        <button
                                            className="cancel-btn"
                                            onClick={handleCancel}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2>{profile.name}</h2>

                                    <p>
                                        {profile.email}
                                    </p>

                                    <span className="role-badge">
                                        {profile.role}
                                    </span>
                                </>
                            )}

                        </div>

                    </div>


                    <div className="profile-card account-card">

                        <h2>Account Information</h2>

                        <div className="account-row">
                            <span>Account ID</span>
                            <strong>#{profile.id}</strong>
                        </div>

                        <div className="account-row">
                            <span>Role</span>
                            <strong>
                                {profile.role}
                            </strong>
                        </div>

                        <div className="account-row">
                            <span>Member since</span>
                            <strong>
                                {memberSince}
                            </strong>
                        </div>

                    </div>

                </div>


                <div className="profile-card activity-card">

                    <div className="activity-heading">
                        <h2>Your ScoutAI Activity</h2>

                        <p>
                            Your verification activity at a glance.
                        </p>
                    </div>

                    <div className="stats-grid">

                        <div className="stat-box">
                            <span>🔎</span>
                            <strong>
                                {profile.total_verifications}
                            </strong>
                            <p>
                                Total Verifications
                            </p>
                        </div>

                        <div className="stat-box">
                            <span>⚠️</span>
                            <strong>
                                {profile.suspicious_jobs}
                            </strong>
                            <p>
                                Suspicious Jobs
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Profile;
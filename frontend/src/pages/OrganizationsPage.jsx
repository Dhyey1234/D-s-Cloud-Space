import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrganizationsPage.css';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const response = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched organizations:', data.organizations?.length || 0);
        setOrganizations(data.organizations || []);
      } else if (response.status === 401) {
        console.log('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        console.error('Failed to fetch organizations:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateOrg = async (orgId) => {
    if (!confirm('Are you sure you want to deactivate this organization? Members will lose access until reactivated.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orgs/${orgId}/deactivate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchOrganizations(); // Refresh the list
      }
    } catch (err) {
      console.error('Deactivate org error:', err);
    }
  };

  const handleEditOrg = (orgId) => {
    navigate(`/org/${orgId}`);
  };

  if (loading) {
    return <div className="loading">Loading organizations...</div>;
  }

  return (
    <div className="organizations-page">
      <nav className="org-nav">
        <h1>Organizations</h1>
      </nav>

      <div className="org-container">
        <div className="org-header">
          <h2>Your Organizations</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/create-organization')}
          >
            + Create Organization
          </button>
        </div>

        <div className="org-grid">
          {organizations.length === 0 ? (
            <p className="no-orgs">No organizations yet. Create one to get started!</p>
          ) : (
            <>
              <p style={{ gridColumn: '1 / -1', fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                Found {organizations.length} organization(s)
              </p>
              {organizations.map((org) => (
                <div key={org._id} className="org-card">
                <div className="org-card-content">
                  <div className="org-card-header">
                    <h3>{org.name}</h3>
                    <span className="org-role">{org.role.toUpperCase()}</span>
                  </div>
                  <p className="org-desc">{org.description || 'No description'}</p>
                  <div className="org-stats">
                    <span className="stat">👥 1 member</span>
                  </div>
                </div>
                <div className="org-card-footer">
                  <button
                    className="open-btn"
                    onClick={() => handleSwitchOrg(org._id)}
                  >
                    ⚙️ Open Settings
                  </button>                  <button
                    className="btn btn-secondary btn-edit"
                    onClick={() => handleEditOrg(org._id)}
                  >
                    ✏️ Edit
                  </button>
                  {org.status !== 'suspended' && (
                    <button
                      className="btn btn-danger btn-deactivate"
                      onClick={() => handleDeactivateOrg(org._id)}
                    >
                      🚫 Deactivate
                    </button>
                  )}
                  {org.status === 'suspended' && (
                    <span className="org-status">🚫 Suspended</span>
                  )}                </div>
              </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OrganizationSettingsPage.css';

export default function OrganizationSettingsPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile'); // profile, members, invite, policies
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrgDetails();
  }, [orgId]);

  const fetchOrgDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const [orgRes, membersRes] = await Promise.all([
        fetch(`/api/orgs/${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/orgs/${orgId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrg(orgData.organization);
        setFormData({
          name: orgData.organization.name,
          description: orgData.organization.description || '',
        });
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch org details:', err);
      setError('Failed to fetch organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orgs/${orgId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to update organization');
      } else {
        setMessage('Organization updated successfully');
        setOrg(data.organization);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!inviteEmail) {
      setError('Email is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orgs/${orgId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to send invite');
      } else {
        setMessage(`Invite sent to ${inviteEmail}`);
        setInviteEmail('');
        setInviteRole('member');
      }
    } catch (err) {
      console.error('Invite error:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orgs/${orgId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMembers(members.filter((m) => m._id !== memberId));
        setMessage('Member removed');
      }
    } catch (err) {
      console.error('Remove error:', err);
      setError('Failed to remove member');
    }
  };

  if (loading) {
    return <div className="loading">Loading organization settings...</div>;
  }

  return (
    <div className="org-settings-page">
      <nav className="settings-nav">
        <button onClick={() => navigate('/organizations')}>← Back to Organizations</button>
        <h1>{org?.name} Settings</h1>
      </nav>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${tab === 'members' ? 'active' : ''}`}
            onClick={() => setTab('members')}
          >
            Members
          </button>
          <button
            className={`tab-btn ${tab === 'invite' ? 'active' : ''}`}
            onClick={() => setTab('invite')}
          >
            Invite
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {tab === 'profile' && (
          <div className="settings-panel">
            <h2>Organization Profile</h2>
            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Organization Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {tab === 'members' && (
          <div className="settings-panel">
            <h2>Organization Members</h2>
            <div className="members-list">
              {members.map((member) => (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <p className="member-name">{member.user.name}</p>
                    <p className="member-email">{member.user.email}</p>
                  </div>
                  <div className="member-details">
                    <span className="member-role">{member.role}</span>
                    <span className="member-status">{member.status}</span>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={member.role === 'owner'}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'invite' && (
          <div className="settings-panel">
            <h2>Invite New Member</h2>
            <form onSubmit={handleInviteMember} className="settings-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Send Invite
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/AcceptInvitePage.css';

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAcceptInvite = async () => {
    setLoading(true);
    setError('');

    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        setError('You must be logged in to accept an invite');
        return;
      }

      const response = await fetch(`/api/orgs/invite/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to accept invite');
      } else {
        setMessage('Invite accepted! Redirecting...');
        setTimeout(() => navigate('/organizations'), 2000);
      }
    } catch (err) {
      console.error('Accept invite error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="accept-invite-page">
      <div className="invite-card">
        <h1>Accept Organization Invite</h1>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {!message && (
          <>
            <p>You have been invited to join an organization on D's Cloud Space.</p>
            <button
              className="btn btn-primary btn-large"
              onClick={handleAcceptInvite}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Accept Invite'}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/')}
            >
              Decline
            </button>
          </>
        )}
      </div>
    </div>
  );
}

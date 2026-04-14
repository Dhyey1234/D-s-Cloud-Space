import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(1024); // 1GB in MB
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchFiles(token);
  }, [navigate]);

  const fetchFiles = async (token) => {
    try {
      const response = await fetch('/api/files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        const totalSize = data.files.reduce((acc, file) => acc + parseFloat(file.size), 0);
        setStorageUsed(totalSize);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFiles([...files, data.file]);
        setStorageUsed((prev) => prev + parseFloat(data.file.size));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const deletedFile = files.find((f) => f.id === fileId);
        setFiles(files.filter((f) => f.id !== fileId));
        if (deletedFile) {
          setStorageUsed((prev) => prev - parseFloat(deletedFile.size));
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  const getStoragePercentage = () => {
    return (storageUsed / storageLimit) * 100;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="nav-left">
          <h2>📁 D's Cloud Space</h2>
        </div>
        <div className="nav-right">
          <span className="user-name">Welcome, {user?.name}!</span>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/organizations')}
            title="Manage Organizations"
          >
            Organizations
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="home-container">
        <div className="home-header">
          <h1>Your Cloud Storage Dashboard</h1>
          <p>Manage your files securely in the cloud</p>
        </div>

        {/* Storage Overview */}
        <div className="storage-overview">
          <div className="storage-card">
            <h3>Storage Usage</h3>
            <div className="storage-bar">
              <div
                className="storage-fill"
                style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
              ></div>
            </div>
            <div className="storage-text">
              <span>{formatFileSize(storageUsed)} used</span>
              <span>{formatFileSize(storageLimit)} total</span>
            </div>
            <p className="storage-percentage">{getStoragePercentage().toFixed(1)}% used</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-info">
                <h4>{files.length}</h4>
                <p>Total Files</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-info">
                <h4>{formatFileSize(storageLimit - storageUsed)}</h4>
                <p>Available</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-info">
                <h4>100%</h4>
                <p>Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <label htmlFor="file-input" className="upload-button">
              <div className="upload-icon">⬆️</div>
              <div className="upload-text">
                <h3>Upload Files</h3>
                <p>Drag & drop or click to browse</p>
              </div>
              <input
                id="file-input"
                type="file"
                onChange={handleUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="action-card">
            <div className="action-icon">📂</div>
            <div className="action-text">
              <h3>Create Folder</h3>
              <p>Organize your files</p>
            </div>
          </div>

          <div className="action-card">
            <div className="action-icon">🔗</div>
            <div className="action-text">
              <h3>Share Files</h3>
              <p>Generate shareable links</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="activity-item">
                <div className="activity-icon">📄</div>
                <div className="activity-info">
                  <p><strong>{file.name}</strong> uploaded</p>
                  <small>{new Date(file.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="no-activity">
                <p>No recent activity. Upload your first file!</p>
              </div>
            )}
          </div>
        </div>

        {/* Files Section */}
        <div className="files-section">
          <div className="files-header">
            <h2>Your Files ({files.length})</h2>
            <div className="files-filters">
              <button className="filter-btn active">All Files</button>
              <button className="filter-btn">Images</button>
              <button className="filter-btn">Documents</button>
              <button className="filter-btn">Videos</button>
            </div>
          </div>

          {files.length === 0 ? (
            <div className="no-files">
              <div className="no-files-icon">📂</div>
              <h3>No files yet</h3>
              <p>Upload your first file to get started with D's Cloud Space</p>
              <label htmlFor="file-input" className="btn btn-primary">
                Upload File
                <input
                  id="file-input"
                  type="file"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <div className="files-grid">
              {files.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-icon">📄</div>
                  <div className="file-actions">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(file.id)}
                      title="Delete file"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="file-info">
                    <h3 title={file.name}>{file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}</h3>
                    <p>{formatFileSize(file.size)}</p>
                    <small>{new Date(file.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="home-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Secure file storage</li>
                <li>Fast uploads & downloads</li>
                <li>Cross-device sync</li>
                <li>Advanced sharing</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>About</h4>
              <p>D's Cloud Space - Your personal cloud storage solution built with modern web technologies.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 D's Cloud Space. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

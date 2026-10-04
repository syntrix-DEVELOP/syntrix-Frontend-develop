import React, { useState } from 'react';

// ==========================================
// 1. THE DOCUMENT VERIFICATION COMPONENT
// ==========================================
const DocumentMode = ({ userEmail }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  
  // 🚀 NEW: State for Temporal Rate Limiting & AI Routing
  const [taskType, setTaskType] = useState('notes'); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Generate object URL for the live preview window
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file || !userEmail) {
      setStatus('error');
      setMessage('Please select or capture a file and ensure you are logged in.');
      return;
    }

    setStatus('loading');
    setMessage('Compressing and queuing your document...');

    try {
      const base64String = await convertToBase64(file);

      // 🚀 MODIFIED: Payload structured for the new /api/upload-task architecture
      const payload = {
        userEmail,
        taskType, 
        fileName: file.name || 'camera_capture.jpg',
        imageBase64: base64String
      };

      // 🚀 MODIFIED: Pointing to the new Waiting Room endpoint
      const targetUrl = process.env.REACT_APP_BACKEND_URL 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/upload-task` 
        : '/api/upload-task';

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Queued for Verification! Your reward will be allocated shortly.');
        setFile(null); 
        setPreviewUrl('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Could not connect to the waiting room.');
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '40px auto',
      padding: '40px 30px',
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
        Document Verification
      </h2>
      <p style={{ color: '#475569', fontSize: '15px', marginBottom: '30px', lineHeight: '1.6', fontWeight: '500' }}>
        Upload your physical document. Our system will securely process and verify it before granting your reward.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ================= 🗂️ TASK TYPE SELECTOR ================= */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: '14px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
            Select Task Type:
          </label>
          <select 
            value={taskType} 
            onChange={(e) => setTaskType(e.target.value)}
            disabled={status === 'loading'}
            style={{
              width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #cbd5e1', 
              outline: 'none', fontSize: '15px', color: '#334155', background: '#f8fafc', 
              cursor: status === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="notes">📝 Physical Notes / Document</option>
            <option value="selfie">🤳 Human Selfie Check</option>
          </select>
        </div>

        {/* ================= 📸 1. THE CAMERA ACTION ZONE ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'inline-block',
            transition: 'all 0.2s ease'
          }}>
            📷 Open Camera & Take Photo
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleFileChange}
              disabled={status === 'loading'}
              style={{ display: 'none' }}
            />
          </label>

          {/* Live Preview Window Container */}
          {previewUrl && (
            <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden', background: '#000', marginTop: '8px', position: 'relative' }}>
              <img src={previewUrl} alt="Snapped Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', fontStyle: 'italic', lineHeight: '1.4' }}>
            "Ensure your handwriting/face is clear, well-lit, and the photo is shot vertically."
          </p>
        </div>
        
        {/* ================= UPLOAD TRIGGER BUTTON ================= */}
        <button 
          onClick={handleUpload} 
          disabled={status === 'loading' || !file}
          style={{
            background: status === 'loading' || !file ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: status === 'loading' || !file ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: status === 'loading' || !file ? 'none' : '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
          }}
        >
          {status === 'loading' ? 'Processing...' : 'Submit Document'}
        </button>
      </div>
      
      {status === 'loading' && <p style={{ marginTop: '20px', color: '#ea580c', fontWeight: '700', fontSize: '14px' }}>⏳ {message}</p>}
      {status === 'success' && <p style={{ marginTop: '20px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>✨ {message}</p>}
      {status === 'error' && <p style={{ marginTop: '20px', color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>⚠️ {message}</p>}
    </div>
  );
};


// ==========================================
// 2. THE MASTER LAYOUT COMPONENT (APP)
// ==========================================
const App = () => {
  const [emailInput, setEmailInput] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('document'); // 'survey' or 'document'

  const handleLogin = (e) => {
    e.preventDefault();
    if (emailInput.trim().includes('@')) {
      setUserEmail(emailInput.trim().toLowerCase());
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    setEmailInput('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      backgroundImage: 'radial-gradient(at 40% 20%, #e0e7ff 0px, transparent 50%), radial-gradient(at 80% 0%, #ede9fe 0px, transparent 50%)',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      padding: '20px'
    }}>
      
      {/* ================= TOP LOGIN / AUTH BAR ================= */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 30px auto',
        padding: '20px 30px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ fontWeight: '900', fontSize: '20px', color: '#0f172a', letterSpacing: '-0.5px' }}>
          SYNTRIX
        </div>

        {!userEmail ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
            <input 
              type="email" 
              placeholder="Enter email to continue..." 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
            />
            <button 
              type="submit"
              style={{ background: '#0f172a', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              Verify
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#475569', fontWeight: '600', fontSize: '14px' }}>
              Logged in as: <span style={{ color: '#10b981' }}>{userEmail}</span>
            </span>
            <button 
              onClick={handleLogout}
              style={{ background: '#fee2e2', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT NAVIGATION ================= */}
      {userEmail && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#ffffff', padding: '8px', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <button 
              onClick={() => setActiveTab('document')}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'document' ? '#4f46e5' : 'transparent', color: activeTab === 'document' ? '#ffffff' : '#64748b'
              }}
            >
              📄 Document Mode
            </button>
            <button 
              onClick={() => setActiveTab('survey')}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'survey' ? '#4f46e5' : 'transparent', color: activeTab === 'survey' ? '#ffffff' : '#64748b'
              }}
            >
              📝 Survey Mode
            </button>
          </div>

          {/* Render the Active Mode */}
          {activeTab === 'document' && (
            <DocumentMode userEmail={userEmail} />
          )}

          {activeTab === 'survey' && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>Survey Module Placeholder</h3>
              <p style={{ color: '#64748b' }}>Your survey questions will render here, completely isolated from the document upload logic.</p>
            </div>
          )}
          
        </div>
      )}

      {/* State when not logged in */}
      {!userEmail && (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
          <h2 style={{ color: '#0f172a' }}>Authentication Required</h2>
          <p style={{ color: '#64748b' }}>Please enter your email above to access the platform.</p>
        </div>
      )}

    </div>
  );
};

export default App;
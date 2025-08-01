import React, { useState } from 'react';
import './UploadPage.css';

const UploadPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !name || !expiry) {
      setMessage('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('expiry_date', expiry);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();
      setMessage(data.message || 'Upload complete');

      if (res.ok) {
        setName('');
        setDescription('');
        setExpiry('');
        setFile(null);
      }
    } catch (err) {
      setMessage('Upload failed. Try again.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload New Document</h2>
      {message && <div className="message-box">{message}</div>}
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Document Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the document purpose (optional)"
          />
        </div>

        <div className="form-group">
          <label>Expiry Date:</label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload File:</label>
          <input
            type="file"
            accept=".pdf,.docx,.jpg,.png"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Upload</button>
      </form>
    </div>
  );
};

export default UploadPage;

import React, { useState } from 'react';
import axios from '../api';

const UploadProject = ({ onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Choose a file');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('image_file', file);

    try {
      const res = await axios.post('/projects/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Uploaded successfully');
      onUploadSuccess(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to upload');
    }
  };

  return (
    <div style={{ padding: '20px', borderRadius: '8px', display: 'flex' }}>
    <form onSubmit={handleSubmit} style={{ Width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column' , border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
      <h3>Create New Project</h3>
      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 10 }}
      />
      <textarea
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        style={{ width: '100%', height: 80, marginBottom: 10 }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
        style={{ marginBottom: 10 }}
      />
      <br />
      <button type="submit">Upload</button>
    </form>
    </div>
  );
};

export default UploadProject;

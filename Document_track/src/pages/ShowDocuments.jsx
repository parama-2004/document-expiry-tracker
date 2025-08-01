// src/pages/ShowDocuments.jsx
import React, { useEffect, useState } from 'react';
import './ShowDocuments.css';

const ShowDocuments = () => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/public-documents')
            .then(res => res.json())
            .then(data => setDocuments(data))
            .catch(() => setDocuments([]));
    }, []);

    return (
        <div className="show-documents-container">
            <h2>Public Documents</h2>
            <ul className="doc-list">
                {documents.map(doc => (
                    <li key={doc.id} className="doc-card">
                        <h4>{doc.name}</h4>
                        <p>{doc.description}</p>
                        <span className="expiry">Expires: {doc.expiry_date}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShowDocuments;

import React from 'react';

const DocumentTable = ({ documents, isAdmin, onToggleVisibility }) => {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Expiry</th>
          <th>Status</th>
          {isAdmin && <th>Visibility</th>}
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.name}</td>
            <td>{doc.expiry}</td>
            <td>{doc.status}</td>
            {isAdmin && (
              <td>
                <button onClick={() => onToggleVisibility(doc.id)}>
                  {doc.visible ? 'Hide' : 'Show'}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DocumentTable;
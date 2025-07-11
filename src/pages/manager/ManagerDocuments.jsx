import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase'; // adjust path if needed
import '../../assets/styles/admin.css';

function ManagerDocuments() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', file: null });
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);

  const storage = getStorage();

  useEffect(() => {
    fetchDocuments();

    // Get current logged-in user
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, 'documents'));
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDocuments(docs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileURL = '';
      if (formData.file) {
        const storageRef = ref(storage, `documents/${Date.now()}_${formData.file.name}`);
        await uploadBytes(storageRef, formData.file);
        fileURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'documents'), {
        name: formData.name,
        description: formData.description,
        fileURL,
        timestamp: serverTimestamp(),
        uploadedBy: user?.email || 'Unknown'
      });

      setFormData({ name: '', description: '', file: null });
      setShowForm(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  return (
    <>
      {!showForm ? (
        // DOCUMENTS HOME PAGE
        <div className='users-container'>
          <h1 className='welcome-title'>Documents</h1>

          <div className='button-container'>
            <button
              className='today-task-button'
              onClick={() => setShowForm(true)}
            >
              Upload Document
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Description</th>
                <th>Uploaded By</th>
                <th>Uploaded At</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{doc.description}</td>
                  <td>{doc.uploadedBy || 'N/A'}</td>
                  <td>{doc.timestamp?.toDate().toLocaleString() || 'Pending'}</td>
                  <td>
                    {doc.fileURL ? (
                      <a href={doc.fileURL} target="_blank" rel="noopener noreferrer">View</a>
                    ) : 'No File'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // DOCUMENT UPLOAD FORM
        <div className="users-container">
          <h2 className='welcome-title'>Upload Document</h2>
          <form className="form-box" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Document Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              required
            />
            <button type="submit" className='submit-button'>Submit</button>
            <button
              type="button"
              className='cancel-button'
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ManagerDocuments;

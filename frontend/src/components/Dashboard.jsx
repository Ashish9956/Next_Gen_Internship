import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [viewOption, setViewOption] = useState('all'); // 'all', 'my', 'add'
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [editDocument, setEditDocument] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState(''); // State for success/failure message
  const navigate = useNavigate(); // Navigation hook

  // Fetch documents based on the view option
  const fetchDocuments = async () => {
    const url = viewOption === 'all' ? '/api/v1/documents' : '/api/v1/documents/my';
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [viewOption]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDocument((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.description.trim()) return;
    try {
      const response = await axios.post('/api/v1/documents', newDocument, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDocuments((prevDocs) => [...prevDocs, response.data]);
      setNewDocument({ title: '', description: '', imageUrl: '' });
      setMessage('Document added successfully!'); // Success message
      setTimeout(() => {
        setMessage('');
        setViewOption('my'); // Navigate to My Documents
      }, 3000);
    } catch (error) {
      console.error('Error adding document:', error);
      setMessage('Error adding document. Please try again.'); // Failure message
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDocument((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditStart = (index) => {
    setEditIndex(index);
    setEditDocument(documents[index]);
  };

  const handleUpdateDocument = async (id) => {
    if (!editDocument.title.trim() || !editDocument.description.trim()) return;
    try {
      const response = await axios.put(`/api/v1/documents/${id}`, editDocument, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedDocuments = documents.map((doc, index) =>
        index === editIndex ? response.data : doc
      );
      setDocuments(updatedDocuments);
      setEditIndex(null);
      setEditDocument({ title: '', description: '', imageUrl: '' });
      setMessage('Document updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating document:', error);
      setMessage('Error updating document. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveDocument = async (id) => {
    try {
      await axios.delete(`/api/v1/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
      setMessage('Document deleted successfully!');
      setTimeout(() => {
        setMessage('');
        setViewOption('my'); // Navigate to My Documents
      }, 3000);
    } catch (error) {
      console.error('Error removing document:', error);
      setMessage('Error removing document. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex space-x-6">
          <div className="flex flex-col items-start space-y-4 w-48 bg-white p-4 rounded-xl shadow-lg">
            <button
              onClick={() => setViewOption('all')}
              className="text-indigo-600 font-semibold hover:bg-indigo-100 w-full py-2 px-4 rounded-lg"
            >
              All Documents
            </button>
            <button
              onClick={() => setViewOption('my')}
              className="text-indigo-600 font-semibold hover:bg-indigo-100 w-full py-2 px-4 rounded-lg"
            >
              My Documents
            </button>
            <button
              onClick={() => setViewOption('add')}
              className="text-indigo-600 font-semibold hover:bg-indigo-100 w-full py-2 px-4 rounded-lg"
            >
              Add Document
            </button>
          </div>

          <div className="w-full">
            {message && (
              <div className="p-4 text-center text-white bg-green-500 rounded-lg mb-6">{message}</div>
            )}
            {viewOption === 'add' ? (
              <div>
                <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-600">Add Document</h2>
                <div className="mb-6">
                  <input
                    type="text"
                    name="title"
                    value={newDocument.title}
                    onChange={handleChange}
                    placeholder="Document Title"
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    name="description"
                    value={newDocument.description}
                    onChange={handleChange}
                    placeholder="Document Description"
                    rows="4"
                    className="w-full p-4 mt-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="url"
                    name="imageUrl"
                    value={newDocument.imageUrl}
                    onChange={handleChange}
                    placeholder="Image URL (optional)"
                    className="w-full p-4 mt-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddDocument}
                    className="w-full py-3 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-600">
                  {viewOption === 'all' ? 'All Documents' : 'My Documents'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.length === 0 ? (
                    <p className="text-center text-gray-500 col-span-3">No documents available.</p>
                  ) : (
                    documents.map((doc, index) => (
                      <div key={doc._id} className="flex flex-col bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        {editIndex === index ? (
                          <div>
                            <input
                              type="text"
                              name="title"
                              value={editDocument.title}
                              onChange={handleEditChange}
                              className="p-3 border border-gray-300 rounded-md"
                            />
                            <textarea
                              name="description"
                              value={editDocument.description}
                              onChange={handleEditChange}
                              rows="4"
                              className="p-3 border border-gray-300 rounded-md"
                            />
                            <input
                              type="url"
                              name="imageUrl"
                              value={editDocument.imageUrl}
                              onChange={handleEditChange}
                              placeholder="Image URL"
                              className="p-3 border border-gray-300 rounded-md"
                            />
                            <div className="flex space-x-4 mt-4">
                              <button
                                onClick={() => handleUpdateDocument(doc._id)}
                                className="text-white bg-indigo-600 py-2 px-4 rounded-lg"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => setEditIndex(null)}
                                className="text-red-500 py-2 px-4 rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-xl font-semibold text-indigo-600">{doc.title}</h3>
                            <p className="text-gray-700">{doc.description}</p>
                            <img src={doc.imageUrl} alt={doc.title} className="mt-4 h-40 w-full object-cover rounded-lg" />
                            <div className="flex space-x-4 mt-6">
                              <button
                                onClick={() => handleEditStart(index)}
                                className="text-yellow-500 py-2 px-4 rounded-lg"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveDocument(doc._id)}
                                className="text-red-500 py-2 px-4 rounded-lg"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

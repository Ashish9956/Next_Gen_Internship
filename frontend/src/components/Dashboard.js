import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                // Extract the token from the parsed object
                const token = user ? user.token : null;
                const { data } = await axios.get('http://localhost:5000/api/documents', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDocuments(data);
                // console.log(data)
            } catch (error) {
                console.error('Failed to fetch documents:', error);
                navigate('/');
            }
        };
        fetchDocuments();
    }, [navigate]);

    return (
        <div className="container">
        <h2 className="my-4">Dashboard</h2>
        <div className="row">
            {documents.map((doc) => (
                <div key={doc._id} className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{doc.title}</h5>
                            <p className="card-text">Created on: {new Date(doc.createdAt).toLocaleDateString()}</p>
                            <Link to={`/document/${doc._id}`} className="btn btn-primary mt-auto">Open Document</Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div className="text-center">
            <button className="btn btn-success mt-4" onClick={() => navigate('/document/new')}>Create New Document</button>
        </div>
    </div>
);
};

export default Dashboard;
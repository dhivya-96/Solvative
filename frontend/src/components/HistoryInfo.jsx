import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles/HistoryInfo.css';
const HistoryInfo = ({type}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchHistory = async () => {
            let urlname;
            try {
                urlname = type=='p5'?"P5History": "rewardsHistory";
                
                const response = await axios.get(`http://localhost:8080/${urlname}`,{
                    params:  type=='p5' ?{senderid :id}:{receiverid:id} 
                }); 
                
                setHistory(response?.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/p5-history/${id}`); // Replace with your API endpoint for delete
            setHistory(history.filter(entry => entry.id !== id));
        } catch (err) {
            setError(err.message || 'An error occurred while deleting');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container">
            <table className="table">
                <thead>
                    <tr>
                        <th className="header">#</th>
                        <th className="header">Date-Time</th>
                        <th className="header">P5 Given</th>
                        <th className="header">User Name</th>
                       {type=='p5' && <th className="header">Delete</th>}
                    </tr>
                </thead>
                <tbody>
                    {history.length>0?(history.map((entry, index) => (
                        <tr key={entry.id}>
                            <td className="cell">{index + 1}</td> {/* Auto-incremented # */}
                            <td className="cell">{entry.timestamp}</td>
                            <td className="cell">{entry.reward}</td>
                            <td className="cell">{entry.receiverName}</td>
                            {type=='p5' && <td className="cell">
                                <button
                                    className="button"
                                    onClick={() => handleDelete(entry.id)}
                                >
                                    Delete
                                </button>
                            </td>}
                        </tr>
                    ))):<tr >
                        <td colSpan={5} className='align-center'>No records found</td>
                    </tr>
                    }
                </tbody>
            </table>
        </div>
    );
};

export default HistoryInfo;

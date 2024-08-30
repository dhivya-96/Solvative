import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/ListUsers.css';
import { FaUserEdit } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

const ListUsers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/new');
  };

  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:8080/')
      .then(response => {
        setData(response.data); 
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Render loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render table with data
  return (
    <div className="App">
    <button className="new-user-button" onClick={handleClick}>
      New User
    </button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>PF Points</th>
            <th>Reward Points</th>
            <th>Login</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.PF}</td>
              <td>{item.reward?item.reward:0}</td>
              <td> <Link to={`/user/${item.id}`}><FaUserEdit/></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListUsers;

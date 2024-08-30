import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/NewUser.css'

const NewUser = () => {
  const [name, setName] = useState('');
  
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:8080/newuser', {
        name,
        PF:100,
        reward:0
      });
      // Handle success response
      console.log('User created:', response.data);
      navigate('/'); // Redirect to home page on success
    } catch (error) {
      // Handle error response
      console.error('Error creating user:', error);
    }
  };

  const handleCancel = () => {
    navigate('/'); 
  };

  return (
    <div className="new-user-container">
    <form className="new-user-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-buttons">
        <button type="button" className="save-button" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  </div>
  );
};

export default NewUser;

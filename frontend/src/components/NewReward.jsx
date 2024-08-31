import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./styles/NewReward.css";
import { useNavigate } from "react-router-dom";

const NewRewardPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);
  const [error, setError] = useState(null);
  const [existingPFPoints, setExistingPFPoints] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/");
        setExistingPFPoints(response?.data.filter((val) => val.id == id)[0].PF);
        setUsers(response.data);
      } catch (err) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const handleCancel = () => {
    setSelectedUser("");
    setRewardAmount("");
    setError(null);
    navigate(`/user/${id}/p5`);
  };

  const handleSelectUser = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUser || rewardAmount <= 0 || rewardAmount > 100) {
      setError("Please select a user and enter a valid reward amount (1-100).");
      return;
    }

    let selectedUserInfo = users.filter((val) => val.id == selectedUser)[0];

    console.log("selected user value", selectedUserInfo);
    try {
      await axios.post("http://localhost:8080/addReward", {
        senderid: parseInt(id),
        receiverid: parseInt(selectedUserInfo.id),
        reward: parseInt(rewardAmount),
      });
      alert("Reward submitted successfully");
      setSelectedUser("");
      setRewardAmount("");
      navigate(`/user/${id}/p5`);
    } catch (err) {
      setError("Failed to submit reward");
    }
  };

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userSelect">Select User:</label>
          <select
            id="userSelect"
            value={selectedUser}
            onChange={(e) => handleSelectUser(e)}
          >
            <option value="">Select a user</option>
            {users
              .filter((val) => val.id != id)
              .map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="rewardAmount">Reward Amount:</label>
          <input
            id="rewardAmount"
            type="number"
            value={rewardAmount}
            onChange={(e) => setRewardAmount(e.target.value)}
            min="1"
            max={existingPFPoints ? existingPFPoints : "100"}
          />
          {existingPFPoints !== 0 && (
            <p className="note">Existing PF Points: {existingPFPoints}</p>
          )}
        </div>
        <div className="form-buttons">
          <button
            type="submit"
            className="submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRewardPage;

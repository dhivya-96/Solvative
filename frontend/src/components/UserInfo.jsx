import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "./styles/UserInfo.css";

const UserInfo = ({ type }) => {
  const [name, setName] = useState("");
  const { id } = useParams();
  const [userData, setUserData] = useState({});
  const [isValid, setIsValid] = useState(true);
  
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const checkUser = async () => {
    try {
      // Check if user exists
      const response = await axios.get(`http://localhost:8080/getuser/${id}`);
      setName(response?.data?.name);
      setUserData(response?.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (type == "exists") {
      checkUser();
    }
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (value.trim() === '') {
        setError('Username is required.');
        setIsValid(false);
    } else if (value.length < 3) {
        setError('Username atleast 3 characters.');
        setIsValid(false);
    } else {
        setError('');
        setIsValid(true);
    }
};

  const handleSave = async () => {
    try {
      const userType = type == "exists" ? "edituser" : "newuser";
      const reqBody =
        type == "exists"
          ? { name, id: parseInt(id) }
          : {
              name,
              PF: 100,
              reward: 0,
            };

      const response = await axios.post(
        `http://localhost:8080/${userType}`,
        reqBody
      );

      console.log("User created:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleP5Click = () => {
    navigate(`/user/${id}/p5`);
  };

  const handleRewardsClick = () => {
    navigate(`/user/${id}/rewards`);
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
            onChange={(e) =>handleNameChange(e)}
            required
          />
          {error && <p className="error">{error}</p>}
        </div>

        <div className="form-buttons">
          <button type="button" className="save-button" onClick={handleSave}>
            Save
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
      {type == "exists" && (
        <div>
          <div class="info">
            <span>P5 Points :</span>
            <button
              type="button"
              className="align-button"
              onClick={handleP5Click}
            >
              {userData?.PF ? userData?.PF : 0}
            </button>
          </div>
          <div class="info">
            <span>Rewards : </span>
            <button
              type="button"
              className="align-button"
              onClick={handleRewardsClick}
            >
              {userData?.reward ? userData?.reward : 0}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;

import React from 'react';
import { useLocation, Link, useMatch as testMatch } from 'react-router-dom';
import './styles/AppBar.css'; // Import the CSS file for styling

const AppBar = () => {
const location = useLocation();
const path = location.pathname;


  // Determine the title based on the current route
  const getTitle = () => {
    if (path.startsWith('/user/')) {
      return 'User Details';
    }
    // if (useMatch('/posts/:postId')) {
    //   return 'Post Details';
    // }

    switch (location.pathname) {
    case '/':
        return 'List all users';
    case '/new':
        return 'Create User';
    //   case '/about':
    //     return 'About Us';
    //   case '/contact':
    //     return 'Contact Us';
      default:
        return 'My App';
    }
  };

  return (
    <div className="appbar">
      <div className="appbar-title">
        {getTitle()}
      </div>
      {/* <div className="appbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/users/1">User 1</Link>
        <Link to="/posts/42">Post 42</Link>
      </div> */}
    </div>
  );
};

export default AppBar;

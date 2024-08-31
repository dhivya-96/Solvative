import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppBar from './components/AppBar';
import Listusers from './components/ListUsers';
import UserInfo from './components/UserInfo';
import HistoryInfo from './components/HistoryInfo'

// import About from './pages/About';
// import Contact from './pages/Contact';

const App = () => {
  return (
    <Router>
      <AppBar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Listusers />} />
          <Route path="/user/:id" element={<UserInfo type="exists" />}></Route>
          <Route path="/new" element={<UserInfo type="new" />} />
          <Route path="/user/:id/p5" element={<HistoryInfo type='p5' />} />
          <Route path="/user/:id/rewards" element={<HistoryInfo type='reward'/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

// src/StorybookGrid.js
import { Link } from 'react-router-dom';
import './App.css';
import './normal.css';
import React from 'react';


const StorybookGrid = () => {
  // Your code for the storybook grid goes here

  return (
    <div className="grid-container">
      {/* Your story thumbnails and other grid content go here */}
      <Link to="/chat" className="sidemenu-button">
        <span>+</span>
        New Chat
      </Link>
    </div>
  );
};

export default StorybookGrid;

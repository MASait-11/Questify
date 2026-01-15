/*
 * React Entry Point
 * This file renders the root App component into the DOM.
 * It's the first file that runs when the React app starts.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './components/components.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


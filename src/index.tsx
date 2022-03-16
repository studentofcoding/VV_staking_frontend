import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { App } from './App';

ReactDOM.render(
    <StrictMode>  
        <Router>
            <Routes>
                <Route path="/home" element={<App page="home"/>} />
                <Route path="/stake" element={<App page="stake" />} />
                <Route path="/claim" element={<App page="claim" />} />
                <Route path="/config" element={<App page="config" />} />
                <Route path="/" element={<App page="combined" />} />
            </Routes>
        </Router>
    </StrictMode>,
    document.getElementById('app')
);

import React from 'react';
import './Content.css';

const Content = ({ children }) => {
    return (
        <div className="content-container">
            {children}
        </div>
    );
};

export default Content;
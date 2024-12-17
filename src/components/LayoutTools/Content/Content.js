import React from 'react';

const Content = ({ children }) => {
    return (
        <div className="flex flex-1 bg-blue-500 w-screen">
            {children}
        </div>
    );
};

export default Content;
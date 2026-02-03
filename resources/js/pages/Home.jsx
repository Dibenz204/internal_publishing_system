import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    React + Laravel
                </h1>
                <p className="text-gray-600">
                    Welcome to your React app integrated with Laravel!
                </p>
                <div className="mt-6">
                    <a
                        href="/welcome"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Laravel Welcome Page
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;
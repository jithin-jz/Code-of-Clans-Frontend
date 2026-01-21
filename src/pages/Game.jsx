import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Game = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/');
    }, [navigate]);
    return null;
};

export default Game;

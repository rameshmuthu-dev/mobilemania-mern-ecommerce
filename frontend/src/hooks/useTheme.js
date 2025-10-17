// src/hooks/useTheme.js

import { useEffect } from 'react'; 
import { useSelector } from 'react-redux'; 

const useTheme = () => {
    const { mode } = useSelector((state) => state.theme); 

    useEffect(() => {
        const html = document.documentElement;
        if (mode === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [mode]);
};

export default useTheme;
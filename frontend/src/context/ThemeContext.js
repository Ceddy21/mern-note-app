import React, {createContext, useState, useContext, useEffect} from 'react';

const themeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() =>{
        return localStorage.getItem('theme') || 'light';
    })

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <themeContext.Provider value = {{theme, toggleTheme}}>
            {children}
        </themeContext.Provider>
    )
};

export const useTheme = () => {
    const context = useContext(themeContext);
    if(!context) {
        throw new Error('useTheme must be used within a themeProvider');
    }
    return context;
}
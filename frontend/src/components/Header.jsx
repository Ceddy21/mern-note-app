import React, {useState} from 'react';
import {useTheme} from '../context/ThemeContext';
import {FaStickyNote, FaSun, FaMoon} from 'react-icons/fa';

const Header = () => {
    const {theme, toggleTheme} = useTheme();

    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = () => {
        setIsAnimating(true);
        toggleTheme();
        setTimeout(() => {
            setIsAnimating(false);
        }, 600);
    };

    return (
        <header className='sticky top-0 z-50 bg-blue-500 dark:bg-gray-800 shadow-md transition-colors duration-300'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16 md:h-20'>

                    {/* Left logo + App Name */}
                    <div className='flex items-center gap-2 sm:gap-3'>
                        <FaStickyNote className='text-2xl sm:text-3xl text-white dark:text-blue-700'/>
                            <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white tracking-tight'>
                                AppName
                            </h1>
                    </div>

                    <button
                        onClick = {handleToggle}
                        className = "relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus: ring-2 focus:ring-blue-400"
                        aria-label = "toggleTheme"
                    >
                        <div className = {`absolute inset-0 flex items-center justify-center ${isAnimating ? 'animate-spinIcon' : ''}`}>
                            {theme === 'light' ? (<FaMoon className ="text-gray-700 text-base sm:text-xl" />
                            ) : (
                                <FaSun className='text-yellow-400 text-base sm:text-xl'/>
                            )}
                        </div>

                    </button>
                </div>
            </div>
        </header>
    )
};

export default Header;
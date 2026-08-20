import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ searchTerm, setSearchTerm}) => {
    return (
        <div className='relative max-w-md mx-auto mb-6'>
            <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder = 'Search notes...'
                className='w-full px-4 py-2 pl-10 rounded-10 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
        </div>
    );
};

export default SearchBar;
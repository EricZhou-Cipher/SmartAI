import React, { useState } from 'react';

const SearchBar = ({ 
  onSearch, 
  placeholder = "搜索...", 
  disabled = false, 
  loading = false,
  searchTypes = [],
  className = "",
  initialValue = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [searchType, setSearchType] = useState(searchTypes.length > 0 ? searchTypes[0].value : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && !disabled && !loading) {
      onSearch(searchType ? { term: searchTerm, type: searchType } : searchTerm);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex w-full items-center ${className}`} role="search">
      <div className="relative flex-grow">
        {searchTypes.length > 0 && (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <select
              className="h-full rounded-l-md border-transparent bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              disabled={disabled}
              aria-label="搜索类型"
            >
              {searchTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <input
          type="text"
          className={`w-full rounded-l-md border-gray-300 py-2 ${
            searchTypes.length > 0 ? 'pl-24' : 'pl-4'
          } pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="搜索输入框"
          role="searchbox"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      <button
        className={`inline-flex items-center rounded-r-md px-4 py-2 ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
        onClick={handleSubmit}
        disabled={disabled || loading}
        aria-label="搜索按钮"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar; 
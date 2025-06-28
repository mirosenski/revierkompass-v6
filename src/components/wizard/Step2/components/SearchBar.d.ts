import React from 'react';
interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onVoiceCommand: () => void;
    onCommand: () => void;
}
declare const SearchBar: React.FC<SearchBarProps>;
export default SearchBar;

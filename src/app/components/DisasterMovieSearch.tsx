import React, { useState, useEffect } from 'react';

interface Movie {
  title: string | undefined;
  year: number;
  rating: number | string;
  boxOffice: number;
  numberOfRatings: number;
  plotSummary: string;
  disasterType: string;
}

interface DisasterMovieSearchProps {
  movies: Movie[];
  disasterTypes: string[];
  onFilterChange: (filteredMovies: Movie[]) => void;
}

const DisasterMovieSearch: React.FC<DisasterMovieSearchProps> = ({ movies, disasterTypes, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');

  useEffect(() => {
    filterMovies();
  }, [searchTerm, selectedType, minYear, maxYear, movies]);

  const filterMovies = () => {
    let filteredMovies = movies;

    if (searchTerm) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.title && typeof movie.title === 'string' && 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filteredMovies = filteredMovies.filter(movie => movie.disasterType === selectedType);
    }

    if (minYear) {
      filteredMovies = filteredMovies.filter(movie => movie.year >= parseInt(minYear));
    }

    if (maxYear) {
      filteredMovies = filteredMovies.filter(movie => movie.year <= parseInt(maxYear));
    }

    onFilterChange(filteredMovies);
  };

  return (
    <div className="disaster-movie-search">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="search-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Disaster Types</option>
          {disasterTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="number"
          className="search-number"
          placeholder="Min Year"
          value={minYear}
          onChange={(e) => setMinYear(e.target.value)}
        />
        <input
          type="number"
          className="search-number"
          placeholder="Max Year"
          value={maxYear}
          onChange={(e) => setMaxYear(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DisasterMovieSearch;
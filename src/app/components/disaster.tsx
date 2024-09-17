import React, { useState, useEffect } from 'react';
import DisasterMovieSearch from './DisasterMovieSearch';
import DisasterTypeChart from './DisasterTypeChart';

interface Movie {
  title: string;
  year: number;
  rating: number | string;
  boxOffice: number;
  numberOfRatings: number;
  plotSummary: string;
  disasterType: string;
}

const DisasterMovieTimeline: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/movies.json')
      .then(response => response.json())
      .then(data => {
        setMovies(data.movies);
        setFilteredMovies(data.movies);
        const types = Array.from(new Set(data.movies.map((m: Movie) => m.disasterType))) as string[];
        setDisasterTypes(types);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movie data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const handleFilterChange = (newFilteredMovies: Movie[]) => {
    setFilteredMovies(newFilteredMovies);
  };

  const minYear = 1920;
  const maxYear = Math.max(...movies.map(m => m.year));
  const decades = Array.from(
    { length: Math.ceil((maxYear - minYear) / 10) },
    (_, i) => Math.floor(minYear / 10) * 10 + i * 10
  );

  const getColorForDisasterType = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'Natural Disaster': '#E63946',
      'Biblical': '#1D3557',
      'Monster(s)': '#43AA8B',
      'Ecological Collapse': '#F4A261',
      'Man-made Disaster': '#F47F83',
      'Nukes!': '#4A6FA5',
      'Apocalyptic': '#7BCBB5',
      'Dystopian': '#F7C39B',
      'Post-Apocalyptic': '#FAA5A8',
      'Alien Invasion': '#7798C0',
      'Pandemic': '#A5DCD0',
      'Zombies': '#FAD7B8',
      'AI Takeover': '#95A5A6',
      'Evolved Apes': '#FF9F1C',
      'Time Travel': '#2EC4B6',
      'General Collapse': '#E71D36',
      'Supernatural': '#011627',
      'Fantasy': '#FDFFFC',
      'Cosmic': '#B91372',
      'Terrorism': '#31263E',
      'Psychological': '#44A1A0',
      'General causes': '#6B818C',
      'unknown': '#5D576B',
      'Unknown Cause': '#4EB5DB',
    };
    return colorMap[type] || '#95A5A6';
  };
  const categoryCount = disasterTypes.reduce((acc, type) => {
    acc[type] = filteredMovies.filter(m => m.disasterType === type).length;
    return acc;
  }, {} as Record<string, number>);

  const otherThreshold = 10;
  const mainCategories = Object.entries(categoryCount)
    .filter(([, count]) => count >= otherThreshold)
    .sort(([, a], [, b]) => b - a);
  
  const otherCount = Object.values(categoryCount)
    .filter(count => count < otherThreshold)
    .reduce((sum, count) => sum + count, 0);

  const sortedDisasterTypes = [
    ...mainCategories.map(([type]) => type),
    ...(otherCount > 0 ? ['Other'] : [])
  ];

  const formatRating = (rating: number | string) => {
    return typeof rating === 'number' ? rating.toFixed(1) : rating;
  };

  const getDecadeHeight = (decade: number) => {
    const moviesInDecade = filteredMovies.filter(m => m.year >= decade && m.year < decade + 10);
    const moviesByYear = Array.from({ length: 10 }, (_, i) => {
      return moviesInDecade.filter(m => m.year === decade + i).length;
    });
    const maxMoviesInYear = Math.max(...moviesByYear);
    
    const minHeight = 100;
    const maxHeight = 500;
    const heightPerMovie = 25;
    return Math.min(Math.max(minHeight, maxMoviesInYear * heightPerMovie), maxHeight);
  };

  const getDecadeLegend = (decade: number) => {
    const moviesInDecade = filteredMovies.filter(m => m.year >= decade && m.year < decade + 10);
    const typeCounts = disasterTypes.reduce((acc, type) => {
      acc[type] = moviesInDecade.filter(m => m.disasterType === type).length;
      return acc;
    }, {} as Record<string, number>);

    const sortedTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0);

    const totalMovies = sortedTypes.reduce((sum, [, count]) => sum + count, 0);

    return (
      <div className="decade-legend">
        <div className="decade-legend-bar">
          {sortedTypes.map(([type, count]) => {
            const percentage = (count / totalMovies) * 100;
            return (
              <div
                key={type}
                className="decade-legend-segment"
                style={{
                  backgroundColor: getColorForDisasterType(type),
                  flexGrow: count,
                }}
                title={`${type}: ${count} movie${count !== 1 ? 's' : ''}`}
              >
                {percentage > 5 && (
                  <span className="decade-legend-count">{count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="disaster-movie-timeline">
      <header>
        <h1>Disasters by the decade</h1>
        <h2>According to Hollywood</h2>
      </header>
      <DisasterTypeChart movies={filteredMovies} />
      <DisasterMovieSearch
        movies={movies}
        disasterTypes={disasterTypes}
        onFilterChange={handleFilterChange}
      />
      <div className="disaster-breakdown">
        <h3>Disaster Breakdown | Total films: {filteredMovies.length}</h3>
        <div className="stacked-bar-chart">
          {sortedDisasterTypes.map(type => {
            const count = type === 'Other' ? otherCount : categoryCount[type];
            const percentage = (count / filteredMovies.length) * 100;
            return (
              <div
                key={type}
                className="bar-segment"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: type === 'Other' ? '#999' : getColorForDisasterType(type)
                }}
                title={`${type}: ${count} (${percentage.toFixed(1)}%)`}
              ></div>
            );
          })}
        </div>
        <div className="legend">
          {sortedDisasterTypes.map(type => (
            <div key={type} className="legend-item">
              <span 
                className="color-box" 
                style={{ backgroundColor: type === 'Other' ? '#999' : getColorForDisasterType(type) }}
              ></span>
              <span className="type-name">{type}</span>
              <span className="type-count">
                ({type === 'Other' ? otherCount : categoryCount[type]})
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="decades-container">
        {decades.map(decade => (
          <div key={decade} className="decade" style={{ height: `${getDecadeHeight(decade)}px` }}>
            <div className="decade-label">{decade}s</div>
            <div className="year-columns">
              {Array.from({ length: 10 }, (_, i) => decade + i).map(year => (
                <div key={year} className="year-column">
                  <div className="year-label">{year}</div>
                  <div className="movie-dots">
                    {filteredMovies
                      .filter(movie => movie.year === year)
                      .map((movie, index) => (
                        <div
                          key={movie.title}
                          className="movie-dot-container"
                        >
                          <div
                            className="movie-dot"
                            style={{
                              backgroundColor: getColorForDisasterType(movie.disasterType),
                              width: `${Math.max(8, Math.min(24, Number(movie.rating) * 2))}px`,
                              height: `${Math.max(8, Math.min(24, Number(movie.rating) * 2))}px`,
                            }}
                          ></div>
                          <div className="movie-info">
                            <h3>{movie.title}</h3>
                            <p>Year: {movie.year}</p>
                            <p>Type: {movie.disasterType}</p>
                            <p>Rating: {formatRating(movie.rating)}/10</p>
                            <p>Number of Ratings: {movie.numberOfRatings.toLocaleString()}</p>
                            <p>Plot: {movie.plotSummary}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            {getDecadeLegend(decade)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisasterMovieTimeline;
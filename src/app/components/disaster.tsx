import React, { useState, useEffect } from 'react';

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
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/movies.json')
      .then(response => response.json())
      .then(data => {
        setMovies(data.movies);
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

  const minYear = 1920;
  const maxYear = Math.max(...movies.map(m => m.year));
  const decades = Array.from({ length: Math.ceil((maxYear - minYear) / 10) }, (_, i) => minYear + i * 10);

  const getColorForDisasterType = (type: string) => {
    const hue = disasterTypes.indexOf(type) * (360 / disasterTypes.length);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const categoryCount = disasterTypes.reduce((acc, type) => {
    acc[type] = movies.filter(m => m.disasterType === type).length;
    return acc;
  }, {} as Record<string, number>);

  const sortedDisasterTypes = disasterTypes.sort((a, b) => categoryCount[b] - categoryCount[a]);

  const formatRating = (rating: number | string) => {
    return typeof rating === 'number' ? rating.toFixed(1) : rating;
  };

  const getDecadeHeight = (decade: number) => {
    const moviesInDecade = movies.filter(m => m.year >= decade && m.year < decade + 10);
    const moviesByYear = Array.from({ length: 10 }, (_, i) => {
      return moviesInDecade.filter(m => m.year === decade + i).length;
    });
    const maxMoviesInYear = Math.max(...moviesByYear);
    
    const minHeight = 100; // Minimum height for decades with few movies
    const maxHeight = 500; // Maximum height for decades with many movies
    const heightPerMovie = 25; // Adjust this value to change the scaling
    return Math.min(Math.max(minHeight, maxMoviesInYear * heightPerMovie), maxHeight);
  };

  return (
    <div className="disaster-movie-timeline">
    <header>
      <h1>Disasters by the decade</h1>
      <h2>According to hollywood</h2>
      </header>
 <div className="disaster-breakdown">
  <h3>Disaster Breakdown (Total: {movies.length})</h3>
  <div className="stacked-bar-chart">
    {sortedDisasterTypes.map(type => {
      const count = categoryCount[type];
      const percentage = (count / movies.length) * 100;
      return (
        <div
          key={type}
          className="bar-segment"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColorForDisasterType(type)
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
          style={{ backgroundColor: getColorForDisasterType(type) }}
        ></span>
        <span className="type-name">{type}</span>
        <span className="type-count">({categoryCount[type]})</span>
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
                    {movies
                      .filter(movie => movie.year === year)
                      .map((movie, index) => (
                        <div
      key={movie.title}
      className="movie-dot"
      style={{
        backgroundColor: getColorForDisasterType(movie.disasterType),
        width: `${Math.max(8, Math.min(24, Number(movie.rating) * 2))}px`,
        height: `${Math.max(8, Math.min(24, Number(movie.rating) * 2))}px`,
      }}
    >
     <div className="movie-info-container">
                             <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>Year: {movie.year}</p>
        <p>Type: {movie.disasterType}</p>
        <p>Rating: {formatRating(movie.rating)}/10</p>
      
        <p>Number of Ratings: {movie.numberOfRatings.toLocaleString()}</p>
        <p>Plot: {movie.plotSummary}</p>
      </div>
                        </div>   

                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
       
           </div>
        ))}
      </div>

    
    </div>
  );
};

export default DisasterMovieTimeline;
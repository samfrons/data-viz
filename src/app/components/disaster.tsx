import React, { useState, useEffect } from 'react';

interface Movie {
  title: string;
  year: number;
  disasterType: string;
  rating: number | string;
  boxOffice: number;
  numberOfRatings: number;
  plotSummary: string;
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
        const types = Array.from(new Set(data.movies.map((m: Movie) => m.disasterType)));
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

  const minYear = 1930;
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

  return (
    <div className="disaster-movie-timeline">
      <h1>Disaster Movie Timeline</h1>

      <div className="decades-container">
        {decades.map(decade => (
          <div key={decade} className="decade">
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
                          <div className="movie-info">
                            <h3>{movie.title}</h3>
                            <p>Year: {movie.year}</p>
                            <p>Type: {movie.disasterType}</p>
                            <p>Rating: {formatRating(movie.rating)}/10</p>
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

      <div className="legend">
        <h3>Disaster Types (Total: {movies.length})</h3>
        <div className="legend-items">
          {sortedDisasterTypes.map(type => (
            <div key={type} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getColorForDisasterType(type) }}></div>
              <span>{type}: {categoryCount[type]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisasterMovieTimeline;
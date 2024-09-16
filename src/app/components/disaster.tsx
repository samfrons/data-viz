import React, { useState, useRef, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Movie {
  title: string;
  year: number;
  disasterType: string;
  rating: number;
  boxOffice: number;
  numberOfRatings: number;
  plotSummary: string;
}

const DisasterMovieTimeline: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDecade, setCurrentDecade] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

  //const minYear = Math.min(...movies.map(m => m.year));
  const minYear = 1931;
  const maxYear = Math.max(...movies.map(m => m.year));
  const decades = Array.from({ length: Math.ceil((maxYear - minYear) / 10) }, (_, i) => minYear + i * 10);

  const getColorForDisasterType = (type: string) => {
    const hue = disasterTypes.indexOf(type) * (360 / disasterTypes.length);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleScroll = () => {
    if (timelineRef.current) {
      const scrollPosition = timelineRef.current.scrollLeft;
      const decadeWidth = timelineRef.current.clientWidth / decades.length;
      const currentDecadeIndex = Math.floor(scrollPosition / decadeWidth);
      setCurrentDecade(decades[currentDecadeIndex]);
    }
  };

  const categoryCount = disasterTypes.reduce((acc, type) => {
    acc[type] = movies.filter(m => m.disasterType === type).length;
    return acc;
  }, {} as Record<string, number>);

  const sortedDisasterTypes = disasterTypes.sort((a, b) => categoryCount[b] - categoryCount[a]);

  return (
    <div className="disaster-movie-timeline">
      <h1>Disaster Movie Timeline</h1>
      
      <div className="decade-indicator">
        Current Decade: {currentDecade ? `${currentDecade}s` : 'Scroll to view'}
      </div>

      <div className="timeline-container" ref={timelineRef} onScroll={handleScroll}>
        <div className="timeline">
          {decades.map(decade => (
            <div key={decade} className="decade">
              <div className="decade-label">{decade}</div>
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
                              width: `${Math.max(8, Math.min(24, movie.rating * 2))}px`,
                              height: `${Math.max(8, Math.min(24, movie.rating * 2))}px`,
                            }}
                            onClick={() => handleMovieClick(movie)}
                            title={movie.title}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box">
        {selectedMovie ? (
          <>
            <h2>{selectedMovie.title}</h2>
            <p>Year: {selectedMovie.year}</p>
            <p>Disaster Type: {selectedMovie.disasterType}</p>
            <p>Rating: {selectedMovie.rating.toFixed(1)}/10</p>
            <p>Number of Ratings: {selectedMovie.numberOfRatings.toLocaleString()}</p>
            <p>Box Office: ${selectedMovie.boxOffice.toLocaleString()}</p>
            <p>Plot: {selectedMovie.plotSummary}</p>
          </>
        ) : (
          <p>Click on a movie dot to see details</p>
        )}
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
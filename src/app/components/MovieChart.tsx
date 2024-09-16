import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Function to generate a unique color for each disaster type
const generateColor = (index) => {
  const hue = (index * 137.508) % 360; // Use golden angle approximation
  return `hsl(${hue}, 70%, 50%)`;
};

// Custom legend component
const CustomLegend = ({ disasterTypes }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
    {disasterTypes.map((type, index) => (
      <div key={type} style={{ margin: '5px 10px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '20px', height: '20px', backgroundColor: generateColor(index), marginRight: '5px' }}></div>
        <span>{type}</span>
      </div>
    ))}
  </div>
);

const DisasterMovieChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [disasterTypes, setDisasterTypes] = useState([]);
  const [movieCounts, setMovieCounts] = useState({});
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    if (data && data.movies) {
      const total = data.movies.length;
      setTotalMovies(total);

      // Extract unique disaster types and count movies for each type
      const types = [];
      const counts = {};
      data.movies.forEach(movie => {
        if (!types.includes(movie.disasterType)) {
          types.push(movie.disasterType);
        }
        counts[movie.disasterType] = (counts[movie.disasterType] || 0) + 1;
      });

      setDisasterTypes(types);
      setMovieCounts(counts);
      setChartData(data.movies);

      // Check for movies with missing or invalid data
      const invalidMovies = data.movies.filter(movie => 
        !movie.title || !movie.year || !movie.disasterType || 
        typeof movie.rating !== 'number' || typeof movie.boxOffice !== 'number' ||
        typeof movie.numberOfRatings !== 'number'
      );

      if (invalidMovies.length > 0) {
        console.warn('Movies with missing or invalid data:', invalidMovies);
      }
    }
  }, [data]);

  return (
    <div style={{ width: '100%', height: '100%', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Disaster Movie Dashboard</h2>
      
      <Card>
        <CardHeader>Movie Counts</CardHeader>
        <CardContent>
          <p><strong>Total Movies: {totalMovies}</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(movieCounts).map(([type, count]) => (
              <div key={type} style={{ 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '5px',
                backgroundColor: generateColor(disasterTypes.indexOf(type)),
                color: 'white'
              }}>
                <strong>{type}:</strong> {count} movies
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div style={{ height: '400px', marginTop: '20px' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="year" name="Year" />
            <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 10]} />
            <ZAxis type="number" dataKey="boxOffice" name="Box Office" unit="$" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="Movies"
              data={chartData}
              shape="circle"
              fillOpacity={0.6}
              fill={(entry) => generateColor(disasterTypes.indexOf(entry.disasterType))}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <CustomLegend disasterTypes={disasterTypes} />
    </div>
  );
};

export default DisasterMovieChart;
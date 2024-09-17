import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Movie {
  title: string;
  year: number;
  disasterType: string;
}

interface DisasterTypeChartProps {
  movies: Movie[];
}

const DisasterTypeChart: React.FC<DisasterTypeChartProps> = ({ movies }) => {
  const minYear = 1920;
  const maxYear = Math.max(...movies.map(m => m.year));
  const disasterTypes = Array.from(new Set(movies.map(m => m.disasterType)));

  const getColorForDisasterType = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'Natural Disaster': '#E63946',
      'Post-Apocalyptic': '#1D3557',
      'Zombies': '#43AA8B',
      'Alien Invasion': '#F4A261',
      'Pandemic': '#F47F83',
      'Man-made Disaster': '#4A6FA5',
      'Ecological Collapse': '#7BCBB5',
      'Nukes!': '#F7C39B',
      'Dystopian': '#FAA5A8',
      'Biblical': '#7798C0',
      'Apocalyptic': '#A5DCD0',
      'AI Takeover': '#FAD7B8',
      'Other': '#95A5A6'
    };
    return colorMap[type] || '#95A5A6';
  };

  const prepareChartData = () => {
    const yearRange = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const datasets = disasterTypes.map(type => {
      const data = yearRange.map(year => {
        const moviesThisYear = movies.filter(m => m.year === year && m.disasterType === type);
        return moviesThisYear.length;
      });
      return {
        label: type,
        data: data,
        fill: true,
        backgroundColor: getColorForDisasterType(type),
        borderColor: getColorForDisasterType(type),
      };
    });

    return {
      labels: yearRange,
      datasets: datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Year'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Movies'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Disaster Movie Types Over Time'
      },
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Line data={prepareChartData()} options={chartOptions} />
    </div>
  );
};

export default DisasterTypeChart;
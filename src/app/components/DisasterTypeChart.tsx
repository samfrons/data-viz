import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

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
  const startYear = 1920;
  const maxYear = useMemo(() => Math.max(...movies.map(m => m.year)), [movies]);
  const allDisasterTypes = useMemo(() => Array.from(new Set(movies.map(m => m.disasterType))), [movies]);

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

  const prepareChartData = useMemo(() => {
    const yearRange = Array.from({ length: maxYear - startYear + 1 }, (_, i) => startYear + i);
    
    const yearlyData = yearRange.map(year => {
      const moviesThisYear = movies.filter(m => m.year === year);
      const counts: { [key: string]: number } = {};
      allDisasterTypes.forEach(type => {
        counts[type] = moviesThisYear.filter(m => m.disasterType === type).length;
      });
      return counts;
    });

    const datasets = allDisasterTypes.map(type => {
      const data = yearlyData.map(yearData => yearData[type] || 0);
      return {
        label: type,
        data: data,
        fill: true,
        backgroundColor: getColorForDisasterType(type),
        borderColor: getColorForDisasterType(type),
        borderWidth: 1,
      };
    });

    return {
      labels: yearRange,
      datasets: datasets,
    };
  }, [movies, maxYear, allDisasterTypes]);

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
        },
        min: 0,
      }
    },
    plugins: {
      title: {
        display: true,
        text: ''
      },
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (context: any) => {
            return `Year: ${context[0].label}`;
          },
          label: (context: any) => {
            if (context.parsed.y > 0) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
            return null;
          },
          afterBody: (context: any) => {
            const total = context.reduce((sum: number, item: any) => sum + item.parsed.y, 0);
            return `Total: ${total}`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <Line data={prepareChartData} options={chartOptions} />
    </div>
  );
};

export default DisasterTypeChart;
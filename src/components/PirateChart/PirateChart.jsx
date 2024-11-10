import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const LineChart = ({ data }) => {
  const chartRef = useRef(null); // Create a ref for the canvas element

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy();
    }

    const transactionIds = data.map(item => item.transactionid);
    const prices = data.map(item => item.price);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: transactionIds,
        datasets: [{
          label: 'Price',
          data: prices,
          borderColor: '#2f6831', // Line color
          backgroundColor: '#2f683180', // Fill color under the line
          fill: true, // Fill area under the line
          tension: 0.1, // Line tension (smoothness)
          pointRadius: 5, // Data point size
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        scales: {
          y: {
            beginAtZero: false,
            grace: '5%',
            title: {
              display: true,
              text: 'Price'
            }
          },
          x: {
            display:false,
            title: {
              display: false,
              text: 'History'
            }
          }
        }
      }
    });

    // Save the chart instance to the canvas element
    chartRef.current.chartInstance = chart;

    // Cleanup: Destroy the chart when the component unmounts or data changes
    return () => {
      chart.destroy();
    };
  }, [data]); // Re-run when `data` prop changes

  return <canvas ref={chartRef} width="400" height="200"></canvas>;
};

export default LineChart;

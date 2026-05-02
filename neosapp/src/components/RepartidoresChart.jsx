import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RepartidoresChart({ pedidos, repartidores }) {
  // Procesar datos para la gráfica
  const procesarDatos = () => {
    const estados = ['En camino', 'Pendiente', 'Entregado', 'Cancelado'];

    // Crear datasets para cada estado
    const datasets = estados.map((estado, index) => {
      const colores = [
        'rgba(76, 175, 80, 0.8)',   // Verde - En camino
        'rgba(255, 193, 7, 0.8)',   // Amarillo - Pendiente
        'rgba(33, 150, 243, 0.8)',  // Azul - Entregado
        'rgba(244, 67, 54, 0.8)'    // Rojo - Cancelado
      ];

      const coloresHover = [
        'rgba(76, 175, 80, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(33, 150, 243, 1)',
        'rgba(244, 67, 54, 1)'
      ];

      return {
        label: estado,
        data: repartidores.map(repartidor => {
          return pedidos.filter(p =>
            p.repartidor === repartidor.nombre && p.estado === estado
          ).length;
        }),
        backgroundColor: colores[index],
        borderColor: coloresHover[index],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      };
    });

    return {
      labels: repartidores.map(r => r.nombre),
      datasets: datasets
    };
  };

  const data = procesarDatos();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Pedidos por Repartidor y Estado',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(200, 169, 81, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context) {
            return `Repartidor: ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} pedidos`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 13,
            weight: '600'
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 169, 81, 0.1)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 13,
            weight: '500'
          }
        },
        title: {
          display: true,
          text: 'Número de Pedidos',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div style={{ height: '400px', width: '100%', padding: '10px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
import React, { useState } from 'react';
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

export default function VendedoresChart({ pedidos, vendedores, onActualizarTope }) {
  const [topesVentas, setTopesVentas] = useState(
    vendedores.reduce((acc, vendedor) => {
      acc[vendedor.id] = vendedor.topeVentas || 0;
      return acc;
    }, {})
  );

  // Calcular ventas totales por vendedor
  const calcularVentasPorVendedor = () => {
    return vendedores.map(vendedor => {
      const pedidosVendedor = pedidos.filter(p =>
        p.vendedorId === vendedor.id && p.estado !== 'Cancelado'
      );

      const totalVentas = pedidosVendedor.reduce((sum, pedido) => sum + pedido.total, 0);

      return {
        nombre: vendedor.nombre,
        ventas: totalVentas,
        tope: topesVentas[vendedor.id] || 0,
        zona: vendedor.zona
      };
    });
  };

  const datosVentas = calcularVentasPorVendedor();

  const data = {
    labels: datosVentas.map(v => v.nombre),
    datasets: [
      {
        label: 'Ventas Totales',
        data: datosVentas.map(v => v.ventas),
        backgroundColor: 'rgba(200, 169, 81, 0.8)',
        borderColor: 'rgba(200, 169, 81, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Tope de Ventas',
        data: datosVentas.map(v => v.tope),
        backgroundColor: 'rgba(244, 67, 54, 0.3)',
        borderColor: 'rgba(244, 67, 54, 0.8)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        type: 'line',
        fill: false,
        pointBackgroundColor: 'rgba(244, 67, 54, 1)',
        pointBorderColor: 'rgba(244, 67, 54, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

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
        text: 'Ventas por Vendedor',
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
        callbacks: {
          title: function(context) {
            const vendedor = datosVentas[context[0].dataIndex];
            return `${vendedor.nombre} (${vendedor.zona})`;
          },
          label: function(context) {
            const vendedor = datosVentas[context.dataIndex];
            if (context.datasetIndex === 0) {
              const porcentaje = vendedor.tope > 0 ? ((vendedor.ventas / vendedor.tope) * 100).toFixed(1) : 0;
              return `Ventas: $${vendedor.ventas.toLocaleString()} (${porcentaje}% del tope)`;
            } else {
              return `Tope: $${vendedor.tope.toLocaleString()}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
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
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
          font: {
            size: 13,
            weight: '500'
          }
        },
        title: {
          display: true,
          text: 'Monto en Pesos',
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

  const handleTopeChange = (vendedorId, nuevoTope) => {
    const nuevosTopes = { ...topesVentas, [vendedorId]: parseInt(nuevoTope) || 0 };
    setTopesVentas(nuevosTopes);

    if (onActualizarTope) {
      onActualizarTope(vendedorId, parseInt(nuevoTope) || 0);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: '350px', marginBottom: '20px' }}>
        <Bar data={data} options={options} />
      </div>

      {/* Controles de topes de ventas */}
      <div style={{
        background: 'rgba(30, 30, 30, 0.5)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid rgba(200, 169, 81, 0.2)'
      }}>
        <h4 style={{
          color: '#c8a951',
          margin: '0 0 15px 0',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Configurar Topes de Ventas
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {vendedores.map(vendedor => {
            const ventasActuales = datosVentas.find(d => d.nombre === vendedor.nombre)?.ventas || 0;
            const topeActual = topesVentas[vendedor.id] || 0;
            const porcentaje = topeActual > 0 ? ((ventasActuales / topeActual) * 100).toFixed(1) : 0;
            const alcanzado = ventasActuales >= topeActual && topeActual > 0;

            return (
              <div key={vendedor.id} style={{
                background: alcanzado ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                padding: '12px',
                borderRadius: '6px',
                border: `1px solid ${alcanzado ? '#4caf50' : 'rgba(255, 255, 255, 0.1)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    color: '#ddd',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {vendedor.nombre}
                  </span>
                  <span style={{
                    color: alcanzado ? '#4caf50' : '#c8a951',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {topeActual > 0 ? `${porcentaje}%` : 'Sin tope'}
                  </span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{
                    color: '#aaa',
                    fontSize: '12px',
                    display: 'block',
                    marginBottom: '4px'
                  }}>
                    Tope de ventas ($)
                  </label>
                  <input
                    type="number"
                    value={topesVentas[vendedor.id] || ''}
                    onChange={(e) => handleTopeChange(vendedor.id, e.target.value)}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#aaa'
                }}>
                  <span>Actual: ${ventasActuales.toLocaleString()}</span>
                  <span>Tope: ${topeActual.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PerformanceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext("2d");
    
    if (ctx) {
      // Mock data
      const views = [2150, 2420, 2250, 2800, 3200, 2950, 3500, 4100, 3800, 4300, 4500, 4800];
      const users = [120, 132, 121, 154, 178, 195, 197, 205, 220, 250, 275, 290];
        // Create the chart with enhanced styling for modern look
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ],
          datasets: [
            {
              label: "Page Views",
              data: views,
              borderColor: "#3b82f6", // blue-500
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#3b82f6",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBorderWidth: 3,
              pointHoverBackgroundColor: "#3b82f6",
              pointHoverBorderColor: "#fff",
            },
            {
              label: "Active Users",
              data: users,
              borderColor: "#8b5cf6", // purple-500
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,              pointBackgroundColor: "#fff",
              pointBorderColor: "#8b5cf6",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBorderWidth: 3,
              pointHoverBackgroundColor: "#8b5cf6",
              pointHoverBorderColor: "#fff",
            },          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: {
              position: "top" as const,
              align: "end" as const,
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  family: "'Inter', 'system-ui', sans-serif",
                  size: 12
                },
                boxWidth: 8,
              },
            },
            tooltip: {
              mode: "index" as const,
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.8)",              titleFont: {
                size: 13,
                weight: "bold",
                family: "'Inter', 'system-ui', sans-serif",
              },
              bodyFont: {
                size: 12,
                family: "'Inter', 'system-ui', sans-serif",
              },
              padding: 12,
              cornerRadius: 6,
              displayColors: true,
              boxPadding: 6,
              usePointStyle: true,
            },
          },
          scales: {            x: {
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
              ticks: {
                font: {
                  family: "'Inter', 'system-ui', sans-serif",
                  size: 12
                },
                color: "#6b7280"  // gray-500
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                // Customize the y-axis labels to show K (thousands) format
                callback: function(value) {
                  const numValue = Number(value);
                  return numValue >= 1000 ? (numValue/1000) + 'K' : value;
                },
                font: {
                  family: "'Inter', 'system-ui', sans-serif",
                  size: 12
                },
                color: "#6b7280",  // gray-500
                padding: 10,
              },              grid: {
                display: true,
                color: "rgba(226, 232, 240, 0.5)",  // gray-200 with opacity
              },
              border: {
                display: false,
              },
            },
          },
          interaction: {
            mode: "nearest" as const,
            axis: "x" as const,
            intersect: false,
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-72">
      <canvas ref={chartRef} />
    </div>
  );
}
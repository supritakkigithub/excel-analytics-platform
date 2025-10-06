import React, { lazy, Suspense } from 'react';

// Lazy load heavy 3D components for better performance
const ThreeDBarChart = lazy(() => import('../charts/ThreeDBarChart.js'));
const ThreeDSurfaceChart = lazy(() => import('../charts/ThreeDSurfaceChart.js'));
const ThreeDScatterChart = lazy(() => import('../charts/ThreeDScatterChart.js'));

// --- Placeholder Components for Future Implementation ---
const PlaceholderChart = ({ name }) => (
  <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', borderRadius: 8 }}>
    <h3 style={{ color: '#90a4ae' }}>{name} Chart Coming Soon</h3>
  </div>
);

// --- TODO: Modularize these 2D charts as well ---
// For now, we pass the Recharts components directly for simplicity
const ChartRenderer = ({ type, data, theme, ...props }) => {
  // Loading state for lazy-loaded components
  const loader = (
    <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Loading Chart...</p>
    </div>
  );

  switch (type) {
    // Note: The 2D charts are still handled by the render2DChart prop for now.
    // We will modularize them in a future step.

    case '3D Bar':
      return (
        <Suspense fallback={loader}>
          <ThreeDBarChart data={data} theme={theme} {...props} />
        </Suspense>
      );
    
    case '3D Surface':
        return (
          <Suspense fallback={loader}>
            <ThreeDSurfaceChart data={data} theme={theme} {...props} />
          </Suspense>
        );

    case '3D Scatter':
      return (
        <Suspense fallback={loader}>
          <ThreeDScatterChart data={data} theme={theme} {...props} />
        </Suspense>
      );

    default:
      // Return the existing 2D chart logic from Analysis.js
      // This allows us to refactor incrementally.
      if (props.render2DChart) {
        return props.render2DChart();
      }
      return <PlaceholderChart name={type} />;
  }
};

export default ChartRenderer;
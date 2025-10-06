import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import jsPDF from 'jspdf';

const SURFACE_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e42', '#a21caf', '#eab308', '#6366f1', '#14b8a6'
];

// Helper: map a value in [min, max] to a color (blue to red gradient)
function getHeatmapColor(value, min, max) {
  const t = (value - min) / (max - min);
  // Blue (low) to Red (high)
  const r = Math.round(255 * t);
  const g = Math.round(64 * (1 - t) + 64 * t); // subtle green for smoothness
  const b = Math.round(255 * (1 - t));
  return new THREE.Color(`rgb(${r},${g},${b})`);
}

const ThreeDSurfaceChart = forwardRef(({ data, xKey, yKey, zKey, theme }, ref) => {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !xKey || !yKey || !zKey) return;

    // --- Theme Colors ---
    const isDark = theme === 'dark';
    const sceneColor = isDark ? 0x1f2937 : 0xf0f4f8;
    const axesColor = isDark ? 0x9ca3af : 0x374151;
    const surfaceColor = SURFACE_COLORS[0];

    // === Scene Setup ===
    const width = mountRef.current.clientWidth;
    const height = 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(20, 30, 40);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // === Lights ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // === Axes Helper ===
    const createAxis = (color, points) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
      return new THREE.Line(geometry, material);
    };
    const axisLength = 22;
    scene.add(createAxis(0xff0000, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLength, 0, 0)])); // X
    scene.add(createAxis(0x00ff00, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLength, 0)])); // Y
    scene.add(createAxis(0x0000ff, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLength)])); // Z

    // === Surface Geometry ===
    const segments = Math.floor(Math.sqrt(data.length));
    if (segments < 1) return;
    const planeGeometry = new THREE.PlaneGeometry(20, 20, segments - 1, segments - 1);
    const xValues = data.map(d => Number(d[xKey] || 0));
    const yValues = data.map(d => Number(d[yKey] || 0));
    const zValues = data.map(d => Number(d[zKey] || 0));
    const maxZ = Math.max(...zValues);
    const minZ = Math.min(...zValues);
    // Set Z and color for each vertex
    const colors = [];
    for (let i = 0; i < planeGeometry.attributes.position.count; i++) {
      const z = (zValues[i] / maxZ) * 5 || 0;
      planeGeometry.attributes.position.setZ(i, z);
      // Map original Z value to color
      const color = getHeatmapColor(zValues[i], minZ, maxZ);
      colors.push(color.r, color.g, color.b);
    }
    planeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    planeGeometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      shininess: 80,
      flatShading: true,
    });
    const surface = new THREE.Mesh(planeGeometry, material);
    surface.rotation.x = -Math.PI / 2;
    scene.add(surface);

    // === Tooltips for Surface Vertices ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastPointerEvent = null;
    let lastVertexIndex = null;

    const onPointerMove = (event) => {
      lastPointerEvent = event;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    mountRef.current.addEventListener('pointermove', onPointerMove);

    // === Animation Loop with Tooltip Logic ===
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);

      // Raycast for surface hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(surface);
      if (intersects.length > 0) {
        // Find the closest vertex to the intersection point
        const intersect = intersects[0];
        const pos = planeGeometry.attributes.position;
        let minDist = Infinity;
        let minIdx = null;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vy = pos.getY(i);
          const vz = pos.getZ(i);
          const dist = Math.sqrt(
            Math.pow(intersect.point.x - vx, 2) +
            Math.pow(intersect.point.y - vy, 2) +
            Math.pow(intersect.point.z - vz, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            minIdx = i;
          }
        }
        if (minIdx !== null && tooltipRef.current && lastPointerEvent) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${lastPointerEvent.clientX + 10}px`;
          tooltipRef.current.style.top = `${lastPointerEvent.clientY - 30}px`;
          tooltipRef.current.innerHTML = `<b>${xKey}:</b> ${xValues[minIdx]}<br/><b>${yKey}:</b> ${yValues[minIdx]}<br/><b>${zKey}:</b> ${zValues[minIdx]}`;
          lastVertexIndex = minIdx;
        }
      } else {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        lastVertexIndex = null;
      }
      requestAnimationFrame(animate);
    };
    animate();

    // === Cleanup ===
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      mountRef.current?.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, [data, xKey, yKey, zKey, theme]);

  useImperativeHandle(ref, () => ({
    exportPNG: handleExportImage,
    exportPDF: handleExportPDF,
    exportCSV: handleExportCSV,
  }));

  function handleExportImage() {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = '3d-surface-chart.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function handleExportPDF() {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.addImage(dataURL, 'PNG', 10, 10, 180, 120);
    pdf.save('3d-surface-chart.pdf');
  }
  function handleExportCSV() {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => `"${row[h]}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '3d-surface-chart.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add a color legend overlay for the heatmap
  const legendBg = theme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)';
  const legendText = theme === 'dark' ? '#f3f4f6' : '#1e293b';

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
    >
      {/* Floating Color Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          background: legendBg,
          color: legendText,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          padding: '12px 18px',
          minWidth: 120,
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 2 }}>Z Value (Heatmap)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 24, height: 16, background: 'linear-gradient(to right, #3b82f6, #ef4444)', display: 'inline-block', borderRadius: 4, border: '1.5px solid #e5e7eb' }} />
          <span style={{ fontSize: 13 }}>Low</span>
          <span style={{ flex: 1, borderBottom: '1px solid #e5e7eb', margin: '0 4px' }} />
          <span style={{ fontSize: 13 }}>High</span>
        </div>
      </div>
      {/* Chart Area */}
      <div
        ref={mountRef}
        style={{ width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', position: 'relative' }}
      >
        <div
          ref={tooltipRef}
          style={{
            display: 'none',
            position: 'fixed',
            pointerEvents: 'none',
            background: 'rgba(30,41,59,0.95)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 13,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: 80,
            textAlign: 'left',
          }}
        />
      </div>
    </div>
  );
});

export default ThreeDSurfaceChart; 
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import jsPDF from 'jspdf';

const BAR_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e42', '#a21caf', '#eab308', '#6366f1', '#14b8a6',
];

const getChartHeight = () => {
  // Use ~80% of viewport height; clamp between 680 and 1000 for desktop clarity
  return Math.max(680, Math.min(1000, Math.floor(window.innerHeight * 0.8)));
};

const ThreeDBarChart = forwardRef(({ data, xKey, yKey, theme }, ref) => {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const [cameraPreset, setCameraPreset] = useState('isometric');
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const chartGroupRef = useRef(null);
  const [heightPx, setHeightPx] = useState(getChartHeight());

  // Windowing for large datasets to preserve bar readability
  const [startIdx, setStartIdx] = useState(0);
  const maxVisible = 24; // show up to 24 bars at once
  const visibleData = Array.isArray(data) ? data.slice(startIdx, Math.min(startIdx + maxVisible, data.length)) : [];

  useEffect(() => {
    if (!visibleData || visibleData.length === 0) return;

    const isDark = theme === 'dark';
    const sceneColor = isDark ? 0x1f2937 : 0xf0f4f8;

    const width = mountRef.current.clientWidth;
    const height = heightPx;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(sceneColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(16, 24, 12);
    scene.add(dirLight);

    const createAxis = (color, points) => {
      const geometry = new LineGeometry();
      geometry.setPositions(points.flat());
      const material = new LineMaterial({ color, linewidth: 3, resolution: new THREE.Vector2(width, height) });
      return new Line2(geometry, material);
    };

    const chartGroup = new THREE.Group();
    scene.add(chartGroup);
    chartGroupRef.current = chartGroup;

    const desiredWorldWidth = 25;
    const baseBarWidth = 1.8;
    const baseGap = 0.9;
    const count = visibleData.length || 1;
    const totalBaseWidth = count * (baseBarWidth + baseGap);
    const scaleW = Math.min(1, desiredWorldWidth / totalBaseWidth);
    const barWidth = baseBarWidth * scaleW;
    const barDepth = 1.6 * Math.max(0.6, scaleW);
    const gap = baseGap * scaleW;
    const axisLength = Math.max(22, desiredWorldWidth + 2);

    const maxBarHeight = 22;
    const maxValue = Math.max(...visibleData.map(d => Number(d[yKey] || 0)));
    const safeMaxValue = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 1;
    const bars = [];

    visibleData.forEach((row, i) => {
      const heightVal = Number(row[yKey] || 0);
      if (!Number.isFinite(heightVal)) return;
      const geometry = new THREE.BoxGeometry(barWidth, (heightVal / safeMaxValue) * maxBarHeight, barDepth);
      const color = BAR_COLORS[i % BAR_COLORS.length];
      const material = new THREE.MeshPhongMaterial({ color });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = i * (barWidth + gap);
      bar.position.y = ((heightVal / safeMaxValue) * maxBarHeight) / 2;
      bar.position.z = 0;
      bar.userData = { x: row[xKey], y: row[yKey], color };
      chartGroup.add(bar);
      bars.push(bar);
    });

    const axesGroup = new THREE.Group();
    axesGroup.add(createAxis(0xff0000, [[0, 0, 0], [axisLength, 0, 0]]));
    axesGroup.add(createAxis(0x00ff00, [[0, 0, 0], [0, axisLength, 0]]));
    axesGroup.add(createAxis(0x0000ff, [[0, 0, 0], [0, 0, axisLength]]));
    chartGroup.add(axesGroup);

    function fitCameraToObject(cam, object, controls, preset = 'isometric', offset = 0.96) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const leftBias = size.x * 0.2; // stronger left bias so content starts near left
      const target = new THREE.Vector3(center.x - leftBias, center.y, center.z);
      controls.target.copy(target);

      const fov = cam.fov * (Math.PI / 180);
      const aspect = cam.aspect;
      const fovX = 2 * Math.atan(Math.tan(fov / 2) * aspect);

      let spanX, spanY;
      if (preset === 'top') {
        spanX = Math.max(size.x, size.z);
        spanY = Math.max(size.x, size.z);
      } else if (preset === 'front') {
        spanX = size.x; spanY = size.y;
      } else if (preset === 'side') {
        spanX = size.z; spanY = size.y;
      } else {
        spanX = Math.max(size.x, size.z);
        spanY = Math.max(size.y, Math.min(size.x, size.z));
      }

      const distFitX = (spanX / 2) / Math.tan(fovX / 2);
      const distFitY = (spanY / 2) / Math.tan(fov / 2);
      let distance = Math.max(distFitX, distFitY) * offset;

      const dir = new THREE.Vector3().subVectors(cam.position, controls.target).normalize();
      cam.position.copy(dir.multiplyScalar(distance).add(controls.target));
      cam.near = Math.max(0.1, distance / 100);
      cam.far = distance * 100;
      cam.updateProjectionMatrix();

      controls.minDistance = distance * 0.65;
      controls.maxDistance = distance * 3.5;
      controls.update();
    }

    fitCameraToObject(camera, chartGroup, controls, cameraPreset, 0.96);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredBar = null;
    let lastPointerEvent = null;

    const onPointerMove = (event) => {
      lastPointerEvent = event;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    mountRef.current.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      const w = mountRef.current.clientWidth;
      const h = getChartHeight();
      setHeightPx(h);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      fitCameraToObject(camera, chartGroup, controls, cameraPreset, 0.96);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bars);
      if (intersects.length > 0) {
        const bar = intersects[0].object;
        if (hoveredBar && hoveredBar !== bar) hoveredBar.material.color.set(hoveredBar.userData.color);
        hoveredBar = bar;
        bar.material.color.set('#f59e42');
        if (tooltipRef.current && lastPointerEvent) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${lastPointerEvent.clientX + 10}px`;
          tooltipRef.current.style.top = `${lastPointerEvent.clientY - 30}px`;
          tooltipRef.current.innerHTML = `<b>${xKey}:</b> ${bar.userData.x}<br/><b>${yKey}:</b> ${bar.userData.y}`;
        }
      } else {
        if (hoveredBar) hoveredBar.material.color.set(hoveredBar.userData.color);
        hoveredBar = null;
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      mountRef.current?.removeChild(renderer.domElement);
      mountRef.current?.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      chartGroupRef.current = null;
    };
  }, [visibleData, xKey, yKey, theme, cameraPreset, heightPx]);

  useImperativeHandle(ref, () => ({
    exportPNG: handleExportImage,
    exportPDF: handleExportPDF,
    exportCSV: handleExportCSV,
  }));

  const presetButtons = [
    { key: 'isometric', label: 'Isometric' },
    { key: 'top', label: 'Top' },
    { key: 'front', label: 'Front' },
    { key: 'side', label: 'Side' },
  ];

  const handleExportImage = () => {
    setTimeout(() => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;
      const prev = new THREE.Vector2();
      renderer.getSize(prev);
      renderer.setSize(prev.x * 2, prev.y * 2, false); // 2x resolution export
      renderer.render(scene, camera);
      const dataURL = renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = '3d-bar-chart.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      renderer.setSize(prev.x, prev.y, false);
    }, 100);
  };

  function handleExportPDF() {
    setTimeout(() => {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      if (!renderer || !scene || !camera) return;
      const prev = new THREE.Vector2();
      renderer.getSize(prev);
      renderer.setSize(prev.x * 2, prev.y * 2, false);
      renderer.render(scene, camera);
      const dataURL = renderer.domElement.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // Fit image inside page with small margin
      const margin = 24;
      const drawW = pageW - margin * 2;
      const drawH = pageH - margin * 2;
      pdf.addImage(dataURL, 'PNG', margin, margin, drawW, drawH);
      pdf.save('3d-bar-chart.pdf');
      renderer.setSize(prev.x, prev.y, false);
    }, 100);
  }

  function handleExportCSV() {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => row[h] ?? '').join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3d-bar-chart.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {presetButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setCameraPreset(btn.key)}
            style={{
              background: cameraPreset === btn.key ? '#2563eb' : '#1e293b',
              color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontWeight: 600,
              cursor: 'pointer', outline: cameraPreset === btn.key ? '2px solid #60a5fa' : 'none', transition: 'background 0.2s',
            }}
          >{btn.label}</button>
        ))}
        {Array.isArray(data) && data.length > maxVisible && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>Bars {startIdx + 1}-{Math.min(startIdx + maxVisible, data.length)} of {data.length}</span>
            <input type="range" min={0} max={Math.max(0, data.length - maxVisible)} value={startIdx} onChange={(e) => setStartIdx(parseInt(e.target.value, 10))} style={{ width: 220 }} />
          </div>
        )}
      </div>
      <div ref={mountRef} style={{ width: '100%', height: heightPx, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
        <div ref={tooltipRef} style={{ display: 'none', position: 'fixed', pointerEvents: 'none', background: 'rgba(30,41,59,0.95)', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 13, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 80, textAlign: 'left' }} />
      </div>
    </div>
  );
});

export default ThreeDBarChart; 
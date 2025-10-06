import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import jsPDF from 'jspdf';

const POINT_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e42', '#a21caf', '#eab308', '#6366f1', '#14b8a6'
];

const ThreeDScatterChart = forwardRef(({ data, xKey, yKey, zKey, theme }, ref) => {
    const mountRef = useRef(null);
    const tooltipRef = useRef(null);
    const [cameraPreset, setCameraPreset] = useState('isometric');
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);

    // Clean data before rendering
    const cleanedData = React.useMemo(() =>
        (data || []).filter(row =>
            Number.isFinite(Number(row[xKey])) &&
            Number.isFinite(Number(row[yKey])) &&
            Number.isFinite(Number(row[zKey]))
        ),
        [data, xKey, yKey, zKey]
    );

    useEffect(() => {
        if (!cleanedData || cleanedData.length === 0 || !xKey || !yKey || !zKey) return;

        // --- Theme Colors ---
        const isDark = theme === 'dark';
        const sceneColor = isDark ? 0x1f2937 : 0xf0f4f8; // dark:bg-gray-800, light:bg-gray-100
        const axesColor = isDark ? 0x9ca3af : 0x374151; // dark:text-gray-400, light:text-gray-700

        // === Scene Setup (copied from 3D Bar) ===
        const width = mountRef.current.clientWidth;
        const height = 500;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(sceneColor);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        // Camera preset positions
        const presetPositions = {
            isometric: { pos: [30, 30, 30], look: [0, 0, 0] },
            top: { pos: [0, 60, 0], look: [0, 0, 0] },
            front: { pos: [0, 20, 60], look: [0, 0, 0] },
            side: { pos: [60, 20, 0], look: [0, 0, 0] },
        };
        const initial = presetPositions[cameraPreset] || presetPositions.isometric;
        camera.position.set(...initial.pos);
        camera.lookAt(...initial.look);
        cameraRef.current = camera;

        // === WebGL Renderer ===
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // === Orbit Controls ===
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enableZoom = true;

        // === Lights ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // === Axis Helper ===
        const createAxis = (color, points) => {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color, linewidth: 3 });
            return new THREE.Line(geometry, material);
        };
        const axisLength = 22;
        scene.add(createAxis(0xff0000, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLength, 0, 0)])); // X
        scene.add(createAxis(0x00ff00, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLength, 0)])); // Y
        scene.add(createAxis(0x0000ff, [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLength)])); // Z

        // === TEST CUBE ===
        const testGeometry = new THREE.BoxGeometry(2, 2, 2);
        const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testGeometry, testMaterial);
        testCube.position.set(5, 5, 5);
        scene.add(testCube);

        // Points
        const xVals = cleanedData.map(d => Number(d[xKey] || 0));
        const yVals = cleanedData.map(d => Number(d[yKey] || 0));
        const zVals = cleanedData.map(d => Number(d[zKey] || 0));
        const maxX = Math.max(...xVals);
        const maxY = Math.max(...yVals);
        const maxZ = Math.max(...zVals);
        const minX = Math.min(...xVals);
        const minY = Math.min(...yVals);
        const minZ = Math.min(...zVals);
        // Normalize to fit in axisLength
        const norm = v => ({
            x: ((v.x - minX) / (maxX - minX || 1)) * axisLength,
            y: ((v.y - minY) / (maxY - minY || 1)) * axisLength,
            z: ((v.z - minZ) / (maxZ - minZ || 1)) * axisLength,
        });
        const points = [];
        cleanedData.forEach((row, i) => {
            const x = Number(row[xKey]);
            const y = Number(row[yKey]);
            const z = Number(row[zKey]);
            if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
                console.warn('Invalid data for scatter point:', row);
                return;
            }
            const pos = norm({ x, y, z });
            const geometry = new THREE.SphereGeometry(0.6, 16, 16);
            const color = POINT_COLORS[i % POINT_COLORS.length];
            const material = new THREE.MeshPhongMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(pos.x, pos.y, pos.z);
            sphere.userData = { x, y, z, color };
            scene.add(sphere);
            points.push(sphere);
        });

        // Raycaster for tooltips
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredPoint = null;
        let lastPointerEvent = null;
        const onPointerMove = (event) => {
            lastPointerEvent = event;
            const rect = mountRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        mountRef.current.addEventListener('pointermove', onPointerMove);

        // Camera preset animation logic
        let animating = false;
        let targetPos = null;
        let targetLook = null;
        const presetData = presetPositions[cameraPreset];
        if (presetData) {
            animating = true;
            targetPos = new THREE.Vector3(...presetData.pos);
            targetLook = new THREE.Vector3(...presetData.look);
        }

        // Animation loop
        const animate = () => {
            controls.update();
            if (animating && targetPos && targetLook) {
                camera.position.lerp(targetPos, 0.1);
                const currentLook = controls.target.clone();
                currentLook.lerp(targetLook, 0.1);
                controls.target.copy(currentLook);
                if (camera.position.distanceTo(targetPos) < 0.2 && controls.target.distanceTo(targetLook) < 0.2) {
                    camera.position.copy(targetPos);
                    controls.target.copy(targetLook);
                    animating = false;
                }
            }
            renderer.render(scene, camera);
            // Raycast for point hover
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(points);
            if (intersects.length > 0) {
                const point = intersects[0].object;
                if (hoveredPoint && hoveredPoint !== point) {
                    hoveredPoint.material.color.set(hoveredPoint.userData.color);
                }
                hoveredPoint = point;
                point.material.color.set('#f59e42'); // Highlight color
                if (tooltipRef.current && lastPointerEvent) {
                    tooltipRef.current.style.display = 'block';
                    tooltipRef.current.style.left = `${lastPointerEvent.clientX + 10}px`;
                    tooltipRef.current.style.top = `${lastPointerEvent.clientY - 30}px`;
                    tooltipRef.current.innerHTML = `<b>${xKey}:</b> ${point.userData.x}<br/><b>${yKey}:</b> ${point.userData.y}<br/><b>${zKey}:</b> ${point.userData.z}`;
                }
            } else {
                if (hoveredPoint) hoveredPoint.material.color.set(hoveredPoint.userData.color);
                hoveredPoint = null;
                if (tooltipRef.current) tooltipRef.current.style.display = 'none';
            }
            requestAnimationFrame(animate);
        };
        animate();

        // Cleanup
        return () => {
            mountRef.current?.removeChild(renderer.domElement);
            mountRef.current?.removeEventListener('pointermove', onPointerMove);
            renderer.dispose();
            rendererRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
        };
    }, [cleanedData, xKey, yKey, zKey, theme, cameraPreset]);

    useImperativeHandle(ref, () => ({
        exportPNG: handleExportImage,
        exportPDF: handleExportPDF,
        exportCSV: handleExportCSV,
    }));

    // Export handlers
    function handleExportImage() {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera) return;
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = '3d-scatter-chart.png';
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
        pdf.save('3d-scatter-chart.pdf');
    }
    function handleExportCSV() {
        if (!cleanedData || cleanedData.length === 0) return;
        const headers = Object.keys(cleanedData[0]);
        const rows = cleanedData.map(row => headers.map(h => `"${row[h]}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '3d-scatter-chart.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Camera preset buttons UI
    const presetButtons = [
        { key: 'isometric', label: 'Isometric' },
        { key: 'top', label: 'Top' },
        { key: 'front', label: 'Front' },
        { key: 'side', label: 'Side' },
    ];

    // Legend colors for axes
    const axisLegend = [
        { color: '#ff0000', label: 'X Axis' },
        { color: '#00ff00', label: 'Y Axis' },
        { color: '#0000ff', label: 'Z Axis' },
    ];
    // Legend for points: show color and xKey value
    const pointLegends = cleanedData.map((row, i) => ({ color: POINT_COLORS[i % POINT_COLORS.length], label: row[xKey] }));
    const legendBg = theme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)';
    const legendText = theme === 'dark' ? '#f3f4f6' : '#1e293b';

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {/* Floating Legend Overlay */}
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
                    minWidth: 140,
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    pointerEvents: 'auto',
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f5f9',
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Points</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
                    {pointLegends.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 18, height: 18, borderRadius: 9, background: item.color, display: 'inline-block', border: '1.5px solid #e5e7eb' }} />
                            <span style={{ fontSize: 13 }}>{item.label}</span>
                        </div>
                    ))}
                </div>
                <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
                {axisLegend.map(axis => (
                    <div key={axis.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 4, borderRadius: 2, background: axis.color, display: 'inline-block' }} />
                        <span>{axis.label}</span>
                    </div>
                ))}
            </div>
            {/* Chart Area */}
            <div style={{ width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    {presetButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setCameraPreset(btn.key)}
                            style={{
                                background: cameraPreset === btn.key ? '#2563eb' : '#1e293b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: cameraPreset === btn.key ? '2px solid #60a5fa' : 'none',
                                transition: 'background 0.2s',
                            }}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
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
        </div>
    );
});

export default ThreeDScatterChart; 
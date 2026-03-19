import { Graph } from "./graph.js";
import { GraphDisplay } from "./display.js";
import { Renderer } from "./renderer.js";
import { Vector } from "./vector.js";

const canvas = document.getElementById("canvas");
const textarea = document.getElementById("edges");
const directedToggle = document.getElementById("directedToggle");
const eigenToggle = document.getElementById("eigenToggle");
const ignoreFirstLineToggle = document.getElementById("ignoreFirstLine");

let graph = new Graph(0);
let display;
let renderer;

function resizeCanvas() {
	const rect = canvas.getBoundingClientRect();

	canvas.width = rect.width;
	canvas.height = rect.height;

	if (display) {
		display.resize(rect.width, rect.height);
	}
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function buildGraphFromText(text) {
	const linesRaw = text.split("\n").filter(l => l.trim().length > 0);

	const lines = ignoreFirstLineToggle.checked
		? linesRaw.slice(1)
		: linesRaw;

	const vertexSet = new Set();
	const edgesRaw = [];

	for (const line of lines) {
		const parts = line.trim().split(/\s+/);

		if (parts.length === 1) {
			vertexSet.add(parts[0]);
		}

		if (parts.length === 2 || parts.length === 3) {
			vertexSet.add(parts[0]);
			vertexSet.add(parts[1]);

			const w = parts.length === 3 ? parseFloat(parts[2]) : 1;

			edgesRaw.push([parts[0], parts[1], w]);
		}
	}

	// Convert set to array
	const labels = Array.from(vertexSet);

	// Map label → index
	const map = new Map();
	labels.forEach((label, i) => {
			map.set(label, i);
			});

	const g = new Graph(labels.length);

	// Store labels in graph
	g.labels = labels;

	for (const [uLabel, vLabel, w] of edgesRaw) {
		g.addEdge(map.get(uLabel), map.get(vLabel), w);
	}

	return g;
}



function rebuildGraph() {
	graph = buildGraphFromText(textarea.value);

	if (!display) {
		display = new GraphDisplay(
				graph,
				window.innerWidth, window.innerHeight,
				20
				);

		renderer = new Renderer(canvas, display);
		renderer.resize();
	} else {
		display.updateGraph(graph);
	}

	graph.directed = directedToggle.checked;
	display.eigenUpdated = false;
}

directedToggle.addEventListener("change", () => {
		if (display) {
		graph.directed = directedToggle.checked;
		}
		});

let debounceTimer = null;

textarea.addEventListener("input", () => {
		clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
				rebuildGraph();
				}, 300); // waits 300ms after last keystroke
		});

eigenToggle.addEventListener("change", () => {
		display.showEigen = eigenToggle.checked;
		display.eigenUpdated = false;

		});

ignoreFirstLineToggle.addEventListener("change", () => {
	rebuildGraph();
});

// Initial example
textarea.value = `0 1
1 2
2 3
3 4
4 5
5 0`;

rebuildGraph();

// ---------------- Dragging ----------------


let dragging = false;
let draggedVertex = -1;
let mouseDownPos = null;

canvas.addEventListener("pointerdown", (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const v = display.findVertexAt(x, y);

		if (v !== -1) {
		dragging = true;
		draggedVertex = v;
		mouseDownPos = { x, y };

		display.dragging[v] = true;

		// Prevent scrolling on mobile
		e.preventDefault();
		}
		});

canvas.addEventListener("pointermove", (e) => {
		if (!dragging || draggedVertex === -1) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		display.setPosition(draggedVertex, x, y);
		canvas.setPointerCapture(e.pointerId);
		});

canvas.addEventListener("pointerup", (e) => {
		if (draggedVertex !== -1) {

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const dx = x - mouseDownPos.x;
		const dy = y - mouseDownPos.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		if (dist < 6) {
		display.trava[draggedVertex] = !display.trava[draggedVertex];
		}

		display.dragging[draggedVertex] = false;
		}

		dragging = false;
		draggedVertex = -1;
		canvas.releasePointerCapture(e.pointerId);
});




// ---------------- Animation ----------------

function animate() {
	if (display && renderer) {
		display.step();
		renderer.draw();
	}
	requestAnimationFrame(animate);
}

animate();


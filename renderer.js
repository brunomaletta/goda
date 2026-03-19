export class Renderer {
	constructor(canvas, display) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = true;
		this.display = display;

		this.radius = display.radius;
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	draw() {
		const ctx = this.ctx;
		const graph = this.display.graph;
		const pos = this.display.pos;

		const edges = graph.getEdges();
		const showWeights = edges.some(([_, __, w]) => w !== 1);

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw edges
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;

		for (const [u, v, w] of edges) {
			const p1 = pos[u];
			const p2 = pos[v];
		
			if (u === v) {
				const loopRadius = this.radius * 1.0;
			
				const cx = p1.x;
				const cy = p1.y + this.radius * 1.0;
			
				const startAngle = -Math.PI * 0.15;
				const endAngle = Math.PI * 1.15;
			
				ctx.beginPath();
				ctx.arc(cx, cy, loopRadius, startAngle, endAngle);
				ctx.stroke();
			
				// -------------------
				// DRAW ARROW (if directed)
				// -------------------
				if (graph.directed) {
					for (const angle of [endAngle, startAngle]) {
						// Point on arc
						const x = cx + loopRadius * Math.cos(angle);
						const y = cy + loopRadius * Math.sin(angle);

						// Tangent direction
						let tx = -Math.sin(angle);
						let ty = Math.cos(angle);
						if (angle === startAngle) {
							tx = -tx;
							ty = -ty;
						}

						drawArrowFromDirection(ctx, x, y, tx, ty);
					}
				}
			
				// -------------------
				// WEIGHT
				// -------------------
				if (showWeights) {
					ctx.fillStyle = "black";
					ctx.font = "14px monospace";
					ctx.textAlign = "center";
			
					ctx.fillText(
						w.toString(),
						cx,
						cy + loopRadius + 10
					);
				}
			
				continue;
			}
			// -------------------
			// NORMAL EDGE
			// -------------------
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
		
			// Draw arrow if directed
			if (graph.directed) {
				drawArrow(ctx, p1, p2, this.radius);
			}
		
			// -------------------
			// DRAW WEIGHT
			// -------------------
			if (showWeights) {
				const midX = (p1.x + p2.x) / 2;
				const midY = (p1.y + p2.y) / 2;

				// Slight perpendicular offset 
				const dx = p2.x - p1.x;
				const dy = p2.y - p1.y;
				const len = Math.sqrt(dx * dx + dy * dy) || 1;

				const nx = -dy / len;
				const ny = dx / len;

				const offset = 10;

				ctx.fillStyle = "black";
				ctx.font = "14px monospace";   // bigger
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillText(
					w.toString(),
					midX + nx * offset,
					midY + ny * offset
				);
			}
		}

		// Draw nodes
		for (let i = 0; i < graph.getN(); i++) {
			const p = pos[i];

			ctx.beginPath();
			ctx.arc(p.x, p.y, this.radius, 0, 2 * Math.PI);
			ctx.fillStyle = "#86c232";
			ctx.fill();

			ctx.lineWidth = this.display.trava[i] ? 4 : 2;
			ctx.strokeStyle = "#000";
			ctx.stroke();

			ctx.fillStyle = "#000";
			ctx.font = "14px monospace";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const label = graph.labels ? graph.labels[i] : i.toString();
			ctx.fillText(label, p.x, p.y);
		}

		// DRAW EIGEN LAST
		if (this.display.showEigen) {

			this.display.computeEigen();
			const eig = this.display.eigenvalues;

			const panelWidth = 220;
			const x = this.canvas.width - panelWidth - 20;
			const y = 20;

			ctx.fillStyle = "white";
			ctx.fillRect(x, y, panelWidth, 30 + eig.length * 18);

			ctx.strokeStyle = "#000";
			ctx.lineWidth = 1;
			ctx.strokeRect(x, y, panelWidth, 30 + eig.length * 18);

			ctx.fillStyle = "black";
			ctx.font = "14px monospace";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";

			ctx.fillText("Eigenvalues:", x + 10, y + 8);

			for (let i = 0; i < eig.length; i++) {
				ctx.fillText(
						eig[i].toFixed(4),
						x + 10,
						y + 28 + i * 18
						);
			}
		}
	}

}

function drawArrowFromDirection(ctx, x, y, dx, dy) {
	const len = Math.sqrt(dx * dx + dy * dy) || 1;
	dx /= len;
	dy /= len;

	const arrowLength = 10;
	const angle = Math.atan2(dy, dx);

	ctx.beginPath();
	ctx.moveTo(x, y);

	ctx.lineTo(
		x - arrowLength * Math.cos(angle - Math.PI / 6),
		y - arrowLength * Math.sin(angle - Math.PI / 6)
	);

	ctx.lineTo(
		x - arrowLength * Math.cos(angle + Math.PI / 6),
		y - arrowLength * Math.sin(angle + Math.PI / 6)
	);

	ctx.closePath();
	ctx.fillStyle = "#000";
	ctx.fill();
}

function drawArrow(ctx, from, to, radius) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const angle = Math.atan2(dy, dx);

	const arrowLength = 10;

	const x = to.x - radius * Math.cos(angle);
	const y = to.y - radius * Math.sin(angle);

	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(
			x - arrowLength * Math.cos(angle - Math.PI / 6),
			y - arrowLength * Math.sin(angle - Math.PI / 6)
			);
	ctx.lineTo(
			x - arrowLength * Math.cos(angle + Math.PI / 6),
			y - arrowLength * Math.sin(angle + Math.PI / 6)
			);
	ctx.closePath();
	ctx.fillStyle = "#000";
	ctx.fill();
}


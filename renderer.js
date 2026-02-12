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

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw edges
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;

		for (const [u, v] of graph.getEdges()) {
			const p1 = pos[u];
			const p2 = pos[v];

			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();

			if (graph.directed) {
				drawArrow(ctx, p1, p2, this.radius);
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


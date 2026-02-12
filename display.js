import { Vector } from "./vector.js";

const EPS = 1e-6;

export class GraphDisplay {
	constructor(graph, width, height, radius = 20) {
		this.graph = graph;

		this.X = width;
		this.Y = height;
		this.radius = radius;

		this.temDir = false;
		this.centr = false;
		this.draw = false;

		this.pos = [];
		this.vel = [];
		this.para = [];
		this.trava = [];
		this.dragging = [];

		this.showEigen = false;
		this.eigenvalues = [];
		this.eigenUpdated = false;

		this.initPolygon();
	}

	cmpDouble(x, y, EPS = 1e-9) {
		const dist = Math.abs(x - y);
		if (dist < EPS) return 0;
		return x < y ? -1 : 1;
	}

	findVertexAt(x, y) {
		const mouse = new Vector(x, y);

		for (let i = this.pos.length - 1; i >= 0; i--) {
			if (mouse.distance(this.pos[i]) < this.radius) {
				return i;
			}
		}

		return -1;
	}

	setPosition(i, x, y) {
		this.pos[i] = this.deixaDentro(new Vector(x, y), false);
		this.vel[i] = new Vector(0, 0);
	}

	// -------------------------
	// Initial circular layout
	// -------------------------
	initPolygon() {
		const n = this.graph.getN();
		if (n === 0) return;

		const raioGrafo = (Math.min(this.X, this.Y) - 100) / 2;
		let centro = new Vector(this.X / 2, this.Y / 2);
		const theta = (2 * Math.PI) / n;

		if (n % 2 === 1) {
			const falta = raioGrafo - raioGrafo * Math.cos(theta / 2);
			centro = centro.add(new Vector(0, falta / 2));
		}

		this.pos = [];
		this.vel = [];
		this.para = [];
		this.trava = [];
		this.dragging = [];

		for (let i = 0; i < n; i++) {
			this.pos.push(
					new Vector(
						centro.x + Math.sin(i * theta + theta / 2) * raioGrafo,
						centro.y + Math.cos(i * theta + theta / 2) * raioGrafo
						)
					);

			this.vel.push(new Vector(0, 0));
			this.para.push(false);
			this.trava.push(false);
			this.dragging.push(false);
		}
	}

	// -------------------------
	// Keep vertex inside canvas
	// -------------------------
	deixaDentro(v, trav) {
		const r = this.radius;
		const pad = trav ? 2 : 0;

		let x = Math.max(v.x, r + 1 + pad);
		let y = Math.max(v.y, r + 1 + pad);

		x = Math.min(x, this.X - r - 3 - pad);
		y = Math.min(y, this.Y - r - 3 - pad);

		return new Vector(x, y);
	}

	// -------------------------
	// Eades with acceleration
	// -------------------------
	fdpEadesAcc(it) {
		const adj = this.graph.getSimMatrix();
		const n = this.graph.getN();

		const c1 = 20;
		const c2 = 100;
		const c3 = 50000;
		const c4 = 0.3;
		const c5 = 100000;

		while (it--) {
			const forces = [];

			for (let i = 0; i < n; i++) {
				let f = new Vector(0, 0);

				for (let j = 0; j < n; j++) {
					if (j === i) continue;

					let d = this.pos[i].distance(this.pos[j]);
					if (d < EPS) d = EPS;

					const unit = this.pos[j].sub(this.pos[i]).scale(1 / d);

					if (!adj[i][j]) {
						// repulsion
						f = f.sub(unit.scale(c3 / (d * d)));
					} else {
						// spring force
						f = f.add(
								unit.scale(
									c1 * Math.log(d / (c2 + n + this.graph.getEdges().length))
									)
								);
					}
				}

				// Wall repulsion
				const walls = [
					new Vector(0, this.pos[i].y),
						new Vector(this.X, this.pos[i].y),
						new Vector(this.pos[i].x, 0),
						new Vector(this.pos[i].x, this.Y),
				];

				for (const w of walls) {
					let d = this.pos[i].distance(w);
					if (d < EPS) d = EPS;

					const unit = w.sub(this.pos[i]).scale(1 / d);
					f = f.sub(unit.scale(c5 / (d * d)));
				}

				// Damping
				const damping = this.vel[i].scale(-0.2);
				f = f.add(damping);

				forces.push(f);
			}

			// Update velocity
			for (let i = 0; i < n; i++) {
				if (!this.dragging[i]) {
					this.vel[i] = this.vel[i].add(forces[i].scale(c4));
				}
			}

			// Stop locked or paused nodes
			for (let i = 0; i < n; i++) {
				if (this.trava[i] || this.dragging[i]) {
					this.vel[i] = new Vector(0, 0);
				}
			}

			// Update position
			for (let i = 0; i < n; i++) {
				if (!this.trava[i] && !this.dragging[i]) {
					this.pos[i] = this.deixaDentro(
							this.pos[i].add(this.vel[i]),
							this.trava[i]
							);
				}
			}

		}
	}

	// -------------------------
	// Animation step
	// -------------------------
	step() {
		if (this.draw) return;

		// run a few iterations per frame
		this.fdpEadesAcc(2);
	}

	updateGraph(newGraph) {
		const oldN = this.graph.getN();
		const newN = newGraph.getN();

		// Preserve old positions
		const newPos = [];
		const newVel = [];
		const newPara = [];
		const newTrava = [];
		const newDragging = [];

		for (let i = 0; i < newN; i++) {
			if (i < oldN) {
				// existing vertex → keep everything
				newPos.push(this.pos[i]);
				newVel.push(this.vel[i]);
				newPara.push(this.para[i]);
				newTrava.push(this.trava[i]);
				newDragging.push(this.dragging[i]);
			} else {
				// new vertex → place in center
				const cx = this.X / 2;
				const cy = this.Y / 2;

				const radius = Math.min(this.X, this.Y) * 0.12; // adjust spread

				const angle = Math.random() * 2 * Math.PI;
				const r = radius * Math.sqrt(Math.random());

				const x = cx + r * Math.cos(angle);
				const y = cy + r * Math.sin(angle);

				newPos.push(new Vector(x, y));
				newVel.push(new Vector(0, 0));
				newPara.push(false);
				newTrava.push(false);
				newDragging.push(false);
			}
		}

		// Replace internal state
		this.graph = newGraph;
		this.pos = newPos;
		this.vel = newVel;
		this.para = newPara;
		this.trava = newTrava;
		this.dragging = newDragging;
	}

	inertia(a) {
		const n = a.length;

		for (let k = 0; k < n; k++) {

			if (this.cmpDouble(a[k][k], 0) === 0) {
				for (let i = k; i < n; i++) {
					if (this.cmpDouble(a[i][k], 0) !== 0) {
						const vec = [...a[i]];

						for (let j = 0; j < n; j++) {
							a[k][j] += vec[j];
							a[j][k] += vec[j];
						}
						break;
					}
				}
			}

			if (this.cmpDouble(a[k][k], 0) === 0) continue;

			const alpha = Math.sqrt(Math.abs(a[k][k]));

			for (let i = k; i < n; i++) {
				a[i][k] /= alpha;
				a[k][i] /= alpha;
			}

			for (let i = k + 1; i < n; i++) {
				const beta = a[i][k] / a[k][k];

				for (let j = 0; j < n; j++) {
					a[i][j] -= beta * a[k][j];
				}

				const gamma = a[k][i] / a[k][k];

				for (let j = 0; j < n; j++) {
					a[j][i] -= gamma * a[j][k];
				}
			}
		}

		const ans = [0, 0, 0];

		for (let k = 0; k < n; k++) {
			const sign = this.cmpDouble(a[k][k], 0, 1e-9);
			ans[sign + 1]++;
		}

		return ans;
	}

	eigenvalueRec(t, eig, l, r, sz_l, sz_r) {
		const n = t.length;

		if (sz_l + sz_r === n) return;

		const m = (l + r) / 2;

		if (this.cmpDouble(l, r, 1e-6) === 0) {
			for (let k = 0; k < n - sz_l - sz_r; k++) {
				eig.push(m);
			}
			return;
		}

		const a = [];

		for (let i = 0; i < n; i++) {
			a[i] = [];
			for (let j = 0; j < n; j++) {
				a[i][j] = t[i][j];
				if (i === j) a[i][j] -= m;
			}
		}

		const inertia = this.inertia(a);

		this.eigenvalueRec(t, eig, l, m, sz_l, inertia[1] + inertia[2]);

		for (let k = 0; k < inertia[1]; k++) {
			eig.push(m);
		}

		this.eigenvalueRec(t, eig, m, r, inertia[0] + inertia[1], sz_r);
	}

	computeEigen() {
		if (this.eigenUpdated) return;
		console.log("Computing eigen...");

		const matrix = this.graph.getSimMatrix();

		const eig = [];
		this.eigenvalueRec(
				matrix,
				eig,
				-this.graph.getN(),
				this.graph.getN(),
				0,
				0
				);

		this.eigenvalues = eig.sort((a, b) => a - b);
		this.eigenUpdated = true;
	}

}


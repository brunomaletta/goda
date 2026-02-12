export class Graph {
	constructor(n = 0) {
		this.n = n;
		this.edges = [];
		this.directed = false;
		this.labels = [];
	}

	addEdge(u, v) {
		this.edges.push([u, v]);
	}

	getN() {
		return this.n;
	}

	getEdges() {
		return this.edges;
	}

	getSimMatrix() {
		const matrix = Array.from({ length: this.n }, () =>
				Array(this.n).fill(0)
				);

		for (const [u, v] of this.edges) {
			matrix[u][v] = 1;
			matrix[v][u] = 1;
		}

		return matrix;
	}

}


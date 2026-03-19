export class Graph {
	constructor(n = 0) {
		this.n = n;
		this.edges = [];
		this.directed = false;
		this.labels = [];
	}

	addEdge(u, v, w = 1) {
		this.edges.push([u, v, w]);
	}

	getN() {
		return this.n;
	}

	getEdges() {
		return this.edges;
	}

	getUnweightedSimMatrix() {
		const matrix = Array.from({ length: this.n }, () =>
				Array(this.n).fill(0)
				);

		for (const [u, v, w] of this.edges) {
			matrix[u][v] = 1;
			matrix[v][u] = 1;
		}

		return matrix;
	}

}


export class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  scale(c) {
    return new Vector(this.x * c, this.y * c);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  distance(v) {
    return this.sub(v).norm();
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  rotate(th) {
    return new Vector(
      this.x * Math.cos(th) - this.y * Math.sin(th),
      this.x * Math.sin(th) + this.y * Math.cos(th)
    );
  }

  project(v) {
    const denom = v.dot(v);
    if (denom === 0) return new Vector(0, 0);
    return v.scale(this.dot(v) / denom);
  }
}


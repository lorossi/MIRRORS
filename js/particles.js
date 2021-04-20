class Particle {
  constructor(x, y, vel, word, size, max_life, width, height) {
    this._pos = new Vector(x, y);
    this._vel = vel.copy();
    this._word = word;
    this._size = size;
    this._width = width;
    this._height = height;
    this._max_life = max_life;

    this._life = 0;
    this._dist = new Vector(0, 0);
  }

  move() {
    // increase life
    this._life++;
    // keep track of the distance from the spawn
    this._dist.add(this._vel);
    // actually move
    this._pos.add(this._vel);

    // bounce around
    if (this._pos.x - this._size / 2 < 0 || this._pos.x + this._size / 2 > this._width) this._vel.x *= -1;
    if (this._pos.y - this._size / 2 < 0 || this._pos.y > this._height) this._vel.y *= -1;
  }

  get x() {
    return parseInt(this._pos.x);
  }

  get y() {
    return parseInt(this._pos.y);
  }

  get dist() {
    return this._dist.mag();
  }

  get theta() {
    return this._vel.heading() + Math.PI / 2;
  }

  get alive() {
    return this._life < this._max_life;
  }

  get size() {
    return this._size;
  }

  set size(s) {
    this._size = s;
  }

  get alpha() {
    // get alpha, separated if less than a certain age
    const min_age = 100;
    if (this._life < min_age) return ease(this._life / min_age);
    return 1 - ease(this._life / this._max_life);
  }

  get word() {
    return this._word;
  }
}

class Vector {
  constructor(x = 0, y = 0) {
    this._x = x;
    this._y = y;
  }

  heading() {
    return Math.atan2(this._y, this._x);
  }

  mag() {
    return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
  }

  add(v) {
    this._x += v.x;
    this._y += v.y;
    return this;
  }

  copy() {
    return new Vector(this._x, this._y);
  }

  rotate(t) {
    this._x = this._x * Math.cos(t) - this._y * Math.sin(t);
    this._y = this._x * Math.sin(t) + this._y * Math.cos(t);
    return this;
  }

  get x() {
    return this._x;
  }

  set x(s) {
    this._x = s;
  }

  get y() {
    return this._y;
  }

  set y(s) {
    this._y = s;
  }
}
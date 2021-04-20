class Sketch extends Engine {
  setup() {
    // parameters
    this._max_life = 1200;
    this._words = ["MIRRORS", "ECHOES", "WAVES"];
    this._waves_number = this._words.length * 4;
    this._show_fps = false;
    this._recording = false;
    // sketch setup
    this._ended = false;
    this._replaced = 0;
    console.clear();
    this._capturer_started = false;
    this._capturer = new CCapture({
      framerate: 60,
      verbose: true,
      motionBlurFrames: true,
      format: "png",
    });
    this._word_count = 0;
    this._waves = [];
    for (let i = 0; i < this._waves_number; i++) {
      const new_wave = new Wave(this._words[this._word_count], this._max_life, this._width, this._height);
      new_wave.age((1 - i / this._waves_number) * this._max_life);
      this._waves.push(new_wave);
      // update the current word counter
      this._word_count = (this._word_count + 1) % this._words.length;
    }
  }

  draw() {
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
    }

    this.background("#000");
    // draw and updates waves
    this._waves.forEach(w => {
      w.show(this._ctx);
      w.move();
    });

    // remove empty waves
    this._waves = this._waves.filter(p => p.alive);
    // replenish waves array
    if (this._waves.length < this._waves_number) {
      const new_wave = new Wave(this._words[this._word_count], this._max_life, this._width, this._height);
      this._waves.push(new_wave);
      // update the current word counter
      this._word_count = (this._word_count + 1) % this._words.length;
      // keep the count of replaced words
      this._replaced++;

      this._ended = this._replaced > this._words.length;
    }

    // show FPS
    if (this._show_fps) {
      this._ctx.save();
      this._ctx.fillStyle = "red";
      this._ctx.font = "30px Hack";
      this._ctx.fillText(parseInt(this._frameRate), 40, 40);
      this._ctx.restore();
    }

    if (this._recording) {
      if (!this._ended) this._capturer.capture(this._canvas);
      else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
      }
    }
  }
}

class Wave {
  constructor(word, max_life, width, height) {
    this._word = word.split("");
    this._max_life = max_life;

    this._pos = new Vector(width / 2, height); // curve center
    this._vel = new Vector(0, -2); // expanding velocity
    this._span = Math.PI / 4; // curve radius
    this._radius = 10; // curve radius
    this._particles_num = this._word.length * 2;
    this._particle_max_size = 75; // max text size 

    this._particles = [];
    const d_theta = this._vel.heading();

    const theta_increment = this._span / this._particles_num;
    const start_theta = -this._span / 2 + theta_increment / 2;
    const end_theta = this._span / 2;

    // generate wave of particles (letters)
    let count = 0;
    for (let theta = start_theta; theta < end_theta; theta += theta_increment) {
      const px = this._pos.x + this._radius * Math.cos(theta + d_theta);
      const py = this._pos.y + this._radius * Math.sin(theta + d_theta);
      const pvel = this._vel.copy().rotate(theta);
      this._particles.push(new Particle(px, py, pvel, this._word[count], this._particle_max_size, this._max_life, width, height));

      count = (count + 1) % this._word.length;
    }
  }

  show(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    this._particles.forEach(p => {
      ctx.save();
      ctx.font = `${p.size}px Hack`;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.theta);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fillText(p.word, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  move() {
    // set text size to fill the arch
    const part_size = this._span * this._particles[0].dist / this._particles.length;
    if (part_size < this._particle_max_size) this._particles.forEach(p => p.size = part_size);
    // update size
    this._particles.forEach(p => p.move(this._particles, this._particles_dist));
    // remove dead particles
    this._particles = this._particles.filter(p => p.alive);
  }

  age(life) {
    // set particle age
    this._particles.forEach(p => p.age(life));
  }

  get alive() {
    return this._particles.length > 0;
  }
}

const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

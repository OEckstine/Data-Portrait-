const controls = {
  resolution: 240,
  noiseFactor: 6,
  hoverWobble: 5.0,
  noiseDetail: 0.01,
  speed: 0.02
};
let flowSpeed = 0.6;     
let waveWidth = 20;      
let waveFront = 0;
let table;
let size = 9;
let cx, cy;
let num;
let minR = 80;
let rings = [];
let palette = ["#4287f5", "#59B1C9", "#2b67af", "#62b6de", "#1B19A2", "#D0E5FF", "#587AD1", "#49C6FF"];

function preload() {
  table = loadTable("data.csv", "csv", "header");
}

function setup() {
  createCanvas(450, 450);
  cx = width / 2;
  cy = height / 2;
  num = table.getRows().length;

  for (let i = 0; i < num; i++) {
    let dataRow = table.getRow(i);  
    let date = dataRow.getString("Date");
    let AveragedB = dataRow.getString("Avg");
    let HighestdB = dataRow.getString("DB High");
    let r = minR + i * size;
    let c = random(palette);
    rings.push(new Ring(i, date, AveragedB, HighestdB, r, c));
  }
  waveFront = minR;
}

function draw() {
  background(60);
  waveFront += flowSpeed;
  const outerR = minR + (num - 1) * size;
  if (waveFront > outerR + waveWidth) {
    waveFront = minR - waveWidth;
  }

  for (let i = 0; i < num; i++) {
    rings[i].update();
    rings[i].display();
  }
}

class Ring {
  constructor(index, date, avg, high, r, c) {
    this.index = index;
    this.date = date;
    this.avg = float(avg);
    this.high = float(high);
    this.r = r;
    this.c = c;
    this.hoverFactor = 0;
  }

  update() {
    const d = abs(this.r - waveFront);
    const halfW = waveWidth * 0.5;
    const t = 1.0 - constrain((d - 0) / halfW, 0, 1);
    this.hoverFactor = t * t * (3 - 2 * t);
  }

  display() {
    noFill();
    const sw = lerp(2, 4, this.hoverFactor);
    strokeWeight(3);
    stroke(this.c);

    beginShape();
    const dataBoost = map(this.avg, 40, 100, 1.0, 3.5);  
    const wobbleBoost = lerp(1.0, controls.hoverWobble * 1.2, this.hoverFactor);
    const wobbleAmt = controls.noiseFactor * 1.5 * wobbleBoost * dataBoost;

    for (let i = 0; i <= controls.resolution; i++) {
      const a = map(i, 0, controls.resolution, 0, TWO_PI);
      const bx = cx + cos(a) * this.r;
      const by = cy + sin(a) * this.r;
      const n = noise(
        bx * controls.noiseDetail,
        by * controls.noiseDetail,
        frameCount * controls.speed
      );

      const offsetR = n * wobbleAmt;
      const x = cx + cos(a) * (this.r + offsetR);
      const y = cy + sin(a) * (this.r + offsetR);

      vertex(x, y);
    }

    endShape(CLOSE);
  }  
}

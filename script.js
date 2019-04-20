const INDICATOR_BACKGROUND = 'black';
const GRID_COLOR = 'green';
const SCAN_LINE_COLOR = 'red';
const RING_AMOUNT = 8;
const SECTOR_AMOUNT = 16;
const GRID_WIDTH = 1;
const SCAN_LINE_WIDTH = 2;
const GRID_BORDER = 0.95;
const SCAN_LINE_START_ANGLE = 0;
const SCAN_LINE_PERIOD = 60;

function Indicator({
    startX,
    startY,
    radius,
}) {
    this.x = startX;
    this.y = startY;
    this.radius = radius;
    this.background = INDICATOR_BACKGROUND;
    this.grid = {
        edge: GRID_BORDER,
        rings: createRings(),
        color: GRID_COLOR,
        width: GRID_WIDTH,
        sectorCount: SECTOR_AMOUNT,
    };
    this.scanLine = {
        angle: SCAN_LINE_START_ANGLE,
        width: SCAN_LINE_WIDTH,
        color: SCAN_LINE_COLOR,
        frequency: SCAN_LINE_PERIOD,
    };
    this.signal = {
        td: 5E-9,
        speed: 3E+8,
        amplitude: 2E+4,
        duration: 1E-7,
        carrier: 2E+7,
        function: (t) => {
            const a = this.signal.amplitude;
            const f = this.signal.carrier;
            const duration = this.signal.duration;

            return t >= 0 && t <= duration ? a * Math.sin(2 * Math.PI * f * t) : 0;
        },
        sampling: () => {
            const td = this.signal.td;
            const amount = Math.floor(this.signal.duration / td);
            const signal = this.signal.function;

            this.signal.samples = new Array(amount).fill(0);
            this.signal.samples.forEach((s, i, a) => {
                a[i] = signal(i * td);
            });
        },
    };
    this.filter = {
        create: () => {
            const samples = this.signal.samples;
            this.filter.samples = samples.reverse();
        }
    };
}

function Ring(position) {
    this.position = position;
}

function createRings() {
    let rings = [];
    for (let i = 0; i < RING_AMOUNT; i++) {
        const position = GRID_BORDER * (i + 1) / RING_AMOUNT;
        rings.push(new Ring(position));
    }
    return rings;
}

function drawIndicator({ctx, indicator,}) {
    drawBackground({ctx, indicator});
    drawRings({ctx, indicator});
    drawGrid({ctx, indicator});
    drawScanLine({ctx, indicator});
}

function drawBackground({ctx, indicator,}) {
    ctx.fillStyle = indicator.background;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, indicator.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawRing({ctx, indicator, ring,}) {
    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, ring.position * indicator.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawRings({ctx, indicator,}) {
    indicator.grid.rings.forEach((ring) => {
        drawRing({ctx, indicator, ring});
    })
}

function drawGrid({ctx, indicator,}) {
    const x = indicator.x;
    const y = indicator.y;
    const sectorCount = indicator.grid.sectorCount;
    const edge = indicator.grid.edge * indicator.radius;

    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    for (let i = 0; i < sectorCount; i++) {
        const angle = i * 2 * Math.PI / sectorCount;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(angle) * edge, y - Math.cos(angle) * edge);
    }
    ctx.stroke();
}

function drawScanLine({ctx, indicator,}) {
    const x = indicator.x;
    const y = indicator.y;
    const angle = indicator.scanLine.angle;
    const edge = indicator.grid.edge * indicator.radius;

    ctx.strokeStyle = indicator.scanLine.color;
    ctx.lineWidth = indicator.scanLine.width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * edge, y - Math.cos(angle) * edge);
    ctx.stroke();
}

function redraw({ctx, indicator,}) {
    drawIndicator({ctx, indicator,});
}

function updateScanLine({dt, indicator,}) {
    const scanLine = indicator.scanLine;
    const deltaAngle = 2 * Math.PI * dt / scanLine.frequency;
    scanLine.angle = (scanLine.angle + deltaAngle) % (2 * Math.PI);
}

function transmit() {
    //TODO: излучать сигнал в секторе
    //TODO: цели в секторе должны давать отклик
    //TODO: отклик состоит из зашумленного сигнала и задержки
    //TODO: отклик лежит в массиве откликов (обнулять в каждой итерации) для данного сектора
}

function receive() {
    //TODO: если массив откликов не пустой, пропустить отклик через окно (длина = длине сигнала) и через СФ
    //TODO: максимальный результат СФ лежат в массиве откликов СФ
    //TODO: по наибольшему значению результатов СФ принять решение о наличиии/пропуске сигнала
    //TODO: при наличии сигнала определить временную задержку, записать в массив задержек
}

function process() {
    //TODO; вычислить расстояние до цели и записать в массив обнаруженных целей (добавить время жизни)
}

function scan({dt, indicator,}) {
    const resolution = indicator.scanLine.resolution;

    const prevAngle = indicator.scanLine.angle;
    updateScanLine({dt, indicator,});
    const curAngle = indicator.scanLine.angle;

    const deltaSector = curAngle - prevAngle;

    //console.log(prevAngle);
    //console.log(curAngle);
    //console.log(deltaAngle);
    //console.log(dt);

    //transmit();
    //receive();
    //process();

    //console.log(sector);
}

function update({dt, indicator,}) {
    scan({dt, indicator,});
    console.log(indicator);
}

function main() {
    const canvasEl = document.getElementById('canvas');
    const width = canvasEl.offsetWidth;
	const height = canvasEl.offsetHeight;
    
    const ctx = canvasEl.getContext('2d');

    let indicator = new Indicator({
        startX: width / 2,
        startY: height / 2,
        radius: width / 2,
        color: 'black',
    });

    indicator.signal.sampling();
    indicator.filter.create();

    redraw({ctx, indicator,});

    let lastTimestamp = Date.now();
    const animateFn = () => {
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) * 0.001;
        lastTimestamp = currentTimestamp;

        update({
            dt: deltaTime,
            indicator,
        });
        redraw({ctx, indicator});
        requestAnimationFrame(animateFn);
    };
    animateFn();
}
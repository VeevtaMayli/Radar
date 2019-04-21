const INDICATOR_BACKGROUND = 'black';
const GRID_COLOR = 'green';
const SCAN_LINE_COLOR = 'red';
const RING_AMOUNT = 8;
const SECTOR_AMOUNT = 16;
const GRID_WIDTH = 1;
const SCAN_LINE_WIDTH = 2;
const GRID_BORDER = 0.95;
const SCAN_LINE_START_ANGLE = 0;
const SCAN_LINE_PERIOD = 6;
const DISTANCE_MAX = 40000;

function Indicator({startX, startY, radius}) {
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
        attenuationRatio: 3E-3,
        noiseLevel: 2E-8,
        maxDistance: DISTANCE_MAX,
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
        },
    };
}

function Target({radius, angle}) {
    this.radius = radius;
    this.angle = angle;
}

function Ring(position) {
    this.position = position;
}

function createRings() {
    const rings = [];
    for (let i = 0; i < RING_AMOUNT; i++) {
        const position = GRID_BORDER * (i + 1) / RING_AMOUNT;
        rings.push(new Ring(position));
    }
    return rings;
}

function drawBackground({ctx, indicator}) {
    ctx.fillStyle = indicator.background;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, indicator.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawRing({ctx, indicator, ring}) {
    ctx.strokeStyle = indicator.grid.color;
    ctx.lineWidth = indicator.grid.width;
    ctx.beginPath();
    ctx.arc(indicator.x, indicator.y, ring.position * indicator.radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawRings({ctx, indicator}) {
    indicator.grid.rings.forEach((ring) => {
        drawRing({ctx, indicator, ring});
    });
}

function drawGrid({ctx, indicator}) {
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

function drawScanLine({ctx, indicator}) {
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

function drawTarget({ctx, target, indicator}) {
    if (target.radius > indicator.signal.maxDistance) return;

    const radius = target.radius * indicator.radius * indicator.grid.edge / indicator.signal.maxDistance;
    const angle = target.angle;

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(indicator.x + radius * Math.sin(angle), indicator.y - radius * Math.cos(angle), 5, 0, 2 * Math.PI);
    ctx.fill();
}

function drawIndicator({ctx, indicator}) {
    drawBackground({ctx, indicator});
    drawRings({ctx, indicator});
    drawGrid({ctx, indicator});
    drawScanLine({ctx, indicator});
}

function redraw({ctx, indicator, targets}) {
    drawIndicator({ctx, indicator});

    targets.forEach((target) => {
        drawTarget({ctx, indicator, target});
    });
}

function updateScanLine({dt, indicator}) {
    const scanLine = indicator.scanLine;
    const deltaAngle = 2 * Math.PI * dt / scanLine.frequency;
    scanLine.angle = (scanLine.angle + deltaAngle) % (2 * Math.PI);
}

function angleInsideSector({minAngle, maxAngle, angle}) {
    return minAngle < maxAngle
        ? angle >= minAngle && angle < maxAngle
        : angle >= minAngle && angle < 2 * Math.PI || angle >= 0 && angle < maxAngle;
}

function transmit({signal, startAngle, stopAngle, responses, targets}) {
    const targetsInSector = targets.filter((target) => {
        return angleInsideSector({
            minAngle: startAngle,
            maxAngle: stopAngle,
            angle: target.angle,
        });
    });

    if (targetsInSector.length === 0) return;

    targetsInSector.forEach((target) => {
        const attenuation = Math.pow(10, -0.1 * signal.attenuationRatio * target.radius);
        const dumpedSamples = signal.samples.slice();
        dumpedSamples.forEach((sample, i, samples) => {
            samples[i] = attenuation * sample;
        });

        const delay = 2 * target.radius / signal.speed;
        const nSamples = Math.floor(delay / signal.td);
        let response = new Array(nSamples).fill(0);

        response = response.concat(dumpedSamples);
        response += (1 - 0.5 * Math.random()) * signal.noiseLevel;
        responses.push(response);
    });
}

function receive({signal, filter, responses, echoes}) {
    //TODO: если массив откликов не пустой, пропустить отклик через окно (длина = длине сигнала) и через СФ
    //TODO: максимальный результат СФ лежат в массиве откликов СФ
    //TODO: по наибольшему значению результатов СФ принять решение о наличиии/пропуске сигнала
    //TODO: при наличии сигнала определить временную задержку, записать в массив задержек
}

function process({echoes, detectedTargets}) {
    //TODO; вычислить расстояние до цели и записать в массив обнаруженных целей (добавить время жизни)
}

function scan({dt, indicator, targets}) {
    const signal = indicator.signal;
    const filter = indicator.filter.samples;
    const prevAngle = indicator.scanLine.angle;
    updateScanLine({dt, indicator});
    const curAngle = indicator.scanLine.angle;

    if (prevAngle === curAngle) return;
    const responses = [];
    const echoes = [];

    transmit({
        signal,
        startAngle: prevAngle,
        stopAngle: curAngle,
        responses,
        targets,
    });
    receive({signal, filter, responses, echoes});
    process({echoes});

    console.log(responses);
}

function update({dt, indicator, targets}) {
    scan({dt, indicator, targets});
}

function initialize({indicator, targets}) {
    indicator.signal.sampling();
    indicator.filter.create();

    for (let i = 0; i < 10; i++) {
        targets.push(new Target({
            radius: (Math.random() * indicator.radius * (indicator.grid.edge - indicator.grid.rings[0].position) + indicator.radius * indicator.grid.rings[0].position)
                * indicator.signal.maxDistance / 450 * 0.95,
            angle: Math.random() * 2 * Math.PI,
        }));
    }

    //console.log(indicator, targets);
}

function main() {
    const canvasEl = document.getElementById('canvas');
    const width = canvasEl.offsetWidth;
    const height = canvasEl.offsetHeight;

    const ctx = canvasEl.getContext('2d');

    const indicator = new Indicator({
        startX: width / 2,
        startY: height / 2,
        radius: width / 2,
        color: 'black',
    });

    const targets = [];
    //TODO: добавить обнаруженные цели

    initialize({indicator, targets});
    redraw({ctx, indicator, targets});

    let lastTimestamp = Date.now();
    const animateFn = () => {
        const currentTimestamp = Date.now();
        const deltaTime = (currentTimestamp - lastTimestamp) * 0.001;
        lastTimestamp = currentTimestamp;

        update({
            dt: deltaTime,
            indicator,
            targets,
        });
        redraw({ctx, indicator, targets});
        requestAnimationFrame(animateFn);
    };
    animateFn();
}

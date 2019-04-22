import {drawIndicator} from './drawing.js';
import {getNorm} from './util.js';

const INDICATOR_BACKGROUND = '#000000';
const GRID_COLOR = '#0b601a';
const SECTOR_AMOUNT = 16;
const RING_AMOUNT = 8;
const GRID_WIDTH = 1;
const GRID_BORDER = 0.95;

const SCAN_LINE_COLOR = '#0f951e';
const SCAN_LINE_WIDTH = 3;
const SCAN_LINE_START_ANGLE = 0;
const SCAN_LINE_PERIOD = 6;

const SIGNAL_MAX_DISTANCE = 4E+4;
const SAMPLING_INTERVAL = 5E-7;
const SIGNAL_AMPLITUDE = 2E+4;
const SIGNAL_DURATION = 1E-5;
const SIGNAL_CARRIER = 2E+5;
const SIGNAL_ATTENUATION_RATIO = 3E-3;
const SIGNAL_NOISE_LEVEL = 2E-8;
const LIGHT_VELOCITY = 3E+8;

const RESPONSE_LIMIT = 0.85;

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
        period: SCAN_LINE_PERIOD,
    };
    this.signal = {
        td: SAMPLING_INTERVAL,
        speed: LIGHT_VELOCITY,
        amplitude: SIGNAL_AMPLITUDE,
        duration: SIGNAL_DURATION,
        carrier: SIGNAL_CARRIER,
        attenuationRatio: SIGNAL_ATTENUATION_RATIO,
        noiseLevel: SIGNAL_NOISE_LEVEL,
        maxDistance: SIGNAL_MAX_DISTANCE,
        responseLimit: RESPONSE_LIMIT,
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
            const samples = this.signal.samples.slice().reverse();
            this.filter.samples = samples;
            this.filter.norm = getNorm(samples);
        },
    };
    this.draw = (ctx) => {
        drawIndicator({
            ctx,
            indicator: this,
        });
    };
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

export {
    Indicator,
    LIGHT_VELOCITY,
};

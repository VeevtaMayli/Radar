import {drawTarget} from './drawing.js';
import {makeAnglePositive} from './utils.js';

const TARGET_COLOR = 'rgba(200,204,000,1)'; // color only 'rgba(###,###,###,#);'
const TARGET_SIZE = 5;
const TARGET_LIFETIME_IN_PERIODS = 2;

const RANDOM_LAW_SPEED_LIMIT = 500;

const LAW = {
    linear: function(t) {
        const x0 = this.x0;
        const y0 = this.y0;
        const v = this.speed;
        const a = this.acceleration;

        const x = x0 + v.x * t + 0.5 * a.x * Math.pow(t, 2);
        const y = y0 + v.y * t + 0.5 * a.y * Math.pow(t, 2);

        const radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        const angle = Math.atan2(x, -y);

        return {radius, angle: makeAnglePositive(angle)};
    },
    random: function(t) {
        const x0 = this.x0;
        const y0 = this.y0;
        const v = {
            x: (2 * Math.random() - 1) * RANDOM_LAW_SPEED_LIMIT,
            y: (2 * Math.random() - 1) * RANDOM_LAW_SPEED_LIMIT,
        };

        const x = x0 + v.x * t;
        const y = y0 + v.y * t;

        const radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        const angle = Math.atan2(x, -y);

        return {radius, angle: makeAnglePositive(angle)};
    },
};

function Target({radius, angle, xSpeed = 0, ySpeed = 0, xAcceleration = 0, yAcceleration = 0, type = 'linear'}) {
    this.type = type;
    this.radius = radius;
    this.angle = angle;
    this.x0 = this.radius * Math.sin(this.angle);
    this.y0 = -this.radius * Math.cos(this.angle);
    this.color = TARGET_COLOR;
    this.size = TARGET_SIZE;
    this.speed = {
        x: xSpeed,
        y: ySpeed,
    };
    this.acceleration = {
        x: xAcceleration,
        y: yAcceleration,
    };
    this.motionLaw = LAW[this.type];
    this.draw = ({ctx, indicator}) => {
        drawTarget({
            ctx,
            target: this,
            indicator,
        });
    };
    this.attenuate = ({dt, indicator}) => {
        this.lifetime -= dt / indicator.scanLine.period / TARGET_LIFETIME_IN_PERIODS;

        const rgb = this.color.slice(0, 17);
        this.color = rgb + this.lifetime + ')';
    };
}

export {Target};

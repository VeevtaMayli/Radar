import {drawTarget} from './drawing.js';

const TARGET_COLOR = 'rgba(200,204,000,1)';
const TARGET_SIZE = 5;
const TARGET_ALPHA_LIMIT = 0.15;

function Target({radius, angle}) {
    this.radius = radius;
    this.angle = angle;
    this.x0 = this.radius * Math.sin(this.angle);
    this.y0 = -this.radius * Math.cos(this.angle);
    this.color = TARGET_COLOR;
    this.size = TARGET_SIZE;
    this.speed = {
        x: -1166,
        y: 0,
    };
    this.acceleration = {
        x: 0,
        y: 0,
    };
    this.motionLaw = (t) => {
        const x0 = this.x0;
        const y0 = this.y0;
        const v = this.speed;
        const a = this.acceleration;

        const x = x0 + v.x * t + 0.5 * a.x * Math.pow(t, 2);
        const y = y0 + v.y * t + 0.5 * a.y * Math.pow(t, 2);

        const radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        //console.log({x, radius});
        const angle = Math.atan2(x, -y);
        return {
            radius,
            angle: angle >= 0 ? angle : 2 * Math.PI + angle,
        };
    };
    this.draw = ({ctx, indicator}) => {
        drawTarget({
            ctx,
            target: this,
            indicator,
        });
    };
    this.attenuate = ({dt, indicator}) => {
        this.lifetime -= dt / indicator.scanLine.period;

        if (this.lifetime > TARGET_ALPHA_LIMIT) {
            const rgb = this.color.slice(0, 17);
            this.color = rgb + this.lifetime + ')';
        }
    };
}

export {Target};

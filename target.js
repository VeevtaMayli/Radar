import {drawTarget} from './drawing.js';

const TARGET_COLOR = 'rgba(200,204,000,1)';
const TARGET_SIZE = 5;
const TARGET_ALPHA_LIMIT = 0.15;

function Target({radius, angle}) {
    this.radius = radius;
    this.angle = angle;
    this.color = TARGET_COLOR;
    this.size = TARGET_SIZE;
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

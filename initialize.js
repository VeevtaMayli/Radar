import {Target} from './target.js';

function initialize({indicator, targets}) {
    indicator.signal.sampling();
    indicator.filter.create();

    for (let i = 0; i < 0; i++) {
        targets.push(new Target({
            radius: (Math.random() * indicator.radius * (indicator.grid.edge - indicator.grid.rings[0].position) + indicator.radius * indicator.grid.rings[0].position)
                * indicator.signal.maxDistance / (indicator.radius * indicator.grid.edge),
            angle: Math.random() * 2 * Math.PI,
        }));
    }
    //targets.push(new Target({radius: 40000, angle: 1.5}));
    targets.push(new Target({radius: 30000, angle: Math.PI / 2}));
    //targets.push(new Target({radius: 39000, angle: 0.55}));
    //targets.push(new Target({radius: 38000, angle: 2.6}));
    //targets.push(new Target({radius: 18000, angle: 2.6}));
}

export {initialize};

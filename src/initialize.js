import {Target} from './target.js';

const DEFAULT_TARGETS = '[{"radius":10000,"angle":1.570796326' +
    '7948966,"xSpeed":-1000,"xAcceleration":100,"type":' +
    '"linear"},{"radius":24500,"angle":4.04719755119659' +
    '76,"type":"random"}]';

function initialize({indicator, targets}) {
    localStorage['targets'] = DEFAULT_TARGETS;

    indicator.signal.sampling();
    indicator.filter.create();

    JSON.parse(localStorage['targets']).forEach((target) => {
        targets.push(new Target(target));
    });
}

export {initialize};

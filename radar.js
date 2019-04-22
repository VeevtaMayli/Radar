import {angleInsideSector, getNorm} from './util.js';
import {Target} from './target.js';
import {LIGHT_VELOCITY} from './indicator.js';

function scan({dt, indicator, targets, detectedTargets}) {
    const signal = indicator.signal;
    const filter = indicator.filter;
    const prevAngle = indicator.scanLine.angle;
    moveScanLine({dt, indicator});
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
    process({
        angle: curAngle,
        echoes,
        detectedTargets,
    });
}

function moveScanLine({dt, indicator}) {
    const scanLine = indicator.scanLine;
    const deltaAngle = 2 * Math.PI * dt / scanLine.period;
    scanLine.angle = (scanLine.angle + deltaAngle) % (2 * Math.PI);
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
        response.forEach((response, i, responses) => {
            responses[i] += (1 - 0.5 * Math.random()) * signal.noiseLevel;
        });
        responses.push(response);
    });
}

function filtration({signal, filter}) {
    const signalSize = signal.length;
    const responseSize = 2 * signalSize - 1;
    const responses = new Array(responseSize).fill(0);

    for (let n = 0; n < signalSize; n++) {
        responses.forEach((response, m, responses) => {
            if (m - n >= 0 && m-n <= responseSize - signalSize) {
                responses[m] += signal[n] * filter[m - n];
            }
        });
    }
    return responses;
}

function normalization({response, signal, filterNorm}) {
    const signalNorm = getNorm(signal);
    const norm = signalNorm * filterNorm;

    return Math.max(...response) / norm;
}

function receive({signal, filter, responses, echoes}) {
    if (responses.length === 0) return;

    const window = signal.samples.length;

    responses.forEach((response) => {
        const maxFilterResponses = [];
        for (let section = 0; section < response.length - window; section++) {
            const responsePart = response.slice(section, section + window);
            const filterResponses = filtration({
                signal: responsePart,
                filter: filter.samples,
            });

            maxFilterResponses.push(normalization({
                response: filterResponses,
                signal: responsePart,
                filterNorm: filter.norm,
            }));
        }

        const maxFilterResponse = Math.max(...maxFilterResponses);

        if (maxFilterResponse >= signal.responseLimit) {
            const position = maxFilterResponses.indexOf(maxFilterResponse) + 1;
            const delay = position * signal.td;
            echoes.push(delay);
        }
    });
}

function process({angle, echoes, detectedTargets}) {
    echoes.forEach((echo) => {
        detectedTargets.push(new Target({
            radius: echo * LIGHT_VELOCITY / 2,
            angle,
        }));
        detectedTargets[detectedTargets.length - 1].lifetime = 1;
    });
}

export {scan};

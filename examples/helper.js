const expectation1 = {
    expect: () => {
        return expectation1;
    },
    send: () => {
        return expectation1;
    },
    body: {
        id: 'mockId',
        name: 'asCustomer.testPost',
        latitude: 5.6,
        longitude: -4.2,
        links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}],
        date: '2018-06-01T11:05:00.000Z',
        values: new Array(3),

        computations: [{
            id: 'mockId',
            periodBegin: '2018-06-01T11:05:00.000Z',
            periodEnd: '2018-06-01T11:10:00.000Z',
            progressIngest: 1,
            launchedBy: 'demo',
            links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}, {rel: 'radar-measure', href: 'mockId'}],
        }, {
            id: 'mockId',
            periodBegin: '2018-06-01T11:05:00.000Z',
            periodEnd: '2018-06-01T11:10:00.000Z',
            progressIngest: 1,
            launchedBy: 'demo',
            links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}, {rel: 'radar-measure', href: 'mockId'}],
        }],

    }
};

const expectation2 = {
    expect: () => {
        return expectation2;
    },
    send: () => {
        return expectation2;
    },
    body: {
        id: 'mockId',
        name: 'asCustomer.testPut',
        latitude: 9.2,
        longitude: 7.2,
        date: '2018-06-01T11:05:00.000Z',
        values: new Array(3),
        map: JSON.stringify([{
            id: 'mockId',
            date: '2018-06-01T11:05:00.000Z',
            values: new Array(3),
        }]),

        status: 0,
        quality: -1,

        links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}],

        progressIngest : 1,
        progressComputing : 1,
        timeSpentInMs : 100,

        periodBegin: '2018-06-01T11:05:00.000Z',
        periodEnd: '2018-06-01T11:10:00.000Z',
    }
};

class mock {
    static _request() {
        return {
            post: () => {
                return expectation1;
            },
            put: () => {
                return expectation2;
            },
            get: () => {
                return expectation2;
            },
        };
    }

    info(...args) {
        console.log(args);
    }
}

exports.$app = new Promise((resolve) => {
    resolve(new mock())
});
exports.request = mock._request;
exports.logger = new mock();

exports.RainNode = require('../dist').RainNode;
exports.GaugeNode = require('../dist').GaugeNode;
exports.RadarNode = require('../dist').RadarNode;
exports.RadarNodeMap = require('../dist').RadarNodeMap;
exports.RadarMeasure = require('../dist').RadarMeasure;
exports.RainComputationNode = require('../dist').RainComputationNode;
exports.RainComputationMap = require('../dist').RainComputationMap;
exports.MeasureValuePolarContainer = require('../dist').MeasureValuePolarContainer;
exports.RainMeasure = require('../dist').RainMeasure;
exports.RadarMeasureValue = require('../dist').RadarMeasureValue;
exports.RainMeasureValue = require('../dist').RainMeasureValue;
exports.GaugeMeasure = require('../dist').GaugeMeasure;


exports.cleanup = async () => {

};

let polarValues = [];
for (let i = 0; i < 720; i++) {
    const polarEdges = [];
    for (let j = 0; j < 250; j++) {
        polarEdges.push(250 - j);
    }
    let container = {azimuth: i / 2, distance: 1, polarEdges: polarEdges};
    polarValues.push(container);
}

const value = {
    angle: 0.4,
    polars: polarValues,
};
const value2 = {
    angle: 1.4,
    polars: polarValues,
};
const value3 = {
    angle: 2.4,
    polars: polarValues,
};

const values = [value, value2, value3];

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
        values: values,
        computations: [{
            id: 'mockId',
            periodBegin: '2018-06-01T11:05:00.000Z',
            periodEnd: '2018-06-01T11:10:00.000Z',
            progressIngest: 1,
            launchedBy: 'demo',
            links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}, {
                rel: 'radar-measure',
                href: 'mockId'
            }],
        }, {
            id: 'mockId',
            periodBegin: '2018-06-01T11:05:00.000Z',
            periodEnd: '2018-06-01T11:10:00.000Z',
            progressIngest: 1,
            launchedBy: 'demo',
            links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}, {
                rel: 'radar-measure',
                href: 'mockId'
            }],
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
        values: values,
        map: JSON.stringify([{
            id: 'mockId',
            date: '2018-06-01T11:05:00.000Z',
            values: values,
        }]),

        status: 0,
        quality: -1,

        links: [{rel: 'rain', href: 'mockId'}, {rel: 'radar', href: 'mockId'}],

        progressIngest: 1,
        progressComputing: 1,
        timeSpentInMs: 100,

        periodBegin: '2018-06-01T11:05:00.000Z',
        periodEnd: '2018-06-01T11:10:00.000Z',
    }
};

const expectationGauge = {
    expect: () => {
        return expectationGauge;
    },
    send: () => {
        return expectationGauge;
    },
    id: 'mockId',
    name: 'asCustomer.testPut',
    latitude: 9.198,
    longitude: 7.201,
};

class Mock {
    static   _request(mockedApp) {
        return {
            post: async () => {
                return expectation1;
            },
            put: async () => {
                return expectation2;
            },
            get: async (url) => {
                if (url.indexOf('gauge') > 0) {
                    return expectationGauge;
                }
                return expectation2;
            },
        };
    }

    info(...args) {
        console.log(args);
    }
}

exports.$app = new Promise((resolve) => {
    resolve(new Mock());
});
exports.request = Mock._request;
exports.logger = new Mock();

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
exports.GaugeNodeMap = require('../dist').GaugeNodeMap;


exports.cleanup = async () => {

};

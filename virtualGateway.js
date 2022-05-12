const axios = require("axios").default;
const perlinNoise3d = require("perlin-noise-3d");

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
const noise = new perlinNoise3d();
const URL = "https://vitaband.herokuapp.com";
noise.noiseSeed(Math.E);

noiseOffset = (baseValue, magnitude, step, limits) => {
  let y = noise.get(step) * magnitude;
  let output = (baseValue + y).toFixed(2);
  if (output < limits[0]) {
    return limits[0];
  } else if (output > limits[1]) {
    return limits[1];
  } else {
    return output;
  }
};

function fetchEndpoint(gatewaySerial) {
  return axios.get(`${URL}/gateways/getGatewayInfo/${gatewaySerial}`);
}

async function transmit(nodeSerial, endpoint) {
  try {
    let noiseStep = 0;

    for (;;) {
      let datetime = new Date();
      console.log(datetime.toLocaleString());

      axios
        .post(endpoint, {
          nodeSerial: nodeSerial,
          heartRate: Math.round(noiseOffset(58, 50, noiseStep, [58, 110])),
          temperature: noiseOffset(35, 5, noiseStep + 1, [35, 40]),
          spo2: Math.round(noiseOffset(90, 10, noiseStep + 2, [90, 100])),
          lat: 14.837921,
          lng: 120.792356,
          date: `${datetime.getMonth() + 1}/${datetime.getDate()}/${2022}`,
          time: `${
            datetime.getHours() + 1
          }:${datetime.getMinutes()}:${datetime.getSeconds()}`,
          cough: Math.round(noiseOffset(0, 1, noiseStep + 20, [0, 1])),
          ir: noiseOffset(20000, 30000, noiseStep, [20000, 50000]),
          battery: 99,
        })
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });

      noiseStep += 0.1;
      await timer(4000);
      // break;
    }
  } catch (e) {
    console.log(e);
  }
}

fetchEndpoint("AAAA")
  .then(function (response) {
    let endpoint = response.data.endpoint;

    // transmit("01", endpoint);
    transmit("02", endpoint);
    transmit("03", endpoint);
  })
  .catch(function (error) {
    console.log(error);
  });

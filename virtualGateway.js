const axios = require("axios").default;
const perlinNoise3d = require("perlin-noise-3d");

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
const noise = new perlinNoise3d();
const URL = "https://vitaband.herokuapp.com";
// const URL = "http://localhost:8000";
const realEndpoint = "/readings";
const testEndpoint = "/test/postRead";
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

async function transmit(nodeSerial) {
  try {
    let noiseStep = 0;

    for (;;) {
      let datetime = new Date();
      console.log(datetime.toLocaleString());

      axios
        .post(URL + testEndpoint, {
          nodeSerial: nodeSerial,
          heartRate: noiseOffset(78, 20, noiseStep, [60, 99]),
          temperature: noiseOffset(31.51, 20, noiseStep + 1, [27, 45]),
          spo2: noiseOffset(90, 20, noiseStep + 2, [0, 100]),
          hr: noiseOffset(60, 20, noiseStep, [60, 200]),
          lat: 14.837921,
          lng: 120.792356,
          date: `${
            datetime.getMonth() + 1
          }/${datetime.getDate()}/${2022}`,
          time: `${
            datetime.getHours() + 1
          }:${datetime.getMinutes()}:${datetime.getSeconds()}`,
          cough: Math.round(noiseOffset(0, 1, noiseStep + 1, [0, 1])),
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

//VIRTUAL NODE INSTANCES
// transmit("01");
transmit("02");
transmit("03");

import express from 'express';
import pg from 'pg';
import fetch from 'node-fetch';
import cors from 'cors';
import queryString  from 'query-string';
import moment from 'moment';
import momentZone from 'moment-timezone';

const app = express();

const options = {
  origin: [
    'http://localhost:3039',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
  credentials: true,
};

const client = new pg.Client({
    user: 'postgres',
    host: '172.16.117.159',
    database: 'weather_prod',
    password: 'root',
    port: 5432,
});

client.connect();

app.use(cors(options));

const { PORT = 3039 } = process.env;

const cordHibin = {
  lat: 67.670036,
  lon: 33.687525,
};


app.use(express.json());

function fetchDataTomorroyApi() {


const getTimelineURL = "https://api.tomorrow.io/v4/timelines";

// // get your key from app.tomorrow.io/development/keys
const apikey = "sCUblc1wePiFH49ZtaUla6zoB0N62pCv";

// // pick the location, as a latlong pair
let location = [67.670036, 33.687525];

// // list the fields
const fields = [
"temperature",
"windSpeed",
"windGust",
"windDirection",
"pressureSeaLevel",
"humidity",
"precipitationIntensity",
"precipitationProbability",
"precipitationType",
"rainAccumulation",
"snowAccumulation",
"iceAccumulation",
];

// // choose the unit system, either metric or imperial
const units = "metric";

// // set the timesteps, like "current", "1h" and "1d"
const timesteps = ["1h"];

// // configure the time frame up to 6 hours back and 15 days out
const now = moment.utc();
const startTime = moment.utc(now).subtract(6, "hours").toISOString();
const endTime = moment.utc(now).add(6, "hours").toISOString();

// // specify the timezone, using standard IANA timezone format
const timezone = "Europe/Moscow";

// // request the timelines with all the query string parameters as options
const getTimelineParameters =  queryString.stringify({
    apikey,
    location,
    fields,
    units,
    timesteps,
    startTime,
    endTime,
    timezone,
}, {arrayFormat: "comma"});



  fetch(getTimelineURL + "?" + getTimelineParameters)
    .then(res => res.json())
    .then(json => {
        let currentTime = momentZone().tz("Europe/Moscow").format();
        console.log(json.data.timelines[0].intervals[0].values);
        const query = `
          INSERT INTO in_tw_api (temperature, humidity, pressure, windspeed, winddirection,
          windgust, precipitationintensity1h, precipitationintensity3h, precipitationintensity6h,
          precipitationprobability, precipitationtype, rainaccumulation1h, rainaccumulation3h, rainaccumulation6h,
          snowaccumulation1h, snowaccumulation3h, snowaccumulation6h, iceaccumulation1h, iceaccumulation3h, iceaccumulation6h, date_time)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) returning *
        `;
        client.query(query, [json.data.timelines[0].intervals[6].values.temperature,
       json.data.timelines[0].intervals[6].values.humidity,
        json.data.timelines[0].intervals[6].values.pressureSeaLevel,
         json.data.timelines[0].intervals[6].values.windSpeed,
          json.data.timelines[0].intervals[6].values.windDirection,
           json.data.timelines[0].intervals[6].values.windGust,
          json.data.timelines[0].intervals[5].values.precipitationIntensity,
          (json.data.timelines[0].intervals[5].values.precipitationIntensity+json.data.timelines[0].intervals[4].values.precipitationIntensity+json.data.timelines[0].intervals[3].values.precipitationIntensity),
          (json.data.timelines[0].intervals[5].values.precipitationIntensity+json.data.timelines[0].intervals[4].values.precipitationIntensity+json.data.timelines[0].intervals[3].values.precipitationIntensity+json.data.timelines[0].intervals[2].values.precipitationIntensity+json.data.timelines[0].intervals[1].values.precipitationIntensity+json.data.timelines[0].intervals[0].values.precipitationIntensity),
          json.data.timelines[0].intervals[6].values.precipitationProbability,
          json.data.timelines[0].intervals[6].values.precipitationType,
          json.data.timelines[0].intervals[5].values.rainAccumulation,
          (json.data.timelines[0].intervals[5].values.rainAccumulation+json.data.timelines[0].intervals[4].values.rainAccumulation+json.data.timelines[0].intervals[3].values.rainAccumulation),
          (json.data.timelines[0].intervals[5].values.rainAccumulation+json.data.timelines[0].intervals[4].values.rainAccumulation+json.data.timelines[0].intervals[3].values.rainAccumulation+json.data.timelines[0].intervals[2].values.rainAccumulation+json.data.timelines[0].intervals[1].values.rainAccumulation+json.data.timelines[0].intervals[0].values.rainAccumulation),
          json.data.timelines[0].intervals[5].values.snowAccumulation,
          (json.data.timelines[0].intervals[5].values.snowAccumulation+json.data.timelines[0].intervals[4].values.snowAccumulation+json.data.timelines[0].intervals[3].values.snowAccumulation),
          (json.data.timelines[0].intervals[5].values.snowAccumulation+json.data.timelines[0].intervals[4].values.snowAccumulation+json.data.timelines[0].intervals[3].values.snowAccumulation+json.data.timelines[0].intervals[2].values.snowAccumulation+json.data.timelines[0].intervals[1].values.snowAccumulation+json.data.timelines[0].intervals[0].values.snowAccumulation),
          json.data.timelines[0].intervals[5].values.iceAccumulation,
          (json.data.timelines[0].intervals[5].values.iceAccumulation+json.data.timelines[0].intervals[4].values.iceAccumulation+json.data.timelines[0].intervals[3].values.iceAccumulation),
          (json.data.timelines[0].intervals[5].values.iceAccumulation+json.data.timelines[0].intervals[4].values.iceAccumulation+json.data.timelines[0].intervals[3].values.iceAccumulation+json.data.timelines[0].intervals[2].values.iceAccumulation+json.data.timelines[0].intervals[1].values.iceAccumulation+json.data.timelines[0].intervals[0].values.iceAccumulation),
          currentTime], (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Data insert successful');
        });
      })
    .catch(err =>{
      console.log(err);
    })

}



function fetchDataToMl() {


  const getTimelineURL = "https://api.tomorrow.io/v4/timelines";

  // get your key from app.tomorrow.io/development/keys
  const apikey = "KGdtCbDyI2odlxxj8Ft6rpxixB8R0d0w";

  // pick the location, as a latlong pair
  let location = [67.551026, 33.361125];

  // list of the fields
  const fields = [
  "temperature",
  "windSpeed",
  "windGust",
  "windDirection",
  "pressureSeaLevel",
  "humidity",
  ];

  // choose the unit system, either metric or imperial
  const units = "metric";

  // set the timesteps, like "current", "1h" and "1d"
  const timesteps = ["1h"];

  // configure the time frame up to 6 hours back and 15 days out
  const now = moment.utc();
  const startTime = moment.utc(now).subtract(0, "hours").toISOString();
  const endTime = moment.utc(now).add(24, "hours").toISOString();

  // specify the timezone, using standard IANA timezone format
  const timezone = "Europe/Moscow";

  // request the timelines with all the query string parameters as options
  const getTimelineParameters =  queryString.stringify({
      apikey,
      location,
      fields,
      units,
      timesteps,
      startTime,
      endTime,
      timezone,
  }, {arrayFormat: "comma"});



    fetch(getTimelineURL + "?" + getTimelineParameters)
      .then(res => res.json())
      .then(json => {
          let currentTime = momentZone().tz("Europe/Moscow").format();
          console.log(json)





          const query = `
            INSERT INTO in_tw_api_ml_forecast (temperature_now, temperature_3h, temperature_6h, temperature_9h, temperature_12h, temperature_15h, temperature_18h, temperature_21h, temperature_24h, humidity_now, humidity_3h, humidity_6h, humidity_9h, humidity_12h, humidity_15h, humidity_18h, humidity_21h, humidity_24h, pressure_now, pressure_3h, pressure_6h, pressure_9h, pressure_12h, pressure_15h, pressure_18h, pressure_21h, pressure_24h, windspeed_now, windspeed_3h, windspeed_6h, windspeed_9h, windspeed_12h, windspeed_15h, windspeed_18h, windspeed_21h, windspeed_24h, winddirection_now, winddirection_3h, winddirection_6h, winddirection_9h, winddirection_12h, winddirection_15h, winddirection_18h, winddirection_21h, winddirection_24h,
            windgust_now, windgust_3h, windgust_6h, windgust_9h, windgust_12h, windgust_15h, windgust_18h, windgust_21h, windgust_24h, date_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55) returning *
          `;
          client.query(query, [json.data.timelines[0].intervals[0].values.temperature,
         json.data.timelines[0].intervals[3].values.temperature,
         json.data.timelines[0].intervals[6].values.temperature,
         json.data.timelines[0].intervals[9].values.temperature,
         json.data.timelines[0].intervals[12].values.temperature,
         json.data.timelines[0].intervals[15].values.temperature,
         json.data.timelines[0].intervals[18].values.temperature,
         json.data.timelines[0].intervals[21].values.temperature,
         json.data.timelines[0].intervals[24].values.temperature,
         json.data.timelines[0].intervals[0].values.humidity,
         json.data.timelines[0].intervals[3].values.humidity,
         json.data.timelines[0].intervals[6].values.humidity,
         json.data.timelines[0].intervals[9].values.humidity,
         json.data.timelines[0].intervals[12].values.humidity,
         json.data.timelines[0].intervals[15].values.humidity,
         json.data.timelines[0].intervals[18].values.humidity,
         json.data.timelines[0].intervals[21].values.humidity,
         json.data.timelines[0].intervals[24].values.humidity,
          json.data.timelines[0].intervals[0].values.pressureSeaLevel,
         json.data.timelines[0].intervals[3].values.pressureSeaLevel,
         json.data.timelines[0].intervals[6].values.pressureSeaLevel,
         json.data.timelines[0].intervals[9].values.pressureSeaLevel,
         json.data.timelines[0].intervals[12].values.pressureSeaLevel,
         json.data.timelines[0].intervals[15].values.pressureSeaLevel,
         json.data.timelines[0].intervals[18].values.pressureSeaLevel,
         json.data.timelines[0].intervals[21].values.pressureSeaLevel,
         json.data.timelines[0].intervals[24].values.pressureSeaLevel,
          json.data.timelines[0].intervals[0].values.windSpeed,
         json.data.timelines[0].intervals[3].values.windSpeed,
         json.data.timelines[0].intervals[6].values.windSpeed,
         json.data.timelines[0].intervals[9].values.windSpeed,
         json.data.timelines[0].intervals[12].values.windSpeed,
         json.data.timelines[0].intervals[15].values.windSpeed,
         json.data.timelines[0].intervals[18].values.windSpeed,
         json.data.timelines[0].intervals[21].values.windSpeed,
         json.data.timelines[0].intervals[24].values.windSpeed,
            json.data.timelines[0].intervals[0].values.windDirection,
         json.data.timelines[0].intervals[3].values.windDirection,
         json.data.timelines[0].intervals[6].values.windDirection,
         json.data.timelines[0].intervals[9].values.windDirection,
         json.data.timelines[0].intervals[12].values.windDirection,
         json.data.timelines[0].intervals[15].values.windDirection,
         json.data.timelines[0].intervals[18].values.windDirection,
         json.data.timelines[0].intervals[21].values.windDirection,
         json.data.timelines[0].intervals[24].values.windDirection,
             json.data.timelines[0].intervals[0].values.windGust,
         json.data.timelines[0].intervals[3].values.windGust,
         json.data.timelines[0].intervals[6].values.windGust,
         json.data.timelines[0].intervals[9].values.windGust,
         json.data.timelines[0].intervals[12].values.windGust,
         json.data.timelines[0].intervals[15].values.windGust,
         json.data.timelines[0].intervals[18].values.windGust,
         json.data.timelines[0].intervals[21].values.windGust,
         json.data.timelines[0].intervals[24].values.windGust,
            currentTime], (err, res) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log('Data insert successful');
          });
        })
      .catch(err =>{
        console.log(err);
      })

  }





function endFuction() {
fetchDataTomorroyApi();
  fetchDataToMl();
}


let timerId = setInterval(() => endFuction(), 6000);


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

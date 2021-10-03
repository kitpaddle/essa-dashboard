// JAVASCRIPT FOR THE MAP

const startingPos =[63.6498,17.9238];
const URL_BASELAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const URL_BASELAYER_TEST = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';


// Coordinates in WFS are in CRS 3011
// Use proj4 to convert and overwrite them in the data
// Definfe the projections EPSF:4326 is the most standard one and
// is used by LEAFLET in this case.
proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  [
    'EPSG:3011',
    "+proj=tmerc +lat_0=0 +lon_0=18 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  ]
]);


// Take somewhat correct JSON object from city sources and format it
// to be correct GEOJSON format and CRS and return GEOJSON Object
async function api2GEO(url){
  totalLayers++;
  const response = await fetch(url);
  const d = await response.json();
  const data = d.features;
  const coordType = data[0].geometry.type; // Check type of geometry
  console.log("Loading "+data.length+" features");
  console.log("Type of geometry: "+coordType);
  // Overwrite coordinates data with rereferenced data with proj4
  // to account for correct CRS and so leaflet can display them 
  //console.log(data[344]); 
  for(let i=0; i<data.length; i++){
    if(data[i].geometry==null || data[i].geometry.coordinates==null ) continue;
    let arr = data[i].geometry.coordinates;
    let projArr = arr;
    for(let j=0; j<arr.length; j++){
      for(let k=0; k<arr[j].length; k++){
        projArr[j][k]=proj4('EPSG:3011','EPSG:4326', [arr[j][k][0], arr[j][k][1]]);
      }
    }
    data[i].geometry.coordinates = projArr;
  }
  console.log("Finished");
  // Return correct GeoJSON woth correct coordinates
  return data;
}


// Creating MAP and baseMap Layer and adding them to the DIV
// So even if other layers take time to load map shows right away
const map = L.map('map1', {
  center: startingPos,
  zoom: 4,
  fullscreenControl: true,
  attributionControl: false,
  renderer: L.canvas()
});

L.control.attribution({
  position: 'bottomleft'
}).addTo(map);


const baseMap = new L.tileLayer(URL_BASELAYER_TEST, {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OSM</a> kitpaddle',
  minZoom: 1,
  updateWhenIdle: true,
  keepBuffer: 5,
  edgeBufferTiles: 2
}).addTo(map);

async function getSigmetData() {
  const response = await fetch('/sigmet');
  const data = await response.json();
  console.log("Data fetched");
  console.log(data);
}

getSigmetData();
//const sigmetLayer = L.geoJSON(data, {style: {color: 'blue'}}).addTo(map);

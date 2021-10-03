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
const map = L.map('sigmetMap', {
  center: startingPos,
  zoom: 4,
  fullscreenControl: true,
  attributionControl: false,
  renderer: L.canvas()
});

L.control.attribution({
  position: 'bottomleft'
}).addTo(map);


const baseMap = new L.tileLayer(URL_BASELAYER, {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OSM</a> kitpaddle',
  minZoom: 1,
  updateWhenIdle: true,
  keepBuffer: 5,
  edgeBufferTiles: 2
}).addTo(map);

let sigmetLayer;

async function getSigmetData() {
  const response = await fetch('/sigmet');
  const data = await response.json();
  console.log("Data fetched");

  if(map.hasLayer(sigmetLayer)){
    map.removeLayer(sigmetLayer);
    console.log("wooo");
  }
  // Add to map
  sigmetLayer = L.geoJSON(data, {
    style: {color: 'blue'},
    onEachFeature: setTooltip
  }).addTo(map);
  
  // Get out only ESAA ENOR EFIN EVRR
  const esaa = data.features.filter(e => e.properties.firName == 'ESAA SWEDEN');
  const enor = data.features.filter(e => e.properties.firName == 'ENOR NORWAY');
  const efin = data.features.filter(e => e.properties.firName == 'EFIN HELSINKI');
  const evrr = data.features.filter(e => e.properties.firName == 'EVRR RIGA');
  const eett = data.features.filter(e => e.properties.firId == 'EETT TALLINN');

  // Fill list with sigmets
  fillSigList(esaa,"esaa", "ESAA Sweden: ");
  fillSigList(enor,"enor", "ENOR Norway: ");
  fillSigList(efin,"efin", "EFIN Finland: ");
  fillSigList(eett,"eett", "EETT Estonia: ");
  fillSigList(evrr,"evrr", "EVRR Latvia: ");

  // Update last update time (now) in UTC
  let nowUTC = new Date();
  let hh = nowUTC.getUTCHours();
  let mm = nowUTC.getUTCMinutes();
  if(hh<10) hh = '0'+hh;
  if(mm<10) mm = '0'+mm;
  document.getElementById('sigLatest').innerHTML='Senast uppdaterad: '+hh+':'+mm+' UTC';
  
}

function fillSigList(firData, firName, t){
  if(firData.length>0){
    document.getElementById(firName).innerHTML='<b>'+t+firData.length+"</b><ul>";
    console.log("FIR name: "+firName);
    for(let i=0; i<firData.length;i++)
    {
      let a = firData[i].properties;
      if(a.base==0) a.base = "SFC";
      if(a.base < 6000 && !isNaN(a.base)) a.base += 'ft';
      if(a.base > 6000 && !isNaN(a.base)) a.base = 'FL'+a.base.substring(0,3);
      if(a.top < 6000 && !isNaN(a.top)) a.top += 'ft';
      if(a.top > 6000 && !isNaN(a.top)){
        if(a.top<10000)
          a.top = 'FL0'+(a.top).toString().substring(0,2);
        else
          a.top = 'FL'+(a.top).toString().substring(0,3);
      } 

      
      let output = a.seriesId+' '+a.qualifier+' '+a.hazard+' || '+a.base+' - '+a.top;
      document.getElementById(firName).innerHTML+='<li>'+output+'</li>';
    }
    document.getElementById(firName).innerHTML+="</ul>";
  } else {
    document.getElementById(firName).innerHTML='<b>'+t+'0</b>';
    console.log("FIR name: "+firName);
  }
}

function setTooltip(feature, layer){
  let raw = feature.properties.rawSigmet;
  let output = '<b>'+feature.properties.firName+' - '+feature.properties.seriesId+'</b><br>';
  output+= feature.properties.qualifier+' '+feature.properties.hazard+'<br>';
  output+= feature.properties.base+'ft - '+feature.properties.top+'ft';
  output+= '<br>From: '+feature.properties.validTimeFrom+'<br>';
  output+= 'To: '+feature.properties.validTimeTo;
  layer.on({
    mouseover: function(e){
      document.getElementById('sigRaw').innerHTML="<b>Original SIGMET: </b><br>"+raw;
      try {layer.setStyle({color: 'yellow'}); }
      catch(e) { }
    },
    mouseout: function(e){
      try {layer.setStyle({color: 'blue'}); }
      catch(e) { }
    }
  });
  layer.bindPopup(output, {'className' : 'popupCustom'});
}

function sigmetRefresh(){
  console.log("Manual Refresh of SIGMET Data");
  map.flyTo(startingPos, 4);
  getSigmetData();
  
}
// Call once for init, call again at interval for updates or via button
getSigmetData();

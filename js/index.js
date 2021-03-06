//global variables
var count = 0;
var road_req = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
var no_more_add = false;
var no_more_req = false;
var token = 'pk.eyJ1Ijoia2lyaWxsbCIsImEiOiJjamtuemNoeG0yazJjM3BtejZpaHF5M29sIn0.rFXA4G4R9fIJznYryyi2FA';
//------------------------//
//Geocoding block of functions
//------------------------//
function status(response) {  
  if (response.status >= 200 && response.status < 300 &&response.status!=429) {  
    return Promise.resolve(response)  
  } else {  
    return Promise.reject(new Error(response.statusText))  
  }  
}

function json(response) {  
  return response.json()  
}

function add_point(url){
  if (count<4 && no_more_add==false){
    fetch(url)  
  .then(status)  
  .then(json)  
  .then(function(data) {  
    console.log('Geo request succeeded with JSON response', data);
  let lat = JSON.stringify(data[0]['lat']).slice(1,-1);
  let lon = JSON.stringify(data[0]['lon']).slice(1,-1);
     document.getElementById("result").innerHTML +='<strong><p>' + lat+' '+ lon +'</p></strong>';
      document.getElementById("wp").value = "";
    road_req+=(lon+','+lat+';');
      L.marker([lat,lon]).addTo(mymap);
    count++;
  }).catch(function(error) {  
    console.log('Request failed', error);  
  });
  }
}

function req(){
 var link='https://nominatim.openstreetmap.org/search/'+document.getElementById('wp').value.split(' ').join('%20')+'?format=json&addressdetails=0&limit=1&polygon_svg=0';
 add_point(link);
}
document.getElementById('add').addEventListener('click', req);
//------------------------//
//block of routing functions
//------------------------//

function req_stats(){
  no_more_add=true;
  console.log(road_req.slice(0,-1)+'?overview=full&access_token='+token);
  if (count>=2 && no_more_req == false){
    fetch(road_req.slice(0,-1)+'?overview=full&access_token='+token)  
  .then(status)  
  .then(json)  
  .then(function(data){
      console.log('Route request succeeded with JSON response', data);
      document.getElementById("stats").innerHTML +='<strong><p>'+"the distance is "+JSON.stringify(Math.round(data['routes'][0]['distance']/1000))+' km </p></strong>';
      document.getElementById("stats").innerHTML +='<strong><p>'+"the duration is "+JSON.stringify(Math.round(data['routes'][0]['duration']/3600))+' hours </p></strong>';
      var polyline = L.polyline(decode(data['routes'][0]['geometry']), {color:'black'}).addTo(mymap);
      mymap.fitBounds(polyline.getBounds());
      no_more_req = true;
    })
  }
}
document.getElementById('calculate').addEventListener('click', req_stats);
//------------------------//
//Mapping
//------------------------//
var mymap = L.map('mapid').setView([55.75,37.62], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: token,
}).addTo(mymap);

function onMapClick(e) {
  if (count<4 && no_more_add==false){
    var marker = L.marker((e.latlng)).addTo(mymap);
    let lat= marker.getLatLng()['lat'];
    let lon = marker.getLatLng()['lng'];
    road_req+=(lon+','+lat+';');
    document.getElementById("result").innerHTML +='<strong><p>' + lat+' '+ lon +'</strong></p>';
    count++;
  }
}
mymap.on('click', onMapClick);
//decoding
function decode(encoded){
var len = encoded.length;
var index = 0;
var array = [];
var lat = 0;
var lng = 0;

while (index < len) {
var b;
var shift = 0;
var result = 0;
do {
b = encoded.charCodeAt(index++) - 63;
result |= (b & 0x1f) << shift;
shift += 5;
} while (b >= 0x20);
var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
lat += dlat;

shift = 0;
result = 0;
do {
b = encoded.charCodeAt(index++) - 63;
result |= (b & 0x1f) << shift;
shift += 5;
} while (b >= 0x20);
var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
lng += dlng;

array.push([lat * 1e-5, lng * 1e-5]);
}

return array;
}

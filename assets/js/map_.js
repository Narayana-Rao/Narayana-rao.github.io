    /*===================================================
                      OSM  LAYER               
===================================================*/

var map = L.map('map').setView([35.0,0], 2.);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className:'map-tiles'
});
osm.addTo(map);

/*===================================================
                      MARKERS               
===================================================*/

// Function to load GeoJSON data
$.getJSON("assets/js/map_data/point_data.geojson", function(data) {
    // Add GeoJSON layer to the map
    L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
            if (feature.properties && feature.properties.popupContent) {
                layer.bindPopup(feature.properties.popupContent);
            }
        }
    }).addTo(map);
});

// var pt1 = L.marker([19.132128384618802, 72.91782170419445]);
// pt1.addTo(map);
// var popup1 = pt1.bindPopup('MRSLab, IIT Bombay')
// popup1.addTo(map);

// var pt2 = L.marker([23.027946334038724, 72.51889522482324]);
// pt2.addTo(map);
// var popup2 = pt2.bindPopup('SAC-ISRO, Ahmedabad')
// popup2.addTo(map);

// var pt3 = L.marker([45.3947464948016, -75.71439439784899]).addTo(map);
// pt3.bindPopup('AAFC-Canada').addTo(map);

// var pt4 = L.marker([41.3893801672304, 2.116212166590115]).addTo(map);
// pt4.bindPopup('Barcelona Tech - UPC, Spain').addTo(map);

// var pt5 = L.marker([17.98377810459607, 79.53066693604285]).addTo(map);
// pt5.bindPopup('NIT Warangal').addTo(map);

// var pt6 = L.marker([12.918932648990973, 77.61064763160826]).addTo(map);
// pt6.bindPopup('CropIn Technology Solutions').addTo(map);

// var pt7 = L.marker([45.63154416649742, -73.38168942617135]).addTo(map);
// pt7.bindPopup('INRS-Quebec, Canada').addTo(map);

// var pt8 = L.marker([38.38543800558585, -0.5140907966191396]).addTo(map);
// pt8.bindPopup('University of Alicante, Spain').addTo(map);

// var pt9 = L.marker([42.386741, -72.530051]).addTo(map);
// pt9.bindPopup('University of Massachusetts Amherst').addTo(map);

// var pt10 = L.marker([38.986894, -76.942573]).addTo(map);
// pt10.bindPopup('University of Maryland').addTo(map);

// var pt10 = L.marker([38.831209, -77.311747]).addTo(map);
// pt10.bindPopup('George Mason University').addTo(map);

// var pt11 = L.marker([22.314716, 87.310748]).addTo(map);
// pt11.bindPopup('IIT Kharagpur').addTo(map);

// var pt12 = L.marker([48.085479, 11.279480]).addTo(map);
// pt12.bindPopup('German Aerospace Center (DLR)').addTo(map);

// var pt13 = L.marker([34.201250, -118.171351]).addTo(map);
// pt13.bindPopup('Jet Propulsion Laboratory (JPL, CalTech)').addTo(map);

// var pt14 = L.marker([39.025424, -76.923921]).addTo(map);
// pt14.bindPopup('USDA-ARS Hydrology and Remote Sensing Laboratory').addTo(map);

// var pt15 = L.marker([47.115799, -88.544807]).addTo(map);
// pt15.bindPopup('Michigan Technological University').addTo(map);


/*===================================================
                     TILE LAYER               
===================================================*/

// var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
// attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
// subdomains: 'abcd',
// 	maxZoom: 20
// });
// // CartoDB_DarkMatter.addTo(map);

// // Google Map Layer

// googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
//     maxZoom: 20,
//     subdomains:['mt0','mt1','mt2','mt3']
//  });
// //  googleStreets.addTo(map);

//  // Satelite Layer
// googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
//    maxZoom: 20,
//    subdomains:['mt0','mt1','mt2','mt3']
//  });
// // googleSat.addTo(map);

// var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
//  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// subdomains: 'abcd',
// minZoom: 1,
// maxZoom: 20,
// ext: 'jpg'
// });
// // Stamen_Watercolor.addTo(map);


/*===================================================
                      GEOJSON               
===================================================*/

// var linedata = L.geoJSON(lineJSON).addTo(map);
// var pointdata = L.geoJSON(pointJSON).addTo(map);
// var nepalData = L.geoJSON(nepaldataa).addTo(map);
// var polygondata = L.geoJSON(polygonJSON,{
//     onEachFeature: function(feature,layer){
//         layer.bindPopup('<b>This is a </b>' + feature.properties.name)
//     },
//     style:{
//         fillColor: 'red',
//         fillOpacity:1,
//         color: 'green'
//     }
// }).addTo(map);

/*===================================================
                      LAYER CONTROL               
===================================================*/

// var baseLayers = {
//     "Satellite":googleSat,
//     "Google Map":googleStreets,
//     "Water Color":Stamen_Watercolor,
//     "OpenStreetMap": osm,
// };

// var overlays = {
//     "Marker": pt1,
//     // "PointData":pointdata,
//     // "LineData":linedata,
//     // "PolygonData":polygondata
// };

// L.control.layers(baseLayers, overlays).addTo(map);


/*===================================================
                      SEARCH BUTTON               
===================================================*/

// L.Control.geocoder().addTo(map);




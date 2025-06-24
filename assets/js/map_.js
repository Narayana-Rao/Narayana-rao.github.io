

var map = L.map('map', {
    fullscreenControl: true
}).setView([35.0,0], 2.);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className:'map-tiles'
});
osm.addTo(map);

L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(map);

var resetControl = L.control({ position: 'topleft' });

resetControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var btn = L.DomUtil.create('a', '', div);
    btn.innerHTML = '⭯'; // Reset icon — feel free to swap
    btn.href = '#';
    btn.title = 'Reset view';

    btn.onclick = function (e) {
        e.preventDefault();
        map.setView([20.0, 0], 2); // Your default center and zoom
    };

    return div;
};

resetControl.addTo(map);
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

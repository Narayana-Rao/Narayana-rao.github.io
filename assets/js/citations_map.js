var cite_map = L.map('cite_map', {
    fullscreenControl: true
}).setView([20.0, 0], 2);
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    className: 'map-tiles'
});
osm.addTo(cite_map);

L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(cite_map);

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

resetControl.addTo(cite_map);


/*===================================================
                      MARKERS               
===================================================*/

// Initialize a marker cluster group
var markers = L.markerClusterGroup({
    maxClusterRadius: 25  // default is 80; lower = tighter clusters
});

$.getJSON("assets/js/map_data/all_citing_inst.geojson", function(data) {
    var geoJsonLayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            if (!latlng || (latlng.lat === 0 && latlng.lng === 0)) {
                return null; // skip this point
            }
            return L.marker(latlng);
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties && feature.properties.affiliation) {
                layer.bindPopup(feature.properties.affiliation);
            }
        }
    });

    markers.addLayer(geoJsonLayer);
    cite_map.addLayer(markers);
});

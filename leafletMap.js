"use strict"


//make a map
var map = L.map('map').setView([51, 13], 5)

//Layer
let markerLayerGroup = L.layerGroup()
//Baselayers
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});
//these are our base layers
var baseMaps = {
    "OSM": osm,
    "OSM.Hot": osmHOT,
    "OSM.Topo": OpenTopoMap
}
//here an layerControl is added to the map
var layerControl = L.control.layers(baseMaps).addTo(map);

//draw cities
function drawCityMarkers(cities) {
    updateCities()
    var markerArr = []
    for (let i = 0; i < cities.features.length; i++) {
        let markerPosition = [cities.features[i].geometry.coordinates[1], cities.features[i].geometry.coordinates[0]]
        let cityName = cities.features[i].properties.cityname
        let country = cities.features[i].properties.country
        let population = cities.features[i].properties.population
        let imgpath = cities.features[i].properties.picture
        if (imgpath == undefined) {
            var popup = L.popup()
                .setContent("<b>" + cityName + "</b><p>Country: " + country + "</p><p>Population: " + population + "</p>");

        }
        else {
            var popup = L.popup()
                .setContent("<b>" + cityName + "</b><p>Country: " + country + "</p><p>Population: " + population + "</p><a href=" + imgpath + "><img class='popUpimage' src='" + imgpath + "'/></a>");
        }
        var marker = L.marker([markerPosition[0], markerPosition[1]]).bindPopup(popup)
        markerArr.push(marker)

    }
    markerLayerGroup = L.layerGroup(markerArr).addTo(map)
    layerControl.addOverlay(markerLayerGroup, "Cities").addTo(map)
    console.log("add cities layer")
}
//removes drawn cities, if an new file is uploaded
function updateCities(){
    layerControl.remove()
    layerControl = L.control.layers(baseMaps).addTo(map);
    markerLayerGroup.eachLayer(function(layer) { markerLayerGroup.removeLayer(layer);});
    console.log("Map is updated")
}


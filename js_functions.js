"use strict"
/*+++++++++++++++++++++++++++
        Classes
++++++++++++++++++++++++++++++*/

class Point {
    constructor(lat, lon, name) {
        this.lat = lat     // latitude in degrees
        this.lon = lon     // longtitude in degrees
        this.name = name   // name of point
    }
}

/*+++++++++++++++++++++++++++
        Variables
++++++++++++++++++++++++++++++*/
const berlin = new Point(52.52, 13.405, "Berlin")
let point1
let cities
let nearest_cities
let validFile = false
//Buttons
let newPointButton = document.getElementById("button_new_Point")
let nearestCitiesButton = document.getElementById("button_nearest_cities")
let displayChartButton = document.getElementById("displayChart")
let uploadButton = document.getElementById("fileupload1")

/*+++++++++++++++++++++++++++
        Functions
++++++++++++++++++++++++++++++*/

///Distance in Kilometers as arrow function
let distance_in_kilometer = distance_in_m => distance_in_m / 1000

//computes distances in meter or kilometer between to given points 
function compute_geographic_distance(point1, point2, unit) {
    const lat1 = point1.lat
    const lon1 = point1.lon
    const lat2 = point2.lat
    const lon2 = point2.lon
    let geographic_distance
    const R = 6371e3; // meters

    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // in metres        
    // unit can be meter or kilometer
    if (unit === "meter" || unit == "m") {
        geographic_distance = d
    }
    if (unit === "kilometer" || unit == "km") {
        geographic_distance = distance_in_kilometer(d)
    }

    return geographic_distance // geographic distance in the given unit (meter/kilometer)
}

///computes ditances between one given Point and a list of cities and finds the nearest
function find_nearest_cities(array_of_cities, new_point) {
    const point1 = new_point
    let cities = array_of_cities
    let list_of_distances = []
    //iterates over all objects in cities and computes distances to point 1
    for (let i = 0; i < cities.features.length; i++) {
        let point2 = new Point(cities.features[i].geometry.coordinates[1], cities.features[i].geometry.coordinates[0], cities.features[i].properties.cityname)
        list_of_distances.push([compute_geographic_distance(point1, point2, "kilometer"), cities.features[i].properties.cityname])
    }
    console.log("unsorted list of distances:", list_of_distances)

    let sortby = (a, b) => a[0] - b[0] //sort in ascending order, feedback from exercise 1
    let nearestCities = list_of_distances.sort(sortby)
    console.log("sorted list of distances (ascending order):", nearestCities)
    return nearestCities
}

function getFiletype(inputFile) {
    let filetypeArr = (inputFile.name).split('.')  //gets filename and seperates the filetype as string
    let filetype = filetypeArr[filetypeArr.length - 1]  //get characters after last dot  
    console.log("your filetype: ", filetype)
    return filetype
}

/*+++++++++++++++++++++++++++
        Functions for events
++++++++++++++++++++++++++++++*/

///Upload Geojson
function file_upload() {

    let file = document.getElementById("fileupload1").files[0]
    let filetype = getFiletype(file)


    if (filetype === "json" || filetype == "geojson" || filetype=="JSON" || filetype=="geoJSON" || filetype=="GEOJSON") {
        validFile = true
        console.log("File Type:", filetype)
        let reader = new FileReader()
        reader.readAsText(file)

        reader.onload = function () {
            cities = JSON.parse(reader.result)
            drawCityMarkers(cities)
            console.log("your .geojson-data:", cities)
        }
        reader.onerror = function () {
            console.log(reader.error);
        }

        document.getElementById("warning1").style.display = "none"


    }
    else {
        console.log("invalid filetype:", filetype)
        document.getElementById("warning1").style.display = "inline"
    }
}
//get point from input
function addPoint() {
    //read html-inputs "Your Point", inputs are strings
    let lat = document.getElementById("new_Point_lon").value
    let lon = document.getElementById("new_Point_lat").value
    let name = document.getElementById("new_Point_name").value

    //do this, when non input-field is empty
    if (lat !== "" && lon !== "" && name !== "") {
        lat = parseFloat(lat)
        lon = parseFloat(lon)
        let newPoint = new Point(lat, lon, name)
        point1 = newPoint //write point to global variable point1
        console.log("added Point", newPoint)
        lat = ""
        lon = ""
        name = ""
        return newPoint
    }
    else {
        console.log("there are empty inputs")
        alert("enter all values")
    }

}
function newPointMarker() {

    let point = addPoint()
    //distance to berlin
    let distanceJS = compute_geographic_distance(point, berlin, "km")
    distanceJS = Math.round(distanceJS * 1000) / 1000
    //distance using turf
    var pointTurf = turf.point([point.lat, point.lon])
    var berlinTurf = turf.point([berlin.lat, berlin.lon])
    var distanceTurf = turf.distance(pointTurf, berlinTurf);
    distanceTurf = Math.round(distanceTurf * 1000) / 1000

    //create map marker
    let markerPosition = [point.lat, point.lon]
    let cityName = point.name
    let imgpath = document.getElementById("ImgUrl").value

    var marker = L.marker([markerPosition[0], markerPosition[1]])
    var markerGeoJSON = marker.toGeoJSON()
    //add properties to marker
    markerGeoJSON.properties.cityname = cityName.toString()
    markerGeoJSON.properties.distanceBerlin = distanceJS
    markerGeoJSON.properties.distanceBerlinTurf = distanceTurf

    //create popup
    if (imgpath == undefined || imgpath == "") {
        var popup = L.popup()
            .setContent(
                "<b>" + cityName + "</b></br>" +
                "<p> Distance Berlin (JS)" + distanceJS + " [km]</p>" +
                "<p> Distance Berlin (Turf): " + distanceTurf + " [km]</p>");
    }
    else {
        var popup = L.popup()
            .setContent(
                "<b>" + cityName + "</b>" +
                "<p> Distance Berlin (JS): " + distanceJS + " [km]<p>" +
                "<p> Distance Berlin (Turf): " + distanceTurf + " [km]</p>" +
                "<a href=" + imgpath + "><img class='popUpimage' src='" + imgpath + "'/></a>");
        markerGeoJSON.properties.picture = imgpath.toString()
    }
    marker.bindPopup(popup).addTo(map)
    newPointLayerGroup.addLayer(marker)
    layerControl.addOverlay(marker, "new Point")
    console.log(markerGeoJSON)
}
//show nearest cities in a table
function get_nearest_cities() {
    nearest_cities = find_nearest_cities(cities, point1)
    let tableheading = "<tr><th>Your Point</th><th>City</th><th>Distance [km]</th></tr>"
    let tablecontent = ""
    //output nearest city to html-table 
    for (let i = 0; i < nearest_cities.length; i++) {
        nearest_cities[i][0] = Math.round(nearest_cities[i][0] * 1000) / 1000 //round to 3 digits
        tablecontent = tablecontent + "<tr><td >" + point1.name + "</td><td>" + nearest_cities[i][1] + "</td><td >" + nearest_cities[i][0] + "</td></tr>"
    }

    document.getElementById("table1").innerHTML = tableheading + tablecontent
    console.log("here comes the table")
}

function displayChart() {

    const ctx = document.getElementById('chart1')

    let data = nearest_cities
    let label_list = []
    let data_list = []
    //auto labeling for 2dim data
    for (let i = 0; i < data.length; i++) {
        label_list.push(data[i][1])
        data_list.push(data[i][0])
    }
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label_list,
            datasets: [{
                label: 'distance Point - Cities [km]',
                data: data_list,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    console.log("here comes the chart")
}

/*+++++++++++++++++++++++++++
        Eventlisteners
++++++++++++++++++++++++++++++*/

newPointButton.addEventListener("click", newPointMarker)
nearestCitiesButton.addEventListener("click", get_nearest_cities)
displayChartButton.addEventListener("click", displayChart)
uploadButton.addEventListener("change", file_upload)






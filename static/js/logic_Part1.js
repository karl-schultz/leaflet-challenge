// Create variable to hold layout tiles for topographical map
let tileBase = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'",
  {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });


// Create variable for map object and add tile base to it
let mainMap = L.map("map", {
  center: [
    40.7, -94.5
  ],
  // set zoom so we can see most of world's landmass 
  zoom: 3
});

tileBase.addTo(mainMap);


//get access to geoJSON data 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Create function to stylize color and scale of each earthquake
  function dataStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: determineColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Create function to determine color on the magnitude of the earthquake
  function determineColor(depth) {
    switch (true) {
      case depth > 90:
        // use hexadecimals to determine colors to return
        // return color "red"
        return "#ea2c2c";
      case depth > 70:
        // return color "bright orange"
        return "#ea822c";
      case depth > 50:
        // return color "orange peel"
        return "#ee9c00";
      case depth > 30:
        // return color "yellow"
        return "#eecc00";
      case depth > 10:
        // return color "green-tinted yellow"
        return "#d4ee00";
      default:
        // return color "green"
        return "#98ee00";
    }
  }

  // Create function to determine circle radius based on  magnitude .Change 0 to 1 so as not to multiply by 0 for smallest size.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Process geojson data
  L.geoJson(data, {
    // Turn each feature into a marker
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Style using dataStyle function createe above
    style: dataStyle,
    // Create a popup for each circle marking earthquake location. Show magnitude and location of the earthquake.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    }
  }).addTo(mainMap);

  // Create a legend control object
  let legend = L.control({
    position: "bottomright"
  });

  // Add the details for the legend, setting color for each range.
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Looping through to generate a label with a colored box for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
        + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to main map
  legend.addTo(mainMap);
});

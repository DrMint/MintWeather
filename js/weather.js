"use strict";

function displayErrorPopup(title, description) {
    popupContainer.classList.add("enabled");
    const errorPopup = document.querySelector("#errorPopup");
    const errorTitle = errorPopup.querySelector("#errorTitle");
    const errorDescription = errorPopup.querySelector("#errorDescription");
    errorTitle.innerHTML = title;
    errorDescription.innerHTML = description;
}

function refreshMap(latitude, longitude, zoom=13, displayMarker=true) {

    document.querySelector("#osmContainer").innerHTML = ""

    const geo = ol.proj.fromLonLat([longitude, latitude]);
      
    const map = new ol.Map({
        target: 'osmContainer',
        layers: [
            new ol.layer.Tile({
            source: new ol.source.OSM(),
            })
        ],
        view: new ol.View({
            center: geo,
            zoom: zoom
        }),
        controls: [],
        interactions: []
    });

    
    if (displayMarker) {

        const markerStyle = new ol.style.Style({
            image: new ol.style.Icon({
              src: "../img/marker.png",
              scale: 0.25,
              anchor: [0.5, 1]
            }),
        });

        const marker = new ol.geom.Point(geo);
        const feature = new ol.Feature({geometry: marker});

        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [feature]
            }),
            style: markerStyle
        });
        map.addLayer(layer);
    }

    
}

function windNameToSymbol(direction) {
    if (direction === 'N') return '↑';
    if (direction === 'NE') return '↗';
    if (direction === 'E') return '→';
    if (direction === 'SE') return '↘';
    if (direction === 'S') return '↓';
    if (direction === 'SO') return '↙';
    if (direction === 'O') return '←';
    if (direction === 'NO') return '↖';
}

function closeErrorPopup() {
    popupContainer.classList.remove("enabled");
}

function refreshUI(data) {
    console.log(data);

    if (data.errors) {
        displayErrorPopup(data.errors[0].text, data.errors[0].description);
        return;
    }

    refreshMap(data.city_info.latitude, data.city_info.longitude);

    const cityInfo = document.querySelector("#cityInfo");
    const forecasts = document.querySelector("#forecasts"); 
    let content = '';

    content += '<div id="cityTitle">'
        content += '<p>Displaying information for</p>'
        content += '<h2 id="cityTitle">' + data.city_info.name + '</h2>';
        content += '<br>';
        content += '<p>Latitude: ' + data.city_info.latitude + '<br>';
        content += 'Longitude: ' + data.city_info.longitude + '<br>';
        content += 'Elevation: ' + data.city_info.elevation + ' m</p>'
        content += '<br>';
        content += '<p>☀️ ' + data.city_info.sunrise + '</p>'
        content += '<p>🌑 ' + data.city_info.sunset + '</p>'
    content += '</div>'
    content += '<div>'
        content += '<h3>Current conditions (at ' + data.current_condition.hour + ')</h3>'
        content += '<p class="temp">' + data.current_condition.tmp + '°C</p>';
        content += '</p>Humidity: ' + data.current_condition.humidity + '%<br>';
        content += 'Pressure: ' + data.current_condition.pressure + ' hPa<br>';
        content += 'Wind: ' + windNameToSymbol(data.current_condition.wnd_dir) + ' ' + data.current_condition.wnd_spd +  ' km/h</p>'
        content += '<img src="' + data.current_condition.icon_big + '" alt="">'
        content += '<p>' + data.current_condition.condition + '</p>';
    content += '</div>'
    cityInfo.innerHTML = content;

    content = '<h2>Next days forecasts</h2>';
    for (let index = 1; index <= 4; index++) {
        let day = data['fcst_day_' + String(index)];
        content += '<div>'
            content += '<h3>' + day.day_long + ' (' + day.date + ')' + '</h3>';
            content += '<p>min ' + day.tmin + '°C / max ' + day.tmax + '°C</p>';
            content += '<img src="' + day.icon_big + '" alt="">';
            content += '<p>' + day.condition + '</p>';
        content += '</div>';
    }

    forecasts.innerHTML = content;
    
    

}

function fetchWeatherInfo(cityName) {
    fetch("https://prevision-meteo.ch/services/json/" + cityName)
    .then(response => response.json())
    .then(data => {refreshUI(data)})
}

const cityInput = document.querySelector("#cityInput");
const showWeatherButton = document.querySelector("#showWeatherButton");
const resultContainer = document.querySelector("#resultContainer");
const closePopupButton = document.querySelector("#errorPopup > .closePopup");
const popupContainer = document.querySelector(".popupContainer");

refreshMap(0, 0, 0, false);

showWeatherButton.addEventListener("click", () => fetchWeatherInfo(cityInput.value));
closePopupButton.addEventListener("click", closeErrorPopup)
cityInput.addEventListener("keyup", (event) => {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      event.preventDefault();
      fetchWeatherInfo(cityInput.value);
    }
  }); 

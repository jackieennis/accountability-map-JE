import React, {useRef, useEffect} from 'react';
import './App.css';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import "mapbox-gl/dist/mapbox-gl.js";
import Places from 'places.js';
import rd3 from 'react-d3-library'


// mapbox access token from mapbox.com
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// variable to define the zoom lvl of when to go from county view to tract view
const zoomThreshold = 9;

// the map application
function App() {
  const mapboxElRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapboxElRef.current,
      style: "mapbox://styles/mapbox/light-v10", // style of the basemap
      // TODO: change the basemap style to only show county name and city name
      center: [-99.514301, 31.616819], // centers the view of the map
      minZoom: 5, // disables zooming out past zoom lvl 5
      pitchWithRotate: false, // disables rotating the map
      dragRotate: false // disables rotating the map
      // maxBounds: [[],[]] // view boundaries for the map
    });

    // adds geocoder
    // });
    // TODO: figure out how to add Algolia to query the map
    // (https://community.algolia.com/places/examples.html?utm_medium=social-owned&utm_source=GitHub&utm_campaign=places%20repository)
    // var placesAutocomplete = new Places({
    //   appId: process.env.REACT_APP_APPID,
    //   apiKey: process.env.REACT_APP_APIKEY,
    //   container: document.querySelector('#input-map')
    // });
    //
    // placesAutocomplete.on('change', e => console.log(e.suggestion))

    // disables rotating the map
    map.touchZoomRotate.disableRotation();

    // adds zooming in and out buttoms
    // map.addControl(new mapboxgl.NavigationControl());

    // create variables
    var hoveredStateId = null;
    var nameDisplay = document.getElementById('name');
    var scoreDisplay = document.getElementById('score');

    // basemap and layers

    // TODO: fetching the data from mongodb via node.js ??? 
    // TODO: connect w GraphQL API and show ashtma rates at the national scale 
    map.on('load', function() {
      // Adding data sources to the map
      
      // Source for state 
      // map.addSource('countyjson', {
      //   'type': 'geojson',
      //   'data': 'https://raw.githubusercontent.com/shelbygreen/env-racism-map/master/county_population_score.json',
      //   'generateId': true
      //   // TODO: fix highlight bug from generateId. should probably add id field
      //   // to the json and make sure its within the properties
      // });
      
      // source for the county data
      map.addSource('countyjson', {
        'type': 'geojson',
        'data': 'https://raw.githubusercontent.com/shelbygreen/env-racism-map/master/county_population_score.json',
        'generateId': true
        // TODO: fix highlight bug from generateId. should probably add id field
        // to the json and make sure its within the properties
      });

      // source for the tract data
      map.addSource('tractjson', {
        'type': 'geojson',
        'data': 'https://raw.githubusercontent.com/shelbygreen/env-racism-map/master/tract_population_score.json',
        'generateId': true
      });

      // Adding layers to the map
      // choropleth layer for the county data
      map.addLayer({
        'id': 'countyjson-fill',
        'type': 'fill',
        'source': 'countyjson',
        'layout': {},
        'maxzoom': zoomThreshold, // switches to tract view at this zoom lvl
        'paint': {
          'fill-color': {
            property: 'score', // colors coded by the 'score' attribute
            stops: [
              [1, "rgb(253,231,37)"],
              [2, "rgb(180,222,44)"],
              [3, "rgb(109,205,89)"],
              [4, "rgb(53,183,121)"],
              [5, "rgb(31,158,137)"],
              [6, "rgb(38,130,142)"],
              [7, "rgb(49,104,142)"],
              [8, "rgb(62,74,137)"],
              [9, "rgb(72,40,120)"],
              [10, "rgb(68,1,84)"]
            ]
          },
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.7,
            0.7
          ]
        },
      }, 'waterway-label');

      // choropleth layer for the tract data
      map.addLayer({
        'id': 'tractjson-fill',
        'type': 'fill',
        'source': 'tractjson',
        'layout': {},
        'minzoom': zoomThreshold,
        'paint': {
          'fill-color': {
            property: 'score',
            stops: [
              [1, "rgb(253,231,37)"],
              [2, "rgb(180,222,44)"],
              [3, "rgb(109,205,89)"],
              [4, "rgb(53,183,121)"],
              [5, "rgb(31,158,137)"],
              [6, "rgb(38,130,142)"],
              [7, "rgb(49,104,142)"],
              [8, "rgb(62,74,137)"],
              [9, "rgb(72,40,120)"],
              [10, "rgb(68,1,84)"]
            ]
          },
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.7,
              0.7
            ]
        }
      }, 'waterway-label');

      // highlight layer for the county data - adds thick white border to county
      map.addLayer({
        'id': 'countyjson-highlight',
        'type': 'line',
        'source': 'countyjson',
        'layout': {},
        'maxzoom': zoomThreshold,
        'paint': {
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            0.4
          ],
          'line-color': "#FFFFFF"
        }
      }, 'waterway-label');

      // highlight layer for the tract data - adds thick white border to tract
      map.addLayer({
        'id': 'tractjson-highlight',
        'type': 'line',
        'source': 'tractjson',
        'layout': {},
        'minzoom': zoomThreshold,
        'paint': {
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            0.5
          ],
          'line-color': "#FFFFFF"
        }
      }, 'waterway-label');

    });

    // Populating sidebar and highlight on hover feature
    // TODO: add city to tract title
    map.on('mousemove', 'countyjson-fill', function(e) {
      // change the pointer style when on a region
      map.getCanvas().style.cursor = 'pointer';

      // set variables equal to the current feature's details
      var regionName = e.features[0].properties.name;
      var regionScore = e.features[0].properties.score;

      if (e.features) {
        // if the feature exists, populate the sidebar
        nameDisplay.textContent = regionName;
        scoreDisplay.textContent = regionScore;

        // add a highlight
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'countyjson',
            id: hoveredStateId
          }, {
            hover: false
          });
        }

        hoveredStateId = e.features[0].id;

        map.setFeatureState({
          source: 'countyjson',
          id: hoveredStateId
        },{
          hover: true
        });

      }
    });

    map.on('mousemove', 'tractjson-fill', function(e) {
      // change the pointer style when on a region
      map.getCanvas().style.cursor = 'pointer';

      // set variables equal to the current feature's details
      var regionName = e.features[0].properties.name;
      var regionScore = e.features[0].properties.score;

      if (e.features) {
        // if the feature exists, populate the sidebar
        nameDisplay.textContent = regionName;
        scoreDisplay.textContent = regionScore;

        // add a highlight
        if (hoveredStateId) {
          map.setFeatureState({
            source: 'tractjson',
            id: hoveredStateId
          }, {
            hover: false
          });
        }

        hoveredStateId = e.features[0].id;

        map.setFeatureState({
          source: 'tractjson',
          id: hoveredStateId
        },{
          hover: true
        });

      }
    });

    map.on('mouseleave', 'countyjson-fill', function () {
      // change the pointer style
      map.getCanvas().style.cursor = 'default';

      // Remove the information from the previously hovered feature from the sidebar
      // nameDisplay.textContent = '';
      // scoreDisplay.textContent = '';

      if (hoveredStateId) {
        map.setFeatureState({
          source: 'countyjson',
          id: hoveredStateId
        }, {
          hover: false
        });
      }
      hoveredStateId = null;
    });

    map.on('mouseleave', 'tractjson-fill', function () {
      map.getCanvas().style.cursor = 'default';

      // Remove the information from the previously hovered feature from the sidebar
      nameDisplay.textContent = 'Select a region for details';
      scoreDisplay.textContent = '';

      if (hoveredStateId) {
        map.setFeatureState({
          source: 'tractjson',
          id: hoveredStateId
        }, {
          hover: false
        });
      }
      hoveredStateId = null;
    });

    // load initial data for the sidebar
    map.onLoad = document.getElementById("name").innerHTML = "Select a region to see details";

});

  return (
    <div class="App">
      <div id="navbar"></div>
      <main>
        <div
          ref={mapboxElRef}
          id="mapContainer"></div>

        <div id="side">
          <div class="ui left fixed vertical menu">
              <div class="name" id="name"></div>
              <h2 class="score" id="score"></h2>
          </div>
        </div>
      </main>
  </div>
  );
}

export default App;

//set up the map
var map = L.map('map');

// create the tile layer with correct attribution
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 12, maxZoom: 18, attribution: osmAttrib});		

// start the map in South-East England
map.setView(new L.LatLng(45.422160,-75.696105),12);
map.addLayer(osm);

// GraphHopper foot/walk button
function createWalkButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    btn.title = "Walking route";
    return btn;
}

// GraphHopper bike button
function createBikeButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    btn.title = "Biking route";
    return btn;
}

//  GraphHopper car button
function createCarButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    btn.title = "Car route";
    return btn;
}

// Create a Leaflet buttons for GraphHopper
// Reserve waypoints button
function createReverseButton(label, container) {
    var btn = L.DomUtil.create('button', '', container);
    btn.setAttribute('type', 'button');
    btn.innerHTML = label;
    btn.title = "Reverse waypoints";
    return btn;
}


// Create a plan for the routing engine
// This plan will create specific geocoding buttons
// Extend L.Routing.Plan to create a custom plan for GraphHopper
var geoPlan = L.Routing.Plan.extend({

createGeocoders: function() {

	var container = L.Routing.Plan.prototype.createGeocoders.call(this),

		// Create a reverse waypoints button
		reverseButton = createReverseButton('<img src="images/reverse.png" width="15px"'+'style="-webkit-clip-path: inset(0 0 5px 0); -moz-clip-path: inset(0 0 5px 0); clip-path: inset(0 0 5px 0);">', container);

		//http://gis.stackexchange.com/questions/193235/leaflet-routing-machine-how-to-dinamically-change-router-settings

		// Create a button for walking routes
		walkButton = createWalkButton('<img src="images/walk.png" width="15px"'+'style="-webkit-clip-path: inset(0 0 5px 0); -moz-clip-path: inset(0 0 5px 0); clip-path: inset(0 0 5px 0);">', container);

		// Create a button for biking routes
		bikeButton = createBikeButton('<img src="images/bike.png" width="17px"'+'style="-webkit-clip-path: inset(0 0 5px 0); -moz-clip-path: inset(0 0 5px 0); clip-path: inset(0 0 5px 0);">', container);

		// Create a button for driving routes
		carButton = createCarButton('<img src="images/car.png" width="15px"'+'style="-webkit-clip-path: inset(0 0 5px 0); -moz-clip-path: inset(0 0 5px 0); clip-path: inset(0 0 5px 0);">', container);

		// Event to reverse the waypoints
		L.DomEvent.on(reverseButton, 'click', function() {
				var waypoints = this.getWaypoints();
				this.setWaypoints(waypoints.reverse());
				console.log("Waypoints reversed");
			    	}, this);

		// Event to generate walking routes
		L.DomEvent.on(walkButton, 'click', function() {
			graphHopperRouting.getRouter().options.urlParameters.vehicle = 'foot';
			graphHopperRouting.route();
			graphHopperRouting.setWaypoints(graphHopperRouting.getWaypoints());
			console.log("Walking route");	
		}, this);

		// Event to generate biking routes
		L.DomEvent.on(bikeButton, 'click', function() {
			graphHopperRouting.getRouter().options.urlParameters.vehicle = 'bike';
			graphHopperRouting.route();
			graphHopperRouting.setWaypoints(graphHopperRouting.getWaypoints());
			console.log("Biking route");	
		}, this);

			// Event to generate driving routes
			L.DomEvent.on(carButton, 'click', function() {
				graphHopperRouting.getRouter().options.urlParameters.vehicle = 'car';
				graphHopperRouting.route();
				graphHopperRouting.setWaypoints(graphHopperRouting.getWaypoints());
				console.log("Driving route");	
				}, this);
	
			return container;
		    }
	});

	// Create a plan for the routing
	var plan = new geoPlan(

		// Empty waypoints
		[],

		{
			// Default geocoder
			geocoder: new L.Control.Geocoder.Nominatim(),

			// Create routes while dragging markers
			routeWhileDragging: true,
		}),

		// Call the GH routing engine
		graphHopperRouting = L.Routing.control({

			// Empty waypoints
			waypoints: [],

			// Positioning of the routing engine in the window
			position: 'bottomright',

			// Draggable routes
			routeWhileDragging: true,

			// Change these.. Offline GH routing
			router: L.Routing.graphHopper('', {
				serviceUrl: 'http://localhost:8989/route',
				urlParameters: { type: 'json',
						 weighting: 'shortest',
						 algorithm: 'dijkstra' }
				}),

			// Use the created plan for GH routing
			plan: plan,

			// Show the routing icon on a reloaded window
			show: true,

			// Enable the box to be collapsed
			collapsible: false,

			// Collapse button which opens the routing icon (mouse over)
			// Fix this so the routing box closes when mouse leaves the routing window rather than the window "X"
			collapseBtn: function(itinerary) {
				var collapseBtn = L.DomUtil.create('span', itinerary.options.collapseBtnClass);
				L.DomEvent.on(collapseBtn, 'click', itinerary._toggle, itinerary);
				itinerary._container.insertBefore(collapseBtn, itinerary._container.firstChild);
			},

			//showAlternatives: true,

			// Alternative line styles
			altLineOptions: {
			styles: [{
				color: 'black',
				opacity: 0.15,
				weight: 9

			}, {
				color: 'white',

				opacity: 0.8,
				weight: 6
			}, {
				color: 'blue',
				opacity: 0.5,
				weight: 2
			}]
			}
	});

	map.addControl(graphHopperRouting);

	function createButton(label, container) {
	    var btn = L.DomUtil.create('button', '', container);
	    btn.setAttribute('type', 'button');
	    btn.innerHTML = label;
	    btn.title = "Start route location";
	    return btn;
	}

map.on('click', function(e) {
    var container = L.DomUtil.create('div'),
        startBtn = createButton('Start', container),
        destBtn = createButton('Go', container);

L.DomEvent.on(startBtn, 'click', function() {
        graphHopperRouting.spliceWaypoints(0, 1, e.latlng);
        map.closePopup();
});

    L.DomEvent.on(destBtn, 'click', function() {
        graphHopperRouting.spliceWaypoints(graphHopperRouting.getWaypoints().length - 1, 1, e.latlng);
        map.closePopup();
    });
    
L.popup()
        .setContent(container)
        .setLatLng(e.latlng)
        .openOn(map);
});


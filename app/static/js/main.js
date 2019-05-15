var v = new Vue({
	el: '#vue-div',
	data: {
	},
	methods: {
	},
	beforeMount() {
	},
})
Vue.config.devtools = true;

var showOnlyFavorites = false;
var map
var filterStartTime = 600 //time in minutes
var filterEndTime = 1020
let lat = 36.97, lng = -121.99

var locations = [
	/*
		{
			title: "Graybears Shelter",
			location: "5224 N Broadway St",
			lat: 36.975,
		long: -121.95,
		hours: "9:00 - 4:00",
		open: true,
		},
		{
			title: "Greenpeace Center",
			location: "216 Central Ave",
			lat: 36.978,
		long: -122.02,
		hours: "9:00 - 4:00",
		open: false,
		},
		*/
]

function shouldFilter(location) {
	let favorites = ['Location 1', 'Location 3']
	let tempTime = location['start'].split('T')[1].split('-')
	let startTime = tempTime[0].split(':')
	let startTimeInMinutes = convertToMinutes(parseInt(startTime[0]), parseInt(startTime[1]))
	let endTime = tempTime[1].split(':')
	let endTimeInMinutes = convertToMinutes(parseInt(endTime[0]), parseInt(endTime[1]))
	
	if (favorites.length > 0 && !favorites.includes(location['title']) && showOnlyFavorites) { //dont show location if it isn't favorited
		return true;
	}

	if (startTimeInMinutes < filterStartTime || endTimeInMinutes > filterEndTime) { //too early or late
		return true
	}
	
	return false;
}

function convertToMinutes(hours, minutes) {
	return hours * 60 + minutes
}

function favfilterToggle() {
	showOnlyFavorites = document.getElementById('favfilter').checked
	initMap()
}

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: new google.maps.LatLng(lat, lng),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false,
		fullscreenControl: false,
		zoomControl: false,
		streetViewControl: false,
	})

	var infowindow = new google.maps.InfoWindow({})
	
	var marker, i
	for (i = 0; i < locations.length; i++) {
		if (shouldFilter(locations[i])) {
			continue
		}
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i]["lat"], locations[i]["long"]),
			map: map,
		})
		
		google.maps.event.addListener(
			marker,
			'click',
			(function (marker, i) {
				return function () {
					infowindow.setContent(genDetails(locations[i]))
					infowindow.open(map, marker)
				}
			})(marker, i)
		)
	}
}

function updateBound() {
	filterStartTime = convertToMinutes(document.getElementById('startH').value+document.getElementById('startTOD').value,document.getElementById('startM').value)
	filterEndTime = convertToMinutes(document.getElementById('endH').value+document.getElementById('endTOD').value,document.getElementById('endM').value)
	initMap()
}

//I hate this
function genDetails(elem) {
	var details =
		"<center>" +
		"<h6>" + elem.title + "</h6>" +
		"<p>" + elem.location + "</p>"

	if (elem.open) {
		details += "<p>Open: <span style='color: green'>"
	}
	else {
		details += "<p>Closed: <span style='color: red'>"
	}

	details = details + elem.hours + "</span></p>" +
		"<a href='https://www.google.com/maps/dir/?api=1&destination=" + elem.lat + "," + elem.long + "' class='btn btn-primary'>Get Directions</a>" +
		"</center>"
	return details
}

//just load everything all at once, it's like .1mb, who cares lol
$(function () {
	setTimeout(() => {
		console.log("loaded")
		$.getJSON("/loadDates", function (data) {
			console.log(data)
			locations = data['locs']
			initMap()
		}, 200)
	})
})




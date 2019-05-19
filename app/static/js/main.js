/*
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
*/
var showOnlyFavorites = false;
var map
var filterStartTime = 600 //time in minutes
var filterEndTime = 1020
var filterStartDate = null
var filterEndDate = null
let lat = 36.97, lng = -121.99
let favorites = []

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

function shouldFilter(location, byTime = false) {
	let tempTime = location['start'].split('T')[1].split('-')
	let startTime = tempTime[0].split(':')
	let endTime = tempTime[1].split(':')
	
	if (favorites.length > 0 && !favorites.includes(location['title']) && showOnlyFavorites) { //dont show location if it isn't favorited
		return true;
	}
	//console.log(new Date($('#startDate').val()))
	/*
	if (byTime && startTimeInMinutes < filterStartTime || endTimeInMinutes > filterEndTime) { //too early or late
		console.log('Filtered ' + location['title'] + startTimeInMinutes)
		return true
	}
	*/
	
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
	filterStartDate = new Date($('#startDate').val())
	filterStartDate.setHours(0,0,0,0)
	filterEndDate = new Date($('#endDate').val())
	filterEndDate.setHours(23,59,59,0)
	//filterStartTime = convertToMinutes(document.getElementById('startH').value+document.getElementById('startTOD').value,document.getElementById('startM').value)
	//filterEndTime = convertToMinutes(document.getElementById('endH').value+document.getElementById('endTOD').value,document.getElementById('endM').value)
	initMap()
}

//I hate this
function genDetails(elem){
	var details = 
		"<center>" +
		"<h6>" + elem.title + "</h6>" +
		"<p>" + elem.location + "</p>" 

		let tempTime = elem['start'].split('T')[1].split('-')
		let startTemp = tempTime[0].split(':')
		let startTime = startTemp[0] + ':' + startTemp[1]
		let endTemp = tempTime[1].split(':')
		let endTime = endTemp[0] + ':' + endTemp[1]

		if(elem.open){
			details += "<p>Open: <span style='color: green'>"
		}
		else{
			details += "<p>Closed: <span style='color: red'>"
		}

		details = details + startTime + " - " + endTime + "</span></p>" +
		"<a href='https://www.google.com/maps/dir/?api=1&destination=" + elem.lat + "," + elem.long + "' class='btn btn-primary'>Get Directions</a>" +
		"</center>"
	return details
}


function loadFavorites(){
	favorites = Cookies.getJSON("favorites")
	if (favorites == null){
		Cookies.set("favorites", [])
		favorites = []
	}
}
//use this every time you add or remove something from favorites
function updateFavorites(){
	Cookies.set("favorites", favorites)
}


$(function () {
	//Set date pickers to today and 1 week from today
	today = new Date()
	document.getElementById('startDate').valueAsDate = today
	filterStartDate = today
	today.setDate(today.getDate() + 7)
	document.getElementById('endDate').valueAsDate = today
	filterEndDate = today
	loadFavorites()

	setTimeout(() => {
		console.log("loaded")
		$.getJSON("/loadDates", function (data) {
			console.log(data)
			locations = data['locs']
			initMap()
		}, 200)
		
	})

})




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

]


function shouldFilter(locs, byTime = false) {

	if (!favorites.includes(locs['location'].hashCode().toString()) && showOnlyFavorites) { //dont show location if it isn't favorited
		return true;
	}
	let rtValue = true
	locs['times'].forEach((location, idx) => {
		let tempTime = location['start'].split('T')[1].split('-')

		//console.log(new Date($('#startDate').val()))
		/*
		if (byTime && startTimeInMinutes < filterStartTime || endTimeInMinutes > filterEndTime) { //too early or late
			console.log('Filtered ' + location['title'] + startTimeInMinutes)
			return true
		}
		*/

		//Check date range
		let locdate = location['start'].split('T')[0]
		let locTime = location['start'].split('T')[1].split('-')[0]
		let locCmpDate = new Date(locdate + 'T' + locTime)
		let inRange = (locCmpDate.getTime() > filterStartDate.getTime() && locCmpDate.getTime() < filterEndDate.getTime())
		//console.log('THIS EVENTS DATE IS: ' + locCmpDate)

		//console.log(inRange + ' - ' + locCmpDate)

		if (inRange) {
			rtValue = false
		}
	})
	return rtValue
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
	filterStartDate.setHours(0, 0, 0, 0)
	filterEndDate = new Date($('#endDate').val())
	filterEndDate.setHours(23, 59, 59, 0)
	//filterStartTime = convertToMinutes(document.getElementById('startH').value+document.getElementById('startTOD').value,document.getElementById('startM').value)
	//filterEndTime = convertToMinutes(document.getElementById('endH').value+document.getElementById('endTOD').value,document.getElementById('endM').value)
	initMap()
}

//I hate this
function genDetails(elem) {
	var details =
		"<center>" +
		"<h6>" + elem.title + "</h6>" +

		/*
		'<link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">' +
		'<label for="id-of-input" class="custom-checkbox">' +
		'<input type="checkbox" id="id-of-input"/>' +
		'<i class="glyphicon glyphicon-star-empty"></i>' +
		'<i class="glyphicon glyphicon-star"></i>' +
		  '</label>' +
		  */

		"<p style='margin-bottom:8px'>" + elem.location + "</p>"

	if (elem.open) {
		details += "<p style='margin-bottom:0px'><span style='color: green'>Open</span><br>"
	}
	else {
		details += "<p style='margin-bottom:0px'><b>Open Times:</b><br>"
	}

	details = details +
		//startTime + " - " + endTime + "</span><br>" + 
		getOpenDays(elem['times']) + "</br>" + "</p>" +
		"<a class='btn btn-primary' style='margin-bottom:2px; color:#ffffff' onClick=addFav(`" + elem.location.hashCode() + "`)>Favorite</a><br>" +
		"<a href='https://www.google.com/maps/dir/?api=1&destination=" + elem.lat + "," + elem.long + "' class='btn btn-primary'>Get Directions</a>" +
		"</center>"
	return details
}

function addFav(input) {
	console.log(favorites)
	for (let i = 0; i < favorites.length; i++) {
		if (favorites[i] == input) {
			favorites.splice(i, 1)
			updateFavorites()
			return
		}
	}
	favorites.push(input)
	updateFavorites()
}

function loadFavorites() {
	favorites = Cookies.getJSON("favorites")
	if (favorites == null) {
		Cookies.set("favorites", [])
		favorites = []
	}
}

function getOpenDays(dates) {
	let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var days = {}
	dates.forEach((date, idx) => {
		var locdate = date['start'].split('T')[0]
		var startTime = date['start'].split('T')[1].split('-')[0]
		var endTime = date['end'].split('T')[1].split('-')[0]
		var dateObj = new Date(locdate + 'T' + startTime)
		var endDateObj = new Date(locdate + 'T' + endTime)

		let dayNum = dateObj.getDay()
		if (!(dayNum in days)) {
			days[dayNum] = []
		}
		days[dayNum].push([dateObj, endDateObj])
	})
	var out = ''
	for (day in days) {
		var entry = days[day]
		out += daysOfWeek[day] + `: ` //Day of week append
		console.log(entry)
		let val = entry[0]

		out += getFormattedTime(val[0]) + ` - ` + getFormattedTime(val[1])
		out += `<br>`
	}
	return out
}

function getFormattedTime(d) {
	d = ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2)

	return d;
}

//use this every time you add or remove something from favorites
function updateFavorites() {
	Cookies.set("favorites", favorites)
}

//Google Maps gives us a seperate event for each date. 
//Condense them to a single event per location
function condenseLocations(locations) {
	let i = 0
	let map = new Object()
	while (i < locations.length) {
		loc = locations[i]['location']
		if (!(loc in map)) {
			map[loc] = i
			locations[i]['openTimes'] = [locations[i]['start']]
			i += 1
		} else {
			let j = map[loc]
			locations[j]['openTimes'].push(locations[i]['start'])
			locations.splice(i, 1)
		}
	}
	console.log(locations)
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		alert("Geolocation is not supported by this browser.")
	}
}

function showPosition(position) {
	lat = position.coords.latitude
	lng = position.coords.longitude
	initMap()
}

$(function () {
	//Set date pickers to today and 1 week from today
	today = new Date()
	document.getElementById('startDate').valueAsDate = today
	filterStartDate = today
	end = new Date()
	end.setDate(today.getDate() + 7)
	document.getElementById('endDate').valueAsDate = end
	filterEndDate = end
	filterEndDate.setHours(23, 59, 59, 0)
	loadFavorites()
	getLocation()
	setTimeout(() => {
		console.log("loaded")
		$.getJSON("/loadDates", function (data) {
			console.log(data)
			locations = data['locs']
			condenseLocations(locations)
			initMap()
		}, 200)
	})
})

String.prototype.hashCode = function () {
	var hash = 0, i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};


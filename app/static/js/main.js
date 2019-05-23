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

	if (!favorites.includes(location['title']) && showOnlyFavorites) { //dont show location if it isn't favorited
		return true;
	}
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
	return !(inRange);
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

	let tempTime = elem['start'].split('T')[1].split('-')
	let startTemp = tempTime[0].split(':')
	let startTime = startTemp[0] + ':' + startTemp[1]
	let endTemp = tempTime[1].split(':')
	let endTime = endTemp[0] + ':' + endTemp[1]

	if (elem.open) {
		details += "<p style='margin-bottom:0px'><u>Open</u><span style='color: green'>"
	}
	else {
		details += "<p style='margin-bottom:0px'><u>Closed</u><span style='color: red'><br>"
	}

	details = details + 
		//startTime + " - " + endTime + "</span><br>" + 
		getOpenDays(elem['openTimes']) + "</br>" + "</p>" +
		//"<a class='btn btn-primary' style='margin-bottom:2px; color:#ffffff'>Favorite</a><br>" +
		"<a href='https://www.google.com/maps/dir/?api=1&destination=" + elem.lat + "," + elem.long + "' class='btn btn-primary'>Get Directions</a>" +
		"</center>"
	return details
}

function addFav(input) {
	console.log(input)
}

function loadFavorites() {
	favorites = Cookies.getJSON("favorites")
	if (favorites == null) {
		Cookies.set("favorites", [])
		favorites = []
	}
}

function getOpenDays(dates) {
	let set = new Object()
	let numToDate = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	for (let i = 0; i < dates.length; i++) {
		let temp = dates[i].split('T')
		let locdate = temp[0]
		let locTime = temp[1].split('-')
		let dateObj = new Date(locdate + 'T' + locTime[0])
		let endDateObj = new Date(locdate + 'T' + locTime[1])

		let dayNum = dateObj.getDay()
		if (!(Object.keys(set)).includes(dayNum)) {
			set[dayNum] = []
		}
		set[dayNum].push([dateObj,endDateObj])
	}
	out = ``
	entries = Object.entries(set)
	for (let i = 0; i < entries.length; i++) {
		out += numToDate[entries[i][0]] + `: ` //Day of week append
		let val = entries[i][1]
		//console.log(val)
		for (let j = 0; j < val.length; j++) {	//Time for each day append
			out += getFormattedTime(val[j][0]) + ` - ` + getFormattedTime(val[j][1])
		}
		out += `<br>`
	}
	//out = out.substring(0, out.length - 1)
	//console.log(out)
	return out
}

function getFormattedTime(d){
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




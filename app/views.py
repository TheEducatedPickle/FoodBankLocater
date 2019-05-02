
# A very simple Flask Hello World app for you to get started with...

from flask import render_template, request, jsonify

from app import app
from app.calendar.calendar_stuff import getEvents

@app.route('/')
def index():
	return render_template("index.html")

@app.route('/loadDates/', methods=['GET'])
def load_dates():
	rtData = {}
	data = request.data
	print("LOAD DATES: ", data)
	rtData["test"] = "foo"
	rtData["locationInfo"] = getLocationInfo()
	rtData["locs"] = getEvents()
	return jsonify(rtData)

def getLocationInfo():
	#make calendar api call
	return {}

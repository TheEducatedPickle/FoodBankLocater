from __future__ import print_function
import datetime
import pickle
import os.path
import requests
import json
import urllib.parse
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
def save_obj(obj, name ):
    with open('obj/'+ name + '.pkl', 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open('obj/' + name + '.pkl', 'rb') as f:
        return pickle.load(f)

def getEvents():
    #save_obj({}, 'locations')
    locations = load_obj("locations")
    print("locations: ", locations)
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('calendar', 'v3', credentials=creds)

    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z' # 'Z' indicates UTC time
    print('Getting the upcoming 10 events')
    events_result = service.events().list(calendarId='vel0ek3mdioh6m18iepr85degk@group.calendar.google.com', timeMin=now,
                                        maxResults=10, singleEvents=True,
                                        orderBy='startTime').execute()
    events = events_result.get('items', [])

    filtered_events = []


    if not events:
        print('No upcoming events found.')
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        print(event)
        temp_event = {}
        temp_event['title'] = event['summary']
        temp_event['location'] = event['location']
        temp_event['start'] = event['start'].get('dateTime', event['start'].get('date'))
        temp_event['end'] = event['start'].get('dateTime', event['end'].get('date'))

        if not event['id'] in locations:
            print("no latlong")
            url = "https://maps.googleapis.com/maps/api/geocode/json?"
            req = {}
            req['address'] = event['location' + "California USA"]
            req['key'] = "AIzaSyCcXBAjbujUiiVRO375Dz2_Hm0p6K9ilLM"
            r = requests.get(url + urllib.parse.urlencode(req))
            geo = r.json()['results'][0]['geometry']['location']
            print(geo)
            locations[event['id']] = geo
            save_obj(locations, "locations")

        temp_event['lat'] = locations[event['id']]['lat']
        temp_event['long'] = locations[event['id']]['lng']
        print(temp_event)
        filtered_events.append(temp_event)
    return filtered_events




if __name__ == '__main__':
    getEvents()
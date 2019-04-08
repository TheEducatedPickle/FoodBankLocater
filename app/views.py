
# A very simple Flask Hello World app for you to get started with...

from flask import render_template

from app import app


@app.route('/')
def index():
    return render_template("index.html")


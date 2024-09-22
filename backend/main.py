from flask import Flask, render_template, request, redirect, url_for,jsonify
from flask_cors import CORS
from routes import configure_routes

app = Flask(__name__)
CORS(app)

configure_routes(app)


if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template, request, redirect, url_for,jsonify
from flask_cors import CORS
from routes import configure_routes

b27app = Flask(__name__)
CORS(b27app)

configure_routes(b27app)


if __name__ == '__main__':
    b27app.run(debug=True)
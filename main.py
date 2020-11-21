import os
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/')
def main():

    return ''


if __name__ == "__main__":
    app.run()

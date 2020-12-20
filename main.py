import os
from flask import Flask, jsonify,request
from flask_cors import CORS, cross_origin
import math

app = Flask(__name__)
CORS(app, support_credentials=True)

cclist=[
    {
        'start':1.90,
        'text':'Hello this is first transcript',
        'duration':0.52
    },
    {
        'start':2,
        'text':'Hello this is second transcript',
        'duration':0.52
    },
    {
        'start':2.30,
        'text':'Hello this is third transcript',
        'duration':0.52
    }
]



@app.route('/api/cclist/<start_time>',methods=["GET"])
def main(start_time):
    start_time=math.ceil(float(start_time))
    data = list(filter(lambda x: math.ceil(x['start'])<=start_time+0.5 and math.ceil(x['start'])>=start_time-0.5,cclist))
    return jsonify(data[0]) if data else jsonify({'message':'No transcript found'})

@app.route('/api/postcclist',methods=['POST'])
def postData():
    data = jsonify(request.get_json())
    return data

if __name__ == "__main__":
    app.run()

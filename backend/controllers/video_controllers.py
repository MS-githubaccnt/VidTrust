from flask import jsonify,request,make_response
import os
from dotenv import load_dotenv
from urllib.parse import urlencode
import jwt
import requests
import uuid
from firestore_connection.firestore     import video_url_to_firestore
from botocore.exceptions import NoCredentialsError


config = {
    'client_id': os.getenv('GOOGLE_CLIENT_ID'),
    'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
    'auth_url': 'https://accounts.google.com/o/oauth2/v2/auth',
    'token_url': 'https://oauth2.googleapis.com/token',
    'redirect_url': os.getenv('REDIRECT_URL'),
    'client_url': os.getenv('CLIENT_URL'),
    'token_secret': os.getenv('TOKEN_SECRET'),
    'token_expiration': 36000,
    'post_url': 'https://jsonplaceholder.typicode.com/posts',
}



def video_url():
    print("ckdnjdkscdcsnjdksjcdkjcndkscndnkcjdsckdjcdkcsdjcn")
    data = request.json
    title = data.get('title')
    imageUrl = data.get('imageUrl')
    videoUrl = data.get('videoUrl')
    token = request.cookies.get('token')
    decoded_token = jwt.decode(token, config['token_secret'],algorithms=['HS256'])
    user_dictionary = decoded_token.get('user')
    email = user_dictionary.get('email')
    video_struct = {
        email :email,
        title:title,
        imageUrl:imageUrl,
        videoUrl:videoUrl
    }
    id = str(uuid.uuid4())
    video_ref = video_url_to_firestore()
    video_ref.document(id).set(video_struct)
    return jsonify({"status": "success", "message": "Data received and uploaded"}), 200


def video_fetch_url():
    token = request.cookies.get('token')
    decoded_token = jwt.decode(token, config['token_secret'],algorithms=["HS256"])
    user_dictionary = decoded_token.get('user')
    email = user_dictionary.get('email')
    video_ref = video_url_to_firestore()
    query = video_ref.where('email', '==', email)
    docs = query.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        results.append({
            'id': doc.id,
            'email': data.get('email'),
            'title':data.get('title'),
            'imageUrl': data.get('imageUrl'),
            'videoUrl':data.get('videoUrl')
        })
    return jsonify(results)
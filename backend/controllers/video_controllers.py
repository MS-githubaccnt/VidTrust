from flask import jsonify,request,make_response
import os
from dotenv import load_dotenv
from urllib.parse import urlencode
import jwt
import requests
import uuid
from firestore_connection.firestore     import video_url_to_firestore,temp_video_url_to_firestore
from botocore.exceptions import NoCredentialsError
import logging

logger = logging.getLogger(__name__)

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
        "email" :email,
        "title":title,
        "imageUrl":imageUrl,
        "videoUrl":videoUrl
    }
    id = str(uuid.uuid4())
    video_ref = video_url_to_firestore()
    video_ref.document(id).set(video_struct)
    return jsonify({"status": "success", "message": "Data received and uploaded"}), 200


def video_fetch_url():
    logger.info("Entering video_fetch_url function")
    try:
        token = request.cookies.get('token')
        if not token:
            logger.error("No token found in cookies")
            return jsonify({"error": "No authentication token found"}), 401

        logger.info(f"Token received: {token[:10]}...")  

        try:
            decoded_token = jwt.decode(token, config['token_secret'], algorithms=["HS256"])
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            return jsonify({"error": "Invalid authentication token"}), 401

        user_dictionary = decoded_token.get('user')
        if not user_dictionary:
            logger.error("No user dictionary in decoded token")
            return jsonify({"error": "Invalid token structure"}), 401

        email = user_dictionary.get('email')
        if not email:
            logger.error("No email found in user dictionary")
            return jsonify({"error": "Email not found in token"}), 401

        logger.info(f"Fetching videos for email: {email}")

        video_ref = video_url_to_firestore()
        query = video_ref.where('email', '==', email)
        logger.info(f"Query created: {query._filters_pb}")  # Log the query filters

        docs = query.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            results.append({
                'id': doc.id,
                'email': data.get('email'),
                'title': data.get('title'),
                'imageUrl': data.get('imageUrl'),
                'videoUrl': data.get('videoUrl')
            })
            logger.info(f"Document found: {doc.id}")

        logger.info(f"Total documents found: {len(results)}")

        if not results:
            logger.warning(f"No documents found for email: {email}")

        return jsonify(results)

    except Exception as e:
        logger.exception(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500

def test_video():
    data = request.json
    name = data.get('name')
    videoUrl = data.get('videoUrl')
    video_struct = {
        "name" :name,
        "videoUrl":videoUrl
    }
    id = str(uuid.uuid4())
    video_ref = video_url_to_firestore()
    video_ref.document(id).set(video_struct)
    return jsonify({"status": "success", "message": "Data received and uploaded"}), 200


def delete_video():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({"status": "error", "message": "Name is required"}), 400
    video_ref = temp_video_url_to_firestore()
    query = video_ref.where('name', '==', name)
    docs = query.stream()

    deleted = False
    for doc in docs:
        doc.reference.delete()
        deleted = True

    if deleted:
        return jsonify({"status": "success", "message": f"Video(s) with name '{name}' deleted successfully"}), 200
    else:
        return jsonify({"status": "not found", "message": f"No video found with name '{name}'"}), 404

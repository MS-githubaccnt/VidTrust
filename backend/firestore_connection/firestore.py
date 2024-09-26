from firebase_admin import credentials, firestore, initialize_app
import logging



logger = logging.getLogger(__name__)


cred = credentials.Certificate("firestore_connection/b27project-31bde-firebase-adminsdk-ybhhu-2459f43c40.json")
default_app = initialize_app(cred)
db = firestore.client()


def connect_firebase():
  users_ref = db.collection('users')
  return users_ref

def video_url_to_firestore():
  video_ref = db.collection('videos')
  logger.info("dsvjhsvkhdsvf gjfv sagvjdfgvfghv dfjv dgjv gh vgfv ghd vghd ghd ghd hgdz ghzfdhd zdgh zdhg h h hzd hd d   zdh zgh d zhfd ")
  return video_ref
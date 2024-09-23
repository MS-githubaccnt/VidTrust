from firebase_admin import credentials, firestore, initialize_app


def connect_firebase():
  cred = credentials.Certificate("firestore_connection/b27project-31bde-firebase-adminsdk-ybhhu-2459f43c40.json")
  default_app = initialize_app(cred)
  db = firestore.client()
  users_ref = db.collection('users')
  return users_ref

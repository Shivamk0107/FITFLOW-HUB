import firebase_admin
from firebase_admin import credentials, storage

cred = credentials.Certificate("app/config/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-project-id.appspot.com'
})

bucket = storage.bucket()

def upload_image(file_path, file_name):
    blob = bucket.blob(file_name)
    blob.upload_from_filename(file_path)
    blob.make_public()
    return blob.public_url

from cryptography.hazmat.primitives.asymmetric import rsa,padding
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.backends import default_backend
import cv2
import json
import base64
import ffmpeg
import os
import sys
import requests
from supabase import create_client,Client
import subprocess
from dotenv import load_dotenv
import zlib
load_dotenv()

supabase_url = os.environ['SUPABASE_URL']
supabase_anon_key = os.environ['SUPABASE_ANON_KEY']
client:Client = create_client(supabase_url, supabase_anon_key)

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
print(base_dir)
sys.path.append(base_dir)
from backend.firestore_connection.firestore import connect_signature_database

def generate_key():
    private_key = rsa.generate_private_key(
        public_exponent=65537, 
        key_size=2048
        )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
        )

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    print("Public and Private keys generated successfully.", private_pem,public_pem)
    return private_pem,public_pem

def frame_capture(path):
    cap=cv2.VideoCapture(path)
    fps=cap.get(cv2.CAP_PROP_FPS)
    frame_interval=int(fps)
    frames=[]
    frame_idx=0

    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES,frame_idx)
        ret,frame=cap.read()
        if not ret:
            break

        frames.append(frame)
        frame_idx+=frame_interval

    cap.release()
    return frames

def encode_frame_to_base64(frame):
    frame_resized = cv2.resize(frame, (640, 360), interpolation=cv2.INTER_AREA)
    is_success, buffer = cv2.imencode(".jpg", frame_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
    frame_base64 = base64.b64encode(buffer).decode('utf-8')
    return frame_base64

def extract_metadata(video_path):
    probe=ffmpeg.probe(video_path)
    video_stream=next((stream for stream in probe['streams'] if stream['codec_type']=='video'),None)
    print(video_stream)
    return video_stream

def extract_signature_and_public_key():
    ffmpeg_command=['ffprobe','-v','quiet','-print_format','json','-show_format' ,"output_video.mkv"]
    result = subprocess.run(ffmpeg_command,capture_output=True,text=True)
    metadata=json.loads(result.stdout)
    
    tags = metadata['format']['tags']["['SIGNATURE"]
    values=tags.split("', 'public_key=")

    signature_b64=values[0]
    public_key_b64=values[1].rstrip("']")

    print(signature_b64)
    print(public_key_b64)

    signature = base64.b64decode(signature_b64)
    public_key = base64.b64decode(public_key_b64)

    print("Signature:", signature)
    print("Public Key:", public_key)

    return public_key,signature


def set_signature_and_public_key(local_video_path, signature, public_pem):
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    public_pem_b64 = base64.b64encode(public_pem).decode('utf-8')
    print(signature_b64,"\n\n",public_pem_b64)

    metadata_args = {
        'metadata': [
            f'signature={signature_b64}',
            f'public_key={public_pem_b64}',
        ]
    }
    print(metadata_args)
    input_stream=ffmpeg.input("test_video.mkv")
    output_stream=input_stream.output('output_video.mkv',vcodec='copy',acodec='copy', **metadata_args)
    output_stream.run(overwrite_output=True)

def upload_video_to_supabase(local_file_path, remote_file_name):
    with open(local_file_path, "rb") as file:
        client.storage.from_("video").upload(remote_file_name, file)

def load_public_key(pem_data):
    return serialization.load_pem_public_key(
        pem_data, 
        backend=default_backend()
    )
def combine_data(user_data,metadata,frames):
    encoded_frames=[encode_frame_to_base64(frame) for frame in frames]
    compressed_frames = zlib.compress(''.join(encoded_frames).encode('utf-8'))

    combined_data={
        "user_data":user_data,
        "metadata":metadata,
        "frames":base64.b64encode(compressed_frames).decode('utf-8')
    } 
    
    combined_data_str=json.dumps(combined_data)
    return combined_data_str


def sign_combined_data(user_data,metadata,frames):
    with open("private_key.pem","rb") as f:
        private_key=serialization.load_pem_private_key(f.read(),password=None)
    combined_data=combine_data(user_data,metadata,frames)
    signature=private_key.sign(
        combined_data.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    print(signature)
    return signature,combined_data

def verify_signature(user_data,metadata,frames,signature,public_pem):
    public_key = load_public_key(public_pem)  
    combined_data=combine_data(user_data,metadata,frames)
    try:
        public_key.verify(
            signature,
            combined_data.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        print("The video is authentic.")
    except InvalidSignature:
        print("The video has been tampered with or is not authentic.")

def download_video(url, local_path):
    response = requests.get(url)
    with open(local_path, 'wb') as file:
        file.write(response.content)

video_url = os.environ["SUPABASE_TEST_VIDEO"]
local_video_path = 'local_video.mp4'
download_video(video_url, local_video_path)

signature_ref=connect_signature_database()

user_data={
    "name":"Robert Downey Jr.",
    "email":"robertdowney@gmail.com",
}
private_pem,public_pem=generate_key()
metadata=extract_metadata(video_url)
frames=frame_capture(video_url)
signature,combined_data=sign_combined_data(user_data,metadata,frames)

data={
    "private_pem":private_pem,
    "public_pem":public_pem,
    "signature":signature,
    "combined_data":combined_data
}
signature_ref.add(data)

set_signature_and_public_key(video_url,signature,public_pem)
public_key,signature=extract_signature_and_public_key()
verify_signature(user_data,metadata,frames,signature,public_key)


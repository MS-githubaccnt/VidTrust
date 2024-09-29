from cryptography.hazmat.primitives.asymmetric import rsa,padding
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.exceptions import InvalidSignature
import cv2
import json
import base64
import ffmpeg
import os
from dotenv import load_dotenv
load_dotenv()


def generate_key():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )

    with open("private_key.pem", "wb") as f:
        f.write(private_pem)

    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    with open("public_key.pem", "wb") as f:
        f.write(public_pem)

    print("Public and Private keys generated successfully.")

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
    _,buffer=cv2.imencode(".jpg",frame)
    return base64.b64encode(buffer).decode('utf-8')

def extract_metadata(video_path):
    probe=ffmpeg.probe(video_path, cmd=r'C:/ffmpeg/bin/ffprobe.exe')
    video_stream=next((stream for stream in probe['streams'] if stream['codec_type']=='video'),None)
    print(video_stream)
    return video_stream

def combine_data(user_data,metadata,frames):
    encoded_frames=[encode_frame_to_base64(frame) for frame in frames]

    combined_data={
        "user_data":user_data,
        "metadata":metadata,
        "frames":encoded_frames
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

    with open("signature.bin","wb") as f:
        f.write(signature)

def verify_signature(user_data,metadata,frames,signature):
    with open("public_key.pem", "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())
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

user_data={
    "name":"Robert Downey Jr.",
    "email":"robertdowney@gmail.com",
}
generate_key()
metadata=extract_metadata(os.environ["SUPABASE_TEST_VIDEO"])
frames=frame_capture(os.environ["SUPABASE_TEST_VIDEO"])
sign_combined_data(user_data,metadata,frames)
with open("signature.bin","rb") as f:
    signature=f.read()
verify_signature(user_data,metadata,frames,signature)


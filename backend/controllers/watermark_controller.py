import cv2
import numpy as np
from scipy.fftpack import dct, idct
from PIL import Image, ImageDraw, ImageFont
import os
from google.cloud import vision
from google.oauth2 import service_account 

def load_image(image_path, size=(100, 100)):
    img = Image.open(image_path).convert('L')
    img = img.resize(size, Image.LANCZOS)
    return np.array(img)

def embed_watermark_to_frame(frame, img):
    rows, cols, _ = frame.shape
    yuv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
    y, u, v = cv2.split(yuv_frame)
    dct_y = dct(dct(y.T, norm='ortho').T, norm='ortho')
    img_rows, img_cols = img.shape
    y_start, x_start = (rows - img_rows) // 2, (cols - img_cols) // 2
    dct_y[y_start:y_start + img_rows, x_start:x_start + img_cols] = img
    idct_y = idct(idct(dct_y.T, norm='ortho').T, norm='ortho')
    y = np.clip(idct_y, 0, 255).astype(np.uint8)
    yuv_frame = cv2.merge((y, u, v))
    return cv2.cvtColor(yuv_frame, cv2.COLOR_YUV2BGR)

def extract_watermark_from_frame(frame, img_size=(100, 100)):
    rows, cols, _ = frame.shape
    yuv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
    y, _, _ = cv2.split(yuv_frame)
    dct_y = dct(dct(y.T, norm='ortho').T, norm='ortho')
    img_rows, img_cols = img_size
    y_start, x_start = (rows - img_rows) // 2, (cols - img_cols) // 2
    extracted_img = dct_y[y_start:y_start + img_rows, x_start:x_start + img_cols]
    return np.round(extracted_img).astype(np.uint8)

def video_to_frames(video_path, duration=10, fps=30):
    vidcap = cv2.VideoCapture(video_path)
    frames = []
    total_frames = int(fps * duration)
    for _ in range(total_frames):
        success, image = vidcap.read()
        if not success:
            break
        frames.append(image)
    vidcap.release()
    return frames

def frames_to_video(frames, output_path, fps, size):
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, size)
    for frame in frames:
        out.write(frame)
    out.release()

def save_images(images, prefix='result/pre_compression'):
    if not os.path.exists(prefix):
        os.makedirs(prefix)
    for i, img in enumerate(images):
        img_path = os.path.join(prefix, f'{i}.jpg')
        img.save(img_path)

def embed_watermark_to_video(input_video_path, output_video_path, watermark_path, duration=10, fps=30):
    watermark_img = load_image(watermark_path)
    frames = video_to_frames(input_video_path, duration, fps)
    frames_with_message = [embed_watermark_to_frame(frame, watermark_img) for frame in frames]
    size = (frames[0].shape[1], frames[0].shape[0])
    frames_to_video(frames_with_message, output_video_path, fps, size)

def extract_watermark_from_video(output_video_path, prefix='compression', duration=10, fps=30, img_size=(100, 100)):
    output_frames = video_to_frames(output_video_path, duration, fps)
    post_compression_imgs = [extract_watermark_from_frame(frame, img_size) for frame in output_frames]
    post_compression_texts = [Image.fromarray(img) for img in post_compression_imgs]
    save_images(post_compression_texts, prefix)

def create_text_image(text, width, height, initial_font_size=32):
    img = Image.new('L', (width, height), color=255)  
    draw = ImageDraw.Draw(img)
    font_size = initial_font_size
    while True:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        if text_width <= width and text_height <= height:
            break
        font_size -= 2
        if font_size <= 10: 
            break
    position = ((width - text_width) // 2, (height - text_height) // 2)
    draw.text(position, text, fill=0, font=font)
    return np.array(img)

def read_text_from_image(image_name, folder, credentials_path):
    image_path = os.path.join(folder, image_name)
    credentials = service_account.Credentials.from_service_account_file(credentials_path)
    client = vision.ImageAnnotatorClient(credentials=credentials)
    with open(image_path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    if response.error.message:
        raise Exception(f"OCR error: {response.error.message}")
    return texts[0].description if texts else ""

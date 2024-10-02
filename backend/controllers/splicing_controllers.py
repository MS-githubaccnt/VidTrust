import cv2 as cv
import numpy as np
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
from scipy.signal import wiener
from skimage.restoration import denoise_wavelet
from math import sqrt


def extract_frames(video_file):
    cap = cv.VideoCapture(video_file)
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv.resize(frame, (640, 480))
        frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
        frame = frame / 255.0
        frames.append(frame)
    cap.release()
    cv.destroyAllWindows()
    return np.asarray(frames)


def compute_background(frames):
    return np.mean(frames, axis=0)


def classify_frames(pframes, gmm_bg):
    mframes, sframes, pix_count = [], [], []
    pixel_diff_threshold = 50 / 255

    for frame in pframes:
        bg_diff = cv.absdiff(frame, gmm_bg)
        gray_diff = cv.cvtColor(bg_diff.astype('float32'), cv.COLOR_RGB2GRAY)
        count_diff = np.count_nonzero(gray_diff > pixel_diff_threshold)
        pix_count.append(count_diff)

    min_ele = min(pix_count)
    for i, count in enumerate(pix_count):
        if count > 1.2 * min_ele:
            mframes.append(pframes[i])
        else:
            sframes.append(pframes[i])
    return mframes, sframes


def extract_noise(frame):
    filtered = denoise_wavelet(frame, method='BayesShrink', mode='soft')
    return frame - filtered


def find_rspn(frames, residuals):
    N = len(frames)
    num = np.zeros_like(frames[0], dtype=np.float32)
    denom = np.zeros_like(frames[0], dtype=np.float32)
    for i in range(N):
        I = frames[i]
        W = residuals[i]
        num += W * I
        denom += I ** 2
    return np.where(denom == 0, 0, num / denom)


def zero_mean(image):
    return image - np.mean(image)


def block_wiener_filter(image):
    out = np.zeros_like(image)
    for i in range(3):
        out[:, :, i] = wiener(image[:, :, i])
    return out


def spce(img1, img2):
    img1avg = np.mean(img1)
    img2avg = np.mean(img2)
    pfuncs = np.zeros((img1.shape[0], img1.shape[1]))
    for i in range(img1.shape[0]):
        for j in range(img1.shape[1]):
            pfuncs[i, j] = pfunc(img1, img2, i, j, img1avg, img2avg)

    mx = np.max(np.abs(pfuncs))
    max_ind = np.unravel_index(np.argmax(np.abs(pfuncs)), pfuncs.shape)
    spce_num = np.sign(pfuncs[max_ind]) * (mx ** 2) * (img1.shape[0] * img1.shape[1] - 4)

    i_min = max(0, max_ind[0] - 1)
    i_max = min(img1.shape[0], max_ind[0] + 1)
    j_min = max(0, max_ind[1] - 1)
    j_max = min(img1.shape[1], max_ind[1] + 1)

    pfuncs[i_min:i_max + 1, j_min:j_max + 1] = 0
    denom = np.sum(np.square(pfuncs))
    return spce_num / denom if denom != 0 else 0


def pfunc(img1, img2, t1, t2, img1avg, img2avg):
    num1 = img1 - img1avg
    mask = np.zeros_like(img1)
    mask[t1:, t2:] = 1
    mask_frame = mask * img2
    num2 = mask_frame - mask * img2avg
    numerator = np.sum(num1 * num2)
    denom = np.sqrt(np.sum(num1 ** 2) * np.sum(num2 ** 2))
    return numerator / denom if denom != 0 else 0


def split_into_blocks(image, block_size=32):
    h, w = image.shape[:2]
    image = cv.cvtColor(image, cv.COLOR_RGB2GRAY)
    blocks = []
    for i in range(0, h, block_size):
        for j in range(0, w, block_size):
            block = image[i:i + block_size, j:j + block_size]
            if block.shape == (block_size, block_size):
                blocks.append(block)
    return blocks


def analyze_splicing(pframes, sframes, residual_noise):
    rspn = find_rspn(sframes, residual_noise)
    rspn_zm = zero_mean(rspn)
    rspn_filtered = block_wiener_filter(rspn_zm)
    rspn_blocks = split_into_blocks(rspn_filtered)

    spce_vals = []
    for frame in pframes:
        x = zero_mean(frame)
        x_filtered = block_wiener_filter(x)
        residual = x_filtered.astype('float32')
        frame_blocks = split_into_blocks(residual)

        for i in range(len(rspn_blocks)):
            val = spce(frame_blocks[i], rspn_blocks[i])
            spce_vals.append(val)

    return spce_vals


def visualize_spce_distribution(spce_vals):
    plt.hist(spce_vals, bins=5, edgecolor='black')
    plt.xlabel('Range')
    plt.ylabel('Frequency')
    plt.title('SPCE Distribution - 5 bins')
    plt.show()

    bin_size = 10
    data_min = np.min(spce_vals)
    data_max = np.max(spce_vals)
    bins = np.arange(data_min, data_max + bin_size, bin_size)
    plt.xlim([-100, 100])
    plt.hist(spce_vals, bins=bins, edgecolor='black')
    plt.xlabel('Range')
    plt.ylabel('Frequency')
    plt.title('SPCE Distribution - Custom bins')
    plt.show()


def process_video(video_path):
    pframes = extract_frames(video_path)
    bg = compute_background(pframes)
    mframes, sframes = classify_frames(pframes, bg)
    residual_noise = [extract_noise(frame) for frame in pframes]
    spce_vals = analyze_splicing(pframes, sframes, residual_noise)
    visualize_spce_distribution(spce_vals)
    print("Splicing Detected" if any(abs(val) < 50 for val in spce_vals) else "No Splicing")

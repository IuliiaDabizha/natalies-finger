#!/usr/bin/env python3
"""
assemble_victory_dance_video.py
Assembles AI-generated high-detail anime illustrations of all characters
(except Natalie) dancing in cute dresses under cute anime idol music.
"""

import os
import sys
import math
import random
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 720, 540
FPS = 24
TOTAL_FRAMES = 360  # 15.0 seconds
AUDIO_PATH = "/home/iuliiadabizha/natalies-finger/victory_dance_audio.wav"
OUTPUT_PATH = "/home/iuliiadabizha/natalies-finger/victory_dance.mp4"
DANCE_DIR = "/home/iuliiadabizha/natalies-finger/dance_art"

def get_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf"
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

font_huge = get_font(34)
font_large = get_font(26)
font_mid = get_font(18)
font_small = get_font(13)

def load_and_fit_image(path):
    if not os.path.exists(path):
        img = Image.new("RGB", (W, H), (255, 182, 193))
        return img
    img = Image.open(path).convert("RGB")
    iw, ih = img.size
    scale = max(W / iw, H / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - W) // 2
    top = (nh - H) // 2
    return img.crop((left, top, left + W, top + H))

def apply_dance_motion(img, zoom, pan_x, pan_y, beat_bounce):
    cw = int(W / zoom)
    ch = int(H / zoom)
    cx = int(W / 2 + pan_x)
    cy = int(H / 2 + pan_y + beat_bounce)

    x1 = max(0, min(W - cw, cx - cw // 2))
    y1 = max(0, min(H - ch, cy - ch // 2))
    x2 = x1 + cw
    y2 = y1 + ch

    crop = img.crop((x1, y1, x2, y2))
    return crop.resize((W, H), Image.Resampling.BILINEAR)

def draw_text_bordered(draw, pos, text, font, fill=(255, 255, 255), border=(0, 0, 0), bw=3):
    x, y = pos
    for dx in range(-bw, bw + 1):
        for dy in range(-bw, bw + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=border)
    draw.text((x, y), text, font=font, fill=fill)

def draw_centered_text(draw, y, text, font, fill=(255, 255, 255), border=(0, 0, 0), bw=3):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw_text_bordered(draw, (x, y), text, font, fill, border, bw)

# Initialize Kawaii Hearts & Sparkle Confetti
random.seed(1337)
hearts = [
    {
        'x': random.uniform(0, W),
        'y': random.uniform(-50, H),
        'vx': random.uniform(-0.8, 0.8),
        'vy': random.uniform(-1.5, -3.2),
        'size': random.uniform(8, 18),
        'angle': random.uniform(0, math.pi * 2),
        'color': random.choice([
            (255, 105, 180), # Hot pink
            (255, 182, 193), # Light pink
            (255, 215, 0),   # Gold
            (186, 85, 211),  # Medium orchid
            (135, 206, 250), # Light sky blue
            (152, 251, 152)  # Pale green
        ])
    }
    for _ in range(40)
]

def draw_kawaii_heart(draw, cx, cy, size, color):
    s = size * 0.5
    # Two circles and a triangle
    pts = [
        (cx - s, cy - s * 0.2),
        (cx, cy - s * 0.8),
        (cx + s, cy - s * 0.2),
        (cx, cy + s)
    ]
    draw.polygon(pts, fill=color)

def update_and_draw_hearts(draw):
    for h in hearts:
        h['y'] += h['vy']
        h['x'] += h['vx'] + math.sin(h['angle']) * 1.2
        h['angle'] += 0.08
        if h['y'] < -30:
            h['y'] = H + 20
            h['x'] = random.uniform(0, W)
        draw_kawaii_heart(draw, h['x'], h['y'], h['size'], h['color'])

def main():
    print("Pre-loading AI-generated victory dance illustrations...")
    img1 = load_and_fit_image(os.path.join(DANCE_DIR, "dance1_center_stage.png"))
    img2 = load_and_fit_image(os.path.join(DANCE_DIR, "dance2_arthur_natan.png"))
    img3 = load_and_fit_image(os.path.join(DANCE_DIR, "dance3_raphael_luca.png"))
    img4 = load_and_fit_image(os.path.join(DANCE_DIR, "dance4_full_squad_finale.png"))

    scenes = [
        (img1, 0, 90,   1.04, 1.15, -15, 15, "✨ VICTORY CELEBRATION! ✨", "💖 CUTE DRESS IDOL DANCE! 💖"),
        (img2, 90, 180, 1.12, 1.02, 20, -20, "🌸 ARTHUR & NATAN CUTE MAID SQUAD! 🌸", "🍳 SPATULA MAGIC! 🍳"),
        (img3, 180, 270, 1.05, 1.16, -20, 10, "💜 RAPHAEL & LUCA IDOL HEARTS! 💜", "🎧 CYBER-VISOR GLOW! 🎧"),
        (img4, 270, 360, 1.15, 1.05, 0, 0,   "🎉 TASSIN LA DEMI-LUNE IS LIBERATED! 🎉", "👑 TROLL-KUN & HERO CREW FOREVER! 👑")
    ]

    print(f"Setting up FFmpeg pipe -> {OUTPUT_PATH}...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{W}x{H}",
        "-r", str(FPS),
        "-i", "-",  # Video from stdin
        "-i", AUDIO_PATH,  # Audio from WAV
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_PATH
    ]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    print("Rendering 360 frames of cute anime victory dancing...")
    bpm = 140.0
    sec_per_beat = 60.0 / bpm

    for f_idx in range(TOTAL_FRAMES):
        t = f_idx / FPS
        # Beat bounce (hop on the beat)
        beat_phase = (t / sec_per_beat) % 1.0
        beat_bounce = -abs(math.sin(beat_phase * math.pi)) * 6.0

        # Find active scene
        active_scene = scenes[-1]
        for s in scenes:
            if s[1] <= f_idx < s[2]:
                active_scene = s
                break

        img, start_f, end_f, z1, z2, px1, px2, title_txt, sub_txt = active_scene
        prog = (f_idx - start_f) / (end_f - start_f)
        cur_z = z1 + (z2 - z1) * prog
        cur_px = px1 + (px2 - px1) * prog
        cur_py = 0

        frame_img = apply_dance_motion(img, cur_z, cur_px, cur_py, beat_bounce)
        draw = ImageDraw.Draw(frame_img)

        # Draw floating kawaii hearts
        update_and_draw_hearts(draw)

        # Draw Title & Subtitle with glowing drop-shadows
        banner_y = 28
        draw_centered_text(draw, banner_y, title_txt, font_large, fill=(255, 240, 100), border=(120, 20, 80), bw=3)
        draw_centered_text(draw, banner_y + 36, sub_txt, font_mid, fill=(255, 255, 255), border=(20, 20, 60), bw=2)

        # White flash cut at start of each scene
        scene_frame = f_idx - start_f
        if scene_frame < 5:
            flash_alpha = int(255 * (1.0 - scene_frame / 5.0))
            flash_overlay = Image.new("RGBA", (W, H), (255, 255, 255, flash_alpha))
            frame_img = Image.alpha_composite(frame_img.convert("RGBA"), flash_overlay).convert("RGB")

        # Pipe frame
        proc.stdin.write(frame_img.tobytes())

        if f_idx % 48 == 0:
            print(f"Rendered dance frame {f_idx}/{TOTAL_FRAMES} ({(f_idx/FPS):.1f}s)...")

    proc.stdin.close()
    proc.wait()
    print(f"✅ Victory Dance Video generated successfully: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()

import subprocess
import wave
import struct
import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 720, 540
FPS = 24
DURATION = 15.0
TOTAL_FRAMES = int(FPS * DURATION)

base_dir = '/home/iuliiadabizha/natalies-finger'

# Load screenshot images
img_front = Image.open(f'{base_dir}/v2_1_front_entrance_spawn.png').convert('RGB').resize((W, H))
img_boss = Image.open(f'{base_dir}/v2_10_boss_battle.png').convert('RGB').resize((W, H))
img_finger = Image.open(f'{base_dir}/v2_8_extracted_finger.png').convert('RGB').resize((W, H))
img_kitchen = Image.open(f'{base_dir}/v2_6_kitchen_tools.png').convert('RGB').resize((W, H))
img_kaboom = Image.open(f'{base_dir}/v2_11_explosion_kaboom.png').convert('RGB').resize((W, H))
img_victory = Image.open(f'{base_dir}/v2_12_victory_screen.png').convert('RGB').resize((W, H))

font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
font_title = ImageFont.truetype(font_path, 34)
font_large = ImageFont.truetype(font_path, 26)
font_mid = ImageFont.truetype(font_path, 20)
font_small = ImageFont.truetype(font_path, 15)

# --- 1. GENERATE CHIPTUNE ACTION SOUNDTRACK (WAV) ---
sample_rate = 44100
n_samples = int(sample_rate * DURATION)
audio_samples = []

def square(freq, t):
    return 1.0 if (t * freq) % 1.0 < 0.5 else -1.0

def saw(freq, t):
    return 2.0 * ((t * freq) % 1.0) - 1.0

def noise(t):
    return ((math.sin(t * 987654.3) * 43758.5) % 1.0) * 2.0 - 1.0

print("Generating 15s Action Trailer Audio...")
bpm = 136.0
for i in range(n_samples):
    t = i / sample_rate
    beat = t * (bpm / 60.0)
    val = 0.0
    
    # Driving bassline
    bass_notes = [73.42, 73.42, 87.31, 87.31, 98.0, 98.0, 65.41, 58.27]
    b_step = int(beat * 2) % len(bass_notes)
    b_freq = bass_notes[b_step]
    b_env = math.exp(-7.0 * (beat % 0.5))
    val += saw(b_freq, t) * b_env * 0.35
    
    # Drums: Kick & Snare
    b_frac = beat % 1.0
    if b_frac < 0.12: # Kick
        k_freq = 160 * math.exp(-30.0 * b_frac)
        val += math.sin(2 * math.pi * k_freq * b_frac) * 0.45
    if 0.5 <= b_frac < 0.7 and int(beat) % 2 == 1: # Snare
        val += noise(t) * math.exp(-18.0 * (b_frac - 0.5)) * 0.35
        
    # High Synth Lead Arp
    arp_notes = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23]
    arp_step = int(beat * 4) % len(arp_notes)
    arp_freq = arp_notes[arp_step]
    arp_env = math.exp(-4.5 * ((beat * 4) % 1.0))
    val += square(arp_freq, t) * arp_env * 0.22
    
    # Siren whoop during Scene 1 (0.0 to 3.0s)
    if t < 3.0:
        s_freq = 700 + 250 * math.sin(t * 10.0)
        val += math.sin(2 * math.pi * s_freq * t) * 0.18
        
    # Rising tension riser (9.0 to 12.0s)
    if 9.0 <= t < 12.0:
        rise_frac = (t - 9.0) / 3.0
        r_freq = 200 + 800 * (rise_frac ** 2)
        val += saw(r_freq, t) * 0.25 * rise_frac
        
    # Massive Detonation explosion (12.0s to 15.0s)
    if t >= 12.0:
        exp_t = t - 12.0
        exp_env = math.exp(-1.4 * exp_t)
        val = val * 0.15 + noise(t) * exp_env * 0.8
        
    val = max(-1.0, min(1.0, val))
    audio_samples.append(int(val * 32767))

wav_path = '/tmp/trailer_audio.wav'
with wave.open(wav_path, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    wf.writeframes(struct.pack(f'<{len(audio_samples)}h', *audio_samples))

print("WAV soundtrack ready.")

# --- 2. LAUNCH FFMPEG STREAMING PIPELINE ---
cmd = [
    'ffmpeg', '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{W}x{H}',
    '-pix_fmt', 'rgb24',
    '-r', str(FPS),
    '-i', '-',
    '-i', wav_path,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '160k',
    '-shortest',
    f'{base_dir}/intro.mp4'
]

proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)

def draw_text_bordered(draw, pos, text, font, fill=(255, 255, 255), border=(0, 0, 0), bw=3):
    x, y = pos
    for dx in range(-bw, bw+1):
        for dy in range(-bw, bw+1):
            if dx != 0 or dy != 0:
                draw.text((x+dx, y+dy), text, font=font, fill=border)
    draw.text((x, y), text, font=font, fill=fill)

def draw_centered_text(draw, y, text, font, fill=(255, 255, 255), border=(0, 0, 0), bw=3):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw_text_bordered(draw, (x, y), text, font, fill, border, bw)

print(f"Rendering {TOTAL_FRAMES} trailer frames...")

for frame in range(TOTAL_FRAMES):
    t = frame / FPS
    
    # ----------------------------------------------------
    # SCENE 1: 0.0s - 3.0s (Night Arrival at Tassin Mc'Do)
    # ----------------------------------------------------
    if t < 3.0:
        # Subtle zoom into front entrance
        scale = 1.0 + 0.15 * (t / 3.0)
        nw, nh = int(W * scale), int(H * scale)
        base = img_front.resize((nw, nh), Image.Resampling.BILINEAR)
        crop_x = (nw - W) // 2
        crop_y = (nh - H) // 2
        frame_im = base.crop((crop_x, crop_y, crop_x + W, crop_y + H))
        
        # Red & blue flashing police strobe
        strobe = math.sin(t * 12.0)
        overlay = Image.new('RGB', (W, H), (180, 20, 20) if strobe > 0 else (20, 50, 180))
        frame_im = Image.blend(frame_im, overlay, 0.18 + 0.1 * abs(strobe))
        
        draw = ImageDraw.Draw(frame_im)
        # Letterbox bars
        draw.rectangle([0, 0, W, 45], fill=(0, 0, 0))
        draw.rectangle([0, H-45, W, H], fill=(0, 0, 0))
        
        draw_centered_text(draw, 10, "📍 FRANCE • LYON • TASSIN LA DEMI-LUNE", font_mid, fill=(241, 196, 15))
        draw_centered_text(draw, H - 38, "23:45 — LE MC'DO LE PLUS SOUS TENSION DU MONDE", font_small, fill=(255, 255, 255))
        
        if t >= 0.8:
            draw_centered_text(draw, 140, "🍟 NATALIE'S ANNULAIRE 🍟", font_title, fill=(255, 71, 87), border=(0, 0, 0), bw=4)
            draw_centered_text(draw, 190, "LE BRAQUAGE TROLL DU SIÈCLE", font_mid, fill=(255, 215, 0))

    # ----------------------------------------------------
    # SCENE 2: 3.0s - 6.0s (The Tyrant Natalie in Office)
    # ----------------------------------------------------
    elif t < 6.0:
        st = t - 3.0
        # Zoom on boss
        scale = 1.05 + 0.2 * (st / 3.0)
        nw, nh = int(W * scale), int(H * scale)
        base = img_boss.resize((nw, nh), Image.Resampling.BILINEAR)
        crop_x = int((nw - W) * 0.7)
        crop_y = int((nh - H) * 0.3)
        frame_im = base.crop((crop_x, crop_y, crop_x + W, crop_y + H))
        
        # Shaking if angry
        shake_x = int(math.sin(st * 25.0) * 4)
        shake_y = int(math.cos(st * 20.0) * 3)
        if shake_x != 0 or shake_y != 0:
            frame_im = frame_im.transform((W, H), Image.Transform.AFFINE, (1, 0, shake_x, 0, 1, shake_y))
            
        draw = ImageDraw.Draw(frame_im)
        draw.rectangle([0, 0, W, 45], fill=(0, 0, 0))
        draw.rectangle([0, H-45, W, H], fill=(0, 0, 0))
        
        draw_centered_text(draw, 10, "⚠️ ALERTE TYRAN MANAGÉRIAL : NATALIE (50 ANS)", font_mid, fill=(255, 71, 87))
        draw_centered_text(draw, 70, "1M50 DE PURE HAINE MANAGÉRIALE !", font_large, fill=(255, 255, 255), border=(192, 57, 43), bw=3)
        draw_centered_text(draw, 110, "ELLE SORT LES FRITES 40 SECONDES EN AVANCE !", font_mid, fill=(241, 196, 15))
        draw_centered_text(draw, H - 38, "« LE CROQUANT C'EST POUR LES FAIBLES ! »", font_mid, fill=(255, 107, 107))

    # ----------------------------------------------------
    # SCENE 3: 6.0s - 9.0s (The Sub-Zero Freezer & 2019 Annulaire)
    # ----------------------------------------------------
    elif t < 9.0:
        st = t - 6.0
        scale = 1.0 + 0.15 * (st / 3.0)
        nw, nh = int(W * scale), int(H * scale)
        base = img_finger.resize((nw, nh), Image.Resampling.BILINEAR)
        crop_x = (nw - W) // 2
        crop_y = (nh - H) // 2
        frame_im = base.crop((crop_x, crop_y, crop_x + W, crop_y + H))
        
        # Frosty blue tint
        frost = Image.new('RGB', (W, H), (100, 200, 255))
        frame_im = Image.blend(frame_im, frost, 0.15 + 0.05 * math.sin(st * 6.0))
        
        draw = ImageDraw.Draw(frame_im)
        draw.rectangle([0, 0, W, 45], fill=(0, 0, 0))
        draw.rectangle([0, H-45, W, H], fill=(0, 0, 0))
        
        draw_centered_text(draw, 10, "❄️ CHAMBRE FROIDE SCELLÉE (-18°C) • CARTON MCFLURRY #4", font_mid, fill=(129, 236, 236))
        draw_centered_text(draw, 65, "14 MAI 2019 : L'ANNULAIRE PERDU !", font_large, fill=(255, 215, 0), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 105, "Fossilisé dans la glace Oreo avec sa bague en toc...", font_mid, fill=(255, 255, 255))
        draw_centered_text(draw, H - 38, "OBJECTIF : L'EXTRAIRE ET LUI OFFRIR EN PLEIN VISAGE !", font_small, fill=(241, 196, 15))

    # ----------------------------------------------------
    # SCENE 4: 9.0s - 12.0s (The 7 Rebel Workers)
    # ----------------------------------------------------
    elif t < 12.0:
        st = t - 9.0
        scale = 1.0 + 0.1 * math.sin(st * 4.0)
        nw, nh = int(W * scale), int(H * scale)
        base = img_kitchen.resize((nw, nh), Image.Resampling.BILINEAR)
        crop_x = (nw - W) // 2
        crop_y = (nh - H) // 2
        frame_im = base.crop((crop_x, crop_y, crop_x + W, crop_y + H))
        
        draw = ImageDraw.Draw(frame_im)
        draw.rectangle([0, 0, W, 45], fill=(0, 0, 0))
        draw.rectangle([0, H-45, W, H], fill=(0, 0, 0))
        
        # Flashing banner
        draw_centered_text(draw, 10, "✊ L'ÉQUIPE DU MC'DO DE TASSIN SE RÉVOLTE !", font_mid, fill=(241, 196, 15))
        draw_centered_text(draw, 70, "7 EMPLOYÉS PRENNENT LEUR REVANCHE :", font_large, fill=(255, 255, 255), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 115, "CLEMENT • ARTHUR • CLARA • LEA", font_large, fill=(255, 71, 87), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 155, "NATAN • RAPHAEL • LUCA", font_large, fill=(255, 71, 87), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, H - 38, "ATTENTION AUX ESPIONS : UNE SEULE ERREUR ET TU TE FAIS VIRER !", font_small, fill=(255, 215, 0))

    # ----------------------------------------------------
    # SCENE 5: 12.0s - 15.0s (Explosion Detonation Climax!)
    # ----------------------------------------------------
    else:
        st = t - 12.0
        # Pick kaboom image then victory
        source = img_kaboom if st < 1.4 else img_victory
        
        # Huge screen shake
        shake_x = int((math.sin(st * 40.0) * (1.0 - st / 3.0)) * 14)
        shake_y = int((math.cos(st * 35.0) * (1.0 - st / 3.0)) * 14)
        frame_im = source.transform((W, H), Image.Transform.AFFINE, (1, 0, shake_x, 0, 1, shake_y))
        
        # White flash right at 12.0s
        if st < 0.25:
            white = Image.new('RGB', (W, H), (255, 255, 255))
            frame_im = Image.blend(frame_im, white, 0.85 * (1.0 - st / 0.25))
            
        draw = ImageDraw.Draw(frame_im)
        draw.rectangle([0, 0, W, 45], fill=(0, 0, 0))
        draw.rectangle([0, H-45, W, H], fill=(0, 0, 0))
        
        draw_centered_text(draw, 8, "💥 BOOOOOM ! TENSION DE NATALIE : 9000 PSI ! 💥", font_large, fill=(255, 215, 0), border=(192, 57, 43), bw=4)
        draw_centered_text(draw, 65, "🍟 L'ANNULAIRE DE NATALIE 🍟", font_title, fill=(255, 71, 87), border=(0, 0, 0), bw=4)
        draw_centered_text(draw, 115, "PLUIE DE NUGGETS & COUPONS -100% !", font_mid, fill=(46, 204, 113), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, H - 38, "▶ CLIQUE SUR « LANCER LE BRAQUAGE » POUR JOUER !", font_mid, fill=(255, 215, 0))

    # Add retro CRT scanlines across every frame
    for y in range(0, H, 4):
        # Subtle dark horizontal line
        draw = ImageDraw.Draw(frame_im)
        draw.line([(0, y), (W, y)], fill=(0, 0, 0, 40))
        
    proc.stdin.write(frame_im.tobytes())
    if frame % 48 == 0:
        print(f"Frame {frame}/{TOTAL_FRAMES} rendered ({int(t)}s)...")

proc.stdin.close()
proc.wait()
print("Intro video generated successfully! Returncode:", proc.returncode)

import subprocess
import wave
import struct
import math
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 720, 540
FPS = 24
DURATION = 15.0
TOTAL_FRAMES = int(FPS * DURATION)
bpm = 150.0

base_dir = '/home/iuliiadabizha/natalies-finger'
font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
font_huge = ImageFont.truetype(font_path, 36)
font_title = ImageFont.truetype(font_path, 28)
font_large = ImageFont.truetype(font_path, 22)
font_mid = ImageFont.truetype(font_path, 16)
font_small = ImageFont.truetype(font_path, 13)

# --- 1. SYNTHESIZE J-ROCK / KAWAII CHIPTUNE ANIME SOUNDTRACK ---
sample_rate = 44100
n_samples = int(sample_rate * DURATION)
audio_samples = []

def square(freq, t):
    return 1.0 if (t * freq) % 1.0 < 0.5 else -1.0

def saw(freq, t):
    return 2.0 * ((t * freq) % 1.0) - 1.0

def noise(t):
    return ((math.sin(t * 876543.2) * 43758.5) % 1.0) * 2.0 - 1.0

chords = [
    [174.61, 220.0, 261.63, 329.63], # Fmaj7
    [196.00, 246.94, 293.66, 392.00], # G
    [164.81, 196.00, 246.94, 329.63], # Em7
    [220.00, 261.63, 329.63, 440.00]  # Am
]

print("Generating Kawaii J-Rock Chiptune Opening...")
for i in range(n_samples):
    t = i / sample_rate
    beat = t * (bpm / 60.0)
    bar = int(beat / 4.0)
    chord = chords[bar % len(chords)]
    val = 0.0
    
    # Octave-jumping anime bass
    root = chord[0] / 2.0
    step = int(beat * 2) % 8
    bass_freq = root * 2 if step in [1, 3, 6] else root
    bass_env = math.exp(-8.0 * (beat % 0.5))
    val += saw(bass_freq, t) * bass_env * 0.35
    
    # 4-on-the-floor kick & anime snare
    b_frac = beat % 1.0
    if b_frac < 0.12:
        k_freq = 180 * math.exp(-35.0 * b_frac)
        val += math.sin(2 * math.pi * k_freq * b_frac) * 0.45
    if 0.5 <= b_frac < 0.7 and int(beat) % 2 == 1:
        val += noise(t) * math.exp(-20.0 * (b_frac - 0.5)) * 0.38
    if (beat * 2) % 1.0 < 0.08:
        val += noise(t) * 0.12
        
    # Sparkling Kawaii Chiptune Arp
    arp_step = int(beat * 4) % len(chord)
    arp_note = chord[arp_step] * 2.0
    arp_env = math.exp(-6.0 * ((beat * 4) % 1.0))
    val += square(arp_note, t) * arp_env * 0.28
    
    # Melodic Anime Lead
    lead_notes = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33]
    l_note = lead_notes[int(beat) % len(lead_notes)]
    val += square(l_note, t) * 0.18
    
    # Kawaii Magical Chimes
    sparkle_t = (t * 8.0) % 1.0
    if sparkle_t < 0.1:
        spk_freq = 1300 + 400 * math.sin(t * 30.0)
        val += math.sin(2 * math.pi * spk_freq * t) * 0.12
        
    val = max(-1.0, min(1.0, val))
    audio_samples.append(int(val * 32767))

wav_path = '/tmp/anime_trailer_audio.wav'
with wave.open(wav_path, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    wf.writeframes(struct.pack(f'<{len(audio_samples)}h', *audio_samples))

# --- 2. FFMPEG RAW STREAMING PIPELINE ---
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
    '-crf', '19',
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

def draw_star(draw, cx, cy, r, fill=(255, 234, 167)):
    points = []
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        radius = r if i % 2 == 0 else r * 0.45
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(points, fill=fill)

def draw_heart(draw, cx, cy, size, fill=(255, 118, 117)):
    r = size // 2
    draw.ellipse([cx - size, cy - r, cx, cy + r], fill=fill)
    draw.ellipse([cx, cy - r, cx + size, cy + r], fill=fill)
    draw.polygon([(cx - size, cy), (cx + size, cy), (cx, cy + size + r//2)], fill=fill)

def draw_speed_lines(draw, center, radius, count=36, color=(255, 255, 255, 120)):
    cx, cy = center
    for i in range(count):
        angle = (i / count) * math.pi * 2
        r1 = radius * (0.65 + 0.35 * math.sin(i * 3.7))
        r2 = radius * 1.6
        x1 = cx + math.cos(angle) * r1
        y1 = cy + math.sin(angle) * r1
        x2 = cx + math.cos(angle) * r2
        y2 = cy + math.sin(angle) * r2
        draw.line([(x1, y1), (x2, y2)], fill=color[:3], width=2)

print(f"Rendering {TOTAL_FRAMES} Kawaii Anime Battle frames...")

# Persistent particle seeds
random.seed(42)
sparkles = [{'x': random.randint(0, W), 'y': random.randint(0, H), 'speed': random.uniform(1.5, 4.0), 'r': random.randint(3, 7), 'type': random.choice(['star', 'heart', 'petal'])} for _ in range(35)]

for frame in range(TOTAL_FRAMES):
    t = frame / FPS
    
    # Base Anime pastel background (Purple-Pink-Cyan gradient)
    im = Image.new('RGB', (W, H), (20, 12, 35))
    draw = ImageDraw.Draw(im)
    
    # Dynamic anime background gradient
    for y in range(0, H, 6):
        fac = y / H
        r_col = int(35 + 85 * fac * (0.8 + 0.2 * math.sin(t * 3.0)))
        g_col = int(18 + 40 * fac)
        b_col = int(55 + 90 * (1.0 - fac))
        draw.rectangle([0, y, W, y+6], fill=(r_col, g_col, b_col))
        
    # Floating Kawaii sparkles & cherry blossom petals
    for spk in sparkles:
        spk['y'] -= spk['speed']
        spk['x'] += math.sin(t * 3.0 + spk['r']) * 1.5
        if spk['y'] < -10:
            spk['y'] = H + 10
            spk['x'] = random.randint(0, W)
        if spk['type'] == 'star':
            draw_star(draw, spk['x'], spk['y'], spk['r'], fill=(255, 242, 175))
        elif spk['type'] == 'heart':
            draw_heart(draw, int(spk['x']), int(spk['y']), spk['r'], fill=(255, 150, 180))
        else:
            # Petal
            draw.ellipse([spk['x']-3, spk['y']-5, spk['x']+3, spk['y']+5], fill=(255, 192, 203))

    # ========================================================
    # SCENE 1: 0.0s - 3.0s (Kawaii Moonlight Battle Opening)
    # ========================================================
    if t < 3.0:
        # Giant Anime Moon
        moon_x, moon_y = W // 2, 150
        draw.ellipse([moon_x - 70, moon_y - 70, moon_x + 70, moon_y + 70], fill=(255, 230, 240))
        draw.ellipse([moon_x - 55, moon_y - 75, moon_x + 65, moon_y + 45], fill=(255, 245, 250))
        
        # Golden Arches M Silhouette inside the moon
        draw.arc([moon_x - 40, moon_y - 25, moon_x, moon_y + 25], 180, 0, fill=(241, 196, 15), width=8)
        draw.arc([moon_x, moon_y - 25, moon_x + 40, moon_y + 25], 180, 0, fill=(241, 196, 15), width=8)
        
        # Chibi Hero Silhouette
        hx, hy = W // 2, 310
        # Cute cap
        draw.rectangle([hx - 22, hy - 45, hx + 22, hy - 25], fill=(255, 71, 87))
        draw.rectangle([hx - 28, hy - 28, hx + 10, hy - 22], fill=(255, 71, 87))
        # Chibi face with sparkling anime blush
        draw.ellipse([hx - 20, hy - 30, hx + 20, hy + 5], fill=(255, 215, 185))
        # Big anime sparkle eyes
        eye_blink = (int(t * 4) % 6 == 0)
        if not eye_blink:
            draw.ellipse([hx - 14, hy - 18, hx - 4, hy - 4], fill=(9, 132, 227))
            draw.ellipse([hx + 4, hy - 18, hx + 14, hy - 4], fill=(9, 132, 227))
            draw.ellipse([hx - 11, hy - 16, hx - 7, hy - 10], fill=(255, 255, 255))
            draw.ellipse([hx + 7, hy - 16, hx + 11, hy - 10], fill=(255, 255, 255))
        draw.ellipse([hx - 18, hy - 2, hx - 10, hy + 4], fill=(255, 118, 117)) # Blush
        draw.ellipse([hx + 10, hy - 2, hx + 18, hy + 4], fill=(255, 118, 117))
        # Blue jacket
        draw.rectangle([hx - 18, hy + 5, hx + 18, hy + 38], fill=(9, 132, 227))
        draw.rectangle([hx - 14, hy + 38, hx + 14, hy + 58], fill=(45, 52, 54))
        
        draw_centered_text(draw, 24, "✨ NATALIE'S ANNULAIRE ✨", font_huge, fill=(255, 215, 0), border=(192, 57, 43), bw=4)
        draw_centered_text(draw, 72, "★ 究極のトロール作戦 ★", font_mid, fill=(255, 159, 243))
        draw_centered_text(draw, 420, "📍 FRANCE • LYON • TASSIN LA DEMI-LUNE", font_large, fill=(255, 255, 255), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 465, "ANIME BATTLE HEIST • CAWAIII EDITION!", font_mid, fill=(254, 202, 87))

    # ========================================================
    # SCENE 2: 3.0s - 6.0s (Anime VS Battle Split Screen!)
    # ========================================================
    elif t < 6.0:
        st = t - 3.0
        # Diagonal Split Screen: Left Cyan, Right Crimson
        draw.polygon([(0, 0), (W // 2 + 50, 0), (W // 2 - 50, H), (0, H)], fill=(24, 44, 97))
        draw.polygon([(W // 2 + 50, 0), (W, 0), (W, H), (W // 2 - 50, H)], fill=(111, 30, 81))
        
        # Giant Lightning Cut line
        draw.line([(W // 2 + 50, 0), (W // 2 - 50, H)], fill=(255, 234, 167), width=8)
        draw.line([(W // 2 + 50, 0), (W // 2 - 50, H)], fill=(255, 255, 255), width=3)
        
        # Left: Chibi Hero with Anime Speed Lines
        draw_speed_lines(draw, (180, 240), 180, 24, (129, 236, 236))
        draw_text_bordered(draw, (70, 70), "HERO TROLL-KUN", font_large, fill=(129, 236, 236), border=(0, 0, 0), bw=3)
        draw_text_bordered(draw, (100, 105), "【 トロール勇者 】", font_small, fill=(255, 255, 255))
        # Chibi Hero Face
        hx, hy = 180, 250
        draw.ellipse([hx - 35, hy - 35, hx + 35, hy + 35], fill=(255, 215, 185))
        draw.rectangle([hx - 40, hy - 50, hx + 30, hy - 25], fill=(255, 71, 87)) # Cap
        draw.ellipse([hx - 22, hy - 12, hx - 6, hy + 8], fill=(9, 132, 227))
        draw.ellipse([hx + 6, hy - 12, hx + 22, hy + 8], fill=(9, 132, 227))
        draw.ellipse([hx - 18, hy - 8, hx - 12, hy - 2], fill=(255, 255, 255))
        draw.ellipse([hx + 10, hy - 8, hx + 14, hy - 2], fill=(255, 255, 255))
        draw.ellipse([hx - 28, hy + 12, hx - 14, hy + 20], fill=(255, 118, 117)) # Cute blush
        draw.ellipse([hx + 14, hy + 12, hx + 28, hy + 20], fill=(255, 118, 117))
        
        # Right: Shadow Natalie with Red Anime Glowing Eyes
        draw_speed_lines(draw, (530, 240), 180, 24, (255, 71, 87))
        draw_text_bordered(draw, (440, 70), "TYRANT NATALIE", font_large, fill=(255, 71, 87), border=(0, 0, 0), bw=3)
        draw_text_bordered(draw, (470, 105), "【 暴君店長 】", font_small, fill=(255, 255, 255))
        nx, ny = 530, 250
        # Butch paprika hair
        draw.ellipse([nx - 42, ny - 50, nx + 42, ny + 20], fill=(169, 40, 40))
        draw.ellipse([nx - 36, ny - 30, nx + 36, ny + 35], fill=(255, 200, 175))
        # Glowing crimson eyes with anger vein
        draw.ellipse([nx - 24, ny - 12, nx - 6, hy + 8], fill=(255, 0, 0))
        draw.ellipse([nx + 6, ny - 12, nx + 24, hy + 8], fill=(255, 0, 0))
        draw.line([nx + 18, ny - 35, nx + 32, ny - 25], fill=(255, 0, 0), width=3) # Anime # anger mark
        draw.line([nx + 32, ny - 35, nx + 18, ny - 25], fill=(255, 0, 0), width=3)
        
        # Center VS Badge
        vs_x, vs_y = W // 2, 260
        draw.ellipse([vs_x - 38, vs_y - 38, vs_x + 38, vs_y + 38], fill=(255, 215, 0), outline=(235, 77, 75), width=4)
        draw_text_bordered(draw, (vs_x - 22, vs_y - 14), "VS", font_title, fill=(192, 57, 43), border=(255, 255, 255), bw=2)
        
        draw_centered_text(draw, 440, "⚔️ DESTINY CLASH IN TASSIN ⚔️", font_title, fill=(255, 234, 167), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 485, "THE BATTLE OF WITS & TROLL SPIRIT!", font_mid, fill=(255, 255, 255))

    # ========================================================
    # SCENE 3: 6.0s - 9.0s (The 7 Hard-Working Crew Warriors)
    # ========================================================
    elif t < 9.0:
        st = t - 6.0
        # Cute sparkling spotlight
        draw.ellipse([W // 2 - 260, 40, W // 2 + 260, 480], fill=(44, 25, 75), outline=(255, 159, 243), width=4)
        draw_speed_lines(draw, (W // 2, 240), 200, 30, (255, 204, 204))
        
        draw_centered_text(draw, 50, "💖 THE 7 REBEL WORKERS OF TASSIN 💖", font_title, fill=(255, 118, 117), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 90, "★ 7人の伝説のクルー戦士 ★", font_mid, fill=(255, 234, 167))
        
        # The 7 crew chibi name ribbons
        workers_list = [
            ("CLEMENT", "#ff7675", "Register Master"),
            ("ARTHUR", "#fdcb6e", "Grill King"),
            ("CLARA", "#fd79a8", "Lobby Host"),
            ("LEA", "#fab1a0", "Sauce Queen"),
            ("NATAN", "#81ecec", "Dish Hero"),
            ("RAPHAEL", "#a29bfe", "Safe Guardian"),
            ("LUCA", "#00cec9", "Drive Ace")
        ]
        
        # Show 7 sparkling badges in an arc
        for i, (name, col, title) in enumerate(workers_list):
            bx = 80 + (i % 4) * 160 if i < 4 else 140 + (i - 4) * 160
            by = 150 if i < 4 else 260
            draw.rectangle([bx - 65, by - 25, bx + 65, by + 25], fill=(30, 20, 50), outline=col, width=3)
            draw_star(draw, bx - 50, by - 12, 6, fill=col)
            draw_text_bordered(draw, (bx - 40, by - 18), name, font_mid, fill=(255, 255, 255), border=(0, 0, 0), bw=2)
            draw_text_bordered(draw, (bx - 55, by + 4), title, font_small, fill=col, border=(0, 0, 0), bw=2)
            
        draw_centered_text(draw, 360, "✨ SPOTLESS RESTAURANT & DEDICATED HEROES ✨", font_large, fill=(241, 196, 15), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 405, "THEY KEEP TASSIN CLEAN & SHINING...", font_mid, fill=(255, 255, 255))
        draw_centered_text(draw, 445, "IT'S ONLY NATALIE WHO IS A TOXIC NIGHTMARE!", font_mid, fill=(255, 107, 107))

    # ========================================================
    # SCENE 4: 9.0s - 12.0s (Kawaii Fry Laser Special Attack!)
    # ========================================================
    elif t < 12.0:
        st = t - 9.0
        # Full radial action speed lines
        draw_speed_lines(draw, (W // 2, H // 2), 120, 48, (255, 242, 0))
        
        # Golden French Fries shooting like anime laser beams!
        for i in range(12):
            angle = (i / 12) * math.pi * 2 + st * 4.0
            dist = 80 + ((st * 250 + i * 40) % 280)
            fx = W // 2 + math.cos(angle) * dist
            fy = H // 2 + math.sin(angle) * dist
            # Golden fry laser rectangle
            draw.line([(fx, fy), (fx + math.cos(angle) * 35, fy + math.sin(angle) * 35)], fill=(255, 215, 0), width=6)
            draw.line([(fx, fy), (fx + math.cos(angle) * 35, fy + math.sin(angle) * 35)], fill=(255, 255, 255), width=2)
            
        # Glowing anime energy core
        core_r = int(35 + 10 * math.sin(st * 15.0))
        draw.ellipse([W // 2 - core_r, H // 2 - core_r, W // 2 + core_r, H // 2 + core_r], fill=(255, 255, 255), outline=(255, 215, 0), width=5)
        draw_text_bordered(draw, (W // 2 - 25, H // 2 - 18), "🍟", font_huge)
        
        draw_centered_text(draw, 35, "⚡ KAWAII SPECIAL ATTACK ⚡", font_title, fill=(255, 234, 167), border=(192, 57, 43), bw=4)
        draw_centered_text(draw, 75, "★ 黄金のポテト・バスター！ ★", font_mid, fill=(255, 159, 243))
        draw_centered_text(draw, 435, "💥 ULTIMATE TROLL HEIST INCOMING! 💥", font_large, fill=(255, 255, 255), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 475, "SURVIVE THE TRICKY WORD FIGHTS!", font_mid, fill=(254, 202, 87))

    # ========================================================
    # SCENE 5: 12.0s - 15.0s (Grand Kawaii Anime Title Banner)
    # ========================================================
    else:
        st = t - 12.0
        # Rainbow pastel kawaii border
        draw.rectangle([15, 15, W - 15, H - 15], outline=(255, 215, 0), width=5)
        draw.rectangle([22, 22, W - 22, H - 22], outline=(255, 159, 243), width=3)
        
        # Floating cute stars around corners
        draw_star(draw, 50, 50, 14, fill=(255, 234, 167))
        draw_star(draw, W - 50, 50, 14, fill=(255, 234, 167))
        draw_star(draw, 50, H - 50, 14, fill=(255, 234, 167))
        draw_star(draw, W - 50, H - 50, 14, fill=(255, 234, 167))
        
        # Chibi Hero & Chibi Natalie clashing cute weapons
        draw_centered_text(draw, 60, "🍟 NATALIE'S ANNULAIRE 🍟", font_huge, fill=(255, 71, 87), border=(255, 215, 0), bw=4)
        draw_centered_text(draw, 115, "★ ナタリーのアンニュレール ★", font_mid, fill=(255, 234, 167))
        draw_centered_text(draw, 160, "THE LEGENDARY TROLL HEIST • TASSIN LA DEMI-LUNE", font_mid, fill=(255, 255, 255), border=(0, 0, 0), bw=3)
        
        # Big Kawaii Action Banner
        draw.rectangle([W // 2 - 240, 225, W // 2 + 240, 335], fill=(35, 15, 55), outline=(255, 215, 0), width=4)
        draw_centered_text(draw, 240, "⚔️ READY TO BATTLE? ⚔️", font_title, fill=(255, 234, 167), border=(192, 57, 43), bw=3)
        draw_centered_text(draw, 285, "💖 準備はいい？ カワイイ対決スタート！ 💖", font_small, fill=(255, 159, 243))
        
        # Prompt
        draw_centered_text(draw, 385, "▶ CLIQUE SUR « LANCER LE BRAQUAGE » !", font_large, fill=(46, 204, 113), border=(0, 0, 0), bw=3)
        draw_centered_text(draw, 440, "[ CLICK START HEIST TO PLAY ]", font_mid, fill=(255, 255, 255), border=(0, 0, 0), bw=2)

    proc.stdin.write(im.tobytes())
    if frame % 48 == 0:
        print(f"Frame {frame}/{TOTAL_FRAMES} rendered ({int(t)}s)...")

proc.stdin.close()
proc.wait()
print("Kawaii Anime Battle Intro Video generated successfully! Returncode:", proc.returncode)

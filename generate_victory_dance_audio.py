import wave
import struct
import math
import random

SAMPLE_RATE = 44100
DURATION = 15.0 # seconds
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
BPM = 140.0
BEAT_DUR = 60.0 / BPM
SIXTEENTH = BEAT_DUR / 4.0

def freq(midi_note):
    return 440.0 * (2.0 ** ((midi_note - 69.0) / 12.0))

# Kawaii Chord progression in D Major:
# Gmaj7 (55, 59, 62, 66) -> A7 (57, 61, 64, 67) -> F#m7 (54, 57, 61, 64) -> Bm7 (59, 62, 66, 69)
# Em7 (52, 55, 59, 62) -> A7 (57, 61, 64, 67) -> Dmaj7 (50, 54, 57, 61) -> D (50, 54, 57, 62)
CHORDS = [
    (freq(55), [freq(59), freq(62), freq(66)]), # G
    (freq(57), [freq(61), freq(64), freq(67)]), # A
    (freq(54), [freq(57), freq(61), freq(64)]), # F#m
    (freq(59), [freq(62), freq(66), freq(69)]), # Bm
    (freq(52), [freq(55), freq(59), freq(62)]), # Em
    (freq(57), [freq(61), freq(64), freq(67)]), # A
    (freq(50), [freq(54), freq(57), freq(61)]), # Dmaj7
    (freq(50), [freq(57), freq(62), freq(69)])  # D triumph
]

# Melody notes (cheerful kawaii idol dance melody)
# MIDI notes:
MELODY = [
    # Bar 1 (G): D5, E5, F#5, A5, B5, A5, F#5, E5
    (74, 1.0), (76, 1.0), (78, 1.0), (81, 1.0), (83, 1.5), (81, 0.5), (78, 1.0), (76, 1.0),
    # Bar 2 (A): E5, F#5, G5, B5, C#6, B5, A5, G5
    (76, 1.0), (78, 1.0), (79, 1.0), (83, 1.0), (85, 2.0), (83, 1.0), (81, 1.0),
    # Bar 3 (F#m): F#5, A5, C#6, E6, D6, C#6, B5, A5
    (78, 1.0), (81, 1.0), (85, 1.0), (88, 1.5), (86, 0.5), (85, 1.0), (83, 1.0), (81, 1.0),
    # Bar 4 (Bm): B5, D6, F#6, E6, D6, C#6, B5, A5
    (83, 1.0), (86, 1.0), (90, 1.5), (88, 0.5), (86, 1.0), (85, 1.0), (83, 1.0), (81, 1.0),
    # Bar 5 (Em): G5, B5, D6, E6, G6, F#6, E6, D6
    (79, 1.0), (83, 1.0), (86, 1.0), (88, 1.0), (91, 1.5), (90, 0.5), (88, 1.0), (86, 1.0),
    # Bar 6 (A): C#6, D6, E6, G6, A6, G6, F#6, E6
    (85, 1.0), (86, 1.0), (88, 1.0), (91, 1.0), (93, 2.0), (91, 1.0), (88, 1.0),
    # Bar 7 (Dmaj7): F#6, D6, A5, F#5, G5, A5, B5, C#6
    (90, 1.0), (86, 1.0), (81, 1.0), (78, 1.0), (79, 1.0), (81, 1.0), (83, 1.0), (85, 1.0),
    # Bar 8 (D triumph): D6 (hold!), sparkle fanfare
    (86, 4.0), (86, 1.0), (88, 1.0), (90, 2.0)
]

print("Synthesizing Kawaii Anime Victory Dance Soundtrack (140 BPM, 15.0s)...")

samples = [0.0] * TOTAL_SAMPLES

# 1. Bouncy Bass & Chords
for i in range(TOTAL_SAMPLES):
    t = i / SAMPLE_RATE
    beat = t / BEAT_DUR
    bar = int(beat // 4) % len(CHORDS)
    root_f, chord_fs = CHORDS[bar]

    # Bouncy 8th note bass: root on 1 & 3, octave on 2 & 4
    sub_beat = beat % 1.0
    is_octave = (beat % 0.5) > 0.25
    bass_freq = root_f * (2.0 if is_octave else 1.0)
    decay = math.exp(-(sub_beat % 0.5) * 8.0)
    # Sawtooth/square blend
    saw = 2.0 * ((t * bass_freq) % 1.0) - 1.0
    sq = 1.0 if ((t * bass_freq) % 1.0) < 0.5 else -1.0
    bass_val = (saw * 0.6 + sq * 0.4) * decay * 0.25

    # Cute synth chord pads (sweet PWM bells)
    chord_val = 0.0
    for cf in chord_fs:
        phase = (t * cf) % 1.0
        # Soft square with subtle pulse width modulation
        pwm = 0.5 + 0.2 * math.sin(t * 3.0)
        chord_val += (1.0 if phase < pwm else -1.0) * 0.035

    # 4-on-the-floor Kick & Snare/Handclap
    drum_val = 0.0
    beat_frac = beat % 1.0
    # Kick on every beat
    if beat_frac < 0.15:
        kick_env = 1.0 - (beat_frac / 0.15)
        kick_f = 130.0 * (1.0 - (beat_frac / 0.15) * 0.7)
        drum_val += math.sin(t * kick_f * 2.0 * math.pi) * kick_env * 0.45

    # Snare / Clap on beats 2 and 4 (beat % 2.0 >= 1.0)
    in_snare_beat = (int(beat) % 2 == 1)
    if in_snare_beat and beat_frac < 0.22:
        snare_env = 1.0 - (beat_frac / 0.22)
        noise = (random.random() * 2.0 - 1.0)
        snare_body = math.sin(t * 220.0 * 2.0 * math.pi)
        drum_val += (noise * 0.7 + snare_body * 0.3) * snare_env * 0.35

    # Shimmering 16th Hi-Hats
    hat_frac = (beat * 4.0) % 1.0
    if hat_frac < 0.08:
        hat_env = 1.0 - (hat_frac / 0.08)
        drum_val += (random.random() * 2.0 - 1.0) * hat_env * 0.12

    samples[i] += bass_val + chord_val + drum_val

# 2. Add Kawaii Melody & Sparkle Chimes
curr_beat = 0.0
for note_midi, dur_beats in MELODY:
    start_t = curr_beat * BEAT_DUR
    dur_t = dur_beats * BEAT_DUR
    start_idx = int(start_t * SAMPLE_RATE)
    end_idx = min(TOTAL_SAMPLES, int((start_t + dur_t) * SAMPLE_RATE))
    f = freq(note_midi)

    for idx in range(start_idx, end_idx):
        t_note = (idx - start_idx) / SAMPLE_RATE
        t_global = idx / SAMPLE_RATE
        env = math.exp(-t_note * (1.8 / dur_t)) if dur_beats < 2.0 else min(1.0, t_note * 20.0) * max(0.0, 1.0 - (t_note / dur_t))

        # Cute chiptune vibrato
        vib = math.sin(t_note * 8.0 * math.pi) * (f * 0.015) if t_note > 0.1 else 0.0
        cur_f = f + vib

        # Bubbly sweet square lead with soft sine harmonic
        phase = (t_global * cur_f) % 1.0
        lead_val = (1.0 if phase < 0.5 else -1.0) * 0.22 + math.sin(t_global * cur_f * 2.0 * math.pi) * 0.1
        # High sparkle bell harmonic (octave + 5th)
        sparkle = math.sin(t_global * (cur_f * 3.0) * 2.0 * math.pi) * math.exp(-t_note * 8.0) * 0.15

        samples[idx] += (lead_val + sparkle) * env * 0.4

    curr_beat += dur_beats
    if curr_beat * BEAT_DUR >= DURATION:
        break

# Normalize and write 16-bit WAV
max_val = max(max(abs(s) for s in samples), 1e-4)
norm_factor = 0.95 / max_val

output_wav = "/home/iuliiadabizha/natalies-finger/victory_dance_audio.wav"
with wave.open(output_wav, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    raw_data = bytearray()
    for s in samples:
        val = int(max(-32767, min(32767, s * norm_factor * 32767.0)))
        raw_data.extend(struct.pack('<h', val))
    wf.writeframes(raw_data)

print(f"✅ Victory Dance Audio generated: {output_wav}")

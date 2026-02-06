#!/usr/bin/env python3
"""Convert MetLife HTML animation to GIF using Playwright and Pillow"""

import time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
import io

def create_gif():
    # Configuration
    width = 1200
    height = 628
    fps = 144  # Higher FPS = smoother animation
    duration = 1  # seconds - covers full animation cycle
    output_file = "ML-Offer-CANC.gif"
    frame_delay_ms = 32 # Controls playback speed (lower = faster, higher = slower)
    
    print("Starting browser...")
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': width, 'height': height})
        
        # Load HTML file
        html_path = Path(__file__).parent / "metlife_animated.html"
        page.goto(f"file://{html_path.absolute()}")
        
        # Wait for page to fully load and start animations
        page.wait_for_timeout(500)
        
        # Capture frames
        frames = []
        frame_count = int(duration * fps)
        start_time = time.time()
        
        print(f"Capturing {frame_count} frames at {fps} FPS...")
        
        for i in range(frame_count):
            # Take screenshot
            screenshot = page.screenshot(type='png')
            img = Image.open(io.BytesIO(screenshot))
            
            # Ensure exact dimensions
            if img.size != (width, height):
                img = img.crop((0, 0, width, height))
            
            frames.append(img)
            
            print(f"Frame {i + 1}/{frame_count}", end='\r')
            
            # Calculate exact time to next frame
            target_time = start_time + (i + 1) * (1.0 / fps)
            sleep_time = target_time - time.time()
            if sleep_time > 0:
                time.sleep(sleep_time)
        
        browser.close()
    
    print(f"\nSaving GIF to {output_file}...")
    
    # Save as GIF with optimal settings
    frames[0].save(
        output_file,
        save_all=True,
        append_images=frames[1:],
        duration=int(frame_delay_ms),  # Use calculated delay for accurate timing
        loop=0,
        optimize=True,
        quality=95
    )
    
    print(f"✓ GIF created successfully: {output_file}")
    print(f"  Size: {Path(output_file).stat().st_size / 1024:.1f} KB")
    print(f"  Frames: {len(frames)}")
    print(f"  Duration: {duration}s @ {fps} FPS")

if __name__ == "__main__":
    create_gif()
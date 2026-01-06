#!/usr/bin/env python3
"""
Generate PWA icons from the logo image
"""
import os
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    """Create a simple emergency icon"""
    # Create a new image with a gradient background
    img = Image.new('RGB', (size, size), '#ef4444')
    draw = ImageDraw.Draw(img)
    
    # Draw a white circle
    margin = size // 6
    draw.ellipse([margin, margin, size-margin, size-margin], fill='white', outline='#dc2626', width=size//20)
    
    # Draw emergency symbol (exclamation mark)
    # Top part of exclamation mark
    rect_width = size // 8
    rect_height = size // 2.5
    left = (size - rect_width) // 2
    top = size // 4
    draw.rectangle([left, top, left + rect_width, top + rect_height], fill='#ef4444')
    
    # Bottom dot of exclamation mark
    dot_size = size // 6
    dot_left = (size - dot_size) // 2
    dot_top = size - (size // 3)
    draw.ellipse([dot_left, dot_top, dot_left + dot_size, dot_top + dot_size], fill='#ef4444')
    
    # Save the image
    img.save(output_path, 'PNG', quality=95)
    print(f"Created icon: {output_path} ({size}x{size})")

def main():
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    output_dir = '/app/frontend/public/pwa-icons'
    
    os.makedirs(output_dir, exist_ok=True)
    
    for size in sizes:
        output_path = os.path.join(output_dir, f'icon-{size}x{size}.png')
        create_icon(size, output_path)
    
    # Also create a favicon
    favicon_path = '/app/frontend/public/favicon.ico'
    create_icon(32, '/tmp/favicon-32.png')
    img = Image.open('/tmp/favicon-32.png')
    img.save(favicon_path, format='ICO', sizes=[(32, 32)])
    print(f"Created favicon: {favicon_path}")
    
    print("\n✅ All PWA icons generated successfully!")

if __name__ == '__main__':
    main()

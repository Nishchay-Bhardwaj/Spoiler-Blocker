import cv2
import pytesseract
import numpy as np
from moviepy.editor import VideoFileClip

# Set path for tesseract executable if needed (for Windows users)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# List of spoiler keywords
spoiler_keywords = ["spoiler", "character dies", "plot twist", "betrayal"]  # Example list, modify as needed

# Function to check if a frame contains any spoiler keywords
def contains_spoiler(text, keywords):
    text = text.lower()
    for keyword in keywords:
        if keyword.lower() in text:
            return True
    return False

# Function to blur the frame
def blur_frame(frame):
    return cv2.GaussianBlur(frame, (15, 15), 0)

# Function to overlay a spoiler warning on the video
def add_spoiler_warning(frame):
    warning_text = "SPOILER DETECTED!"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 2
    font_color = (0, 0, 255)  # Red color
    font_thickness = 4
    text_size = cv2.getTextSize(warning_text, font, font_scale, font_thickness)[0]
    
    # Position the text in the center of the frame
    text_x = (frame.shape[1] - text_size[0]) // 2
    text_y = (frame.shape[0] + text_size[1]) // 2

    # Add a semi-transparent rectangle behind the text for better visibility
    overlay = frame.copy()
    cv2.rectangle(overlay, (text_x - 10, text_y - 40), (text_x + text_size[0] + 10, text_y + 10), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    # Put the text on the frame
    cv2.putText(frame, warning_text, (text_x, text_y), font, font_scale, font_color, font_thickness, cv2.LINE_AA)

    return frame

# Function to extract frames, perform OCR, and blur if a spoiler is found
def process_video(input_path, output_path, interval=5):
    # Open the video file
    clip = VideoFileClip(input_path)
    fps = clip.fps
    video_capture = cv2.VideoCapture(input_path)

    # Set up video writer to save processed video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec
    frame_width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
    output_video = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    frame_number = 0
    spoiler_found = False  # Track if any spoilers are found

    while video_capture.isOpened():
        ret, frame = video_capture.read()
        if not ret:
            break
        
        # Extract a frame at the specified interval (in seconds)
        if frame_number % (fps * interval) == 0:
            # Perform OCR on the frame to detect any text
            ocr_text = pytesseract.image_to_string(frame)
            print(f"Frame {frame_number}: OCR detected text: {ocr_text}")
            
            # Check if any spoilers are present
            if contains_spoiler(ocr_text, spoiler_keywords):
                print(f"Spoiler detected in frame {frame_number}.")
                spoiler_found = True  # Set spoiler flag
                frame = blur_frame(frame)  # Blur the frame if spoiler is detected
                frame = add_spoiler_warning(frame)  # Add the "SPOILER DETECTED" overlay

        # Write the processed frame to the output video
        output_video.write(frame)
        frame_number += 1

    # Release resources
    video_capture.release()
    output_video.release()

    # Final spoiler detection message
    if spoiler_found:
        print("WARNING: Spoilers detected in the video!")
    else:
        print("No spoilers found in the video.")
    
    print(f"Processed video saved to {output_path}")

# Main function to run the spoiler blocking process
if __name__ == "__main__":
    input_video_path = "input_video.mp4"  # Replace with the path to your video
    output_video_path = "output_video.mp4"  # Path for saving the output video

    # Process the video
    process_video(input_video_path, output_video_path, interval=5)

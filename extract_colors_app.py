from colormath.color_objects import sRGBColor
from colormath.color_conversions import convert_color
import os
import json
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

# Sample color names dictionary in Python
color_names = {

}

def extract_colors(image, num_colors=10):
    # Resize the image to speed up processing (optional)
    image = image.resize((100, 100))

    # Convert the image to a NumPy array
    image_array = np.array(image)

    # Reshape the array to a list of RGB values
    reshaped_array = image_array.reshape((-1, 3))

    # Apply k-means clustering to find dominant colors
    kmeans = KMeans(n_clusters=num_colors, random_state=42)
    kmeans.fit(reshaped_array)

    # Get the RGB values of the cluster centers
    colors = kmeans.cluster_centers_.astype(int)

    return colors

# Provide the path to your image
image_path = '/path/to/your/image.jpg'

# Load image
image = Image.open(image_path)

# Extract colors using Python logic
colors = extract_colors(image, num_colors=10)

# Convert to RGB format and get color names
color_data = []
for color in colors:
    rgb_color = convert_color(sRGBColor(color[0] / 255, color[1] / 255, color[2] / 255), sRGBColor).get_rgb()
    rgb_values = [int(rgb_color[0] * 255), int(rgb_color[1] * 255), int(rgb_color[2] * 255)]
    rgb_key = ",".join(map(str, rgb_values))
    color_name = color_names.get(rgb_key, 'Unknown')

    color_data.append({
        'hex': "#{:02x}{:02x}{:02x}".format(rgb_values[0], rgb_values[1], rgb_values[2]),
        'rgb': f"rgb({rgb_values[0]}, {rgb_values[1]}, {rgb_values[2]})",
        'red': rgb_values[0],
        'green': rgb_values[1],
        'blue': rgb_values[2],
        'color_name': color_name,
    })

response = {'colors': color_data}
print(json.dumps(response))

# Close the image
image.close()

from PIL import Image
from PIL import Image

image = Image.open("/home/comphortine/Downloads/DA/background.jpeg") 
new_size = (650, 300)
resized_image = image.resize(new_size, Image.ANTIALIAS)
resized_image.save("/home/comphortine/Downloads/DA/background-1.jpeg")
print("Image resized successfully!")

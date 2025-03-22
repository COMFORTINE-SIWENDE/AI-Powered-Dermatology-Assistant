import tensorflow as tf
# load the model
from tensorflow.keras.models import load_model #type: ignore
import os
import numpy as np
# model = load_model(os.path.join("Skin_Disease_Classification.keras"))
model_path = os.path.abspath(
    "/home/comphortine/Comphortine/Dermatology Assistant/endpoints/Skin_Disease_Classification.keras"
)
model = tf.keras.models.load_model(model_path)
print(model.summary())
print(f"Model file path: {os.path.abspath('model.h5')}")

img_width,img_height = 180,180
data_cat = ['acne',
 'actinickeratosis',
 'alopeciaareata',
 'chickenpox',
 'cold sores',
 'eczema',
 'folliculitis',
 'hives',
 'impetigo',
 'melanoma',
 'psoriasis',
 'ringworm',
 'rosacea',
 'shingles',
 'uticaria',
 'vitiligo',
 'warts']

image_path="Skin Diseases Dataset/test/warts/images (73).jpeg"
image = tf.keras.utils.load_img(image_path,target_size=(img_height,img_width))
image_arr = tf.keras.utils.array_to_img(image)
image_bat = tf.expand_dims(image_arr,0)

# predicting
predict = model.predict(image_bat)
score = tf.nn.softmax(predict)

print("Disease in image is {} with an accuracy of {:.2f}%".format(data_cat[np.argmax(score)], np.max(score) * 100))
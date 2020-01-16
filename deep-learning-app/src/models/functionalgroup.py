from __future__ import absolute_import, division, print_function, unicode_literals

import tensorflow as tf
from tensorflow import keras

from tensorflow.keras import datasets, layers, models
import matplotlib.pyplot as plt
from load_data import load_data

(train_data, train_label), (validation_data, validation_label), (test_data, test_label) = load_data()

# Normalize pixel values to be between 0 and 1
# train_data, validation_data, test_data = train_data / 100, validation_data / 100, test_data / 100

# model = models.Sequential()

# model.add(layers.Dense(3801, activation='relu', input_shape=(3801,)))
# model.add(layers.Dense(500, activation='relu'))
# model.add(layers.Dense(500, activation='relu'))
# model.add(layers.Dense(28, activation='relu'))

# model.compile(optimizer='adam',
#               loss='binary_crossentropy',
#               metrics=['accuracy'])

# dataset = tf.data.Dataset.from_tensor_slices((train_data, train_label))
# dataset = dataset.batch(32)

# history = model.fit(train_data, train_label, epochs=20,
#                     validation_data=(validation_data, validation_label))

# model.summary()

# test_loss, test_acc = model.evaluate(test_data,  test_label, verbose=2)

# inputs = keras.Input(shape=(3801,))
# dense = layers.Dense(5000, activation='relu')
# x = dense(inputs)
# x = layers.Dense(500, activation='relu')(x)
# outputs = layers.Dense(28, activation='sigmoid')(x)

# model = keras.Model(inputs=inputs, outputs=outputs, name='mnist_model')

# model.compile(optimizer='adam',
#               loss='binary_crossentropy',
#               metrics=['accuracy'])

# history = model.fit(train_data, train_label,
#                     batch_size=64,
#                     epochs=40,
#                     # validation_split=0.2,
#                     validation_data=(validation_data, validation_label))

# model.summary()

# test_loss, test_acc = model.evaluate(test_data,  test_label, verbose=2)
# print('Test loss:', test_loss)
# print('Test accuracy:', test_acc)


inputs = keras.Input(shape=(1, 3801))
x = layers.Conv1D(200, 5, activation='relu', strides=1, padding='same')(inputs)
x = layers.MaxPooling1D(2, padding='same')(x)
# x = layers.Dense(2000, activation='relu')(x)
x = layers.Dense(500, activation='relu')(x)
outputs = layers.Dense(28, activation='sigmoid')(x)

model = keras.Model(inputs=inputs, outputs=outputs, name='mnist_model')
model.summary()

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

history = model.fit(train_data, train_label,
                    batch_size=64,
                    epochs=20,
                    # validation_split=0.2,
                    validation_data=(validation_data, validation_label))

model.summary()

test_loss, test_acc = model.evaluate(test_data,  test_label, verbose=2)
print('Test loss:', test_loss)
print('Test accuracy:', test_acc)

print('\n# Generate predictions for 3 samples')
predictions = model.predict(test_data[:3])
print(predictions)
print(test_label[:3])
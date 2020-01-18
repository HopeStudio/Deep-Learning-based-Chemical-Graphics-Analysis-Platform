from __future__ import absolute_import, division, print_function, unicode_literals

import tensorflow as tf
from tensorflow import keras

from tensorflow.keras import datasets, layers, models, regularizers
import matplotlib.pyplot as plt
from load_data import load_data

(train_data, train_label), (validation_data, validation_label), (test_data, test_label) = load_data()

# output_num = len(train_label[0][0])
# input_num = len(train_data[0][0])
output_num = len(train_label[0])
input_num = len(train_data[0])

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

# inputs = keras.Input(shape=(input_num,))
# x = inputs
# x = layers.Dense(5000, activation='relu', kernel_regularizer=regularizers.l2(0.001))(x)
# x = layers.Dense(1000, activation='relu', kernel_regularizer=regularizers.l2(0.001))(x)
# outputs = layers.Dense(output_num, activation='sigmoid')(x)

# model = keras.Model(inputs=inputs, outputs=outputs, name='functional_groups_model')

# model.summary()

# model.compile(optimizer='adam',
#               loss='binary_crossentropy',
#               metrics=['accuracy'])

# history = model.fit(train_data, train_label,
#                     batch_size=64,
#                     epochs=10,
#                     # validation_split=0.2,
#                     validation_data=(validation_data, validation_label))

# model.summary()

# test_loss, test_acc = model.evaluate(test_data,  test_label, verbose=2)
# print('Test loss:', test_loss)
# print('Test accuracy:', test_acc)


inputs = keras.Input(shape=(input_num,), name='main')
addition_inputs = keras.Input(shape=(input_num,), name='addition')
x = inputs
x = layers.Reshape(target_shape=(1, input_num))(x)
x = layers.Conv1D(100, 10, activation='relu', strides=1, padding='same')(x)
x = layers.Conv1D(50, 10, activation='relu', strides=1, padding='same')(x)
x = layers.MaxPooling1D(5, padding='same')(x)
x = layers.Conv1D(50, 5, activation='relu', strides=1, padding='same')(x)
x = layers.MaxPooling1D(5, padding='same')(x)
x = layers.Flatten()(x)
x = layers.Concatenate()([x, addition_inputs])
x = layers.Dense(200, activation='relu')(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(output_num, activation='sigmoid')(x)

model = keras.Model(inputs=[inputs, addition_inputs], outputs=outputs, name='functional_group_model')
model.summary()

# keras.utils.plot_model(model, 'multi_input_and_output_model.png', show_shapes=True)

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['binary_accuracy', 'Precision', 'Recall', 'TruePositives', 'FalseNegatives'])

history = model.fit([train_data, train_data], train_label,
                    batch_size=64,
                    epochs=50,
                    # validation_split=0.2,
                    validation_data=([validation_data, validation_data], validation_label)
                    )

model.summary()

test_result = model.evaluate([test_data, test_data],  test_label, verbose=2)
print('Test Result: ', test_result)

import random
import numpy as np

test_num = len(test_data)
samples = [random.randrange(0, test_num) for i in range(5)]

print('\n# Generate predictions for 5 samples')
prediction_data = np.array([test_data[i] for i in samples])
predictions = model.predict([prediction_data, prediction_data])
print(predictions)
print([test_label[i] for i in samples])
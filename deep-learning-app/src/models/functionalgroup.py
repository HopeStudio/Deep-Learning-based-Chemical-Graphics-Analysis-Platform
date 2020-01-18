from __future__ import absolute_import, division, print_function, unicode_literals

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import datasets, layers, models, regularizers
import random
import numpy as np
import datetime
# import matplotlib.pyplot as plt
from load_data import load_data

def reduce_clarity(data, n = 20):
  result = []
  for ir_data in data:
    # ir_data is an array record the absort data from 4000 to 200
    process_data = []
    for i in range(n - 1, len(ir_data), n):
      process_data.append(max([ir_data[i - j] for j in range(n)]))
    result.append(process_data)
  result = np.array(result)
  return result

# load dataset
(train_data, train_label), (validation_data, validation_label), (test_data, test_label) = load_data()

output_num = len(train_label[0])
input_num = len(train_data[0])
addtion_num = len(reduce_clarity([range(input_num)])[0])

def create_full_connected_model():
  inputs = keras.Input(shape=(input_num,))
  x = inputs
  x = layers.Dense(5000, activation='relu', kernel_regularizer=regularizers.l2(0.001))(x)
  x = layers.Dense(1000, activation='relu', kernel_regularizer=regularizers.l2(0.001))(x)
  outputs = layers.Dense(output_num, activation='sigmoid')(x)

  model = keras.Model(inputs=inputs, outputs=outputs, name='functional_groups_model')

def train_funn_connected_model(model):
  model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

  history = model.fit(train_data, train_label,
                      batch_size=64,
                      epochs=10,
                      # validation_split=0.2,
                      validation_data=(validation_data, validation_label))
  return model

def evaludate_full_connected_model(model):
  test_loss, test_acc = model.evaluate(test_data,  test_label, verbose=2)
  print('Test loss:', test_loss)
  print('Test accuracy:', test_acc)

def create_conv_model(input_num=input_num, addtion_num=input_num):
  inputs = keras.Input(shape=(input_num,), name='main')
  # addition_inputs = keras.Input(shape=(addtion_num,), name='addition')

  x = inputs
  x = layers.Reshape(target_shape=(1, input_num))(x)
  x = layers.Conv1D(50, 10, activation='relu', strides=1, padding='same')(x)
  x = layers.Conv1D(50, 10, activation='relu', strides=1, padding='same')(x)
  x = layers.MaxPooling1D(5, padding='same')(x)
  x = layers.Conv1D(50, 5, activation='relu', strides=1, padding='same')(x)
  x = layers.MaxPooling1D(5, padding='same')(x)
  x = layers.Flatten()(x)

  # conbine with additon_inputs
  # x = layers.Concatenate()([x, addition_inputs])
  x = layers.Concatenate()([x, inputs])

  x = layers.Dense(200, activation='relu')(x)
  x = layers.Dropout(0.2)(x)
  outputs = layers.Dense(output_num, activation='sigmoid')(x)

  # model = keras.Model(inputs=[inputs, addition_inputs], outputs=outputs, name='functional_group_model')
  model = keras.Model(inputs=inputs, outputs=outputs, name='functional_group_model')


  model.compile(optimizer='adam',
            loss='binary_crossentropy',
            metrics=['binary_accuracy', 'Precision', 'Recall', 'TruePositives', 'FalseNegatives'])

  return model

def train_model(model):
  log_dir="./logs/fit/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
  tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1)
  history = model.fit(train_data, train_label,
                    batch_size=64,
                    epochs=40,
                    # validation_split=0.2,
                    callbacks=[tensorboard_callback],
                    validation_data=(validation_data, validation_label)
                    )
  
  return model

def evaludate_model(model):
  test_result =  model.evaluate(test_data, test_label, verbose=2)
  print('Test Result: ', test_result)
  test_num = len(test_data)
  samples = [random.randrange(0, test_num) for i in range(5)]

  print('\n# Generate predictions for 5 samples')
  prediction_data = np.array([test_data[i] for i in samples])
  predictions = model.predict(prediction_data)
  print(predictions)
  print([test_label[i] for i in samples])

def save_model(model):
  # model.save('./model/functional_group.h5')
  model.save('./model/functional_group/1', save_format='tf')

model = create_conv_model(addtion_num=addtion_num)

model.summary()
# keras.utils.plot_model(model, 'multi_input_and_output_model.png', show_shapes=True)

train_model(model)

model.summary()
evaludate_model(model)
save_model(model)

# run in docker
# docker run -p 8501:8501 \
#   --mount type=bind,source=/path/to/model/in/your/computer,target=/models/functional_group \
#   -e MODEL_NAME=functional_group -t tensorflow/serving

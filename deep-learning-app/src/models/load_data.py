from preprocess import PreProcessor

pre_processor = PreProcessor()

def load_data(n = 0):
  tranning_sets, validation_sets, test_sets = pre_processor.read_dataset()

  train_set =  [i for i in tranning_sets[n]]
  validation_set = [i for i in validation_sets[n]]
  test_set = [i for i in test_sets]

  train_data = [i[0] for i in train_set]
  train_label= [i[1] for i in train_set]
  validation_data= [i[0] for i in validation_set]
  validation_label= [i[1] for i in validation_set]
  test_data= [i[0] for i in test_set]
  test_label= [i[1] for i in test_set]

  return ((train_data, train_label), (validation_data, validation_label), (test_data, test_label))
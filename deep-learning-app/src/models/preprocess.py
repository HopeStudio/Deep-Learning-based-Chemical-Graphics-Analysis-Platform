# this process is attempt to convert the folder /data
# to a main .csv file with following structure:
# input(IR row data), cas_no, smiles, label, remarks, name, formula, group
# 
# input(IR row data): is vector recording the absorb from 4000cm-1 to 200cm-1
# cas_no: is CAS NO.
# smiles: is SMILES string convert from .mol file
# label: is vector showing which functional group this material has, using SMARTS Pattern match
# remarks: is type of input data
# name: is an array containing name(Chinese, English, others name)
# formula: is the formula of this material
# group: sort by functional group, reference category.json
# 
# with the main .csv file, then we convert it to multi .csv based on group 
# at last, with multi group .csv file, we choose 60% of each to form traning dataset, 20% to form validation dataset, and last 20% to form test dataset.
# we can change the position to convert, so that we can ouput multi traning dataset and validation dataset which will be going to use in cross-validation process.

from openbabel import openbabel, pybel
import json
import os
import csv
import random

data_folder = os.path.join(os.getcwd(), '../../data')
output_folder = os.path.join(os.getcwd(), './output')
group_file = os.path.join(os.getcwd(), './category.json')

class CSVData:
  def __init__(self, reader, is_parse_json = True):
    self.reader = reader
    self.is_parse_json = is_parse_json
    # skip header
    self.reader.__next__()
  def __iter__(self):
    return self
  def __next__(self):
    rowData = self.reader.__next__()
    data = tuple(rowData)
    input_data_json, label_json = data
    if not self.is_parse_json:
      return (input_data_json, label_json)

    input_data = json.loads(input_data_json)
    label = json.loads(label_json)
    return (input_data, label)

class PreProcessor:
  functional_group_smarts = (
    # 烷烃
    '[CH]',
    '[CH2]',
    '[CH3]',
    # 烯烃
    'C=C',
    # 炔烃
    'C#C',
    # 苯
    '[c;r6]',
    # 芳香
    'c',
    # 甲苯
    '[c;r6]C',
    # 苯酚
    '[c;r6][OH]',
    # 卤素
    'C[F,Cl,Br,I]',
    'c[F,Cl,Br,I]',
    # 酰卤
    'C(=O)Cl',
    # 醇
    '[OH]',
    # 酮
    'CC(=O)C',
    # 醛
    '[H]C(=O)',
    # 酯
    'C(=O)OC',
    # 酸
    'C(=O)[OH]',
    # 醚
    'COC',
    # 过氧
    'OO',
    # 酸酐
    'C(=O)OOC(=O)',
    # 酰胺
    'C(=O)N',
    # 胺
    '[NH]',
    '[NH2]',
    # 亚胺
    'C=N',
    # 叠氮化物
    'N#N',
    # 腈
    'C#N',
    # 硝基化合物
    '[N+](=O)[O-]',
    # 硫醇
    '[SH]',
  )

  def __init__(self, data_folder = data_folder, output_folder = output_folder, group_file = group_file):
    self.data_folder = data_folder
    self.output_folder = output_folder
    self.group_file = group_file
    self.group_map = {}
    self.init_group_map()
    self.count = None

  def init_group_map(self):
    category_json = open(self.group_file, mode='r').read()
    category = json.loads(category_json)

    self.groups = set(['unknown'])
    for cate, items in category.items():
      self.groups.add(cate)
      for item in items:
        self.group_map[item['CASNo']] = cate
  
  def convert_mdl_to_smiles(self, mdl_file):
    mol = pybel.readfile('MDL', mdl_file).__next__()
    smiles_string = mol.write('SMILES')
    return smiles_string
  
  def convert_ir_data_to_vector(self, ir_data_file):
    file = open(ir_data_file, mode='r')
    raw_data = file.read()
    pair_data = raw_data.split(';')[:-1]
    y_data = map(lambda pair_string: int(pair_string.split('/')[1]) / 1000, pair_data)
    result = [y for y in y_data]
    if len(result) != 3801:
      print('data error: is not fix 3801')
    return result
  
  def get_info(self, meta_file):
    file = open(meta_file, mode='r')
    json_string = file.read()
    meta = json.loads(json_string)
    name = [process_name for process_name in map(lambda name: name.split('；')[0], meta['name'])]
    cas = meta['cas']
    group = self.get_group(cas)
    return (name, meta['formula'], meta['remarks'], cas, group)
  
  def get_group(self, cas_no):
    try:
      group = self.group_map[cas_no]
    except:
      group = 'unknown'
    finally:
      return group
  
  def get_label(self, smiles_string):
    result = []
    # result2 = {}
    mol = pybel.readstring('smi', smiles_string)
    for smarts in self.functional_group_smarts:
      smart = pybel.Smarts(smarts)
      if len(smart.findall(mol)) > 0:
        result.append(1)
        # result2[smarts] = True
      else:
        result.append(0)
        # result2[smarts] = False
    
    return result

  def append_main_csv(self, input_data, cas, smiles, label, remarks, name, formular, group):
    self.main_csv_file_writer.writerow((json.dumps(input_data), cas, smiles, json.dumps(label), remarks, json.dumps(name), formular, group))
  
  def read_main_csv_file(self):
    output_csv_file_path = os.path.join(self.output_folder, './main.csv')
    file = open(output_csv_file_path, 'r')
    reader = csv.reader(file)
    # skip header
    reader.__next__()

    # return a iterator
    class CSVData:
      def __iter__(self):
        return self
      def __next__(self):
        rowData = reader.__next__()
        data = tuple(rowData)
        input_data_json, cas, smiles, label_json, remarks, name_json, formular, group = data
        input_data = json.loads(input_data_json)
        name = json.loads(name_json)
        label = json.loads(label_json)
        return (input_data, cas, smiles, label, remarks, name, formular, group)
    
    # return iterator
    return CSVData()

  def read_classify_csv_file(self, group_name, is_parse_json = True):
    output_csv_file_path = os.path.join(self.output_folder, 'classify', group_name.replace('/', '_') + '.csv')
    file = open(output_csv_file_path, 'r')
    reader = csv.reader(file)
    
    # return iterator
    return CSVData(reader, is_parse_json)

  def process_item(self, file_name):
    mdl_file = os.path.join(self.data_folder, file_name + '.mol')
    ir_data_file = os.path.join(self.data_folder, file_name + '.raw')
    meta_file = os.path.join(self.data_folder, file_name + '.meta.json')

    # process item
    vector = self.convert_ir_data_to_vector(ir_data_file)
    smiles = self.convert_mdl_to_smiles(mdl_file)
    label = self.get_label(smiles)
    name, formular, remarks, cas, group = self.get_info(meta_file)
    self.append_main_csv(vector, cas, smiles, label, remarks, name, formular, group)

  def process_cas_folder(self, cas):
    dirs = os.listdir(os.path.join(self.data_folder, cas))
    items = set([])
    for dir in dirs:
      items.add(dir.split('.')[0])
    
    # start process items
    for item_name in items:
      file_name = cas + '/' + item_name
      print('start process cas_item: ', file_name)
      self.process_item(file_name)
      print('process cas_item ', file_name, 'end')

    return len(items)

  def process_data_folder(self):
    # file writer
    output_csv_file_path = os.path.join(self.output_folder, './main.csv')
    main_csv_file = open(output_csv_file_path, mode='w')
    self.main_csv_file_writer = csv.writer(main_csv_file)
    self.main_csv_file_writer.writerow(('input_data', 'cas', 'smiles', 'label', 'remarks', 'name', 'formular', 'group'))

    # process data
    cas_dirs = os.listdir(os.path.join(self.data_folder))
    num_of_item = 0
    for cas in cas_dirs:
      if cas.startswith('.'): continue
      print('start process cas_folder: ', cas)
      num_of_item += self.process_cas_folder(cas)
      print('process cas_folder ', cas, 'end')

    print('process ', num_of_item, 'items')

    # end file writer
    del self.main_csv_file_writer

  def classify(self):
    # initialize data writer
    output_folder = os.path.join(self.output_folder, 'classify')
    writers = {}
    for group_name_source in self.groups:
      group_name = group_name_source.replace('/', '_')
      file = open(os.path.join(output_folder, group_name + '.csv'), mode='w')
      writers[group_name] = csv.writer(file)

    
    # insert headers
    headers = ('input_data', 'label')
    for writer in writers.values():
      writer.writerow(headers)

    # begin to read data, and save to new .csv file
    process_item_num = 0
    data = self.read_main_csv_file()
    for item in data:
      input_data, cas, smiles, label, remarks, name, formular, group = item
      writer = writers[group.replace('/', '_')]
      writer.writerow((json.dumps(input_data), json.dumps(label)))

      print('save ', cas, ' to ', group + '.csv')
      process_item_num += 1
    
    print('process ', process_item_num, ' items')

  def count_items(self):
    count = {}
    total_count = 0
    # file readers
    for group_name in self.groups:
      data = self.read_classify_csv_file(group_name)
      count[group_name] = 0
      for item in data:
        count[group_name] += 1
        total_count += 1
    
    self.count = count
    return (count, total_count)

  def start(self):
    print('start to process data folder')
    self.process_data_folder()
    print('process data folder end')
    print('start to classify')
    self.classify()
    print('classify end')
    print('start to count items')
    count, total_count = self.count_items()
    print(count)
    print('total: ', total_count)
    print('generate dataset')
    self.generate_dataset()
    print('successfully generate dataset')
    self.count_dateset_items()

  def generate_dataset(self):
    tranning_writers, validation_writers, test_writer = self.get_dataset_writer()

    if not self.count:
      self.count_items()

    for group_name in self.groups:
      count = self.count[group_name]
      data = self.read_classify_csv_file(group_name, False)
      if count < 5:
        # all to be tranning set
        for writer in tranning_writers:
          for item in data:
            writer.writerow(item)
      else:
        # tranining set: 60%, validation set: 20%, test set: 20%
        # 1-4: traning set and validation set
        # 5: test set
        num_of_each_group = count // 5
        last_num = count % 5
        sub_data = []
        for i in range(1, 6):
          sub_data.extend([i for x in range(num_of_each_group)])
        
        # deal with extra data, random to each set
        sub_data.extend([random.randrange(1, 6) for x in range(last_num)])

        # random the sub_data list
        for index in range(len(sub_data)):
          random_index = random.randrange(0, len(sub_data))
          temp = sub_data[index]
          sub_data[index] = sub_data[random_index]
          sub_data[random_index] = temp

        i = 0
        for item in data:
          sub_data_type = sub_data[i]
          i += 1
          # test set is 5
          if sub_data_type == 5:
            test_writer.writerow(item)
            continue
          # validator in 1 to 4 sub_data
          for j in range(1, 5):
            if sub_data_type == j:
              validation_writers[j - 1].writerow(item)
            else:
              tranning_writers[j - 1].writerow(item)

  def get_dataset_writer(self):
    # 4 cross-validation set, with same test set
    # initialize writers
    tranning_writers = []
    validation_writers = []

    for i in range(1, 5):
      tranning_file = open(os.path.join(self.output_folder, 'dataset', 'tranningset_' + str(i) + '.csv'), mode='w')
      validation_file = open(os.path.join(self.output_folder, 'dataset', 'validationset_' + str(i) + '.csv'), mode='w')
      tranning_writers.append(csv.writer(tranning_file))
      validation_writers.append(csv.writer(validation_file))

    # initilize testset
    test_file = open(os.path.join(self.output_folder, 'dataset', 'testset.csv'), mode='w')
    test_writer = csv.writer(test_file)

    # set headers
    headers = ('input_data', 'label')
    for writers in [tranning_writers, validation_writers]:
      for writer in writers:
        writer.writerow(headers)
    test_writer.writerow(headers)

    return (tranning_writers, validation_writers, test_writer)
      
  def read_dataset(self):
    dataset_path = os.path.join(self.output_folder, 'dataset')
    tranning_set = []
    validation_set = []
    test_set = None

    for i in range(4):
      tranning_file = open(os.path.join(dataset_path, 'tranningset_' + str(i + 1) + '.csv'), mode='r')
      validation_file = open(os.path.join(dataset_path, 'validationset_' + str(i + 1) + '.csv'), mode='r')

      tranning_reader = csv.reader(tranning_file)
      validation_reader = csv.reader(validation_file)

      tranning_set.append(CSVData(tranning_reader))
      validation_set.append(CSVData(validation_reader))
      
    # test set
    test_file = open(os.path.join(dataset_path, 'testset.csv'), mode='r')
    test_set = CSVData(csv.reader(test_file))

    return (tranning_set, validation_set, test_set)

  def count_dateset_items(self):
    tranning_set, validation_set, test_set = self.read_dataset()
    tranning_count = list(map(lambda data: self.count_data(data), tranning_set))
    validation_count = list(map(lambda data: self.count_data(data), validation_set))
    test_count = self.count_data(test_set)
    
    print('tranning set count: ', tranning_count)
    print('validation set count: ', validation_count)
    print('test set count: ', test_count)

    # calulate percentage:
    percentage = []
    def get_percentage(n, total):
      return str(round(n / total * 100, 2)) + '%'

    for i in range(4):
      total = tranning_count[i] + validation_count[i] + test_count
      print('total:', total)
      res = [
        get_percentage(tranning_count[i], total),
        get_percentage(validation_count[i], total),
        get_percentage(test_count, total)]
      percentage.append(res)

    print('percenate of the dataset: ', percentage)

  def count_data(self, iterable):
    n = 0
    for i in iterable:
      n += 1
    return n

# pre_processor = PreProcessor(data_folder=data_folder, output_folder=output_folder, group_file=group_file)


# pre_processor.start()
# tranning_set, validation_set, test_set = pre_processor.read_dataset()

# data = test_set.__next__()

# print(data[1][0])

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


default_group_file = './category.json'

class PreProcessor:
  functional_group_smarts = (
    # 烷烃
    'CC',
    'C#N'
    # 烯烃
    # 炔烃
    # 苯，甲苯，芳香
    # 卤素
    # 酰卤
    # 醇
    # 酮
    # 醛
    # 酯
    # 酸
    # 醚
    # 过氧
    # 酰胺
    # 胺
    # 亚胺
    # 酰亚胺
    # 叠氮化物
    # 偶氮化合物
    # 氰酸酯
    # 异氰酸酯
    # 硝酸酯
    # 亚硝酸酯
    # 腈
    # 硝基化合物
    # 吡啶及衍生物
    # 膦
    # 磷酸二酯
    # 磷酸酯
    # 硫醚
  )

  def __init__(self, data_folder, output_folder, group_file = default_group_file):
    self.data_folder = data_folder
    self.output_folder = output_folder
    self.group_file = group_file
    self.group_map = {}
    self.init_group_map()

  def init_group_map(self):
    category_json = open(self.group_file, mode='r').read()
    category = json.loads(category_json)
    for cate, items in category.items():
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
    y_data = map(lambda pair_string: int(pair_string.split('/')[1]) / 10, pair_data)
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
      group = 'unkonw'
    finally:
      return group
  
  def get_label(self, smiles_string):
    result = []
    mol = pybel.readstring('smi', smiles_string)
    for smarts in self.functional_group_smarts:
      smart = pybel.Smarts(smarts)
      if len(smart.findall(mol)) > 0:
        result.append(1)
      else:
        result.append(0)
    
    return result

  def append_main_csv(self, input_data, cas, smiles, label, remarks, name, formular, group):
    output_csv_file_path = './main.csv'
    headers = ('input_data', 'cas', 'smiles', 'label', 'remarks', 'name', 'formular', 'group')
    file = open(output_csv_file_path, mode='a')
    writer = csv.writer(file)
    # if the path is not exist, insert the headers
    if not os.path.exists(output_csv_file_path): writer.writerow(headers)
    writer.writerow((json.dumps(input_data), cas, smiles, json.dumps(label), remarks, json.dumps(name), formular, group))
  
  def read_csv_file(self):
    file = open('./main.csv', 'r')
    reader = csv.reader(file).__next__()
    data = tuple(reader)
    input_data_json, cas, smiles, label_json, remarks, name_json, formular, group = data
    input_data = json.loads(input_data_json)
    name = json.loads(name_json)
    label = json.loads(label_json)
    return (input_data, cas, smiles, label, remarks, name, formular, group)

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
    cas_dirs = os.listdir(os.path.join(self.data_folder))
    num_of_item = 0
    for cas in cas_dirs:
      if cas.startswith('.'): continue
      print('start process cas_folder: ', cas)
      num_of_item += self.process_cas_folder(cas)
      print('process cas_folder ', cas, 'end')

    print('process ', num_of_item, 'items')


data_folder = os.path.join(os.getcwd(), '../../data')
output_folder = os.path.join(os.getcwd(), '../../output')

pre_processor = PreProcessor(data_folder=data_folder, output_folder=output_folder)

# pre_processor.process_data_folder()
result = pre_processor.get_label('CC#N(CC)CC')
print(result)

# data = pre_processor.read_csv_file()

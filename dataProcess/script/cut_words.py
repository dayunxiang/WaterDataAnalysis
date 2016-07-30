# coding=utf-8
__author__ = 'hui'

# 该脚本用于从给定文本中提取关键字
input_filename = "../data/new_water_data.csv"
output_filename = "../data/keywords_list.txt"

import time
stat_time = time.time()

import jieba

def format_str(generator):
    count = 0
    tags=""
    for tag in generator:
        tags += tag+","
        if count > 20:
            tags += "\n"
            count = 0
        count += 1
    return tags

def save_to_file(string,filename):
    import sys
    reload(sys)
    sys.setdefaultencoding( "gbk" )  # 不写这些下面写入文件回报编码错误
    filew = open(filename, 'wb')
    filew.write(string)
    filew.close()

# 数据预处理
filep = open(input_filename, 'rb')
content = filep.read().replace('"','')

# 加载自定义词典
#jieba.load_userdict('file_name')

# 分词
'''
seg_list = jieba.cut(content)
seg_set = list(set(seg_list))
seg_str = format_str(seg_set)
save_to_file(seg_str,'alltext.csv')
'''

# 关键词提取
import jieba.analyse
tags_list = jieba.analyse.extract_tags(content,500)
tags = format_str(tags_list)
# sorted(a) 与 a.sort() 都是排序，但后者改变了a本身
save_to_file(tags, output_filename);
filep.close()

print time.time()-stat_time


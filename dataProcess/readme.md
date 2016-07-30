安装这些工具脚本所依赖的jieba库，按照
[http://www.oschina.net/p/jieba](http://www.oschina.net/p/jieba)
所说，最简单的是全自动安装：

```bat
	pip install jieba
```

文件 | 说明
--- | ---
script/change_data.py | 将orcle导出的sql脚本转化为mysql的sql脚本,输入文件为water.sql，输出文件为water_change.sql
script/cut_words.py | 利用jieba提取关键字的脚本
script/deal_with_data.py | 对csv格式的城市供水的数据进行分词，以关键字分类，进行否定分析，构建关键字等价类，最终生成json格式的数据文件。
script/word_frequent.py | 输入一个文本，对该文本进行词频统计的python脚本。
data/createtable.sql | MySQL中为water_change.sql的数据建立相应的表的建表语句,为待插入数据库的数据做准备
data/datadir.sql | mysql中查看某个数据库数据目录的命令
data/keywords.txt | 通过结合deal_with_data.py的分类结果和人工筛选相结合的办法，先获得若干关键词，再通过对没能分类的数据分析，添加等价词语到keywords.txt的关键词等价集中，少量的添加新的关键词到keywords.txt的关键词中。不断迭代，知道大多数数据得到分类。最终的keywords.txt就是所有关键词，关键词的等价集，关键词描述词，是否为否定敏感的记录的列表。
data/keywords_list.txt| 利用jieba提取关键词的算法，提取500个关键词，人工筛选出合理的作为keywords.txt中关键词的初始量。
data/new_water_data.csv| water.data.csv的EventCause列，也就是这一列需要进行文本处理。
data/savetocsv.sql | 将mysql数据库的数据导出为csv格式的sql命令
data/tianjin.json | 天津市的地图位置信息
water.sql | 2010年天津市城市供水问题的数据的oracle导出的sql脚本，编码为GB2312
water_change.sql | water.sql经过change_data.py处理后可被mysql使用的sql脚本，编码方式为GB2312
data/water_data.csv  | 2010城市供水问题的csv格式的数据(由mysql数据库导出)
data/water_data.json | water_data经过deal_with_data.py 的处理，生成的最终用于可视化的json数据
data/word_freq.csv | 城市供水问题的词频统计（使用word_frequent.py ）

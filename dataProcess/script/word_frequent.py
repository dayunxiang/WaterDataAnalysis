# coding=utf-8
# 词频统计
input_file = "../data/new_water_data.csv"
output_file = "../data/word_freq.csv"			# 使用office excel打开会产生乱码
# 分词后不进行词频统计的词，但在分词前删除又会影响断句分词，不能使用正则表达式
filter_words = [u',',u'.',u'\n',u'，',u'。',u'．',u' ',u'　',u'：',u'《',u'》',u'（',u'）']
# 分词前删除['-',':','“','”']字符和数字，可以使用正则表达式
ignore_words = [u"([\[\]\(\)\'\-\”\“\"\`])","(\d)+"]			


def loadFile():
	import sys,re
	reload(sys)
	sys.setdefaultencoding('utf-8')
	filep = open(input_file)
	content = filep.read().decode('utf-8')		
	filep.close()
	for i_word in ignore_words:
		content = re.sub(i_word,"",content)
		print i_word
		print content[1:100]
	return content

def get_word_frequent(content):
	import jieba
	seg_list = jieba.cut(content)
	word_freq = {}
	for word in seg_list:
		if not isFilter_word(word):
			if word_freq.has_key(word):
				word_freq[word] += 1
			else:
				word_freq[word] = 1
	
	return word_freq
				
def isFilter_word(word):
	for i_word in filter_words:
		if word == i_word:
			return True
	return False

def sort_word_by_frequent(word_freq):
	freq_dict = []
	for word in word_freq.keys():
		freq_dict.append({"word":word, "frequent":word_freq[word]})
	freq_dict.sort(key=lambda freq_word:-freq_word["frequent"])      # 按词频降序排大小
	return freq_dict

def save_to_csv(freq_dict):
	filep = open(output_file, 'wb')
	filep.write(u'rank,word,frequent\n')
	rank = 1
	for word in freq_dict:
		filep.write(str(rank) + "," + word["word"]+"," + str(word["frequent"]) + "\n")
		rank += 1
	filep.close()
	
def main():
	content = loadFile()
	word_freq = get_word_frequent(content)
	freq_dict = sort_word_by_frequent(word_freq)
	save_to_csv(freq_dict)

import time
start_time = time.time()
main()
print time.time()-start_time

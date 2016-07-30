#coding=utf-8
import re

filep = open("../data/water.sql");
filew = open("../data/water_change.sql",'w');

for words in filep.readlines(): 
	words = re.sub("to_date\(", "",words);
	words = re.sub(", 'dd-mm-yyyy hh24:mi:ss'\)", "",words)
	
	newwords = "";
	i=0;
	while(i < len(words)):
		word = words[i:i+19];
		if re.search("(\d\d\-\d\d\-\d\d\d\d \d\d:\d\d:\d\d)", word) != None:
			newwords += word[6:10]+"-";
			newwords += word[3:5] + "-";
			newwords += word[0:2]
			newwords += word[10:19];
			i = i + 19;
			continue;
		newwords += words[i];
		i = i+1;
	filew.write(newwords);

filep.close();
filew.close();


'''
#替换
import re
input = 'hello   world'
#第一个参数是正则表达式，第二个参数是要替换成的内容，第三个参数是替换原字符串
output = re.sub(' ', 'ok',input)
print output 
'''

'''
# 注意点：
#	1.	正则表达式写在括号里
#   2.	不同括号是不同的group， group(0)表示整个长度，group(i)表示第i个括号里的正则匹配的部分
#	3.	注意没有匹配到返回None
word = "haha 11-21-3115 00:01:23 dd-dd-dd";
an = re.search("(\d\d\-\d\d\-\d\d\d\d \d\d:\d\d:\d\d)( dd)", word);
print an.group(0)   #11-21-3115 00:01:23 dd
print an.group(1)	#11-21-3115 00:01:23
print an.group(2)	# dd


an = re.search("(fuck)", word);  # None
print an;
'''
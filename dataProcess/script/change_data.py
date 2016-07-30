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
#�滻
import re
input = 'hello   world'
#��һ��������������ʽ���ڶ���������Ҫ�滻�ɵ����ݣ��������������滻ԭ�ַ���
output = re.sub(' ', 'ok',input)
print output 
'''

'''
# ע��㣺
#	1.	������ʽд��������
#   2.	��ͬ�����ǲ�ͬ��group�� group(0)��ʾ�������ȣ�group(i)��ʾ��i�������������ƥ��Ĳ���
#	3.	ע��û��ƥ�䵽����None
word = "haha 11-21-3115 00:01:23 dd-dd-dd";
an = re.search("(\d\d\-\d\d\-\d\d\d\d \d\d:\d\d:\d\d)( dd)", word);
print an.group(0)   #11-21-3115 00:01:23 dd
print an.group(1)	#11-21-3115 00:01:23
print an.group(2)	# dd


an = re.search("(fuck)", word);  # None
print an;
'''
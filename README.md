1. 该项目没有用到机器学习的方法，纯粹是简单地半手工数据分析和可视化展示。<br/>
2. 可视化部分的程序需要运行在服务器上，使用webstorm打开会自行搭建服务器打开，使用的是d3.js库，设计多个展示图谱。<br/>
3. 该项目数据处理部分使用到一个轻量级的python分词库jieba，教程可以参考[http://www.oschina.net/p/jieba/](http://www.oschina.net/p/jieba/)， 其实直接使用一下pip安装即可：
    pip install  jieba
    <br/>
4. 项目中的几个脚本，可以使用到其他文本处理中：比如dataProcess/script/cut_words可用于文本分词，word_frequents可用于文本词频统计
5. 具体项目说明可参考doc下的文档

目录 | 说明
--- | ---
dataProcess | 数据处理部分
visualization| 数据可视化部分
doc | 该项目的具体过程说明和简单展示的文档



# coding=utf-8

class WaterData:
    def __init__(self,filename):
        import sys
        reload(sys)
        sys.setdefaultencoding('utf-8')
        self.filep = open(filename)
        self.words = self.filep.read().replace('\n','').replace('"','\\"').decode('utf-8') # 变成unicode后不能使用replace,所以必须先行动
        self.scan_index = 0
        self.words_len = len(self.words)
        self.attr = ["workFormId","acceptTime","eventCause", "standardAddress","LNG","LAT"]
        self.current_id = 0
        self.filep.close()
        pass

    def get_next_workform(self):
        if self.scan_index == self.words_len: # 结束了
            return None
        self.current_workform = {}
        self.current_workform["index"] = self.current_id
        self.current_id += 1
        for i in range(len(self.attr)):
            begin_index = self.get_next_quotation_index()
            end_index = self.get_next_quotation_index()
            self.current_workform[self.attr[i]] = self.words[begin_index+1:end_index]  # 切片含左不含右
        return self.current_workform

    def get_next_quotation_index(self):  # 获取下一个分号的位置
        if self.scan_index == self.words_len: # 结束了
            raise ("error data format")
            return None

        for alpha in self.words[self.scan_index:]:
            self.scan_index += 1
            if alpha == "'":
                return self.scan_index - 1

    def createJson(self,filename):
        self.filep = open(filename,'wb')
        self.filep.write(u'{"type":"workformCollection","workforms":[')

    def __addJson(self, dict):
        self.filep.write(u"{")
        keys = [u'index', u'workFormId', u'LAT', u'LNG', u'eventCause', u'standardAddress']
        dict['index'] = str(dict['index'])
        for key in keys:
            self.filep.write(u'"'+ key + u'":"' + dict[key] + u'",')

        self.filep.write(u'"acceptTime":"' + dict["acceptTime"] + u'",')

        self.filep.write(u'"eventSet":')
        self.__writeList(dict['eventSet'])

        self.filep.write(u"}")

    def __writeList(self,list):
        self.filep.write("[")
        # 前几个list元素
        for i in range(len(list)-1):
            ele = list[i]
            if str(type(ele)) == "<type 'dict'>":
                self.filep.write('{')
                self.__writeListEle(ele)
                self.filep.write('},')
            else:
                self.filep.write('"'+str(ele)+'",')
        # 最后一个list元素
        if len(list) > 0:
            ele = list[len(list)-1]
            if str(type(ele)) == "<type 'dict'>":
                self.filep.write('{')
                self.__writeListEle(ele)
                self.filep.write('}')
            else:
                self.filep.write('"'+str(ele)+'"')

        self.filep.write("]")

    # 写入一个list元素
    def __writeListEle(self, ele):
        keys = ele.keys()
            # 前几个key
        for j in range(len(keys)-1):
            key = keys[j]
            self.filep.write('"'+key+'":')
            if str(type(ele[key])) == "<type 'list'>":
                self.__writeList(ele[key])
            else:
                self.filep.write('"'+str(ele[key])+'",')
        # 最后一个key
        if len(keys) > 0:
            key = keys[len(keys)-1]
            self.filep.write('"'+key+'":')
            if str(type(ele[key])) == "<type 'list'>":
                self.__writeList(ele[key])
            else:
                self.filep.write('"'+str(ele[key])+'"')

    def addJson(self,dict):
        self.__addJson(dict)
        self.filep.write(",")

    def overJson(self,dict):
        self.__addJson(dict)
        self.filep.write(u"]}")
        self.filep.close()

'''
event["eventKey"]
event["eventId"]
event["eventType"]
event["eventDescribe"]
'''
class Event:
    def __init__(self,filename):
        self.events = self.load_events(filename)
        # 声明几种前后缀
        deny = u"没有,不,无,未,非"
        self.deny = deny.split(',')
        same = u"也,如此,相同,一样"
        self.same = same.split(',')
        self.distance = 5       # 前后缀所在位置的最大距离

    def load_events(self,filename):
        import sys
        reload(sys)
        sys.setdefaultencoding('utf-8')
        filep = open(filename)
        eventsStr = filep.read().replace('[','').replace(']','').decode('utf-8')
        filep.close()
        eventsStr = eventsStr.split('\n')

        events = []
        eventid = 0
        for eventStr in eventsStr:
            if eventStr == "" : continue
            event = {}
            event["eventId"] = eventid
            eventid += 1
            [keys, describe, canDeny] = eventStr.split(';')
            event["eventKey"] = keys.split(',')
            event["eventDescribe"] = describe.split(',')
            event["eventType"] = event["eventKey"][0]
            event["canDeny"] = bool(canDeny)                    # 有些主题对否定不敏感，如 无井盖还是井盖问题
            events.append(event)
        self.eventCount = eventid
        return events

    # 用于判断是否有否定前缀
    def isDeny(self, string, index,len_k):
        # 前缀
        pre_str = string[index-self.distance:index].split('，')
        pre_str = pre_str[len(pre_str)-1]

        for denyWord in self.deny:
            if pre_str.find(denyWord) != -1:
                return True
        # 后缀
        suf_str = string[index+len_k:index+len_k+self.distance].split('，')
        suf_str = suf_str[0]
        for denyWord in self.deny:
            if suf_str.find(denyWord) != -1:
                return True

        return False

    def extractEvents(self,string):
        eventSet=[]
        for event in self.events:   # 判断是否含有events里的某个event
            e = {}
            for key in event["eventKey"]:   # 比对每一个关键字
                index=string.find(key)
                if index != -1 and key != '' and ( event["canDeny"]
                        or (not self.isDeny(string, index,len(key)))):
                        e["eventId"] = event["eventId"]
                        e["eventType"] = event["eventType"]
                        e["eventDescribe"] = []

                        for describe in event["eventDescribe"]:
                            if describe != '' and string.find(describe) != -1:
                                e["eventDescribe"].append(describe)
                        break

            if len(e) != 0:     # 如果属于该event归入
                eventSet.append(e)

        if len(eventSet) == 0:     # 如果没有归入任何一类，那么就是other
            e = {}
            e["eventId"] = self.eventCount
            e["eventType"] = "other"
            e["eventDescribe"] = []
            eventSet.append(e)
        return eventSet

import time
start_time = time.time()

def main(keywordFile, waterDataFile, saveJsonFile, numlimit):
    events = Event(keywordFile)
    waterData = WaterData(waterDataFile)

    waterData.createJson(saveJsonFile)
    i = 0
    unknow = 0
    waterWork = {}
    if str(type(numlimit)) == "<type 'str'>" and numlimit == 'all':
        waterWork = waterData.get_next_workform()
        eventSet = events.extractEvents(waterWork["eventCause"])
        waterWork["eventSet"] = eventSet
        i += 1

        nextWaterWork = waterData.get_next_workform()
        while nextWaterWork != None:
            waterData.addJson(waterWork)
            waterWork = nextWaterWork
            eventSet = events.extractEvents(waterWork["eventCause"])
            waterWork["eventSet"] = eventSet
            nextWaterWork = waterData.get_next_workform()

             # 显示other类的事件
            if eventSet[0]["eventId"] == events.eventCount:
                unknow += 1
                print "cannot classify :", waterWork["eventCause"]

            if i % 1000 == 0:
                print "have solve : ", i, " workform"
            i += 1

    else:
        while i < numlimit:
            waterWork = waterData.get_next_workform()
            eventSet = events.extractEvents(waterWork["eventCause"])
            waterWork["eventSet"] = eventSet

            if i != numlimit-1:
                waterData.addJson(waterWork)
            # 显示other类的事件
            if eventSet[0]["eventId"] == events.eventCount:
                unknow += 1
                print waterWork["eventCause"]
            i += 1
    waterData.overJson(waterWork)
    print "all count is : ",i
    print "unknow count is :", unknow

if __name__ == '__main__':
    main('../data/keywords.txt','../data/water_data.csv','../data/water_data.json','all')

print time.time() - start_time

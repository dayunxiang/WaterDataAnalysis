create table mmworkformok(WORKFORMID CHAR(14) primary key, ACCEPTTIME datetime, EVENTCAUSE varchar(450), STANDARDADDRESS varchar(100), LNG CHAR(10), LAT char(10));
/*gbk编码用以下*/
ALTER TABLE mmworkformok 
CHARACTER SET = gbk ;
/*utf8编码用下面的*/
/*
ALTER TABLE `test`.`mmworkformok` 
COLLATE = DEFAULT ;
*/

/*注：sql文件编码与表的编码不一致出错会报error267*、

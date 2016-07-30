
/*显示文件存储的默认路径*/
/*show variables like '%datadir%';*/
select * from vis.mmworkformok /*where WORKFORMID<'20100202000000'*/
into outfile '.\\test.csv'   
fields terminated by ',' optionally enclosed by "'" escaped by "'"   
lines terminated by '\r\n';
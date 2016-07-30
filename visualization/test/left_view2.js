// 因为该页面在后面创建，所以开始时是undefined
//var leftMap = top.frames["left_map"];                  //self.parent.parent.frames["left_map"];
//var colors = leftMap["colors"];
var timeLimit = {};
var workForms=[];
var statistic_data =[];

var svg = drawSVG();
drawAxis();

{
    var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
        { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
        { "x": 80,  "y": 5},  { "x": 100, "y": 60}];

//线生成器
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

//svg容器
    var svgContainer = d3.select("body").append("svg")
        .attr("width", 200)
        .attr("height", 200);

//把path扔到容器中，并给d赋属性
    var lineGraph = svgContainer.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");
}
main();


/*****************************************************************************************************/
function main(){
    d3.json("waterdata.json", function (error, root) {
        workForms = root.workforms;
        workForms.forEach(function (d) {
            d.acceptTime = new Date(d.acceptTime.replace(/-/g, "/")); // "2010-01-02"火狐不能解析，谷歌可以，替换-为/ , /-/g表示替换所有-
        });
        timeLimit.start = workForms[0].acceptTime;
        timeLimit.end = workForms[workForms.length - 1].acceptTime;
        timeLimit.time_length = timeLimit.end - timeLimit.start;

        statistic_data = statisticData();

        drawLine(statistic_data[0]);
    });
}

function drawSVG(){
    var width = 300;	//画布的宽度
    var height = 700;	//画布的高度
    var svg = d3.select("body")				//选择文档中的body元素
        .append("svg")				//添加一个svg元素
        .attr("width", width)		//设定宽度
        .attr("height", height);	//设定高度
    return svg;
}

function drawAxis(){
    var dataset = [ 2.5 , 2.1 , 1.7 , 1.3 , 0.9 ];
    var linear = d3.scale.linear()
        .domain([0, d3.max(dataset)])
        .range([0, 250]);
    var axi_time = d3.svg.axis()
        .scale(linear).orient("left").ticks(7);
    svg.append("g").attr("class","axis")
        .attr("transform","translate(28,20)")
        .call(axi_time);

    var axi_count = d3.svg.axis()
        .scale(linear).orient("top").ticks(7);
    svg.append("g").attr("class","axis")
        .attr("transform","translate(28,20)")
        .call(axi_count);
}

function drawLine(data){
    var line = d3.svg.line()
        .x(function(d,i) { return (d.count); })
        .y(function(d) { return (d.date * 10); });

    var g = svg.append("g").attr("transform","translate(100,100)");
    var path = g.append('path')
        .attr('class', 'line')
        .attr('d', line(data));
}

function statisticData(){
    var datas =[];                      // [[{0},{0},{0}..],[{0},{0},{0}..]..]
    for(var i = 0; i < 21; i++){        // 对应为21种事件
        datas.push([]);
        for(var j = 0; j < 24; j++){            // 对应24 个半月
            datas[i].push({date: j, count:0});
        }
    }

    workForms.forEach(function(d,i){
        var index = d.acceptTime.getDate() > 15 ? 1 : 0;
        index += d.acceptTime.getMonth() * 2;               // 月从0开始

        for(j =0; j < d.eventSet.length; j++){
            var event = d.eventSet[j];
            datas[event.eventId][index]["count"] += 1;
        }
    });
    return datas;
}

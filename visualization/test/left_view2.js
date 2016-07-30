// ��Ϊ��ҳ���ں��洴�������Կ�ʼʱ��undefined
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

//��������
    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("linear");

//svg����
    var svgContainer = d3.select("body").append("svg")
        .attr("width", 200)
        .attr("height", 200);

//��path�ӵ������У�����d������
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
            d.acceptTime = new Date(d.acceptTime.replace(/-/g, "/")); // "2010-01-02"������ܽ������ȸ���ԣ��滻-Ϊ/ , /-/g��ʾ�滻����-
        });
        timeLimit.start = workForms[0].acceptTime;
        timeLimit.end = workForms[workForms.length - 1].acceptTime;
        timeLimit.time_length = timeLimit.end - timeLimit.start;

        statistic_data = statisticData();

        drawLine(statistic_data[0]);
    });
}

function drawSVG(){
    var width = 300;	//�����Ŀ��
    var height = 700;	//�����ĸ߶�
    var svg = d3.select("body")				//ѡ���ĵ��е�bodyԪ��
        .append("svg")				//���һ��svgԪ��
        .attr("width", width)		//�趨���
        .attr("height", height);	//�趨�߶�
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
    for(var i = 0; i < 21; i++){        // ��ӦΪ21���¼�
        datas.push([]);
        for(var j = 0; j < 24; j++){            // ��Ӧ24 ������
            datas[i].push({date: j, count:0});
        }
    }

    workForms.forEach(function(d,i){
        var index = d.acceptTime.getDate() > 15 ? 1 : 0;
        index += d.acceptTime.getMonth() * 2;               // �´�0��ʼ

        for(j =0; j < d.eventSet.length; j++){
            var event = d.eventSet[j];
            datas[event.eventId][index]["count"] += 1;
        }
    });
    return datas;
}

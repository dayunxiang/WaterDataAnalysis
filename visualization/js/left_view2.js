var workForms = [];
var timeLimit = {};
var statistic_data = [];
var eventType = ["跑水","漏水","积水","渗水","污水","水质","水压",
    "无水", "水表","冰","消防栓","井盖","截门","水井",
    "井","水管","附近","邻居","机动车道","回访","其他"];
var colors = ["#FFB90F", "#ea5a5a", "#FF3030", "#EEEE00", "#EED5B7",
    "#EE3A8C", "#E0EEE0", "#CD661D", "#B22222", "#9B30FF",
    "#3d85c6", "#dd7e6b", "saddlebrown", "#4A4A4A", "#458B00",
    "#a64d79", "#00FF00", "#006400", "#0000AA", "#68228B",
    "#F5F5DC"];

var newColor = {};
for(var i =0; i < eventType.length; i++){
    newColor[eventType[i]] = colors[i];
}

var svg = d3.select("body").append("svg");

d3.json("waterdata.json", function (error, root) {
    initData(root);
    //console.log(statistic_data);
    refresh();
});

function showData(t_data){
    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temperature); });


        svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    drawData(t_data);

    function drawData(data) {
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

        data.forEach(function(d) {
            d.date = parseDate(d.date);
        });

        var cities = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {date: d.date, temperature: +d[name]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("count");

        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return newColor[d.name]; });

        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
    }
}

function initData(root){
    workForms = root.workforms;
    workForms.forEach(function (d) {
        d.acceptTime = new Date(d.acceptTime.replace(/-/g, "/")); // "2010-01-02"火狐不能解析，谷歌可以，替换-为/ , /-/g表示替换所有-
    });
    timeLimit.start = workForms[0].acceptTime;
    timeLimit.end = workForms[workForms.length - 1].acceptTime;
    timeLimit.time_length = timeLimit.end - timeLimit.start;
    statistic_data = statisticData();
}

function statisticData(){
    var datas =[];

    workForms.forEach(function(d,i){
        var index = d.acceptTime.getDate() > 15 ? 1 : 0;
        index += d.acceptTime.getMonth() * 2;               // 月从0开始
        var t_date = createDateStr(index);
        var pos = findDate(t_date);
        if(pos == -1) {
            datas.push({date:t_date});
            for(var k = 0; k < 21; k++)
                datas[datas.length - 1]["event"+k] = 0;
            pos = datas.length -1;
        }

        for(j =0; j < d.eventSet.length; j++){
            var event = d.eventSet[j];
            datas[pos]["event"+event.eventId] += 1;
        }
    });

    function createDateStr(i){
        var m = Math.floor(i/2) + 1;
        m = m > 9 ? m : "0"+m;
        var d = i % 2;
        d = (d == 0) ? "07" : "21";
        return "2010" + m +  d
    }

    function findDate(t_date){
        for(var k = 0; k < datas.length; k++){
            if(datas[k].date == t_date) return k;
        }
        return -1;
    }

    return datas;
}

function refresh(){
    var data = filterData();
    d3.select("body").select("svg").remove();
    svg = d3.select("body").append("svg");
    if(data.length > 0)
        showData(data);
}
function filterData(){
    var t_datas = [];
    var currentState = top.frames["left_map"]["currentState"];
    var eventId = currentState.eventId;

    for(var i = 0; i < statistic_data.length; i++) {
        var data = {date:statistic_data[i].date};
        for (var j = 0; j < eventId.length; j++) {
            data[eventType[eventId[j]]] = statistic_data[i]["event"+eventId[j]];
        }
        t_datas.push(data);
    }
    return t_datas;
}

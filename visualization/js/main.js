/********************************** 以下是主程序 ***************************************************/
/* 定义基本数据 全局变量 */
    var width = 1000;
    var height = 700;
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#000000");
    svg.call(d3.behavior.zoom().scaleExtent([0.3, 10]).on("zoom", onZoom));

    var first_scale = 200000;
    var first_translate = [width / 2, height / 2];
    var projection = d3.geo.mercator()
        .center([117 + 2.3 / 10, 39 + 1.2 / 10])  // 设置左下角(0,0)点的经纬度
        .scale(first_scale)                     // 以center为中心放缩整张图
        .translate(first_translate);            // 平移<整张图>，所以中心点变为first_translate

    var workForms = [];
    /*****/

    var eventTypeCount = 21;                    // 20各类加一个其他

    var scaleProjection = {};                     // 用于投影与反投影，用于经纬度筛选
    scaleProjection.zoom = {scale: 1, translate: [0, 0]}; // 记录当前的zoom状态，用于投影与反投影
    // 初始化放缩下的投影函数和反投影函数，因为projection默认是以translate为中心放缩的，
    // 一但translate改变，他会带着整张图平移，而不仅是放缩中心的变化
    // 所以采用折衷方案，projection的translate一直设成屏幕中心,并且projection倍率不变,即后面不随zoom改变
    // 投影时，先projection，再平移放大（zoom）
    // 反投影时，先平移（scale设为1，如果有必要），即反zoom，再反投影
    !function () {
        function p(d) { // 经纬度 ---》 坐标
            d = projection(d);
            d = [d[0] * scaleProjection.zoom.scale + scaleProjection.zoom.translate[0],
                d[1] * scaleProjection.zoom.scale + scaleProjection.zoom.translate[1]];
            return d;
        }

        function ip(d) { // 坐标 ---》经纬度
            d = [(d[0] - scaleProjection.zoom.translate[0]) / scaleProjection.zoom.scale,
                (d[1] - scaleProjection.zoom.translate[1]) / scaleProjection.zoom.scale];
            d = projection.invert(d);
            return d;
        }

        scaleProjection.p = p;
        scaleProjection.ip = ip;

        function test() {  // 测试
            d3.selectAll(".pt_circle").remove();
            svg.append("circle").attr("class", "pt_circle")
                .attr("transform",
                "translate(" + scaleProjection.p([117.20751, 39.193928]) +
                ")scale(" + scaleProjection.zoom.scale + ")")
                .attr("r", '10');

            svg.append("circle").attr("class", "pt_circle")
                .attr("transform",
                "translate(" + scaleProjection.p(scaleProjection.ip([100, 200])) + ")")
                .attr("r", '10');
        }

        scaleProjection.test = test;
    }();

    var timeLimit = {
        start: new Date("2010/01/01 00:00:00"), end: new Date("2011/01/01 00:00:00"),
        time_length: (new Date("2011/01/01") - new Date("2010/01/01"))
    };
    var currentState = getDataState();          // 记录当前的交互状态
    /*for(var i = 0; i < 21; i++){
     currentState.eventId.push(i);
     }*/
    //currentState.time.isDynamic = true;

    // 21个类别的颜色
    var colors = ["#FFB90F", "#ea5a5a", "#FF3030", "#EEEE00", "#EED5B7",
        "#EE3A8C", "#E0EEE0", "#CD661D", "#B22222", "#9B30FF",
        "#3d85c6", "#dd7e6b", "saddlebrown", "#4A4A4A", "#458B00",
        "#a64d79", "#00FF00", "#006400", "#0000AA", "#68228B",
        "#F5F5DC"];

    var classBolck = [4, 4]; // 聚类的窗口的个数 [w,h] / [c,r]
    var lastUpdtaTime = new Date().getTime();

    var pointSize = 5;     // 非聚类时的单个数据点的图像大小
    var timetep = 1500;    // 动态时间事件的时间间隔
    var animation = {path:false, pie:true,point:false};

    var currentClusterData = [];  // 当前聚类用的数据，可用于mouseover到饼图时显示
    var currentUnClusterData =[]; // 当前未聚类用的数据，用于其他界面访问
    var eventType = ["跑水","漏水","积水","渗水","污水","水质","水压",
                      "无水", "水表","冰","消防栓","井盖","截门","水井",
                      "井","水管","附近","邻居","机动车道","回访","其他"];

    var isClassied = currentState.classified;   // 判断是否处于分类状态


drawMap();
loadData(); /*****/// 由于数据加载是异步的，所以后面并不能马上获得数据，但也就毫秒级别，对于用户没感觉

/********************************** 以下是主程序调用的函数 *****************************************/

// 绘制天津市地图 并设置zoom

    function drawMap() {
        var path = d3.geo.path()
            .projection(projection);

        var g_path = svg.append("g")
            .attr("class", "tianjin");
        d3.json("tianjin.json", function (error, root) {
            if (error)
                return console.error(error);

            g_path.selectAll("path")
                .data(root.features)
                .enter()
                .append("path")
                .attr("class", "tianjinSubArea")
                .attr("stroke", "#ffff00")
                .attr("stroke-width", 1)
                .attr("fill", "#000000")
                .attr("d", path)
        });
    }

    function onZoom() {
        // svg放大缩小移动不会影响子层的transform
        d3.select(this).selectAll('.tianjin')  // html控件设置scale都是相对于左上点的放缩
            .attr("transform", "translate("
            + d3.event.translate
            + ")scale(" + d3.event.scale + ")");

        scaleProjection.zoom["scale"] = d3.event.scale;
        scaleProjection.zoom["translate"] = d3.event.translate;

        var start_time = new Date().getTime();                      // 效率测试代码

        drawStaticData(getData(currentState));
        //setTimeout("drawStaticData(getData(currentState))",0);      // 伪异步刷新，因为防止动态显示每秒刷新带来的zoom时不同步的问题
        lastUpdtaTime = new Date().getTime();                      // 更新时间

        //console.log(new Date().getTime() - start_time);             // 效率测试代码

        //if(d3.event.scale < 1) currentState.time.isDynamic = false;
        //else currentState.time.isDynamic = true;
    }

// 根据getData返回的数据，绘制到地图上

    function drawData(State) {
        if (State.time.isDynamic) drawDynamicData();
        else {
            currentUnClusterData = getData(State);
            drawStaticData(currentUnClusterData);
        }
    }

    function drawStaticData(data) {
        if (data.classified) { // 如果数据是聚类数据，则画饼状图
            currentClusterData = [];            // 每次聚类刷新，清空数组
            drawInUnClassified([]);  // 利用空数组，exit移除所有圆形；
            drawInClassified3(data);
        }
        else {               // 如果数据是非聚类数据，则用三角形，矩形，圆形表示三大类数据
            drawInClassified3([]);   // // 利用空数组，exit移除所有饼状图；
            drawInUnClassified(data.data);
        }
    }

    // 以下三个聚类方法虽然好像第一个效率更高，但实际上都差不多的卡

    // 绘制聚类数据，方案一，创建和非空的数据个数相同的控件，多余控件则删除，少控件则创建
    function drawInClassified(data) { // 对聚类数据，画饼状图
        var workforms_g = svg.select(".workforms_g");
        if (data.length == 0) {
            workforms_g.selectAll(".pie").remove();
            return;
        }

        // 为每个控件分配一个数据，如果控件多于则删除
        var workforms_pie = workforms_g.selectAll(".pie");
        var i = 0;
        workforms_pie.each(function (d, label_index) {
            while (i < data.clusterCount.eid.length &&
            data.clusterCount.eid[i].length == 0) i++;    // 找到非零的块
            if (i < data.clusterCount.eid.length) {
                drawPie(data.clusterCount.eid[i],                   // 第i块的eCount非零的eid
                    data.clusterCount.eCount[i],                    // 第i块的非零的eCount
                    data.data[i],                                     // 第i块的数据
                    d3.select(this));
                i++;
            }
            else {
                d3.select(this).remove();
            }

        });
        // 如果控件少于数据个数，则创建相应个数的控件
        while (i < data.clusterCount.eid.length) {
            while (i < data.clusterCount.eid.length &&
            data.clusterCount.eid[i].length == 0) i++;      // 找到非零的块
            if (i < data.clusterCount.eid.length) {
                drawPie(data.clusterCount.eid[i],                   // 第i块的eCount非零的eid
                    data.clusterCount.eCount[i],                    // 第i块的非零的eCount
                    data.data[i],                                     // 第i块的数据
                    workforms_g.append("g").attr("class", "pie"));
                i++;
            }

        }
    }

    // 绘制聚类数据，方案二，直接先删除上一次所有的pie，在对非空的数据画pie
    function drawInClassified2(data) {
        var workforms_g = svg.select(".workforms_g");
        workforms_g.selectAll(".pie").remove();
        if (data.length == 0) {
            return;
        }

        for (var i = 0; i < data.clusterCount.eid.length; i++) {  // 遍历所有block
            if (data.clusterCount.eid[i].length != 0)             // 如果该block有非零数据
                drawPie(data.clusterCount.eid[i],                   // 第i块的eCount非零的eid
                    data.clusterCount.eCount[i],                    // 第i块的非零的eCount
                    data.data[i],                                     // 第i块的数据
                    workforms_g.append("g").attr("class", "pie"));
        }
    }

    // 绘制聚类数据，方案三，为每个bloack创建一个pie（画在g上），可以为空（什么都不画），这样不需重复的删除和创建g了
    function drawInClassified3(data) {
        var workforms_g = svg.select(".workforms_g");
        if (data.length == 0) {
            workforms_g.selectAll(".pie").remove();
            return;
        }

        var workforms_pie = workforms_g.selectAll(".pie").data(data.clusterCount.eid);
        workforms_pie.enter().append("g").attr("class", "pie");
        workforms_pie.exit().remove();
        workforms_pie.each(function (d, i) {
            if (data.clusterCount.eid[i].length !== 0)             // 如果该block有非零数据
                drawPie(data.clusterCount.eid[i],                   // 第i块的eCount非零的eid
                    data.clusterCount.eCount[i],                    // 第i块的非零的eCount
                    data.data[i],                                     // 第i块的数据
                    d3.select(this));
            else{
                d3.select(this).selectAll("path").remove();
            }
        });
    }

    // 绘制非聚类数据，并用不同形状表示不同大类的数据，不同颜色表示不同类数据
    function drawInUnClassified(data) { // 对非聚类数据，用三角形，矩形，圆形表示三大类数据，并用颜色表示各小类数据
        var circle_data = [], rect_data = [], tri_data = [];
        data.forEach(function (d) {
            if (+d.eid < 10) circle_data.push(d);
            else if (+d.eid < 16) rect_data.push(d);
            else tri_data.push(d);
        });
        // circle data 更新
        drawDataLabel(circle_data, "circle");
        drawDataLabel(rect_data, "rect");
        drawDataLabel(tri_data, "tri");

        // l.enter().append和l.exit().remove都修改了l本身
        function drawDataLabel(label_data, label_type) {
            var workforms_label =
                svg.select(".workforms_g")
                    .selectAll(".workform_" + label_type)
                    .data(label_data);
            if (label_type == "circle")
                workforms_label
                    .enter()
                    .append("circle")
                    .attr("r", pointSize)
                    .attr("class", "workform_" + label_type);
            else if (label_type == "rect")
                workforms_label
                    .enter()
                    .append("rect")
                    .attr("width", pointSize * 8 / 5)
                    .attr("height", pointSize * 8 / 5)
                    .attr("class", "workform_" + label_type);
            else {
                var r_y = pointSize * 5 / 4;                 // 等边三角形的外接圆半径
                var w_x = (r_y) / 2 * 1.731;   // sqrt(3) = 1.731

                workforms_label
                    .enter()
                    .append("polygon")
                    .attr("points", "0,-" + r_y + " " + w_x + "," + r_y / 2 + " " + (-w_x) + "," + r_y / 2)
                    .attr("class", "workform_" + label_type);
            }

            workforms_label.exit().remove();

            workforms_label
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut)
                .style("fill", function (d) {
                    return colors[+d.eid]
                });
            if(animation.point) {
                workforms_label.transition().duration(timetep)
                    .attr("transform", function (d) {
                        return "translate(" + scaleProjection.p([d.LNG, d.LAT]) + ")";
                    });
            }
            else{
                workforms_label.attr("transform", function (d) {
                        return "translate(" + scaleProjection.p([d.LNG, d.LAT]) + ")";
                    });
            }
        }
    }

    // 对单组block内的聚类统计数据绘制饼状图，采用的策略是enter+exit，重复利用之前的控件（path）
    function drawPie(eid, eCount, data, node) { // 对单组数据画一个饼状图

        // 设置细节查看时的mouseover事件并记录数据
        node.attr("id","pie_"+currentClusterData.length)
            .on("mouseover",mouseOver).on("mouseout",mouseOut);
        var clusterData = {eid:eid,eCount:eCount,data:data};
        currentClusterData.push(clusterData);

        var pie = d3.layout.pie();
        var arcData = pie(eCount);

        // 区域内数据总数
        var datasCount = 0;
        eCount.forEach(function (d) {
            datasCount += d
        });
        //console.log("block data cout : " + datasCount);

        // 求出重心位置
        var pos = [0, 0];
        data.forEach(function (d) {
            pos[0] += +d.LNG;
            pos[1] += +d.LAT;
        });
        pos[0] /= datasCount;
        pos[1] /= datasCount;
        pos = scaleProjection.p(pos);

        if(animation.pie && node.attr("transform") !== null)
            node.transition().duration(timetep)
                .attr("transform", "translate(" + pos +  ")scale("+Math.sqrt(datasCount)+")");
        else node.attr("transform", "translate(" + pos + ")scale("+Math.sqrt(datasCount)+")");

        var innerRadius = 0;
        var outerRadius = 3;
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // enter + exit模式，重复利用上一次的控件，删除多于的控件
        var arcs_g = node.selectAll("path").data(arcData);
        arcs_g.enter().append("path");
        arcs_g.exit().remove();
        arcs_g.attr("fill", function (d, i) {
            return colors[eid[i]];
        });
        if(animation.path) {
            arcs_g.each(function(d,i){
                var arc_label = d3.select(this);
                console.log(arc(d));
                if(arc_label.attr("d") == "M0,3A3,3 0 1,1 0,-3A3,3 0 1,1 0,3Z") // 新创建似的初始值
                    arc_label.transition().duration(timetep/2).attr("d",arc(d));
                else arc_label.attr("d",arc(d));
            });
        }
        else{
            arcs_g.attr("d", function (d) {
                    return arc(d);
                });
        }
    }

    // 基于动态时间绘制数据
    var intervalId;
    var DrawingDynamicData = false;     // 是否在绘制动态时间数据,用于保证不会开出两个动画
    var right_tool = top.frames["right"].frames["right_tool"];
    function drawDynamicData() {
        if (DrawingDynamicData == false) { // 不能用!DrawingDynamicData
            intervalId = setInterval("dynamicTimeInterval()", timetep);
            DrawingDynamicData = true;
        }
    }
    function dynamicTimeInterval() {
        if (currentState.time.isDynamic) {
            var step = currentState.time.end - currentState.time.start;

            // console.log(" " + currentState.time.start + " to " + currentState.time.end);
            drawStaticData(getData(currentState));

            currentState.time.start = new Date(currentState.time.end);
            currentState.time.end = new Date(currentState.time.end.getTime() + step);  // 不能直接用Date型 + step，否则得数不正确

            // 如果时间到头了，则将时间倒回开始
            if (currentState.time.start >= timeLimit.end) {
                currentState.time.start = timeLimit.start;
                currentState.time.end = new Date(timeLimit.start.getTime() + step);  // 不能直接用Date型 + step，否则得数不正确
            }
            else if (currentState.time.end > timeLimit.end) {
                currentState.time.end = timeLimit.end;
                currentState.time.start = new Date(timeLimit.end.getTime() - step);           // 不能直接用Date型 - step，否则得数不正确
            }

            // 刷新控件
            right_tool.slider.update({from:+currentState.time.start,to:+currentState.time.end});
        }
        else {
            clearInterval(intervalId);
            DrawingDynamicData = false;
        }
    }

    // 细节显示事件
    function mouseOver(d, i) {
        if(currentState.classified || d.workFormId == undefined){ // 非聚类d才有数据workFormId
            var id = d3.select(this).attr("id");
            id = +id.substr(4,id.length);
            console.log(id);
            var clusterData = currentClusterData[id];
            showDetailOfClassified(clusterData);
        }
        else{
            showDetailOfUnClassified(d);
        }
    }

    function mouseOut(d, i) {
        d3.select("#tooltip").remove();
    }
    // 把信息放到一个div内的table上显示
    function showDetailOfUnClassified(d){
        d3.select("body").append("div").attr("id","tooltip").transition().duration(200).style("opacity", .9);

        d3.select("#tooltip").html(initToolTip())
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        function initToolTip(){
            return  "<table>" +
                "<tr><td>工单号   : " + "</td><td>" + d.workFormId + "</td></tr>" +
                "<tr><td>经   度  : " + "</td><td>" + d.LNG + "</td></tr>" +
                "<tr><td>纬   度  : " + "</td><td>" + d.LAT + "</td></tr>" +
                "<tr><td>受理时间 : " + "</td><td>" + dateToString(d.acceptTime) + "</td></tr>" +
                "<tr><td>地   点  : " + "</td><td>" + d.standardAddress + "</td></tr>" +
                "<tr><td>事   因  : " + "</td><td>" + d.eventCause + "</td></tr>" +
                "</table>" ;
        }

        // 将Date() 类型的数据转化为数据库的datetime格式
        function dateToString(date){
            function formatDate(d){
                return (d > 9) ? (d) : ("0" + d);
            }

            return (date.getYear()+1900) + "-" + formatDate(date.getMonth()+1) + "-"+formatDate(date.getDate()) + " " +
                formatDate(date.getHours()) +":" + formatDate(date.getMinutes()) + ":" + formatDate(date.getSeconds());

        }
    }

    function showDetailOfClassified(clusterData){
        d3.select("body").append("div").attr("id","tooltip").transition().duration(200).style("opacity", .9);

        d3.select("#tooltip").html(initToolTip())
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        function initToolTip(){
            var eid = clusterData.eid;
            var eCount = clusterData.eCount;

            var datasCount = 0;
            eCount.forEach(function (d) {
                datasCount += d
            });

            function readLine(i){
                return "<tr><td class='css_event"+eid[i]+"'/><td>" + eventType[eid[i]] + " "
                    + eCount[i]+ " ("+ (((eCount[i]/datasCount)*100).toFixed(1)) +"%)"+"</td></tr>"
            }
            var html = "<table>";
            for(var i = 0; i < eid.length; i++) html += readLine(i);
            html += "</table>" ;
            return html;
        }
    }

// getData获取筛选后的数据

// 返回一个初始化的dataState
    function getDataState() {
        var dataState = {};
        dataState.classified = false;        // 是否使用数据聚类
        dataState.eventId = [];              // 筛选出的事件的ID
        dataState.keyWord = "";                // 选中的关键字
        dataState.time = {};                   // 筛选用的时间
        dataState.time.isDynamic = false;  // 是否使用动态时间
        dataState.time.start = new Date("2010/01/01 00:00:00"); // 筛选的起始时间。如果不使用动态时间才有必要设置，否则无效。
        dataState.time.end = new Date("2010/01/31 23:59:59");  // 筛选的终止时间。如果不使用动态时间才有必要设置，否则无效。
        return dataState;
    }

// 利用状态筛选数据,多个筛选分开写并不会影响效率，更多的是代码行数
    function getData(State) {
        var data = {};
        data.data = [];
        data.clusterCount = {};          // 聚类的统计数据
        data.clusterCount.eid = [];      // 聚类统计出的个数不为零的eventId,二维数组,每个block一个数组
        data.clusterCount.eCount = [];   // 对应的eventId的数据统计个数
        data.classified = State.classified;

        var workFormsInSvg = getdatainrect([0, 0], [width, height], workForms);    // 获取屏幕中区块的样本,经纬度筛选

        var workFormsAfterTimeFilter = [];                              // 利用时间筛选数据，其实动态的也是要通过起始和终结时间来计算的，
        workFormsInSvg.forEach(function (d) {
            if (d.acceptTime.getTime() <= State.time.end.getTime() && d.acceptTime.getTime() >= State.time.start.getTime()) {
                workFormsAfterTimeFilter.push(d);
            }
        });                   // 只不过起始和终结时间在UI层自动变化

        // 使用事件进行筛选，并记录选中的eid
        workFormsAfterTimeFilter.forEach(function (d) {
            var eid = eventInFilter(d.eventSet, State.eventId);
            if (eid != -1) {
                d.eid = eid;
                data.data.push(d);
            }
        });

        // 筛选出的数据大于1000,强制聚类或要求聚类
        if (data.data.length > 1000 || State.classified) {
            data = cluster(data);
            isClassied = true;
        }else{
            isClassied = false;
        }

        function eventInFilter(eventset, filter) {
            for (var j = 0; j < eventset.length; j++) {
                var d = eventset[j];
                for (var i = 0; i < filter.length; i++) {
                    if ((+d.eventId) == filter[i]) {
                        return +d.eventId;
                    }
                }
            }
            return -1;
        }

        //console.log(data.data.length + " " + data.clusterCount.eid.length + " " + workFormsAfterTimeFilter.length + " " +
         //   workFormsInSvg.length + " " + workForms.length);
        return data;
    }

    // 加载数据waterdata.json
    function loadData() {
        svg.append("g").attr("class", "workforms_g");
        d3.json("waterdata.json", function (error, root) {
            workForms = root.workforms;
            workForms.forEach(function (d) {
                d.acceptTime = new Date(d.acceptTime.replace(/-/g, "/")); // "2010-01-02"火狐不能解析，谷歌可以，替换-为/ , /-/g表示替换所有-
            });

            if (timeLimit.length == 0) {
                timeLimit.start = workForms[0].acceptTime;
                timeLimit.end = workForms[workForms.length - 1].acceptTime;
                timeLimit.time_length = timeLimit.end - timeLimit.start;
            }

            drawData(currentState);
        });
    }

    // 筛选出在某个矩形块中的点
    function getdatainrect(tl, br, dataset) {
        // 利用经纬度筛选数据，筛选出在屏幕内的数据
        tl = scaleProjection.ip(tl);  // 左上角点的经纬度
        br = scaleProjection.ip(br); // 右下角点的经纬度
        /* 因为天津是没跨域南北极点，所以可以用经纬度的大小比较,
         初始时,返现左小右大，下小上大 [LNG, LAT]
         tl: [116.69422528454052, 39.36887482808491]
         br: [118.28577471545947, 38.70958718464314]
         // 画出tl和br做测试
         d3.selectAll(".circle").remove();
         svg.append("circle").attr("class","circle")
         .attr("transform","translate("+scaleProjection.p(tl)+")").attr("r",'10');
         svg.append("circle").attr("class","circle")
         .attr("transform","translate("+scaleProjection.p(br)+")").attr("r",'10');*/
        var workFormsInSvg = [];
        dataset.forEach(function (d) {
            if (d.LNG < br[0] && d.LNG > tl[0] && d.LAT < tl[1] && d.LAT > br[1]) {
                workFormsInSvg.push(d);
            }
        });     // 选择经纬度范围内的点
        return workFormsInSvg;
    }

    // 对数据进行聚类处理
    function cluster(data) {
        data.classified = true;

        var clusterData = [];
        var clusterCount = [];
        for (var i = 0; i < classBolck[0] * classBolck[1]; i++) {  // 对每一个块初始化
            clusterData.push([]);
            clusterCount.push([]);
            for (var j = 0; j < eventTypeCount; j++) {
                clusterCount[i].push(0);
            }
        }

        var w = width / classBolck[0];
        var h = height / classBolck[1];
        data.data.forEach(function (d) {
            var blockId = getDataClass(d);
            clusterData[blockId].push(d);
            clusterCount[blockId][+d.eid]++;
        });

        // 对统计的数据进行处理，滤掉零项
        for (var blockId = 0; blockId < classBolck[0] * classBolck[1]; blockId++) {
            data.clusterCount.eid.push([]);
            data.clusterCount.eCount.push([]);
            for (var eid = 0; eid < eventTypeCount; eid++) {
                if (clusterCount[blockId][eid] != 0) {
                    data.clusterCount.eid[blockId].push(eid);
                    data.clusterCount.eCount[blockId].push(clusterCount[blockId][eid]);
                }
            }
        }

        data.data = clusterData;
        function getDataClass(d) {
            for (var row = 0; row < classBolck[1]; row++) {
                for (var col = 0; col < classBolck[0]; col++) {
                    var tl = [col * w, row * h];
                    var br = [(col + 1) * w, (row + 1) * h];
                    tl = scaleProjection.ip(tl);
                    br = scaleProjection.ip(br);
                    if (d.LNG < br[0] && d.LNG > tl[0] && d.LAT < tl[1] && d.LAT > br[1]) {
                        return row * classBolck[0] + col;
                    }
                }
            }
        }

        return data;
    }


// 想法，记录上一次的State和数据，如果没变则不必筛选，
// 当数据点超过1000时强制聚类
// 鼠标鱼眼效果

// 外界调用函数，判断是否处于聚类状态
function isInClassied(){
    return isClassied;
}

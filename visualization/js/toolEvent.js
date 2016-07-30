// 引入改变地图模块的接口
{
    var leftMap = top.frames["left_map"];                  //self.parent.parent.frames["left_map"];
    var drawData = leftMap.drawData;
    var currentState = leftMap["currentState"];           // dict 都是引用传递
    var colors = leftMap["colors"];

    var leftView = top.frames["left_view2"];
}

//聚类复选框单击事件
function check1Click(){
    currentState.classified = !currentState.classified; // 注意等于取反可以，但if(!a)并不是a=flase时进入
    drawData(currentState);
}

function btnClk(id){
    var btn = document.getElementById(id);

    var eventId = "";
    for(var i = 6; i < id.length; i++) // 从id中截取eventId
        eventId+=id[i];
    eventId = +eventId;
    console.log(colors[eventId],btn.style.backgroundColor);
    if(btn.style.backgroundColor != colors[eventId]){
        btn.style.backgroundColor = colors[eventId];
        colors[eventId] = btn.style.backgroundColor;
        currentState.eventId.push(eventId);
    }
    else{
        btn.style.backgroundColor = "#8B8B7A";
        for(i = 0; i < currentState.eventId.length; i++) {
            if (eventId == +currentState.eventId[i]) {
                currentState.eventId[i] = currentState.eventId[currentState.eventId.length-1];
                currentState.eventId.pop();
                break;
            }
        }
    }
    drawData(currentState);
    leftView.refresh();
    console.log(currentState.eventId);
}

// 动态播放事件
function dynamicPlay()
{
    var img = document.getElementById("play");
    //console.log(img.src);
    if(currentState.time.isDynamic){
        img.src = "img/bofang.png";
        currentState.time.isDynamic = false;
    }
    else{
        img.src = "img/stop.png";
        currentState.time.isDynamic = true;
    }
    drawData(currentState);
}

var slider; // 记录该对象，用于在main.js中调用
var isDynamic = {notChange:true,value:currentState.time.isDynamic};
$(function () {
    $("#range").ionRangeSlider({
        hide_min_max: true,
        keyboard: true,
        min: +new Date("2010/01/01 00:00:00"),
        max: +new Date("2010/12/31 23:59:59"),
        from: +new Date("2010/02/01 00:00:00"),
        to: +new Date("2010/03/01 00:00:00"),
        step: +(new Date("2010/01/02 00:00:00").getTime() - new Date("2010/01/01 00:00:00").getTime()),
        prettify: function (num) {
            return dateToString(new Date(num));
        },
        type: 'double',
        grid: true,
        prettify_enabled: true,

        onChange: function (data) {
            if(isDynamic.notChange) { // 因为onChange在一次修改中会连续调用
                isDynamic.value = currentState.time.isDynamic;
                isDynamic.notChange = false;
                currentState.time.isDynamic = false;
            }
        },

        onFinish : function(obj){
            currentState.time.start = new Date(obj.from);
            currentState.time.end = new Date(obj.to);

            currentState.time.isDynamic = isDynamic.value;
            isDynamic.notChange = true;
            drawData(currentState);
        }
    });
    slider = $("#range").data("ionRangeSlider");
});

// 将Date() 类型的数据转化为数据库的datetime格式
function dateToString(date){
    function formatDate(d){
        return (d > 9) ? (d) : ("0" + d);
    }

    return (date.getYear()+1900) + "-" + formatDate(date.getMonth()+1) + "-"+formatDate(date.getDate());
    //+ " " + formatDate(date.getHours()) +":" + formatDate(date.getMinutes()) + ":" + formatDate(date.getSeconds());

}

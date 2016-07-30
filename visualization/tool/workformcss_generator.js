var colors = ["#FFB90F", "#FF6EB4", "#FF3030", "#EEEE00", "#EED5B7",
    "#EE3A8C", "#E0EEE0", "#CD661D", "#B22222", "#9B30FF",
    "#8B8B7A", "#8B4500", "#7FFF00", "#4A4A4A", "#458B00",
    "#050505", "#00FF00", "#006400", "#0000AA", "#68228B",
    "#F5F5DC"];


var p = document.createElement("p");
function println(logging) {
    try {
        p.innerHTML += logging.toString() + '<br/>';
    } catch (e) {
        var type = typeof logging;
        p.innerHTML += "the var type is " + type + ", have not function toString()" + "<br/>";
    } finally {
        document.body.appendChild(p);
    }
}

function print(logging) {
    try {
        p.innerHTML += logging.toString();
    } catch (e) {
        var type = typeof logging;
        p.innerHTML += "the var type is " + type + ", have not function toString()" + "<br/>";
    } finally {
        document.body.appendChild(p);
    }
}

for(var i = 0; i < 10; i++){ // 前十个是圆
    println(".css_event" + i+"{");
    println("width:10px;");
    println("height:10px;");
    println("background:"+colors[i]+";");
    println("-moz-border-radius: 5px;");
    println("-webkit-border-radius: 5px;");
    println("border-radius: 5px;");
    println("}")
}

for(i = 10; i < 16; i++){  // 中间六个是rect
    println(".css_event" + i+"{");
    println("width:10px;");
    println("height:10px;");
    println("background:"+colors[i]+";");
    println("}")
}

for(i = 16; i < colors.length; i++){ // 最后是上三角
    println(".css_event" + i+"{");
    println("width:10px;");
    println("height:10px;");
    println("background:"+colors[i]+";");
    println("border-left: 5px solid transparent;");
    println("border-right: 5px solid transparent;");
    println("border-bottom: 10px solid;");
    println("}")
}

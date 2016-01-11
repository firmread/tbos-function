var preFunction = "\n\
#ifdef GL_ES\n\
precision mediump float;\n\
#endif\n\
\n\
#define PI 3.14159265359\n\
\n\
uniform vec2 u_resolution;\n\
uniform vec2 u_mouse;\n\
uniform float u_time;\n\
\n\
float lineJitter = 0.5;\n\
float lineWidth = 7.0;\n\
float gridWidth = 1.0;\n\
float scale = 0.0053;\n\
float zoom = 5.;\n\
vec2 offset = vec2(0.5);\n\
\n\
\n\
float function(in float x) {\n\
    float y = 0.0;\n\
    ";

var postFunction = "\n\
    \n\
    return y;\n\
}\n\
\n\
float rand(vec2 co){\n\
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);\n\
}\n\
\n\
vec3 plot2D(in vec2 _st, in float _width ) {\n\
    const float samples = 3.0;\n\
\n\
    vec2 steping = _width*vec2(scale)/samples;\n\
    \n\
    float count = 0.0;\n\
    float mySamples = 0.0;\n\
    for (float i = 0.0; i < samples; i++) {\n\
        for (float j = 0.0;j < samples; j++) {\n\
            if (i*i+j*j>samples*samples) \n\
                continue;\n\
            mySamples++;\n\
            float ii = i + lineJitter*rand(vec2(_st.x+ i*steping.x,_st.y+ j*steping.y));\n\
            float jj = j + lineJitter*rand(vec2(_st.y + i*steping.x,_st.x+ j*steping.y));\n\
            float f = function(_st.x+ ii*steping.x)-(_st.y+ jj*steping.y);\n\
            count += (f>0.) ? 1.0 : -1.0;\n\
        }\n\
    }\n\
    vec3 color = vec3(1.0);\n\
    if (abs(count)!=mySamples)\n\
        color = vec3(abs(float(count))/float(mySamples));\n\
    return color;\n\
}\n\
\n\
vec3 grid2D( in vec2 _st, in float _width ) {\n\
    float axisDetail = _width*scale;\n\
    if (abs(_st.x)<axisDetail || abs(_st.y)<axisDetail) \n\
        return 1.0-vec3(0.65,0.65,1.0);\n\
    if (abs(mod(_st.x,1.0))<axisDetail || abs(mod(_st.y,1.0))<axisDetail) \n\
        return 1.0-vec3(0.80,0.80,1.0);\n\
    if (abs(mod(_st.x,0.25))<axisDetail || abs(mod(_st.y,0.25))<axisDetail) \n\
        return 1.0-vec3(0.95,0.95,1.0);\n\
    return vec3(0.0);\n\
}\n\
\n\
void main(){\n\
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)-offset;\n\
    st.x *= u_resolution.x/u_resolution.y;\n\
\n\
    scale *= zoom;\n\
    st *= zoom;\n\
\n\
    vec3 color = plot2D(st,lineWidth);\n\
    color -= grid2D(st,gridWidth);\n\
\n\
    gl_FragColor = vec4(color,1.0);\n\
}";





function loadCanvas() {
    var canvas = document.getElementsByClassName("canvas");
    for (var i = 0; i < canvas.length; i++){
        if (canvas[i].id === "custom") {
            canvas[i].id = randomString(16, '#aA');
        }
        billboards[canvas[i].id] = new GlslCanvas(canvas[i]);
    }       
}


function renderCanvas() {
    var IDs = Object.keys(billboards);
    for(var i = 0; i < IDs.length; i++){
        billboards[IDs[i]].setMouse(mouse);
        billboards[IDs[i]].render();
    }
    window.requestAnimFrame(renderCanvas);
}


var billboards = {}; 
function parseSimpleFunction(){

    // parse Simple FUNCTIONS
    var fList = document.querySelectorAll(".simpleFunction");
    for(var i = 0; i < fList.length; i++){
        if (fList[i].hasAttribute("data")){
            id = randomString(16, '#aA');
            var funct = fList[i].getAttribute("data");
  
            // compose glslCanvas
            fList[i].innerHTML = '<div class="function">\
            <canvas id ='+id+' class="canvas" data-fragment="'+preFunction+funct+postFunction+'" width="800px" height="240px" ></canvas>\
            </div>';

            // wakeup the code editor
            var demoEditor = fList[i].getElementsByTagName("div");
            if(demoEditor[0]){
                var editor = CodeMirror(demoEditor[0],{
                    value: funct,
                    viewportMargin: Infinity,
                    lineNumbers: false,
                    matchBrackets: true,
                    mode: "x-shader/x-fragment",
                    keyMap: "sublime",
                    autoCloseBrackets: true,
                    extraKeys: {"Ctrl-Space": "autocomplete"},
                    showCursorWhenSelecting: true,
                    indentUnit: 4
                });
                editor.id = id;

                editor.on("change", function(cm, change) {
                    billboards[cm.id].load(preFunction+cm.getValue()+postFunction);
                    billboards[cm.id].render(true);
                });
            }
        }
    }

}




/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                return window.setTimeout(callback, 1000/60);
         };
})();

/**
 * Provides cancelRequestAnimationFrame in a cross browser way.
 */
window.cancelRequestAnimFrame = (function() {
    return  window.cancelCancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.clearTimeout;
})();




window.onload = function(){
	parseSimpleFunction;
    loadCanvas();

    renderCanvas(); 
};
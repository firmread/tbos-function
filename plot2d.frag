#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float lineJitter = 0.5;
float lineWidth = 7.0;
float gridWidth = 1.7;
float scale = 0.0013;
float zoom = 2.5;
vec2 offset = vec2(0.5);


float function(in float x) {
    float y = 0.0;
    y = x;
    
    //from tbos
    // y = mod(x,0.5); // return x modulo of 0.5
    // y = fract(x); // return only the fraction part of a number
    // y = ceil(x);  // nearest integer that is greater than or equal to x
    // y = floor(x); // nearest integer less than or equal to x
    // y = sign(x);  // extract the sign of x
    // y = abs(x);   // return the absolute value of x
    // y = clamp(x,0.0,1.0); // constrain x to lie between 0.0 and 1.0
    // y = min(0.0,x);   // return the lesser of x and 0.0
    // y = max(0.0,x);   // return the greater of x and 0.0
    
    //from http://blog.hvidtfeldts.net/index.php/2011/07/plotting-high-frequency-functions-using-a-gpu/
    // y = sin(x*x*x)*sin(x);
    
    //from www.flickr.com/photos/kynd/9546075099/
    // y = 1.0 - pow(abs(x),0.5);
    // y = 1.0 - pow(abs(x),1.0);
    // y = 1.0 - pow(abs(x),1.5);
    // y = 1.0 - pow(abs(x),2.0);
    // y = 1.0 - pow(abs(x),2.5);
    // y = pow(cos(u_mouse.x * 0.1 * x), 0.5);
    // y = pow(cos(u_time * x), 0.5);
    // y = pow(cos(PI * x / 2.0), 0.5);
    // y = pow(cos(PI * x / 2.0), 1.0);
    // y = pow(cos(PI * x / 2.0), 1.5);
    // y = pow(cos(PI * x / 2.0), 2.0);
    // y = pow(cos(PI * x / 2.0), 2.5);
    // y = 1.0 - pow(abs(sin(PI * x /2.0)), 0.5);
    // y = 1.0 - pow(abs(sin(PI * x /2.0)), 1.0);
    // y = 1.0 - pow(abs(sin(PI * x /2.0)), 1.5);
    // y = 1.0 - pow(abs(sin(PI * x /2.0)), 2.0);
    // y = 1.0 - pow(abs(sin(PI * x /2.0)), 2.5);
    // y = pow(min(cos(PI * x /2.0), 1.0 - abs(x)), 0.5);
    // y = pow(min(cos(PI * x /2.0), 1.0 - abs(x)), 1.0);
    // y = pow(min(cos(PI * x /2.0), 1.0 - abs(x)), 1.5);
    // y = pow(min(cos(PI * x /2.0), 1.0 - abs(x)), 2.0);
    // y = pow(min(cos(PI * x /2.0), 1.0 - abs(x)), 2.5);
    // y = 1.0 - pow(max(0.0, abs(x) * 2.0 - 1.0), 0.5);
    // y = 1.0 - pow(max(0.0, abs(x) * 2.0 - 1.0), 1.0);
    // y = 1.0 - pow(max(0.0, abs(x) * 2.0 - 1.0), 1.5);
    // y = 1.0 - pow(max(0.0, abs(x) * 2.0 - 1.0), 2.0);
    // y = 1.0 - pow(max(0.0, abs(x) * 2.0 - 1.0), 2.5);
    
    return y;
}


float rand(vec2 co){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}

vec3 plot2D(in vec2 _st, in float _width ) {
    const float samples = 3.0;

    vec2 steping = _width*vec2(scale)/samples;
    
    float count = 0.0;
    float mySamples = 0.0;
    for (float i = 0.0; i < samples; i++) {
        for (float j = 0.0;j < samples; j++) {
            if (i*i+j*j>samples*samples) 
                continue;
            mySamples++;
            float ii = i + lineJitter*rand(vec2(_st.x+ i*steping.x,_st.y+ j*steping.y));
            float jj = j + lineJitter*rand(vec2(_st.y + i*steping.x,_st.x+ j*steping.y));
            float f = function(_st.x+ ii*steping.x)-(_st.y+ jj*steping.y);
            count += (f>0.) ? 1.0 : -1.0;
        }
    }
    vec3 color = vec3(1.0);
    if (abs(count)!=mySamples)
        color = vec3(abs(float(count))/float(mySamples));
    return color;
}

vec3 grid2D( in vec2 _st, in float _width ) {
    float axisDetail = _width*scale;
    if (abs(_st.x)<axisDetail || abs(_st.y)<axisDetail) 
        return 1.0-vec3(0.65,0.65,1.0);
    if (abs(mod(_st.x,1.0))<axisDetail || abs(mod(_st.y,1.0))<axisDetail) 
        return 1.0-vec3(0.80,0.80,1.0);
    if (abs(mod(_st.x,0.25))<axisDetail || abs(mod(_st.y,0.25))<axisDetail) 
        return 1.0-vec3(0.95,0.95,1.0);
    return vec3(0.0);
}

void main(){
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)-offset;
    st.x *= u_resolution.x/u_resolution.y;

    scale *= zoom;
    st *= zoom;

    vec3 color = plot2D(st,lineWidth);
    color -= grid2D(st,gridWidth);

    gl_FragColor = vec4(color,1.0);
}
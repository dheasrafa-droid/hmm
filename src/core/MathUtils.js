/**
 * MathUtils.js
 * DSRT Engine Math Utilities 
 * Includes flags, diff, flow, RNG, TypedArray normalization/denormalization
 * Fully documented with JSDoc
 */

/** @typedef {Float32Array|Uint32Array|Uint16Array|Uint8Array|Int32Array|Int16Array|Int8Array} TypedArray */

/** Debug / flow flags */
export const FLAGS = {
    DEBUG_FLOW: false,
    DEBUG_MATH: false,
    ENABLE_SEEDED_RANDOM: true,
    ENABLE_NORMALIZE_LOG: false
};

const _lut = Array.from({length:256}, (_,i)=>i.toString(16).padStart(2,'0'));
let _seed = 1234567;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** Clamp value */
export function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

/** Clamp 0-1 */
export function clamp01(v){return clamp(v,0,1);}

/** Linear interpolation */
export function lerp(x,y,t){return (1-t)*x + t*y;}

/** Smoothstep cubic */
export function smoothstep(x,min,max){if(x<=min)return 0;if(x>=max)return 1;x=(x-min)/(max-min);return x*x*(3-2*x);}

/** Smootherstep quintic */
export function smootherstep(x,min,max){if(x<=min)return 0;if(x>=max)return 1;x=(x-min)/(max-min);return x*x*x*(x*(x*6-15)+10);}

/** Euclidean modulo */
export function euclideanModulo(n,m){return ((n%m)+m)%m;}

/** Map linear */
export function mapLinear(x,a1,a2,b1,b2){return b1+(x-a1)*(b2-b1)/(a2-a1);}

/** Inverse Lerp */
export function inverseLerp(x,y,value){return x!==y?(value-x)/(y-x):0;}

/** Damp */
export function damp(x,y,lambda,dt){return lerp(x,y,1-Math.exp(-lambda*dt));}

/** Pingpong */
export function pingpong(x,length=1){return length-Math.abs(euclideanModulo(x,length*2)-length);}

/** Random int */
export function randInt(low,high){return low+Math.floor(Math.random()*(high-low+1));}

/** Random float */
export function randFloat(low,high){return low+Math.random()*(high-low);}

/** Random float spread */
export function randFloatSpread(range){return range*(0.5-Math.random());}

/** Seeded random */
export function seededRandom(s){if(s!==undefined)_seed=s;let t=_seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}

/** Generate UUID */
export function generateUUID(){
    const d0=Math.random()*0xffffffff|0;
    const d1=Math.random()*0xffffffff|0;
    const d2=Math.random()*0xffffffff|0;
    const d3=Math.random()*0xffffffff|0;
    return [
        _lut[d0&0xff], _lut[d0>>8&0xff], _lut[d0>>16&0xff], _lut[d0>>24&0xff], '-',
        _lut[d1&0xff], _lut[d1>>8&0xff], '-', _lut[d1>>16&0x0f|0x40], _lut[d1>>24&0xff], '-',
        _lut[d2&0x3f|0x80], _lut[d2>>8&0xff], '-', _lut[d2>>16&0xff], _lut[d2>>24&0xff],
        _lut[d3&0xff], _lut[d3>>8&0xff], _lut[d3>>16&0xff], _lut[d3>>24&0xff]
    ].join('').toLowerCase();
}

/** Degrees to radians */
export function degToRad(d){return d*DEG2RAD;}

/** Radians to degrees */
export function radToDeg(r){return r*RAD2DEG;}

/** Check power of two */
export function isPowerOfTwo(v){return (v&(v-1))===0&&v!==0;}

/** Ceil power of two */
export function ceilPowerOfTwo(v){return Math.pow(2,Math.ceil(Math.log(v)/Math.LN2));}

/** Floor power of two */
export function floorPowerOfTwo(v){return Math.pow(2,Math.floor(Math.log(v)/Math.LN2));}

/** Sign */
export function sign(x){return (x>0)-(x<0);}

/** Fractional part */
export function fract(x){return x-Math.floor(x);}

/** Snap value to step */
export function snap(x,step){return Math.round(x/step)*step;}

/** Normalize to typed array */
export function normalize(value,array){
    switch(array.constructor){
        case Float32Array:return value;
        case Uint32Array:return Math.round(value*4294967295);
        case Uint16Array:return Math.round(value*65535);
        case Uint8Array:return Math.round(value*255);
        case Int32Array:return Math.round(value*2147483647);
        case Int16Array:return Math.round(value*32767);
        case Int8Array:return Math.round(value*127);
        default:throw new Error('Invalid type');
    }
}

/** Denormalize from typed array */
export function denormalize(value,array){
    switch(array.constructor){
        case Float32Array:return value;
        case Uint32Array:return value/4294967295;
        case Uint16Array:return value/65535;
        case Uint8Array:return value/255;
        case Int32Array:return Math.max(value/2147483647,-1);
        case Int16Array:return Math.max(value/32767,-1);
        case Int8Array:return Math.max(value/127,-1);
        default:throw new Error('Invalid type');
    }
}

/** Diff float */
export function diffFloat(a,b){return Math.abs(a-b);}

/** Diff Vec2 */
export function diffVec2(v1,v2){
    const dx=v1.x-v2.x;
    const dy=v1.y-v2.y;
    return {dx,dy,length:Math.sqrt(dx*dx+dy*dy)};
}

/** Diff Vec3 */
export function diffVec3(v1,v2){
    const dx=v1.x-v2.x;
    const dy=v1.y-v2.y;
    const dz=v1.z-v2.z;
    return {dx,dy,dz,length:Math.sqrt(dx*dx+dy*dy+dz*dz)};
}

/** Diff TypedArray */
export function diffTypedArray(arr1,arr2){
    if(arr1.length!==arr2.length)throw new Error('Array length mismatch');
    const diffArray=new Float32Array(arr1.length);
    let totalDiff=0;
    for(let i=0;i<arr1.length;i++){
        diffArray[i]=Math.abs(arr1[i]-arr2[i]);
        totalDiff+=diffArray[i];
    }
    return {diffArray,totalDiff};
}

/** MathUtils export */
export const MathUtils={
    FLAGS, clamp, clamp01, lerp, smoothstep, smootherstep,
    euclideanModulo,mapLinear,inverseLerp,damp,pingpong,
    randInt,randFloat,randFloatSpread,seededRandom,generateUUID,
    degToRad,radToDeg,isPowerOfTwo,ceilPowerOfTwo,floorPowerOfTwo,
    sign,fract,snap,normalize,denormalize,
    diffFloat,diffVec2,diffVec3,diffTypedArray
};
MathUtils.__dsrt_origin = 'dsrt.math.utils';
MathUtils.__dsrt_id = 'MathUtils.v1.0.0';
};

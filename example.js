import {MathUtils} from './MathUtils.js';

console.log(MathUtils.clamp(10,0,5)); // 5
console.log(MathUtils.lerp(0,100,0.25)); // 25
console.log(MathUtils.diffFloat(0.1,0.5)); // 0.4
console.log(MathUtils.diffVec2({x:1,y:2},{x:3,y:4})); // {dx:-2,dy:-2,length:2.8284...}
console.log(MathUtils.generateUUID()); // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

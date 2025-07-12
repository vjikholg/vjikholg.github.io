// TODO: modify nodes to properly display matrices, group elements, id, etc., provide traversal formula on how this element was obtained in runtime
// TODO: maybe "slow down" generation - show step by step of how group is generated, populated, etc. GENERATE GRAPH DURING MAKEGROUP would be really cool 


import { CayleyGraph } from "./cayleygraph.js"; 
import { FiniteGroup } from "./structs/finitegroup.js";
import { Matrix }    from "./structs/matrix.js";

const allGroups = await fetch("../../assets/js/math-modules/cayley-grapher/data/output.json").then(res => res.json());
const groupData = allGroups.find(x => x.name === "c2^2xc4"); 
const mtc = groupData.generators.map((mtx) => {
    const temp = new Matrix(groupData.glforder, mtx.length); 
    temp.contents = mtx; 
    return temp;
})
const group1 = new FiniteGroup(mtc, groupData.name); 
const wrapper = document.querySelector('.graph-wrapper');

// distance we consider a comfortable zoom
const DIST = 200;                 // smaller → closer in

const ELEV = Math.PI/4 - 0.1; // rotate 90 degrees down
const AZIM = Math.PI/3 - 0.5; // 0 degrees azimuth-angle 

const CAMERA_POS = {
    x: DIST * Math.sin(ELEV) * Math.cos(AZIM),
    y: DIST * Math.cos(ELEV),
    z: DIST * Math.sin(ELEV) * Math.sin(AZIM)
}

let cayleyGraph = new CayleyGraph(group1, 'force-graph').graph
    .width(wrapper.clientWidth)
    .height(wrapper.clientHeight)
    .cameraPosition(CAMERA_POS);

window.addEventListener("resize", () => { 
    cayleyGraph
        .width(wrapper.clientWidth)
        .height(wrapper.clientHeight)
})

 

// const sel = document.getElementById('group-select');
// 
// allGroups.forEach((g,i) => {
//     const opt = document.createElement('option');
//     opt.value = i; 
//     opt.innerHTML = g.name; 
//     sel.appendChild(opt); 
// }); 
// 
// sel.addEventListener('change', (e) => {
//    const idx = parseInt(sel.value);
//    const groupData = allGroups[idx]; 
//
//    const mtc = groupData.generators.map((mtx) => {
//    const temp = new Matrix(groupData.glforder, mtx.length); 
//    temp.contents = mtx; 
//    return temp;
//    }); 
//
//    const group = new FiniteGroup(mtc, groupData.name);
//    currentGraph.update(group);
//    
//
//
// });
//
// sel.dispatchEvent(new Event('change'));




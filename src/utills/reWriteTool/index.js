import initFreehandRoiTool from './FreehandRoiTool';
import initProbeTool from './ProbeTool';
import initEllipticalRoiTool from './EllipticalRoiTool';


const init = (props)=>{
    initFreehandRoiTool(props);
    initProbeTool(props);
    initEllipticalRoiTool(props);
}
export default init
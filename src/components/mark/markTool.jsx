import React, { useEffect, useState } from 'react';
import { Route, withRouter } from "dva/router";
import { connect } from 'dva';
import '@/assets/less/mark/tool.less';
import { dcm4cheepath, dicomListByStudyId, login, getToken } from '@/service/index';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as markToolIcon from '@/utills/svgIcon.jsx';
import classNames from 'classnames'
const MarkTool = (props) => {
    let [first, setFirst] = useState(false)
    let [buttons, setButtons] = useState([
        {
            id: 'Login',
            name: '登录',
            icon: '',
            disabled: false,
            active: false
        },
        {
            id: 'Pan',
            name: '移动',
            icon: markToolIcon.moveIcon,
            disabled: false,
            active: false
        },
        // {
        //     id: 'ZoomMouseWheel',
        //     name: '缩放',
        //     icon: markToolIcon.zoomMouseWheelIcon,
        //     disabled: false,
        //     active: false
        // },
        {
            id: 'Magnify',
            name: '放大',
            icon: markToolIcon.magnifylIcon,
            disabled: false,
            active: false
        },
        {
            id: 'Wwwc',
            name: '调窗',
            icon: markToolIcon.wwwclIcon,
            disabled: false,
            active: false
        },
        {
            id: 'Invert',//需要找一找
            name: '负相',
            icon: markToolIcon.invertIcon,
            disabled: false,
            active: false
        },
        {
            id: 'Transform',
            name: '变换',
            icon: markToolIcon.transformIcon,
            disabled: false,
            showChild: false,
            children: [
                {
                    id: 'Rotation',
                    name: '向右',//options: { rotation: 90 }
                    icon: markToolIcon.rightIcon,
                    disabled: false,
                    active: false,
                    parent: 'Transform'
                },
                {
                    id: 'Hflip',
                    name: '左右',
                    icon: markToolIcon.hflipIcon,
                    disabled: false,
                    active: false,
                    parent: 'Transform'
                },
                {
                    id: 'Vflip',
                    name: '上下',
                    icon: markToolIcon.vflipIcon,
                    disabled: false,
                    active: false,
                    parent: 'Transform'
                },
            ]
        },
        {
            id: 'FreehandRoi',
            name: '画笔',
            icon: markToolIcon.freehandRoiIcon,
            disabled: false,
            active: false
        },
        {
            id: 'RectangleRoi',
            name: '矩形',
            icon: markToolIcon.rectangleRoiIcon,
            disabled: false,
            active: false
        },
        {
            id: 'EllipticalRoi',
            name: '椭圆',
            icon: markToolIcon.ellipticalRoiIcon,
            disabled: false,
            active: false
        },
        {
            id: 'Probe',
            name: '点',
            icon: markToolIcon.probeIcon,
            disabled: false,
            active: false
        },
        {
            id: 'FreehandScissors',
            name: '测试',
            icon: markToolIcon.probeIcon,
            disabled: false,
            active: false
        },
        {
            id: 'More',
            name: '更多',
            icon: markToolIcon.moreIcon,
            disabled: false,
            showChild: false,
            children: [
                {
                    id: 'WwwcRegion',
                    name: 'ROI',
                    icon: markToolIcon.roiIcon,
                    disabled: false,
                    active: false,
                    parent: 'More'
                },
                {
                    id: 'DownLoad',
                    name: '下载',
                    icon: markToolIcon.downloadIcon,
                    disabled: false,
                    active: false,
                    parent: 'More'
                },
            ]
        },
        {
            id: 'Reset',
            name: '重置',
            icon: markToolIcon.resetIcon,
            disabled: false,
            active: false
        },
        {
            id: 'ADD',
            name: '增加',
            icon: markToolIcon.resetIcon,
            disabled: false,
            active: false
        },
        {
            id: 'ERASE',
            name: '减少',
            icon: markToolIcon.resetIcon,
            disabled: false,
            active: false
        },

    ])
    const eventsObj = {
        Login: () => {
            login({ "accountName": "jf", "password": "123456" }, 'PUT').then();
        },
        Pan: (viewport, elements, type) => {
            cornerstoneTools.setToolActive('Pan', { mouseButtonMask: type ? type : 2 });
        },
        FreehandRoi: () => {
            sessionStorage.removeItem('updateMarkType')
            cornerstoneTools.setToolActive('FreehandRoi', { mouseButtonMask: 1, });
        },
        ZoomMouseWheel: (viewport, elements, type) => {
            cornerstoneTools.setToolActive('ZoomMouseWheel', { mouseButtonMask: type ? type : 4 });
        },
        Magnify: () => {
            cornerstoneTools.setToolActive('Magnify', { mouseButtonMask: 1 });
        },
        Wwwc: () => {
            cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
        },
        RectangleRoi: () => {
            cornerstoneTools.setToolActive('RectangleRoi', { mouseButtonMask: 1 });
        },
        WwwcRegion: () => {
            cornerstoneTools.setToolActive('WwwcRegion', { mouseButtonMask: 1 });
        },
        Probe: () => {
            cornerstoneTools.setToolActive('Probe', { mouseButtonMask: 1 });
        },
        EllipticalRoi: () => {
            cornerstoneTools.setToolActive('EllipticalRoi', { mouseButtonMask: 1 });
        },
        FreehandScissors: () => {
            cornerstoneTools.setToolActive('FreehandScissors', { mouseButtonMask: 1 });
        },
        Invert: (viewport, elements) => {
            viewport.invert = !viewport.invert;
            cornerstone.setViewport(elements, viewport);
        },
        Reset: (viewport, elements) => {
            cornerstone.reset(elements)
        },
        Hflip: (viewport, elements) => {
            viewport.hflip = !viewport.hflip;
            cornerstone.setViewport(elements, viewport);
        },
        Vflip: (viewport, elements) => {
            viewport.vflip = !viewport.vflip;
            cornerstone.setViewport(elements, viewport);
        },
        Rotation: (viewport, elements) => {
            viewport.rotation += 90;
            cornerstone.setViewport(elements, viewport);
        },
        DownLoad: () => {
            console.log('下载')
        },
        Transform: (viewport, elements, type, toolName) => {
            triggerTool(toolName)
        },
        More: (viewport, elements, type, toolName) => {
            triggerTool(toolName)
        },
        ADD:()=>{
            changeScissorsModle('ADD')
        },
        ERASE:()=>{
            changeScissorsModle('ERASE')
        }
    }
    const toolClick = (toolName) => {
        if (toolName === 'Login') {
            eventsObj[toolName]()
        } else {
            const elements = document.querySelector('.cornerstone-element');
            let viewport = cornerstone.getViewport(elements);
            eventsObj[toolName](viewport, elements, 1, toolName)
        }
        buttons = [...buttons]
        buttons.map(item => {
            item.children && item.children.map(btem => {
                if (btem.id === toolName) {
                    btem.active = true;
                } else {
                    btem.active = false;
                }
            })
            if (item.id === toolName) {
                item.active = true;
            } else {
                item.active = false;
            }
        })
        setButtons(buttons)
    }
    const addAllTools = () => {
        cornerstoneTools.addTool(cornerstoneTools['PanTool']);
        cornerstoneTools.addTool(cornerstoneTools['FreehandRoiTool']);
        cornerstoneTools.addTool(cornerstoneTools['ZoomMouseWheelTool']);
        cornerstoneTools.addTool(cornerstoneTools['MagnifyTool']);
        cornerstoneTools.addTool(cornerstoneTools['WwwcTool']);
        cornerstoneTools.addTool(cornerstoneTools['RectangleRoiTool']);
        cornerstoneTools.addTool(cornerstoneTools['WwwcRegionTool']);
        cornerstoneTools.addTool(cornerstoneTools['ProbeTool']);
        cornerstoneTools.addTool(cornerstoneTools['EllipticalRoiTool']);
        cornerstoneTools.addTool(cornerstoneTools['FreehandScissorsTool']);

    }
    useEffect(() => {
        if (props.publicInfo.imgLoaded === true && first === false) {
            addAllTools();
            const elements = document.querySelector('.cornerstone-element');
            let viewport = cornerstone.getViewport(elements);
            ['Pan', 'ZoomMouseWheel', 'Wwwc'].map((toolName) => {
                eventsObj[toolName](viewport)
            })

            setFirst(true);

        }
    }, [props.publicInfo.imgLoaded])

    const triggerTool = (toolName) => {
        buttons = [...buttons]
        buttons.map(item => {
            if (item.id === toolName) {
                item.showChild = !item.showChild;
            }
        })
        setButtons(buttons)
    }

    const getToolDom = (item, index) => {
        return <button key={`tool${index}`} className={classNames({ more: item.children }, { active: item.active })} onClick={() => toolClick(item.id)}>
            {item.icon}
            <div>{item.name}</div>
        </button>;
    }
    const changeScissorsModle = (type) => {
        const obj = {
            'ADD': () => { sessionStorage.setItem('updateMarkType', type) },
            'ERASE': () => { sessionStorage.setItem('updateMarkType', type) },
            // 'MOREPOINT': () => { sessionStorage.setItem('updateMarkType', type) }
        }
        obj[type]();
    }
    return (
        <div className='toolBox'>
            {
                buttons.map((item, index) => {
                    return !item.children ? getToolDom(item, index) : <div key={`atool${index}`} className='moreToolParent'>
                        {getToolDom(item, index)}
                        {item.showChild ? <div className='childBox' key={`btool${index}`}>
                            {item.children.map((btem, index2) => {
                                return getToolDom(btem, index2)
                            })}
                        </div> : null}
                    </div>
                })
            }
            {/* <button onClick={() => changeScissorsModle('ADD')}>增加</button>
            <button onClick={() => changeScissorsModle('ERASE')}>减少</button> */}
            {/* <button onClick={() => changeScissorsModle('MOREPOINT')}>修改多个点</button> */}
        </div>
    );
}
export default connect(
    ({ publicInfo }) => ({ publicInfo })
)(withRouter(MarkTool));


import React, { useEffect, useState } from 'react';
import { Route, withRouter } from "dva/router";
import { connect } from 'dva';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';

import '@/assets/less/mark/tool.less';

const MarkInfoPop = (props) => {
    const [inputText1,setInputText1] = useState('')
    const { showMarkInforEdite,curOptImg ,dicomListByStudyIdList} = props.publicInfo;
    const {type} = showMarkInforEdite;
    const certain = () => {
        const element = document.querySelector('.cornerstone-element');
        const allData = cornerstoneTools.getElementToolStateManager(element).get(element, type).data;
        const num = allData.length - 1;
        allData[num]['location'] = inputText1;
        allData[num]['locationCode'] = inputText1;
        allData[num]['frameIndex'] = 0
        allData[num]['imagePath'] = `${dicomListByStudyIdList[curOptImg].studyUid}_${dicomListByStudyIdList[curOptImg].seriesUid}_${dicomListByStudyIdList[curOptImg].sopInstanceId}_0`;
        allData[num]['lesionNamingNumber'] = num;
        allData[num]['measurementNumber'] = num;
        allData[num]['patientId'] = '';
        allData[num]['seriesInstanceUid'] = dicomListByStudyIdList[curOptImg].seriesUid;
        allData[num]['sopInstanceUid']= dicomListByStudyIdList[curOptImg].sopInstanceId;
        allData[num]['studyInstanceUid']= dicomListByStudyIdList[curOptImg].studyUid;
        allData[num]['timepointId'] = 'TimepointId';
        allData[num]['toolType'] = type;
        allData[num]['_id'] = allData[num].uuid;
        cornerstone.updateImage(element);
        props.dispatch({
            type: "publicInfo/setAllMarkListInfo",
            allMarkListInfo: JSON.parse(JSON.stringify(allData))
        });
        props.dispatch({
            type: "publicInfo/setShowMarkInforEdite",
            showMarkInforEdite: {
                type:type,
                show: false,
                left: 0,
                top: 0
            }
        });
        setInputText1('')
    }
    const cancel = () => {
        const element = document.querySelector('.cornerstone-element');
        const allData = cornerstoneTools.getElementToolStateManager(element).get(element, type).data;
        cornerstoneTools.removeToolState(
            element,
            type,
            allData[allData.length - 1]
        );
        cornerstone.updateImage(element);
        props.dispatch({
            type: "publicInfo/setAllMarkListInfo",
            allMarkListInfo: JSON.parse(JSON.stringify(allData))
        });
        props.dispatch({
            type: "publicInfo/setShowMarkInforEdite",
            showMarkInforEdite: {
                type:type,
                show: false,
                left: 0,
                top: 0
            }
        });
        setInputText1('')
    }
    const changeInput1 = (val)=>{
        console.log(2222,val)
        setInputText1(val.target.value)
    }
    return (
        <>
            {showMarkInforEdite.show ?
                <div id="markInforEdite" style={{ top: `${showMarkInforEdite.top - 150}px`, left: `${showMarkInforEdite.left}px` }}>
                    <input type="text" value={inputText1||''} onChange={(val)=>changeInput1(val)} />
                    <div>
                        <button onClick={() => cancel()}>取消</button>
                        <button onClick={() => certain()}>确定</button>
                    </div>
                </div> : null
            }
        </>

    );
}
export default connect(
    ({ publicInfo }) => ({ publicInfo })
)(withRouter(MarkInfoPop));
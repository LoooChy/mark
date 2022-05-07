import React, { useEffect, useState } from 'react';
import { Route, withRouter } from "dva/router";
import { connect } from 'dva';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstone from 'cornerstone-core';
import '@/assets/less/mark/tool.less';

const Test1 = (props) => {
    const { allMarkListInfo } = props.publicInfo;

    const onDelete = (index) => {
        const element = document.querySelector('.cornerstone-element');
        const allData = cornerstoneTools.getElementToolStateManager(element).get(element, 'FreehandRoi').data;
        cornerstoneTools.removeToolState(
            element,
            'FreehandRoi',
            allData[index]
        );
        cornerstone.updateImage(element);
        props.dispatch({
            type: "publicInfo/setAllMarkListInfo",
            allMarkListInfo: JSON.parse(JSON.stringify(allData))
        });
    }
    const onHideOrShow = (index, flag) => {
        const element = document.querySelector('.cornerstone-element');
        const allData = cornerstoneTools.getElementToolStateManager(element).get(element, 'FreehandRoi').data;
        allData[index].visible = flag;
        cornerstone.updateImage(element);
        props.dispatch({
            type: "publicInfo/setAllMarkListInfo",
            allMarkListInfo: JSON.parse(JSON.stringify(allData))
        });
    }
    return (
        <>
            {
                allMarkListInfo.map((item, index) => <div key={`allMarkListInfo${index}`}>
                    <span>{index}</span>
                    {item.visible ? <span onClick={() => onHideOrShow(index, false)}>隐藏</span> : <span onClick={() => onHideOrShow(index, true)}>显示</span>}
                    <span onClick={() => onDelete(index)}>删除</span>
                </div>)
            }
        </>

    );
}
export default connect(
    ({ publicInfo }) => ({ publicInfo })
)(withRouter(Test1));
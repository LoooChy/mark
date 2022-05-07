import React, { useEffect, useState } from 'react';
import { Route, withRouter } from "dva/router";
import { connect } from 'dva';
import '@/assets/less/mark/tool.less';
import { dcm4cheepath, dicomListByStudyId, login, getToken } from '@/service/index';
import MarkTool from '@/components/mark/markTool';
import MarkImgList from '@/components/mark/markImgList';
import MarkInfoPop from '@/components/mark/markInfoPop';
import Test1 from '@/components/test1';

import { initCornerstone, requestMetadata } from '@/utills/cornerstoneMark.js';
import init from '@/utills/reWriteTool/index.js';

const Mark = (props) => {
    let imgList = [];
    useEffect(() => {
        init(props)
    }, [])
    const requestImage = (url, index, access_token, props) => {
        let request = new XMLHttpRequest();
        request.responseType = 'blob';
        url += '/rendered';
        request.open('get', url, true);
        request.setRequestHeader('Authorization', 'Bearer ' + access_token);
        request.setRequestHeader('Accept', 'image/jpeg');
        request.onreadystatechange = e => {
            if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                let img = document.createElement('img');
                img.src = window.URL.createObjectURL(request.response);
                imgList = [...imgList, {
                    url: window.URL.createObjectURL(request.response),
                    key: index
                }]
                imgList.sort((a, b) => { return a.key - b.key });
                props.dispatch({
                    type: "publicInfo/setMarkImgList",
                    markImgList: imgList
                });
            }
        };
        request.send(null);
    };


    useEffect(() => {
        dcm4cheepath({ unused: 0 }, 'GET').then((res) => {
            const root = res.rs;
            props.dispatch({
                type: "publicInfo/setDcm4cheepath",
                dcm4cheepathRoot: root
            });
            dicomListByStudyId({ studyDrId: 5 }, 'GET').then((res) => {
                const list = res.data || [];
                props.dispatch({
                    type: "publicInfo/setDicomListByStudyIdList",
                    dicomListByStudyIdList: list
                });
                getToken({ unused: 0 }, 'GET').then((res) => {
                    props.dispatch({
                        type: "publicInfo/setAccess_token",
                        access_token: res.data.access_token
                    });
                    initCornerstone(res.data.access_token, props);
                    list.map((item, index) => {
                        const studies = item.studyUid;
                        const series = item.seriesUid;
                        const instances = item.sopInstanceId;
                        let url = `${root}/studies/${studies}/series/${series}/instances/${instances}/frames/1`;
                        if (index === 0) {
                            let metadataUrl = `${root}/studies/${studies}/series/${series}/instances/${instances}/metadata`;
                            requestMetadata(metadataUrl, res.data.access_token, props)
                        }
                        requestImage(url, index, res.data.access_token, props)
                    });
                })
            })
        });
    }, [])

    return (
        <>
            <MarkTool />
            <div className='markContent'>
                <MarkImgList />
                <div className='canvasBox' onContextMenu={(e) => e.preventDefault()}>
                    <div tabIndex={0} className="cornerstone-element" style={{ width: '100%', height: '100%' }}></div>
                    <MarkInfoPop />
                </div>
                <div className='optDiy'>
                    <Test1/>
                </div>
            </div>
        </>
    );
}
export default connect(
    ({ publicInfo }) => ({ publicInfo })
)(withRouter(Mark));
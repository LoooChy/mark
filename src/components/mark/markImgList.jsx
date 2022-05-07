import React, { useEffect, useState } from 'react';
import { Route, withRouter } from "dva/router";
import { connect } from 'dva';
import '@/assets/less/mark/tool.less';
import { dcm4cheepath, dicomListByStudyId, login, getToken } from '@/service/index';
import { initCornerstone, requestMetadata } from '@/utills/cornerstoneMark.js';


const MarkImgList = (props) => {
    let { curOptImg } = props.publicInfo;
    let imgList = props.publicInfo?.markImgList || [];
    const toolClick = (index) => {
        const { dicomListByStudyIdList, dcm4cheepathRoot, access_token } = props.publicInfo;
        const { studyUid, seriesUid, sopInstanceId } = dicomListByStudyIdList[index];
        const url = `${dcm4cheepathRoot}/studies/${studyUid}/series/${seriesUid}/instances/${sopInstanceId}/metadata`;
        props.dispatch({
            type: "publicInfo/setImgLoaded",
            imgLoaded: false
        });
        props.dispatch({
            type: "publicInfo/setCurOptImg",
            curOptImg: index
        });
        requestMetadata(url, access_token);
    }
    return (
        <div className='imgList'>
            {
                imgList.map((item, index) => <div key={`imgList${index}`} className={curOptImg === index ? 'curent' : ''} ><img alt='' src={item.url} onClick={() => toolClick(index)} /></div>)
            }
        </div>
    );
}
export default connect(
    ({ publicInfo }) => ({ publicInfo })
)(withRouter(MarkImgList));
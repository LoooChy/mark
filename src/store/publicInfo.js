export default {
  namespace: 'publicInfo',
  state: {
    dcm4cheepathRoot: '',
    dicomListByStudyIdList: [],
    access_token: '',
    markImgList: [],
    imgLoaded: false,
    showMarkInforEdite: {
      type:'',
      show: false,
      left: 0,
      top: 0
    },
    allMarkListInfo: [],
    curOptImg:0,
    updateMarkType:''
  },
  reducers: {
    setDcm4cheepath: (state, action) => ({
      ...state,
      dcm4cheepathRoot: action[`dcm4cheepathRoot`]
    }),
    setAccess_token: (state, action) => ({
      ...state,
      access_token: action[`access_token`]
    }),
    setMarkImgList: (state, action) => ({
      ...state,
      markImgList: action[`markImgList`]
    }),
    setDicomListByStudyIdList: (state, action) => ({
      ...state,
      dicomListByStudyIdList: action[`dicomListByStudyIdList`]
    }),
    setImgLoaded: (state, action) => ({
      ...state,
      imgLoaded: action[`imgLoaded`]
    }),
    setAllMarkListInfo: (state, action) => ({
      ...state,
      allMarkListInfo: action[`allMarkListInfo`]
    }),
    setShowMarkInforEdite: (state, action) => ({
      ...state,
      showMarkInforEdite: action[`showMarkInforEdite`]
    }),
    setCurOptImg: (state, action) => ({
      ...state,
      curOptImg: action[`curOptImg`]
    }),
    setUpdateMarkType: (state, action) => ({
      ...state,
      updateMarkType: action[`updateMarkType`]
    }),
    
   
  }
}
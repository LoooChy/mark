import React from 'react';
import dva from 'dva';
import { persistEnhancer } from 'dva-model-persist';
import storage from 'dva-model-persist/lib/storage';
import { ConfigProvider } from 'antd';
import App from './routers';
import './assets/init/normalize.css';
import './assets/less/index.less';
import createHistory from 'history/createBrowserHistory';
import publicInfo from './store/publicInfo.js';

import 'amfe-flexible';
import 'antd/dist/antd.css';
import locale from 'antd/es/locale/zh_CN';
import 'moment/locale/zh-cn';
//@ts-ignore
let test = dva.default || dva;
const app = test({
  history: createHistory(),
  // extraEnhancers: [
  //   persistEnhancer({
  //     key: 'model',
  //     storage
  //   })
  // ],
  // 以下为新增内容
  // onReducer: r => (state, action) => {
  //   // 登出,清空model
  //   if (action.type === 'login/logout') {
  //     return {};
  //   } else {
  //     return r(state, action);
  //   }
  // },
});
app.model(publicInfo);

app.router((obj: any) => (
  <ConfigProvider locale={locale}>
    <App
      history={obj.history}
      match={obj.match}
      location={obj.location}
      // getState={obj.app._store.getState}
      dispatch={obj.app._store.dispatch}
    />
  </ConfigProvider>
));
app.start('#root');

import { message } from 'antd';
import axios from 'axios';
// data传入必须是对象
export default function ajax(url: string, data: object, method = 'GET', type = '') {
  let promise: any;

  // 请求拦截
  axios.interceptors.request.use(
    config => {
      config.headers = {
        // 'version': '1.0.0',
        // 'Content-Type': 'application/json'
      };
      // if (window.location.href.indexOf('login') === -1) {
        config.headers['token'] = '%5Bobject%20Object%5D';
        config.headers['Content-Type'] = 'application/json'
      // }
      return config;
    },
    err => {
      return Promise.reject(err);
    }
  );

  if (method === 'GET') {
    promise = axios.get(url, { params: data });
  } else if(method === 'PUT'){
    promise = axios.put(url, { ...data });
  }else {
    // @ts-ignore
    promise = type ? axios.post(url, data, { responseType: type }) : axios.post(url, data);
  }
  return promise
    .then((res: any) => {
      if (res?.status === 200) {
        return res.data;
      } else {
        message.error({ content: res.msg });
      }
    })
    .catch((err: any) => {
      if (sessionStorage.getItem('token') === null) {
        window.location.pathname = '/'
      }
      // console.log('请求失败了');
      // console.error(err);
      // console.log('错误已经捕获');
    });
}

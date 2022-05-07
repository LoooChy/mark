import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import vitePluginImp from 'vite-plugin-imp';
import path from 'path';//lmw add 1
// import externalGlobals from 'rollup-plugin-external-globals'//lmw add 2
// import createImportPlugin from 'vite-plugin-import'

import legacy from '@vitejs/plugin-legacy';
import resolve from 'rollup-plugin-node-resolve';

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      }
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    reactRefresh(),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/lib/${name}/style/index.less`,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@c': path.resolve(__dirname, './src/components'),
      '@s': path.resolve(__dirname, './src/service'),
      '@m': path.resolve(__dirname, './src/model'),
      '@a': path.resolve(__dirname, './src/assets'),
      // "cornerstone":path.resolve(__dirname,"./src/public/cornerstone.min.js"),//lmw add 3 告诉vite未编译时如何引入cesium
      // "cornerstoneMath":path.resolve(__dirname,"./src/public/cornerstoneMath.min.js"),//lmw add 3 告诉vite未编译时如何引入cesium
      // "cornerstoneTools":path.resolve(__dirname,"./src/public/cornerstoneTools.min.js"),//lmw add 3 告诉vite未编译时如何引入cesium
      // "dicomParser":path.resolve(__dirname,"./src/public/dicomParser.min.js")//lmw add 3 告诉vite未编译时如何引入cesium
    },
    
  },
  server: {
    fs:{
      strict:false //lmw add 4 消除html文件中引入cesium的警告
    },
    proxy: {
      // 转发
      '/dcm4cheepath': 'http://182.106.191.49:8866//dcm4cheepath',
      '/ai-web':'http://182.106.191.49:8866/',
      // '/dcm4chee-arc/aets/DCM4CHEE':{
      //   target:'https://cxr.jfhealthcare.cn:4443/dcm4chee-arc/aets/DCM4CHEE',
      //   changeOrigin:true
      // }
    },
    hmr: {
      host: 'localhost',
    },
  },
  // optimizeDeps:{
  //   include:['cornerstone','cornerstoneMath','cornerstoneTools','dicomParser']//lmw add 5 构建cesium.js
  // },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // external:['cornerstone','cornerstoneMath','cornerstoneTools','dicomParser'],//lmw add 6 不让cesium再被编译
      output: {
        manualChunks(id) {
          // 分包
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
      plugins: [
        resolve(),
        // externalGlobals({
        //   "cornerstone":"cornerstone",//lmw add 7 用引入的Cesium对应代码中的cesium
        //   "cornerstoneMath":"cornerstoneMath",//lmw add 7 用引入的Cesium对应代码中的cesium
        //   "cornerstoneTools":"cornerstoneTools",//lmw add 7 用引入的Cesium对应代码中的cesium
        //   "dicomParser":"dicomParser"//lmw add 7 用引入的Cesium对应代码中的cesium
        // })
      ],
    },
  },
});

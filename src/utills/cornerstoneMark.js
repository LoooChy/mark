// Packages
import Hammer from 'hammerjs';
import * as dicomParser from 'dicom-parser';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as cornerstoneTools from 'cornerstone-tools';

export const initCornerstone = (access_token, props) => {
    // Externals

    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneWADOImageLoader.configure({
        beforeSend: (xhr) => {
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
            xhr.setRequestHeader('Accept', 'multipart/related; type="application/octet-stream"');
        }
    })
    // Image Loader
    const config = {
        maxWebWorkers: navigator.hardwareConcurrency || 1,
        startWebWorkersOnDemand: true,
        webWorkerPath: window.location.origin + `/cornerstoneWADOImageLoaderWebWorker.js`,
        taskConfiguration: {
            decodeTask: {
                codecsPath: window.location.origin + `/cornerstoneWADOImageLoaderCodecs.js`,
                usePDFJS: false,
                strict: false
            },
        },
    };
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
    cornerstoneTools.init(
        {
            showSVGCursors: true,
        }
    );
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    initEnvents(props);
}
const initEnvents = (props) => {
    //加载完成
    cornerstone.events.addEventListener(
        "cornerstoneimageloaded",
        function (event) {
            const eventData = event.detail;
            props.dispatch({
                type: "publicInfo/setImgLoaded",
                imgLoaded: true
            });
        }
    );

    const element = document.querySelector('.cornerstone-element');
    element.addEventListener('keydown', evt => {
        if (evt.keyCode === 27) {
            let FreehandRoiElement = cornerstoneTools.getToolForElement(element, 'FreehandRoi')
            FreehandRoiElement.cancelDrawing(element)
        }
    });


    cornerstone.events.addEventListener(
        'cornerstoneimagerendered',
        function (a, b, c, d) {

        }
    )
    // element.addEventListener(
    //     'cornerstonetoolsmouseclick',
    //     function (evt) {

    //         var eventData = evt.detail;
    //   var element = eventData.element,
    //       currentPoints = eventData.currentPoints;
    //       console.log(currentPoints)
    //     }
    // )
    // const element = document.querySelector('.cornerstone-element');
    const toolType = cornerstoneTools.EVENTS.MEASUREMENT_SELECTED;
    element.addEventListener(toolType, function (evt) {
        const eventData = evt.detail;
        console.log(eventData);
    });

    window.addEventListener('resize', function (e) {//自适应窗口
        cornerstone.resize(element, true)
    });

    cornerstoneTools.toolStyle.setToolWidth(2)
}
const getImageFrameURI = (metadataURI, metadata) => {
    // Use the BulkDataURI if present int the metadata
    if (metadata["7FE00010"] && metadata["7FE00010"].BulkDataURI) {
        return metadata["7FE00010"].BulkDataURI + '/frames/1';
    }

    // fall back to using frame #1
    return metadataURI + '/frames/1';
}






const loadAndViewImage = (imageId, props) => {

    cornerstone.loadImage(imageId).then(function (image) {
        const element = document.querySelector('.cornerstone-element');
        cornerstone.enable(element);

        const stack = {
            currentImageIdIndex: 0,
            imageIds: [imageId],
        };
        cornerstoneTools.addStackStateManager(element, ['stack']);
        cornerstoneTools.addToolState(element, 'stack', stack);

        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        cornerstone.displayImage(element, image, viewport);
    }, function (err) {
        alert(err);
    });
}
export const requestMetadata = (url, access_token, props) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Make sure it's a JSON document
            const data = JSON.parse(this.responseText);
            const metadata = data[0];
            const imageFrameURI = getImageFrameURI(url, metadata);
            const imageId = 'wadors:' + imageFrameURI;
            cornerstoneWADOImageLoader.wadors.metaDataManager.add(imageId, metadata);
            // image enable the dicomImage element and activate a few tools
            loadAndViewImage(imageId, props);
        }
    };
    xhr.send();
}
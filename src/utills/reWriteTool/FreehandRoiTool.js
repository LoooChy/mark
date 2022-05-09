import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as freehandIntersect from '../freehandIntersect.js';
import { message } from 'antd';
import markText from '../textBoxText.js';

// 判断画图顺逆时针
function isCoordShun2(c_str) {
    var coords = c_str;
    if (coords.length < 3) {
        return null;
    }
    if (coords[0] == coords[coords.length - 1]) {
        coords = coords.slice(0, coords.length - 1);
    }
    coords = coords.reverse();
    var maxXIndex = 0;
    var maxX = parseFloat(coords[maxXIndex].split(",")[0]);
    var c1, c2, c3;
    var x1, y1, x2, y2, x3, y3;
    for (var i = 0; i < coords.length; i++) {
        if (parseFloat(coords[i].split(",")[0]) > maxX) {
            maxX = parseFloat(coords[i].split(",")[0]);
            maxXIndex = i;
        }
    }
    if (maxXIndex == 0) {
        c1 = coords[coords.length - 1];
        c2 = coords[maxXIndex];
        c3 = coords[maxXIndex + 1];
    } else if (maxXIndex == coords.length - 1) {
        c1 = coords[maxXIndex - 1];
        c2 = coords[maxXIndex];
        c3 = coords[0];
    } else {
        c1 = coords[maxXIndex - 1];
        c2 = coords[maxXIndex];
        c3 = coords[maxXIndex + 1];
    }
    x1 = parseFloat(c1.split(",")[0]);
    y1 = parseFloat(c1.split(",")[1]);
    x2 = parseFloat(c2.split(",")[0]);
    y2 = parseFloat(c2.split(",")[1]);
    x3 = parseFloat(c3.split(",")[0]);
    y3 = parseFloat(c3.split(",")[1]);
    var s = ((x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3));
    return s < 0;
}
// 判断点是否在图形内部，奇数在内部偶数在外部
function getCrossingNumber(point, lines) {
    let count = 0;
    for (let i = 0; i < lines.length; i += 1) {

        // o, d 是多边形某条边的起点和终点
        // const { o, d } = lines[i].lines[0];
        const o = {
            x: lines[i].x,
            y: lines[i].y
        }
        const d = {
            x: lines[i].lines[0].x,
            y: lines[i].lines[0].y
        }
        // 起点和终点位于水平射线的两侧才会有交点
        if ((o.y > point.y) ^ (d.y > point.y)) {

            // x = (y - y0) / k + x0
            const x = (point.y - o.y) * (d.x - o.x) / (d.y - o.y) + o.x;

            if (x > point.x) {
                count += 1;
            }
        }
    }

    return count;
}
// 将数组arrlast插入数组arrfirst中，index是想要插入的位置
function insert(arrfirst, arrlast, index) {    
    if (index < 0) {
        index = 0;
    } else if (index > arrfirst.length) {
        index = arrfirst.length;
    }
    var arr = [];
    for (var i = 0; i < index; i++) {
        arr.push(arrfirst[i]);
    }
    for (var i = 0; i < arrlast.length; i++) {
        arr.push(arrlast[i]);
    }
    for (var i = index; i < arrfirst.length; i++) {
        arr.push(arrfirst[i]);
    }
    return arr;
}
// 计算点的截断信息
function calcPoints(subData, dataFirstJDNum, callback) {
    let arrall1 = JSON.parse(JSON.stringify(subData));
    let arrall2 = JSON.parse(JSON.stringify(subData));
    let arr1 = arrall1.splice(0, dataFirstJDNum);
    let arr2 = arrall2.splice(-(arrall2.length - dataFirstJDNum));
    callback && callback(arr1, arr2)
}
// 计算新的点坐标信息
function newPoints(sa) {
    let arrSa = [];
    sa.map((item) => {
        arrSa.push({
            x: item.x,
            y: item.y
        });
    });
    let newArr = []
    arrSa.map((item, index) => {
        if (arrSa[index + 1] === undefined) {
            newArr.push({
                active: true,
                highlight: true,
                lines: [
                    {
                        x: arrSa[0].x,
                        y: arrSa[0].y
                    },
                ],
                x: item.x,
                y: item.y,
            })
        } else {
            newArr.push({
                active: true,
                highlight: true,
                lines: [
                    {
                        x: arrSa[index + 1].x,
                        y: arrSa[index + 1].y
                    },
                ],
                x: item.x,
                y: item.y,
            })
        }

    })
    return newArr
}

const initFreehandRoiTool = (props) => {
    let pathArrX = [];
    let pathArrY = [];
    cornerstoneTools.FreehandRoiTool.prototype.renderToolData = function (evt) {
        var _this2 = this;
        var eventData = evt.detail; // If we have no toolState for this element, return immediately as there is nothing to do
        var toolState = cornerstoneTools.getToolState(evt.currentTarget, this.name);

        if (!toolState) {
            return;
        }
        var image = eventData.image,
            element = eventData.element;
        var config = this.configuration;
        var seriesModule = cornerstoneTools.external.cornerstone.metaData.get('generalSeriesModule', image.imageId);
        var modality = seriesModule ? seriesModule.modality : null; // We have tool data for this element - iterate over each one and draw it

        var context = cornerstoneTools.import('drawing/getNewContext')(eventData.canvasContext.canvas);
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var renderDashed = config.renderDashed;
        var lineDash = [4, 4];
        var _loop = function _loop(i) {
            var data = toolState.data[i];

            if (data.visible === false) {
                return "continue";
            }

            cornerstoneTools.import('drawing/draw')(context, function (context) {
                var color = cornerstoneTools.toolColors.getColorIfActive(data);
                var fillColor;

                if (data.active) {
                    if (data.handles.invalidHandlePlacement) {
                        color = config.invalidColor;
                        fillColor = config.invalidColor;
                    } else {
                        color = cornerstoneTools.toolColors.getColorIfActive(data);
                        fillColor = cornerstoneTools.toolColors.getFillColor();
                    }
                } else {
                    fillColor = cornerstoneTools.toolColors.getToolColor();
                }

                var options = {
                    color: color
                };

                if (renderDashed) {
                    options.lineDash = lineDash;
                }

                if (data.handles.points.length) {
                    var points = data.handles.points;
                    cornerstoneTools.import('drawing/drawJoinedLines')(context, element, points[0], points, options);

                    if (data.polyBoundingBox) {
                        cornerstoneTools.import('drawing/drawJoinedLines')(context, element, points[points.length - 1], [points[0]], options);
                    } else {
                        cornerstoneTools.import('drawing/drawJoinedLines')(context, element, points[points.length - 1], [config.mouseLocation.handles.start], options);
                    }
                } // Draw handles


                options = {
                    color: color,
                    fill: fillColor
                };

                if (config.alwaysShowHandles || data.active && data.polyBoundingBox) {
                    // Render all handles
                    options.handleRadius = config.activeHandleRadius;

                    if (_this2.configuration.drawHandles) {
                        cornerstoneTools.import('drawing/drawHandles')(context, eventData, data.handles.points, options);
                    }
                }

                if (data.canComplete) {
                    // Draw large handle at the origin if can complete drawing
                    options.handleRadius = config.completeHandleRadius;
                    var handle = data.handles.points[0];

                    if (_this2.configuration.drawHandles) {
                        cornerstoneTools.import('drawing/drawHandles')(context, eventData, [handle], options);
                    }
                }

                if (data.active && !data.polyBoundingBox) {
                    // Draw handle at origin and at mouse if actively drawing
                    options.handleRadius = config.activeHandleRadius;

                    if (_this2.configuration.drawHandles) {
                        cornerstoneTools.import('drawing/drawHandles')(context, eventData, config.mouseLocation.handles, options);
                    }

                    var firstHandle = data.handles.points[0];

                    if (_this2.configuration.drawHandles) {
                        cornerstoneTools.import('drawing/drawHandles')(context, eventData, [firstHandle], options);
                    }
                } // Update textbox stats


                if (data.invalidated === true && !data.active) {
                    if (data.meanStdDev && data.meanStdDevSUV && data.area) {
                        _this2.throttledUpdateCachedStats(image, element, data);
                    } else {
                        _this2.updateCachedStats(image, element, data);
                    }
                } // Only render text if polygon ROI has been completed and freehand 'shiftKey' mode was not used:


                if (data.polyBoundingBox && !data.handles.textBox.freehand) {
                    // If the textbox has not been moved by the user, it should be displayed on the right-most
                    // Side of the tool.
                    if (!data.handles.textBox.hasMoved) {
                        // Find the rightmost side of the polyBoundingBox at its vertical center, and place the textbox here
                        // Note that this calculates it in image coordinates
                        data.handles.textBox.x = data.polyBoundingBox.left + data.polyBoundingBox.width;
                        data.handles.textBox.y = data.polyBoundingBox.top + data.polyBoundingBox.height / 2;
                    }
                    var text = textBoxText.call(_this2, data, i);
                    cornerstoneTools.import('drawing/drawLinkedTextBox')(context, element, data.handles.textBox, text, data.handles.points, textBoxAnchorPoints, color, lineWidth, 0, true);
                }
            });
        };

        for (var i = 0; i < toolState.data.length; i++) {
            var _ret = _loop(i);

            if (_ret === "continue") continue;
        }

        function textBoxText(data, i) {

            return markText(data, i);
        }

        function textBoxAnchorPoints(handles) {
            return handles;
        }
    }
    cornerstoneTools.FreehandRoiTool.prototype._endDrawing = function (element, handleNearby, evt) {
        var _this = this;
        var toolState = cornerstoneTools.getToolState(element, this.name);
        var config = this.configuration;
        var data = toolState.data[config.currentTool];
        data.active = false;
        data.highlight = false;
        data.handles.invalidHandlePlacement = false; // Connect the end handle to the origin handle
        if (handleNearby !== undefined) {
            var points = data.handles.points;
            points[config.currentHandle - 1].lines.push(points[0]);
        }
        if (this._modifying) {
            this._modifying = false;
            data.invalidated = true;
        } // Reset the current handle
        config.currentHandle = 0;
        config.currentTool = -1;
        data.canComplete = false;

        if (this._drawing) {
            this._deactivateDraw(element);
        }

        cornerstone.updateImage(element);
        this.fireModifiedEvent(element, data);
        this.fireCompletedEvent(element, data);
        var ss = setTimeout(() => {
            if (sessionStorage.getItem('updateMarkType') === 'ADD' && data.color === undefined) {
                _this.diyAdd(element, data, evt)
            } else if (sessionStorage.getItem('updateMarkType') === 'ERASE' && data.color === undefined) {
                _this.diyEraser(element, data, evt)

            } else {

            }

            clearTimeout(ss)
        }, 100)
        // 暂时注释---会有优化
        if (evt && toolState.data.filter((item) => item.color !== undefined).length === 0) {
            props.dispatch({
                type: "publicInfo/setShowMarkInforEdite",
                showMarkInforEdite: {
                    type: 'FreehandRoi',
                    show: true,
                    left: evt.detail.event.clientX,
                    top: evt.detail.event.clientY
                }
            });
        } else {
            props.dispatch({
                type: "publicInfo/setShowMarkInforEdite",
                showMarkInforEdite: {
                    type: 'FreehandRoi',
                    show: false,
                    left: 0,
                    top: 0
                }
            });
        }

    }

    cornerstoneTools.FreehandRoiTool.prototype._editMouseUpCallback = function (evt) {
        var eventData = evt.detail;
        var element = eventData.element;
        var toolState = cornerstoneTools.getToolState(element, this.name);

        this._deactivateModify(element);

        this._dropHandle(eventData, toolState);

        this._endDrawing(element);
        pathArrX = []
        pathArrY = []

        let cur = cornerstoneToolsHelp.diyGetData().filter((item) => item.color !== undefined)[0] || [];
        if (cur) {
            let sa = [];
            cur.handles.points.map((item) => {
                sa.push({
                    x: item.x,
                    y: item.y
                })
            })
            cur.handles.points = newPoints(sa)
        }

        cornerstone.updateImage(element);
    }
    // cornerstoneTools.FreehandRoiTool.prototype._drawingMouseDownCallback = function (evt) {
    //     var eventData = evt.detail;
    //     var buttons = eventData.buttons,
    //         currentPoints = eventData.currentPoints,
    //         element = eventData.element;

    //     if (!this.options.mouseButtonMask.includes(buttons)) {
    //         return;
    //     };
    //     // var freehandIntersect = cornerstoneTools.import('util/freehand/index.js')
    //     var coords = currentPoints.canvas;
    //     var config = this.configuration;
    //     var currentTool = config.currentTool;
    //     var toolState = cornerstoneTools.getToolState(element, this.name);
    //     var data = toolState.data[currentTool];
    //     var handleNearby = this._pointNearHandle(element, data, coords);
    //     if (!freehandIntersect.default.end(data.handles.points) && data.canComplete) {
    //         var lastHandlePlaced = config.currentHandle;

    //         this._endDrawing(element, lastHandlePlaced, evt);
    //     } else if (handleNearby === undefined) {
    //         this._addPoint(eventData);
    //     }

    //     evt.stopImmediatePropagation();
    //     evt.stopPropagation();
    //     evt.preventDefault();
    //     return;
    // }

    cornerstoneTools.FreehandRoiTool.prototype.handleSelectedCallback = function (evt, toolData, handle) {
        var interactionType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'mouse';
        var element = evt.detail.element;
        var toolState = cornerstoneTools.getToolState(element, this.name);
        toolState.data.map((item) => {
            if (item.uuid === toolData.uuid) {
                // toolData.color = toolData.color === undefined ? '#ff00ff' : undefined;
                toolData.color = '#375cb7'
            } else {
                item.color = undefined
            }
        })
        cornerstone.updateImage(element);
        if (handle.hasBoundingBox) {
            // Use default move handler.
            cornerstoneTools.import('manipulators/moveHandleNearImagePoint')(evt, this, toolData, handle, interactionType);
            return;
        }



        var config = this.configuration;
        config.dragOrigin = {
            x: handle.x,
            y: handle.y
        }; // Iterating over handles of all toolData instances to find the indices of the selected handle

        for (var toolIndex = 0; toolIndex < toolState.data.length; toolIndex++) {
            var points = toolState.data[toolIndex].handles.points;

            for (var p = 0; p < points.length; p++) {
                if (points[p] === handle) {
                    config.currentHandle = p;
                    config.currentTool = toolIndex;
                }
            }
        }

        this._modifying = true;

        this._activateModify(element); // Interupt eventDispatchers

        // toolData.active = true
        // window.cornerstoneToolsHelp.toolColors.setActiveColor('#00ffff')
        // preventPropagation(evt);


        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();
    }

    cornerstoneTools.FreehandRoiTool.prototype.completeDrawing = function (element, evt) {
        if (!this._drawing) {
            return;
        }

        var toolState = cornerstoneTools.getToolState(element, this.name);
        var config = this.configuration;
        var data = toolState.data[config.currentTool];

        if (!freehandIntersect.default.end(data.handles.points) && data.handles.points.length >= 2) {
            var lastHandlePlaced = config.currentHandle;
            data.polyBoundingBox = {};

            this._endDrawing(element, lastHandlePlaced, evt);
        }
    }

    cornerstoneTools.FreehandRoiTool.prototype._drawingMouseUpCallback = function (evt) {
        var element = evt.detail.element;
        if (!this._dragging) {
            return;
        }

        this._dragging = false;
        var config = this.configuration;
        var currentTool = config.currentTool;
        var toolState = cornerstoneTools.getToolState(element, this.name);
        var data = toolState.data[currentTool];

        if (!freehandIntersect.default.end(data.handles.points) && data.canComplete) {
            var lastHandlePlaced = config.currentHandle;
            this._endDrawing(element, lastHandlePlaced, evt);
        }

        evt.stopImmediatePropagation();
        evt.stopPropagation();
        evt.preventDefault();
        return;
    }

    cornerstoneTools.FreehandRoiTool.prototype._editMouseDragCallback = function (evt) {
        var eventData = evt.detail;
        var element = eventData.element,
            buttons = eventData.buttons;


        if (buttons === 2) {// 右键控制整体移动
            let toolState = cornerstoneTools.getToolState(element, this.name);
            let config = this.configuration;
            let data = toolState.data[config.currentTool];
            let points = data.handles.points;

            this._getMouseLocation(eventData);
            let changedX = ''
            let changedY = ''
            if (pathArrX.length <= 2) {
                pathArrX.push(eventData.currentPoints.image.x)
            } else if (pathArrX.length === 3) {
                if (pathArrX[1] < pathArrX[2]) {
                    changedX = 'add'
                } else if (pathArrX[1] > pathArrX[2]) {
                    changedX = 'reduce'
                } else {
                    changedX = 'no'
                }
                pathArrX.shift()
            }

            if (pathArrY.length <= 2) {
                pathArrY.push(eventData.currentPoints.image.y)
            } else if (pathArrY.length === 3) {
                if (pathArrY[1] < pathArrY[2]) {
                    changedY = 'add'
                } else if (pathArrY[1] > pathArrY[2]) {
                    changedY = 'reduce'
                } else {
                    changedY = 'no'
                }
                pathArrY.shift()
            }
            let dX = Math.abs(pathArrX[0] - pathArrX[1])
            let dY = Math.abs(pathArrY[0] - pathArrY[1])

            if (changedX !== '' && changedY !== '') {
                if (changedX === 'add') {
                    points.map((item) => {
                        item.x += dX
                    })

                }
                if (changedX === 'reduce') {
                    points.map((item) => {
                        item.x -= dX
                    })
                }
                if (changedY === 'add') {
                    points.map((item) => {
                        item.y += dY
                    })
                }
                if (changedY === 'reduce') {
                    points.map((item) => {
                        item.y -= dY
                    })
                }
            }
            cornerstone.updateImage(element)
        }

        if (!this.options.mouseButtonMask.includes(buttons)) {
            return;
        }

        var toolState = cornerstoneTools.getToolState(element, this.name);
        var config = this.configuration;
        var data = toolState.data[config.currentTool];
        var currentHandle = config.currentHandle;
        var points = data.handles.points;
        var handleIndex = -1; // Set the mouseLocation handle

        this._getMouseLocation(eventData);

        data.handles.invalidHandlePlacement = freehandIntersect.default.modify(points, currentHandle);
        data.active = true;
        data.highlight = true;
        points[currentHandle].x = config.mouseLocation.handles.start.x;
        points[currentHandle].y = config.mouseLocation.handles.start.y;





        handleIndex = this._getPrevHandleIndex(currentHandle, points);

        if (currentHandle >= 0) {
            var lastLineIndex = points[handleIndex].lines.length - 1;
            var lastLine = points[handleIndex].lines[lastLineIndex];
            lastLine.x = config.mouseLocation.handles.start.x;
            lastLine.y = config.mouseLocation.handles.start.y;
        } // Update the image

        if (sessionStorage.getItem('togetherModel')) {// 多个点一起移动
            let changedX = ''
            let changedY = ''
            if (pathArrX.length <= 2) {
                pathArrX.push(points[currentHandle].x)
            } else if (pathArrX.length === 3) {
                if (pathArrX[1] < pathArrX[2]) {
                    changedX = 'add'
                } else if (pathArrX[1] > pathArrX[2]) {
                    changedX = 'reduce'
                } else {
                    changedX = 'no'
                }
                pathArrX.shift()
            }

            if (pathArrY.length <= 2) {
                pathArrY.push(points[currentHandle].y)
            } else if (pathArrY.length === 3) {
                if (pathArrY[1] < pathArrY[2]) {
                    changedY = 'add'
                } else if (pathArrY[1] > pathArrY[2]) {
                    changedY = 'reduce'
                } else {
                    changedY = 'no'
                }
                pathArrY.shift()
            }

            let dX = Math.abs(pathArrX[0] - pathArrX[1])
            let dY = Math.abs(pathArrY[0] - pathArrY[1])
            let sx = 11;
            let length = 0;
            if (sx % 2 !== 0) {
                length = Math.floor(sx / 2)
            } else {
                length = sx / 2
            }
            if (changedX !== '' && changedY !== '') {
                if (changedX === 'add') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].x += dX * (length - i + 1) / 5;
                        points[pointsIndex2].x += dX * (length - i + 1) / 5;
                        points[pointsIndex1]['isMove'] = true;
                        points[pointsIndex2]['isMove'] = true;
                    }

                }
                if (changedX === 'reduce') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].x -= dX * (length - i + 1) / 5;
                        points[pointsIndex2].x -= dX * (length - i + 1) / 5;
                        points[pointsIndex1]['isMove'] = true;
                        points[pointsIndex2]['isMove'] = true;
                    }
                }
                if (changedY === 'add') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].y += dY * (length - i + 1) / 5;
                        points[pointsIndex2].y += dY * (length - i + 1) / 5;
                        points[pointsIndex1]['isMove'] = true;
                        points[pointsIndex2]['isMove'] = true;
                    }
                }
                if (changedY === 'reduce') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].y -= dY * (length - i + 1) / 5;
                        points[pointsIndex2].y -= dY * (length - i + 1) / 5;
                        points[pointsIndex1]['isMove'] = true;
                        points[pointsIndex2]['isMove'] = true;
                    }
                }
            }
        }

        cornerstone.updateImage(element);

    }

    cornerstoneTools.FreehandRoiTool.prototype.diyAdd = function (element, data, evt) {
        var state = cornerstoneTools.getElementToolStateManager(element)
        var alldata = state.get(element, 'FreehandRoi') ? state.get(element, 'FreehandRoi').data : []
        if (alldata.length === 1) {
            return;
        }
        // 后面改成当前选中的点
        let optData = alldata.filter((item) => item.color !== undefined)[0];
        if (optData === undefined) {
            return
        }
        let optDataArr = []
        optData.handles.points.map((item2) => {
            optDataArr.push(`${item2.x},${item2.y}`)

        })
        let dataArr = []
        data.handles.points.map((item2) => {
            dataArr.push(`${item2.x},${item2.y}`)

        })

        let optDataIsShun = true;
        let dataIsShun = true;
        if (isCoordShun2(optDataArr)) {
            optDataIsShun = true
        } else {
            optDataIsShun = false
        }
        if (isCoordShun2(dataArr)) {
            dataIsShun = true
        } else {
            dataIsShun = false
        }

        let innerData1 = [];
        data.handles.points.map((item, index) => {
            if (getCrossingNumber(item, optData.handles.points) % 2 == 0) {//多边形外
                item['needSave'] = true
                item['isData2index'] = index
            } else {
                item['needSave'] = false
                item['isData2index'] = index
                innerData1.push(item)//主图内部的点（不需要）
            }
        })
        let innerData2 = [];
        optData.handles.points.map((item, index) => {
            if (getCrossingNumber(item, data.handles.points) % 2 == 0) {//多边形外
                item['needSave'] = true
                item['isOptDataindex'] = index
            } else {
                item['needSave'] = false
                item['isOptDataindex'] = index
                innerData2.push(item)//副图内部的点（不需要）
            }
        })
        if (innerData1.length === 0 || innerData2.length === 0) {
            cornerstoneTools.removeToolState(
                element,
                'FreehandRoi',
                data
            );
            cornerstone.updateImage(element);
            return
        }

        let optDataFirstJDNum = '';
        let optDataLastJDNum = '';
        for (let j = 0; j < optData.handles.points.length; j++) {
            if (optData.handles.points[j].needSave === false) {
                optDataFirstJDNum = j;
                break;
            }
        }

        let dataFirstJDNum = '';
        let dataLastJDNum = '';
        for (let j = 0; j < data.handles.points.length; j++) {
            if (data.handles.points[j].needSave === false) {
                dataFirstJDNum = j;
                break;
            }
        }

        if (optDataFirstJDNum === 0) {//optDataFirstJDNum为0，重新计算头和尾
            for (let j = 0; j < optData.handles.points.length; j++) {
                if (optData.handles.points[j].needSave === true) {
                    optDataFirstJDNum = j;
                    break;
                }
            }
            optDataLastJDNum = innerData2.length - optDataFirstJDNum;
        } else {
            optDataFirstJDNum = optDataFirstJDNum - 1;
            optDataLastJDNum = optDataFirstJDNum + innerData2.length;
        }



        let mainData = JSON.parse(JSON.stringify(optData.handles.points));
        let subData = JSON.parse(JSON.stringify(data.handles.points));
        mainData = mainData.filter((item) => item.needSave === true);
        subData = subData.filter((item) => item.needSave === true);
        let isContainData0 = data.handles.points.filter((item) => item.isData2index === 0 && item.needSave === true).length
        let isContainOptdata0 = optData.handles.points.filter((item) => item.isOptDataindex === 0 && item.needSave === false).length
        let sa = []

        if (optDataIsShun === true && dataIsShun === true) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll.reverse(), optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData, 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll, 0);
                })
            } else {
                sa = insert(mainData, subData, optDataFirstJDNum + 1);
            }
        } else if (optDataIsShun === true && dataIsShun === false) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll, optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData.reverse(), 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll.reverse(), 0);
                })
            } else {
                sa = insert(mainData, subData.reverse(), optDataFirstJDNum + 1);
            }
        } else if (optDataIsShun === false && dataIsShun === true) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll, optDataFirstJDNum + 1);
                })

            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData.reverse(), 0);

            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll.reverse(), 0);
                })

            } else {
                sa = insert(mainData, subData.reverse(), optDataFirstJDNum + 1);

            }
        } else if (optDataIsShun === false && dataIsShun === false) {

            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll.reverse(), optDataFirstJDNum + 1);
                })

            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData, 0);

            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll, 0);
                })

            } else {
                sa = insert(mainData, subData, optDataFirstJDNum + 1);

            }
        }

        optData.handles.points = newPoints(sa);

        cornerstoneTools.removeToolState(
            element,
            'FreehandRoi',
            data
        );

        cornerstone.updateImage(element);


    }

    cornerstoneTools.FreehandRoiTool.prototype.diyEraser = function (element, data, evt) {
        var state = cornerstoneTools.getElementToolStateManager(element)
        var alldata = state.get(element, 'FreehandRoi') ? state.get(element, 'FreehandRoi').data : []
        if (alldata.length === 1) {
            return;
        }
        // 后面改成当前选中的点
        let optData = alldata.filter((item) => item.color !== undefined)[0];
        if (optData === undefined) {
            return
        }
        let optDataArr = []
        optData.handles.points.map((item2) => {
            optDataArr.push(`${item2.x},${item2.y}`)

        })
        let dataArr = []
        data.handles.points.map((item2) => {
            dataArr.push(`${item2.x},${item2.y}`)

        })

        let optDataIsShun = true;
        let dataIsShun = true;
        if (isCoordShun2(optDataArr)) {
            optDataIsShun = true
        } else {
            optDataIsShun = false
        }
        if (isCoordShun2(dataArr)) {
            dataIsShun = true
        } else {
            dataIsShun = false
        }


        let innerData1 = [];
        data.handles.points.map((item, index) => {
            if (getCrossingNumber(item, optData.handles.points) % 2 == 0) {//多边形外
                item['needSave'] = false
                item['isData2index'] = index
            } else {
                item['needSave'] = true
                item['isData2index'] = index
                innerData1.push(item)//主图内部的点（需要）
            }
        })
        let innerData2 = [];
        optData.handles.points.map((item, index) => {
            if (getCrossingNumber(item, data.handles.points) % 2 == 0) {//多边形外
                item['needSave'] = true
                item['isOptDataindex'] = index
            } else {
                item['needSave'] = false
                item['isOptDataindex'] = index
                innerData2.push(item)//副图内部的点（不需要）
            }
        })
        if (innerData1.length === 0 || innerData2.length === 0) {
            return
        }

        let optDataFirstJDNum = '';
        let optDataLastJDNum = '';
        for (let j = 0; j < optData.handles.points.length; j++) {
            if (optData.handles.points[j].needSave === false) {
                optDataFirstJDNum = j;
                break;
            }
        }

        let dataFirstJDNum = '';
        let dataLastJDNum = '';
        for (let j = 0; j < data.handles.points.length; j++) {
            if (data.handles.points[j].needSave === false) {
                dataFirstJDNum = j;
                break;
            }
        }

        if (optDataFirstJDNum === 0) {//optDataFirstJDNum为0，重新计算头和尾
            for (let j = 0; j < optData.handles.points.length; j++) {
                if (optData.handles.points[j].needSave === true) {
                    optDataFirstJDNum = j;
                    break;
                }
            }
            optDataLastJDNum = innerData2.length - optDataFirstJDNum;
        } else {
            optDataFirstJDNum = optDataFirstJDNum - 1;
            optDataLastJDNum = optDataFirstJDNum + innerData2.length;
        }



        let mainData = JSON.parse(JSON.stringify(optData.handles.points));
        let subData = JSON.parse(JSON.stringify(data.handles.points));
        mainData = mainData.filter((item) => item.needSave === true);
        subData = subData.filter((item) => item.needSave === true);
        let isContainData0 = data.handles.points.filter((item) => item.isData2index === 0 && item.needSave === true).length
        let isContainOptdata0 = optData.handles.points.filter((item) => item.isOptDataindex === 0 && item.needSave === false).length
        let sa = []

        if (optDataIsShun === true && dataIsShun === true) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll, optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData.reverse(), 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll.reverse(), 0);
                })
            } else {
                sa = insert(mainData, subData.reverse(), optDataFirstJDNum + 1);
            }
        } else if (optDataIsShun === true && dataIsShun === false) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll.reverse(), optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData, 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll, 0);
                })
            } else {
                sa = insert(mainData, subData, optDataFirstJDNum + 1);
            }
        } else if (optDataIsShun === false && dataIsShun === true) {
            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll.reverse(), optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData, 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll, 0);
                })
            } else {
                sa = insert(mainData, subData, optDataFirstJDNum + 1);
            }
        } else if (optDataIsShun === false && dataIsShun === false) {

            if (isContainData0 === 1 && isContainOptdata0 === 0) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    arr1 = arr1.reverse();
                    arr2 = arr2.reverse();
                    let subAll = [...arr1, ...arr2];
                    sa = insert(mainData, subAll, optDataFirstJDNum + 1);
                })
            } else if (isContainData0 === 0 && isContainOptdata0 === 1) {
                sa = insert(mainData, subData.reverse(), 0);
            } else if (isContainData0 === 1 && isContainOptdata0 === 1) {
                calcPoints(subData, dataFirstJDNum, (arr1, arr2) => {
                    let subAll = [...arr2, ...arr1];
                    sa = insert(mainData, subAll.reverse(), 0);
                })
            } else {
                sa = insert(mainData, subData.reverse(), optDataFirstJDNum + 1);
            }
        }

        optData.handles.points = newPoints(sa);

        cornerstoneTools.removeToolState(
            element,
            'FreehandRoi',
            data
        );

        cornerstone.updateImage(element);
    }

    cornerstoneTools['diyGetData'] = function (type) {
        var dom = document.querySelector('.cornerstone-element')
        var state = cornerstoneTools.getElementToolStateManager(dom)
        var data = state.get(dom, type || 'FreehandRoi') ? state.get(dom, type || 'FreehandRoi').data : []

        return data
    }
    window['cornerstoneToolsHelp'] = cornerstoneTools;//辅助开发使用
    window['cornerstoneHelp'] = cornerstone;//辅助开发使用
    document.onkeydown = function (e) {
        var keyCode = e.keyCode || e.which || e.charCode;
        var altKey = e.altKey;
        if (altKey && keyCode === 81) {
            if (sessionStorage.getItem('togetherModel')) {
                sessionStorage.removeItem('togetherModel')
                message.success({ content: '多点控制模式已关闭' });
            } else {
                sessionStorage.setItem('togetherModel', true)
                message.success({ content: '多点控制模式已开启' });
            }
        } else if (keyCode === 46) {
            var dom = document.querySelector('.cornerstone-element')
            var state = cornerstoneTools.getElementToolStateManager(dom)
            var data = state.get(dom, 'FreehandRoi') ? state.get(dom, 'FreehandRoi').data : []
            if (data.length > 0) {
                cornerstoneTools.removeToolState(
                    dom,
                    'FreehandRoi',//后期根据需求加入其他类型
                    data.filter((item) => item.color !== undefined)[0]
                );
                cornerstone.updateImage(dom);
            }
        } else if (keyCode === 17) {
            if (sessionStorage.getItem('movePatternModel') === null) {
                sessionStorage.setItem('movePatternModel', true)
            }
        }
        // e.preventDefault();
        // return false;
    }
    // document.onmousedown = function(e){
    //     console.log(e,"dddd")
    // }
}

export default initFreehandRoiTool

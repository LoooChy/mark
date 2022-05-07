import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as freehandIntersect from '../freehandIntersect.js';
import { message } from 'antd';
import markText from '../textBoxText.js';

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
function insert(arrfirst, arrlast, index) {    //将数组arrlast插入数组arrfirst中，index是想要插入的位置
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
function calcPoints(subData, dataFirstJDNum, callback) {
    let arrall1 = JSON.parse(JSON.stringify(subData));
    let arrall2 = JSON.parse(JSON.stringify(subData));
    let arr1 = arrall1.splice(0, dataFirstJDNum);
    let arr2 = arrall2.splice(-(arrall2.length - dataFirstJDNum));
    callback && callback(arr1, arr2)
}

function asdf() {
    function MouseGesture(opt) {
        opt = opt || {};
        if (opt.wise) {
            //是否 获取顺时针角度,默认为逆时针角度
            this._getDeg = this._clockWise;
        } else {
            this._getDeg = this._antiClockWise;
        }
        this.distance = opt.distance || 4; //最小有效距离
        this.vaildOffsetDeg = opt.vaildOffsetDeg || 80; //有效的差值角度，大于这个值，相当于拖拽无效

        this.startPoint = null; //开始的点
        this.options = {}; //其他参数  偏移角度 offsetDeg  ， 偏移比例 offsetRate

        this.cache = null; //缓存的数据
    }


    MouseGesture.prototype._clockWise = function (start, end) {
        //获取顺时针的角度
        return 360 - this._antiClockWise(start, end);
    }

    MouseGesture.prototype._antiClockWise = function (start, end) {
        //获取逆时针的旋转角度
        var x1 = start.x;
        var y1 = start.y;
        var x2 = end.x;
        var y2 = end.y;
        var deg = 0;
        if (x1 != x2) {
            var k = (y1 - y2) / (x1 - x2);
            var a = Math.atan(k);
            deg = a * 180 / Math.PI - 90;   //弧度转角度
            deg = Math.abs(deg);
            if (x1 >= x2) {
                deg = deg + 180;
            }
        } else {
            if (y2 > y1) {
                deg = 0;
            } else {
                deg = 180;
            }
        }
        return Math.floor(deg);
    }


    MouseGesture.prototype.transformDeg = function (deg) {
        if (deg >= 360) {
            deg = deg - 360;
        }
        if (deg < 0) {
            deg = 360 + deg;
        }
        return deg
    }

    /**
     * 计算可用的角度
     * @private
     */
    MouseGesture.prototype._invalidDeg = function (deg, offsetDeg) {
        var $this = this;

        var vaildOffsetDeg = $this.vaildOffsetDeg || 80;

        var start = $this.transformDeg(offsetDeg - vaildOffsetDeg);
        var end = $this.transformDeg(offsetDeg + vaildOffsetDeg);

        if (start >= 360 - 2 * vaildOffsetDeg) {
            if (deg <= end) {
                if (offsetDeg <= end) {
                    return deg - offsetDeg;
                } else {
                    return deg - (360 - offsetDeg);
                }
            }
            if (deg >= start) {
                if (offsetDeg > start) {
                    return deg - offsetDeg;
                } else {
                    return (360 - deg) + offsetDeg;
                }
            }
        } else {
            if (deg <= end && deg >= start) {
                return offsetDeg - deg;
            }
        }
        return false;
    }



    /**
     * 对外的api，设置起始点
     * @param start
     * @param options
     */
    MouseGesture.prototype.setStart = function (start, options, cache) {
        options = options || {};
        this.startPoint = start; //开始的点
        this.options = options; //其他参数,偏移角度 offsetDeg  ， 偏移比例 offsetRate

        this.distance = options.distance || 4; //最小有效距离
        this.vaildOffsetDeg = options.vaildOffsetDeg || 80; //有效的差值角度


        this.cache = cache || null;
    }

    /**
     * 结束之后，清空设置
     */
    MouseGesture.prototype.setEnd = function (opt) {
        opt = opt || {};
        this.distance = opt.distance || 4; //最小有效距离
        this.vaildOffsetDeg = opt.vaildOffsetDeg || 80; //有效的差值角度，大于这个值，相当于拖拽无效

        this.startPoint = null; //开始的点
        this.options = {}; //其他参数
        this.cache = null;
    }

    /**
     * 获取角度相关信息
     * @param end
     */
    MouseGesture.prototype.getDegInfo = function (end) {
        if (this.startPoint && end) {
            var obj = {};
            var start = {
                x: this.startPoint.x,
                y: this.startPoint.y
            }
            var dis = Math.sqrt((start.x - end.x) * (start.x - end.x) + (start.y - end.y) * (start.y - end.y));

            obj["distance"] = dis;
            if (dis >= this.distance) {
                var deg = this._getDeg(start, end);
                obj["deg"] = this.transformDeg(deg);
                obj["missX"] = end.x - start.x;
                obj["missY"] = end.y - start.y;
                return obj;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     *  计算偏移量
     */
    MouseGesture.prototype.calcOffset = function (end) {
        var $this = this;
        var obj = $this.getDegInfo(end);
        if (obj) {
            var offsetDeg = $this.options.offsetDeg || 0;
            offsetDeg = $this.transformDeg(offsetDeg);
            var missDeg1 = $this._invalidDeg(obj.deg, offsetDeg); //偏移角度,正面
            var missDeg2 = $this._invalidDeg($this.transformDeg(obj.deg + 180), offsetDeg); //偏移角度，反面
            var missDeg = false;
            var digital = 1;
            if (missDeg2 !== false) {
                missDeg = missDeg2;
                digital = -1;
            }

            if (missDeg1 !== false) {
                missDeg = missDeg1;
                digital = 1;
            }

            if (missDeg !== false) {
                //有效的拖拽角度
                //计算偏移比例
                missDeg = $this.degToRadian(missDeg);

                var dist = digital * obj.distance * Math.cos(missDeg);
                var offsetRate = $this.options.offsetRate || 1;  //如果是边，偏移比例应该是  1 ，如果是拐角，偏移比例应该是 Math.sqrt(2)/2
                //console.log(missDeg1,missDeg2,obj.deg,offsetDeg,dist,digital);
                return dist * offsetRate;
            }
        }
        return false;

    }


    MouseGesture.prototype.calcOffsetInfo = function (end) {
        var dis = this.calcOffset(end)
        if (dis !== false) {
            var obj = {
                distance: dis
            }
            if (this.cache) {
                obj["cache"] = this.cache;
            }
            return obj;
        }
        return false;
    }

    //角度转弧度
    MouseGesture.prototype.degToRadian = function (deg) {
        return deg * Math.PI / 180;
    }

    //弧度转角度
    MouseGesture.prototype.RadianToDeg = function (radian) {
        return radian * 180 / Math.PI;
    }



    //开始使用

    var circle = document.getElementById("circle");

    var ins = new MouseGesture({ wise: true });

    window.addEventListener("mousedown", function (e) {
        ins.setStart({
            x: e.clientX,
            y: e.clientY
        });
        circle.style.left = e.clientX - 5 + "px";
        circle.style.top = e.clientY - 5 + "px";
    })
    window.addEventListener("mousemove", function (e) {
        if (!ins.startPoint) {
            return;
        }
        var obj = ins.getDegInfo({
            x: e.clientX,
            y: e.clientY
        });
        if (obj) {
            console.log(`角度为:${obj.deg};  x方向位移:${obj.missX};  y方向位移:${obj.missY} ;两点之间的距离为:${obj.distance}`);
        } else {
            console.log("无效的移动");
        }
    })
    window.addEventListener("mouseup", function (e) {
        ins.setEnd();
    })

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
        console.log(evt, "evtevtevt")
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


        if (buttons === 2) {
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


        if (sessionStorage.getItem('togetherModel')) {
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
            if (11 % 2 !== 0) {
                length = Math.floor(sx / 2)
            } else {
                length = sx / 2
            }
            if (changedX !== '' && changedY !== '') {
                if (changedX === 'add') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].x += dX * (length - i + 1) / 10;
                        points[pointsIndex2].x += dX * (length - i + 1) / 10;
                    }

                }
                if (changedX === 'reduce') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].x -= dX * (length - i + 1) / 10;
                        points[pointsIndex2].x -= dX * (length - i + 1) / 10;
                    }
                }
                if (changedY === 'add') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].y += dY * (length - i + 1) / 10;
                        points[pointsIndex2].y += dY * (length - i + 1) / 10;
                    }
                }
                if (changedY === 'reduce') {
                    for (let i = 1; i <= length; i++) {
                        let pointsIndex1 = points[currentHandle + i] ? (currentHandle + i) : (currentHandle + i - points.length);
                        let pointsIndex2 = points[currentHandle - i] ? (currentHandle - i) : (currentHandle - i + points.length);
                        points[pointsIndex1].y -= dY * (length - i + 1) / 10;
                        points[pointsIndex2].y -= dY * (length - i + 1) / 10;
                    }
                }
            }
        }


        handleIndex = this._getPrevHandleIndex(currentHandle, points);

        if (currentHandle >= 0) {
            var lastLineIndex = points[handleIndex].lines.length - 1;
            var lastLine = points[handleIndex].lines[lastLineIndex];
            lastLine.x = config.mouseLocation.handles.start.x;
            lastLine.y = config.mouseLocation.handles.start.y;
        } // Update the image

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
        console.log(innerData1, innerData2)
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
        optData.handles.points = newArr;
        // var newOptData = JSON.parse(JSON.stringify(optData));
        // alldata.map((item) => {
        //     if(item.color!==undefined){
        //         cornerstoneTools.removeToolState(
        //             element,
        //             'FreehandRoi',
        //             item
        //         );
        //         cornerstoneTools.removeToolState(
        //             element,
        //             'FreehandRoi',
        //             data
        //         );

        //     }

        // });
        // cornerstone.updateImage(element);

        // cornerstone.updateImage(element);
        // alldata.map((item) => {
        //     if (item.color !== undefined) {
        //         cornerstoneTools.removeToolState(
        //             element,
        //             'FreehandRoi',
        //             item
        //         );
        //         cornerstoneTools.removeToolState(
        //             element,
        //             'FreehandRoi',
        //             data
        //         );

        //     }

        // });
        // state.add(element, 'FreehandRoi', newOptData)
        // optData.handles.points = newArr
        ///////////////////////////
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
        optData.handles.points = newArr;
        // var newOptData = JSON.parse(JSON.stringify(optData));
        // alldata.map((item) => {
        //     cornerstoneTools.removeToolState(
        //         element,
        //         'FreehandRoi',
        //         item
        //     );
        // });
        // cornerstone.updateImage(element);
        // state.add(element, 'FreehandRoi', newOptData)
        // cornerstone.updateImage(element);
        // alldata.map((item) => {
        //     cornerstoneTools.removeToolState(
        //         element,
        //         'FreehandRoi',
        //         item
        //     );
        // });
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
// var a = JSON.parse('{"visible":true,"active":false,"invalidated":true,"handles":{"points":[{"x":1327.6456599286566,"y":577.1414982164091,"highlight":true,"active":true,"lines":[{"x":692.0594530321048,"y":1493.9928656361476}]},{"x":692.0594530321048,"y":1493.9928656361476,"highlight":true,"active":true,"lines":[{"x":1126.741973840666,"y":2078.4399524375744}]},{"x":1126.741973840666,"y":2078.4399524375744,"highlight":true,"active":true,"lines":[{"x":1893.8287752675387,"y":2107.662306777646}]},{"x":1893.8287752675387,"y":2107.662306777646,"highlight":true,"active":true,"lines":[{"x":1897.4815695600478,"y":2104.009512485137}]},{"x":1897.4815695600478,"y":2104.009512485137,"highlight":true,"active":true,"lines":[{"x":2010.7181926278245,"y":1238.2972651605235}]},{"x":2010.7181926278245,"y":1238.2972651605235,"highlight":true,"active":true,"lines":[{"x":1807.126365054602,"y":1086.349453978159}]},{"x":1807.126365054602,"y":1086.349453978159,"highlight":true,"active":true,"lines":[{"x":2127.6076099881097,"y":745.1700356718194}]},{"x":2127.6076099881097,"y":745.1700356718194,"highlight":true,"active":true,"lines":[{"x":1327.6456599286566,"y":577.1414982164091,"highlight":true,"active":true,"lines":[{"x":692.0594530321048,"y":1493.9928656361476}]}]}],"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":2127.6076099881097,"y":1342.4019024970275,"boundingBox":{"width":48.34228515625,"height":45,"left":499.193439971588,"top":352.5767274892367}},"invalidHandlePlacement":false},"uuid":"3ccb7e50-009a-48f1-995a-72fbc4a159a6","canComplete":false,"highlight":false,"polyBoundingBox":{"left":692.0594530321048,"top":577.1414982164091,"width":1435.548156956005,"height":1530.5208085612367},"meanStdDev":{"count":1321687,"mean":2175.2237095469654,"variance":395152.4595436761,"stdDev":628.6115330978872},"area":24330.682622047614,"location":"35w3","locationCode":"35w3","frameIndex":0,"imagePath":"20220413174701.124406_20220413174701124406_20220413174701.124406.10_0","lesionNamingNumber":0,"measurementNumber":0,"patientId":"","seriesInstanceUid":"20220413174701124406","sopInstanceUid":"20220413174701.124406.10","studyInstanceUid":"20220413174701.124406","timepointId":"TimepointId","toolType":"FreehandRoi","_id":"3ccb7e50-009a-48f1-995a-72fbc4a159a6"}')
// var dom = document.querySelector('.cornerstone-element')
// cornerstoneToolsHelp.setToolActive('FreehandRoi', { mouseButtonMask: 1, });
// var state = cornerstoneToolsHelp.getElementToolStateManager(dom)
// state.add(dom , 'FreehandRoi', a)
// cornerstoneHelp.updateImage(dom)

// cornerstoneToolsHelp.getToolForElement(dom,'FreehandScissors').setActiveStrategy('ERASE_OUTSIDE')


// var dom = document.querySelector('.cornerstone-element')
// cornerstoneToolsHelp.setToolActive('FreehandRoi', { mouseButtonMask: 1, });
// var state = cornerstoneToolsHelp.getElementToolStateManager(dom)
// var data = state.get(dom, 'FreehandRoi')?state.get(dom, 'FreehandRoi').data[0]:[]
// data.handles.points[0].x = 300;
// data.handles.points[0].y = 300;
// cornerstoneHelp.updateImage(dom)

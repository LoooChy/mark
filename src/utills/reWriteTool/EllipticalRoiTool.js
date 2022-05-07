import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as freehandIntersect from '../freehandIntersect.js';
import markText from '../textBoxText.js';


const initEllipticalRoiTool = (props) => {
    cornerstoneTools.EllipticalRoiTool.prototype.renderToolData = function (evt) {
        var _this2 = this;

        var toolData = cornerstoneTools.getToolState(evt.currentTarget, this.name);

        if (!toolData) {
            return;
        }

        var eventData = evt.detail;
        var image = eventData.image,
            element = eventData.element;
        var lineWidth = cornerstoneTools.toolStyle.getToolWidth();
        var lineDash = [4, 4];
        var _this$configuration = this.configuration,
            handleRadius = _this$configuration.handleRadius,
            drawHandlesOnHover = _this$configuration.drawHandlesOnHover,
            hideHandlesIfMoving = _this$configuration.hideHandlesIfMoving,
            renderDashed = _this$configuration.renderDashed;
        var context = cornerstoneTools.import('drawing/getNewContext')(eventData.canvasContext.canvas);

        var _getPixelSpacing = cornerstoneTools.import('util/getPixelSpacing')(image),
            rowPixelSpacing = _getPixelSpacing.rowPixelSpacing,
            colPixelSpacing = _getPixelSpacing.colPixelSpacing; // Meta


        var seriesModule = cornerstoneTools.external.cornerstone.metaData.get('generalSeriesModule', image.imageId) || {}; // Pixel Spacing

        var modality = seriesModule.modality;
        var hasPixelSpacing = rowPixelSpacing && colPixelSpacing;
        cornerstoneTools.import('drawing/draw')(context, function (context) {
            // If we have tool data for this element - iterate over each set and draw it
            for (var i = 0; i < toolData.data.length; i++) {
                var data = toolData.data[i];

                if (data.visible === false) {
                    continue;
                } // Configure


                var color = cornerstoneTools.toolColors.getColorIfActive(data);
                var handleOptions = {
                    color: color,
                    handleRadius: handleRadius,
                    drawHandlesIfActive: drawHandlesOnHover,
                    hideHandlesIfMoving: hideHandlesIfMoving
                };
                cornerstoneTools.import('drawing/setShadow')(context, _this2.configuration);
                //   Object(_drawing_index_js__WEBPACK_IMPORTED_MODULE_11__["setShadow"])(context, _this2.configuration);
                var ellipseOptions = {
                    color: color
                };

                if (renderDashed) {
                    ellipseOptions.lineDash = lineDash;
                } // Draw


                cornerstoneTools.import('drawing/drawEllipse')(context, element, data.handles.start, data.handles.end, ellipseOptions, 'pixel', data.handles.initialRotation);
                cornerstoneTools.import('drawing/drawHandles')(context, eventData, data.handles, handleOptions); // Update textbox stats

                if (data.invalidated === true) {
                    if (data.cachedStats) {
                        _this2.throttledUpdateCachedStats(image, element, data);
                    } else {
                        _this2.updateCachedStats(image, element, data);
                    }
                } // Default to textbox on right side of ROI


                if (!data.handles.textBox.hasMoved) {
                    var defaultCoords = cornerstoneTools.import('util/getROITextBoxCoords')(eventData.viewport, data.handles);
                    Object.assign(data.handles.textBox, defaultCoords);
                }

                var textBoxAnchorPoints = function textBoxAnchorPoints(handles) {
                    return _findTextBoxAnchorPoints(handles.start, handles.end);
                };

                var textBoxContent = markText(data,i);
                data.unit = _getUnit(modality, _this2.configuration.showHounsfieldUnits);
                cornerstoneTools.import('drawing/drawLinkedTextBox')(context, element, data.handles.textBox, textBoxContent, data.handles, textBoxAnchorPoints, color, lineWidth, 10, true);
            }
        });


    }

    cornerstoneTools.EllipticalRoiTool.prototype.createNewMeasurement = function (eventData){
        var goodEventData = eventData && eventData.currentPoints && eventData.currentPoints.image;
  
        if (!goodEventData) {
          logger.error("required eventData not supplied to tool ".concat(this.name, "'s createNewMeasurement"));
          return;
        }
  
        this.EllipticalRoiToolMouseUp = (eventData)=>{
            props.dispatch({
                type: "publicInfo/setShowMarkInforEdite",
                showMarkInforEdite: {
                    type:'EllipticalRoi',
                    show:true,
                    left:eventData.currentPoints.client.x,
                    top:eventData.currentPoints.client.y
                }
            });
            const element = document.querySelector('.cornerstone-element');
            element.removeEventListener('mouseup', handler);
    
        }
        var handler = this.EllipticalRoiToolMouseUp.bind(this,eventData);

        const element = this.element;
        element.addEventListener('mouseup', handler);

        return {
          visible: true,
          active: true,
          color: undefined,
          invalidated: true,
          handles: {
            start: {
              x: eventData.currentPoints.image.x,
              y: eventData.currentPoints.image.y,
              highlight: true,
              active: false
            },
            end: {
              x: eventData.currentPoints.image.x,
              y: eventData.currentPoints.image.y,
              highlight: true,
              active: true
            },
            initialRotation: eventData.viewport.rotation,
            textBox: {
              active: false,
              hasMoved: false,
              movesIndependently: false,
              drawnIndependently: true,
              allowedOutsideImage: true,
              hasBoundingBox: true
            }
          }
        };
      }
    function _getRectangleImageCoordinates(startHandle, endHandle) {
        return {
            left: Math.min(startHandle.x, endHandle.x),
            top: Math.min(startHandle.y, endHandle.y),
            width: Math.abs(startHandle.x - endHandle.x),
            height: Math.abs(startHandle.y - endHandle.y)
        };
    }
    function _getUnit(modality, showHounsfieldUnits) {
        return modality === 'CT' && showHounsfieldUnits !== false ? 'HU' : '';
    }
    function _findTextBoxAnchorPoints(startHandle, endHandle) {
        var _getRectangleImageCoo = _getRectangleImageCoordinates(startHandle, endHandle),
            left = _getRectangleImageCoo.left,
            top = _getRectangleImageCoo.top,
            width = _getRectangleImageCoo.width,
            height = _getRectangleImageCoo.height;

        return [{
            // Top middle point of rectangle
            x: left + width / 2,
            y: top
        }, {
            // Left middle point of rectangle
            x: left,
            y: top + height / 2
        }, {
            // Bottom middle point of rectangle
            x: left + width / 2,
            y: top + height
        }, {
            // Right middle point of rectangle
            x: left + width,
            y: top + height / 2
        }];
    }
}

export default initEllipticalRoiTool





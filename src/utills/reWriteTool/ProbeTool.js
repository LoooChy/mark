import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as freehandIntersect from '../freehandIntersect.js';
import markText from '../textBoxText.js';


const initProbeTool = (props) => {
    cornerstoneTools.ProbeTool.prototype.renderToolData = function (evt) {
        var _this2 = this;
        
        var eventData = evt.detail;
        var _this$configuration = this.configuration,
            handleRadius = _this$configuration.handleRadius,
            renderDashed = _this$configuration.renderDashed;
        var toolData = cornerstoneTools.getToolState(evt.currentTarget, this.name);
  
        if (!toolData) {
          return;
        } // We have tool data for this element - iterate over each one and draw it
  
  
        var context = cornerstoneTools.import('drawing/getNewContext')(eventData.canvasContext.canvas);
        var image = eventData.image,
            element = eventData.element;
        var fontHeight = cornerstoneTools.textStyle.getFontSize();
        var lineDash = [4, 4];
  
        var _loop = function _loop(i) {
          var data = toolData.data[i];
  
          if (data.visible === false) {
            return "continue";
          }
  
          cornerstoneTools.import('drawing/draw')(context, function (context) {
            var color = cornerstoneTools.toolColors.getColorIfActive(data);
  
            if (_this2.configuration.drawHandles) {
              // Draw the handles
              var handleOptions = {
                handleRadius: handleRadius,
                color: color
              };
  
              if (renderDashed) {
                handleOptions.lineDash = lineDash;
              }
  
              cornerstoneTools.import('drawing/drawHandles')(context, eventData, data.handles, handleOptions);
            } // Update textbox stats
  
  
            if (data.invalidated === true) {
              if (data.cachedStats) {
                _this2.throttledUpdateCachedStats(image, element, data);
              } else {
                _this2.updateCachedStats(image, element, data);
              }
            }
  
            var text;
            var _data$cachedStats = data.cachedStats,
                x = _data$cachedStats.x,
                y = _data$cachedStats.y
  
            if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
              text = markText(data,i);
  
             
  
  
              var coords = {
                // Translate the x/y away from the cursor
                x: data.handles.end.x + 3,
                y: data.handles.end.y - 3
              };
              var textCoords = cornerstoneTools.external.cornerstone.pixelToCanvas(eventData.element, coords);
            //   cornerstoneTools.import('drawing/drawTextBox')(context, str, textCoords.x, textCoords.y + fontHeight + 5, color);
              cornerstoneTools.import('drawing/drawTextBox')(context, text, textCoords.x, textCoords.y, color);
            }
          });
        };
  
        for (var i = 0; i < toolData.data.length; i++) {
          var _ret = _loop(i);
  
          if (_ret === "continue") continue;
        }
    }
    
    cornerstoneTools.ProbeTool.prototype.createNewMeasurement = function (eventData){
        var goodEventData = eventData && eventData.currentPoints && eventData.currentPoints.image;

        if (!goodEventData) {
          logger.error("required eventData not supplied to tool ".concat(this.name, "'s createNewMeasurement"));
          return;
        }

        this.ProbeToolMouseUp = (eventData)=>{
            props.dispatch({
                type: "publicInfo/setShowMarkInforEdite",
                showMarkInforEdite: {
                    type:'Probe',
                    show:true,
                    left:eventData.currentPoints.client.x,
                    top:eventData.currentPoints.client.y
                }
            });
            const element = document.querySelector('.cornerstone-element');
            element.removeEventListener('mouseup', handler);
    
        }
        var handler = this.ProbeToolMouseUp.bind(this,eventData);

        const element = this.element;
        element.addEventListener('mouseup', handler);
        return {
          visible: true,
          active: true,
          color: undefined,
          invalidated: true,
          handles: {
            end: {
              x: eventData.currentPoints.image.x,
              y: eventData.currentPoints.image.y,
              highlight: true,
              active: true
            }
          }
        };
        
    }
    
}

export default initProbeTool
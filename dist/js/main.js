"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,r,a){return r&&e(t.prototype,r),a&&e(t,a),t}}(),Calc=function(){function e(){var t=this;_classCallCheck(this,e),this.calcExprObj={value:""},this.calcScreen=document.querySelector(".calc__screen"),this.calcBoard=document.querySelector(".calc__keyboard"),this.prevInputExpression="",this.mapToParser=function(e){return t.bracketParser(e)},this.mapResultToView=function(e){return t.viewResult(e,t.calcScreen)},this.openBracketsCount,this.closeBracketsCount,this.checkSymbolsRegExp=/[^-\d\+\(\)\*\/]/g,this.checkExpressionRegExp=/^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+\(*-?\d+\)*$|^\(*-?\d+\)*$|\(*\d*/,this.checkBeforeInitCalcRegExp=/\d+\D+\d+/,this.avoidBracketsRegExp=/[^0-9_]/,this.operatorsPreorityCurve=[/[*\/]/,/[+-]/],this.bracketOpenIndex,this.bracketCloseIndex,this.calcScreen.oninput=function(){return t.bindInputVerification()},this.calcScreen.addEventListener("paste",this.bindInputVerification.bind(this)),this.calcScreen.addEventListener("cut",this.bindInputVerification.bind(this)),this.calcBoard.addEventListener("click",this.keyboardToScreen.bind(this)),document.addEventListener("keydown",this.keyboardToScreen.bind(this))}return _createClass(e,[{key:"bindInputVerification",value:function(){this.calcScreen.value=this.replaceExcessSymbols(value)}},{key:"viewResult",value:function(e,t){t.value=e}},{key:"replaceExcessSymbols",value:function(e,t){var r=e.replace(this.checkSymbolsRegExp,"");this.checkExpressionRegExp.test(r);return r.length<1?"":r}},{key:"keyboardToScreen",value:function(e){if("keydown"!==e.type)var t=e.target.textContent;else if(13!==e.keyCode&&27!==e.keyCode)return;var r="keydown"===e.type;r&&e.preventDefault(),r&&13===e.keyCode||"="===t?this.changeForCalculating(this.calcExprObj)&&this.mapToParser(this.calcExprObj):("c"===t||27===e.keyCode?this.calcScreen.value="":this.calcScreen.value=this.calcScreen.value+t,this.checkInput(this.calcExprObj))}},{key:"changeForCalculating",value:function(e){if(this.checkBeforeInitCalcRegExp.test(e.value)){var t=/\(\)/;e.value=e.value.replace(t,"");var r=this.openBracketsCount-this.closeBracketsCount;if(r>0)for(var a=0;a<r;a+=1)e.value+=")";return e.value=e.value.replace("(-","(_"),!0}}},{key:"connectBracketExprToResult",value:function(e,t){var r=this.cutStringToArrayExpr(e),a=this.parseCalc(r),c=void 0;if(t)return c=a>0?a+"":"_"+Math.abs(a),void(this.calcExprObj.value=this.replaceBracketExprToNum(this.calcExprObj.value,e,c));this.mapResultToView(a)}},{key:"bracketParser",value:function(e){for(;;){var t=e.value;if(this.bracketCloseIndex=t.indexOf(")"),-1===this.bracketCloseIndex)return void this.connectBracketExprToResult(t);this.bracketOpenIndex=t.lastIndexOf("(",this.bracketCloseIndex);var r=t.slice(this.bracketOpenIndex+1,this.bracketCloseIndex);this.connectBracketExprToResult(r,!0)}}},{key:"replaceBracketExprToNum",value:function(e,t,r){return e.replace("("+t+")",r)}},{key:"cutStringToArrayExpr",value:function(e){for(var t=[];;){var r=e.match(this.avoidBracketsRegExp);if(null===r)return t.push(parseInt(e.replace("_","-"),10)),t;var a=parseInt(e.substring(0,r.index).replace("_","-"),10),c=r[0];t.push(a,c),e=e.slice(r.index+1)}}},{key:"parseCalc",value:function(e){var t=this;return this.operatorsPreorityCurve.forEach(function(r){for(var a=0;a<e.length;a+=1)if(a%2!=0&&r.test(e[a])){var c=e[a],n=e[a-1],i=e[a+1],s=t.initMathExpr(n,c,i);e.splice(a-1,3,s),a-=1}}),e[0]}},{key:"initMathExpr",value:function(e,t,r){return"*"===t?e*r:"/"===t?e/r:"+"===t?e+r:"-"===t?e-r:void 0}}]),e}();new Calc;
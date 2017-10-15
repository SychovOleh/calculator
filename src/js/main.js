//** I didn't use React for this project because our View rendering really small for React and we would have only 3 Components.  */
//** And didn't use MVC cause Model component would have only one preoperty (input data). */

//** I divided all methods to two parts - Parser methods (Controller), View methods, and two methods in {constructer} */
//** for connecting View and Parser => {mapToParser}, {mapResultToView} */


class Calc {
  constructor() {
    this.calcScreen = document.querySelector('.calc__screen');
    this.calcBoard = document.querySelector('.calc__keyboard');

    this.calcExprObj = { value: '' }; //** main input result */

    //** listeners variables */ 
    this.prevInputExpression = '';
    this.openBracketsCount;
    this.closeBracketsCount;
    this.checkSymbolsRegExp = /[^-\d\+\(\)\*\/]/g;
    this.checkExpressionRegExp = /^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+\(*-?\d+\)*$|^\(*-?\d+\)*$|\(*\d*/;
    this.checkBeforeInitCalcRegExp = /\d+\D+\d+/;

    this.calcScreen.oninput = () => this.checkInput();
    this.calcScreen.addEventListener('paste', this.checkInput.bind(this))
    this.calcScreen.addEventListener('cut', this.checkInput.bind(this))
    this.calcBoard.addEventListener('click', this.keyboardToScreen.bind(this))
    document.addEventListener('keydown', this.keyboardToScreen.bind(this))


    this.mapToParser = (calcExprObj) => this.bracketParser(calcExprObj) //** way from View to Parser */
    this.mapResultToView = (result) => this.viewResult(result, this.calcScreen) //** way from Parser to View */

    //** parser variables */ 
    this.avoidBracketsRegExp = /[^0-9_]/;
    this.operatorsPreorityCurve = [/[*\/]/, /[+-]/];
    this.bracketOpenIndex;
    this.bracketCloseIndex;
  }

  //**view metods */
  checkInput() {
    const target = this.calcScreen;
    const newVal = target.value.replace(this.checkSymbolsRegExp, '') //** if paste => delete all excess symbols */

    if (target.value !== newVal) target.value = newVal;
    if (target.value.length < 1) return;

    const isExprCanCalculate = this.checkExpressionRegExp.test(target.value);

    if (!isExprCanCalculate) {
      target.value = this.prevInputExpression;
      return
    }

    this.openBracketsCount = target.value.replace(/[^\(]/g, '').length;
    this.closeBracketsCount = target.value.replace(/[^\)]/g, '').length;

    const bugSolvingRegExp = /[-\+\*\/][-\+\*\/]|-\)|^[-\+\*\/]/;
    if (this.closeBracketsCount > this.openBracketsCount || bugSolvingRegExp.test(target.value)) {
      target.value = this.prevInputExpression;
      return
    }

    this.calcExprObj.value = target.value;
    this.prevInputExpression = target.value;
  }

  keyboardToScreen(event) {
    if (event.type !== 'keydown') {
      var text = event.target.textContent;
    } else if (!(event.keyCode === 13 || event.keyCode === 27)) return;

    const isKeyDown = event.type === 'keydown';

    if (isKeyDown) event.preventDefault();

    if ((isKeyDown && event.keyCode === 13) || text === '=') {
      if (this.changeForCalculating(this.calcExprObj)) this.mapToParser(this.calcExprObj)
      return
    }

    text === 'c' || event.keyCode === 27 ? this.calcScreen.value = '' : this.calcScreen.value = this.calcScreen.value + text;

    this.checkInput(this.calcExprObj)
  }

  changeForCalculating(calcExprObj) {
    if (!this.checkBeforeInitCalcRegExp.test(calcExprObj.value)) return;

    const emptyBracketsRegExp = /\(\)/;
    calcExprObj.value = calcExprObj.value.replace(emptyBracketsRegExp, '')

    const bracketsCountDiffer = this.openBracketsCount - this.closeBracketsCount;

    if (bracketsCountDiffer > 0) {
      for (let i = 0; i < bracketsCountDiffer; i += 1) {
        calcExprObj.value += ')'
      }
    }

    calcExprObj.value = calcExprObj.value.replace('(-', '(_'); //** for parser understanding where are negative numbers */

    return true;
  }

  viewResult(result, inputPlace) {
    inputPlace.value = result;
  }





  //** PARSER METHODS */ 
  connectBracketExprToResult(expression, isIntermediateResult) {
    let arrExprNow = this.cutStringToArrayExpr(expression);
    const resNum = this.parseCalc(arrExprNow)
    let numAsString;

    if (isIntermediateResult) {
      //** negative number in bracketParser is figured out like '_Number' */
      resNum > 0 ? numAsString = resNum + '' : numAsString = `_${Math.abs(resNum)}`;

      this.calcExprObj.value = this.replaceBracketExprToNum(this.calcExprObj.value, expression, numAsString);
      return
    }

    this.mapResultToView(resNum)
  }

  bracketParser(calcExprObj) {
    while (true) {
      const calcString = calcExprObj.value

      this.bracketCloseIndex = calcString.indexOf(')');

      if (this.bracketCloseIndex === -1) {
        this.connectBracketExprToResult(calcString);
        return
      }

      this.bracketOpenIndex = calcString.lastIndexOf('(', this.bracketCloseIndex);
      const stringExpr = calcString.slice(this.bracketOpenIndex + 1, this.bracketCloseIndex);
      this.connectBracketExprToResult(stringExpr, true)
    }
  }

  replaceBracketExprToNum(calcString, expression, numberAsString) {
    return calcString.replace(`(${expression})`, numberAsString)
  }

  cutStringToArrayExpr(calcString) {
    let result = [];

    while (true) {
      const stringInfo = calcString.match(this.avoidBracketsRegExp);

      if (stringInfo === null) { //**last element lost (only operand) */
        result.push(parseInt(calcString.replace('_', '-'), 10));
        return result
      }

      const operandNow = parseInt(calcString.substring(0, stringInfo['index']).replace('_', '-'), 10);
      const operatorNow = stringInfo[0];
      result.push(operandNow, operatorNow)
      calcString = calcString.slice(stringInfo['index'] + 1);
    }
  }

  parseCalc(arrOfExpressions) {
    this.operatorsPreorityCurve.forEach(operatorsRegExp => {

      for (let i = 0; i < arrOfExpressions.length; i += 1) {

        if (i % 2 == 0 || !operatorsRegExp.test(arrOfExpressions[i])) continue;

        const operator = arrOfExpressions[i];
        const prevNum = arrOfExpressions[i - 1];
        const nextNum = arrOfExpressions[i + 1];

        const resNow = this.initMathExpr(prevNum, operator, nextNum);
        arrOfExpressions.splice(i - 1, 3, resNow)

        i -= 1; //**three array elements turned into one in this line. And for following in next */
        //** iteration to next array element we need turn back to previous array element. I didn't */
        //** use forEach because we can't do this step in functionals loop */
      }
    })

    const finishValue = arrOfExpressions[0];
    return finishValue
  }

  initMathExpr(num1, operator, num2) {
    if (operator === '*') {
      return num1 * num2;
    } else if (operator === '/') {
      return num1 / num2;
    } else if (operator === '+') {
      return num1 + num2;
    } else if (operator === '-') {
      return num1 - num2;
    }
  }
}
new Calc()
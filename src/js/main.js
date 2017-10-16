/** I divided all methods to three parts - Verification methods (first Controller), Parser methods (second Controller), */
/** View methods, and two methods in {constructor} for connecting View and Parser => {mapToParser}, {mapResultToView} */
/** Store (Model) has connection with (Controller) only*/
const ENTER_KEYCODE = 13;
const ESC_KEYCODE = 27;

class Calc {
  constructor() {
    /** STORE */
    this.calcStore = { inputVal: '', prevInputVal: '' };


    /** View variables */
    this.calcScreen = document.querySelector('.calc__screen');
    this.calcBoard = document.querySelector('.calc__keyboard');


    /** way from View to Parser */
    this.mapToParser = () => this.bracketParser(this.calcStore);
    /** way from Parser to View */
    this.mapResultToView = (result) => this.viewResult(result, this.calcScreen);



    /** Verification variables */
    this.openBracketsCount;
    this.closeBracketsCount;
    this.replaceRegExp = /[^-\d\+\(\)\*\/]/g;
    this.fullStringVerificationRegExp = /^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+$|^(\(*-?\d+\)*[-\+\*\/]{1}\(*-?)+\(*-?\d+\)*$|^\(*-?\d+\)*$|\(*\d*/;
    this.piecesOfStringRegExp = /[-\+\*\/][-\+\*\/]|-\)|^[-\+\*\/]|\d\(/;
    this.emptyBracketsRegExp = /\(\)/;
    this.oneNumInBracketsRegExp = /\(\_\d+\)/;

    /** Parser variables */
    this.avoidBracketsRegExp = /[^0-9_]/;
    this.operatorsPreorityCurve = [/[\*\/]/, /[\+\-]/];
    this.bracketOpenIndex;
    this.bracketCloseIndex;


    this.calcScreen.oninput = () => this.viewInputVerification();
    this.calcScreen.addEventListener('paste', this.viewInputVerification.bind(this))
    this.calcScreen.addEventListener('cut', this.viewInputVerification.bind(this))
    this.calcBoard.addEventListener('click', this.keyboardToScreen.bind(this))
    document.addEventListener('keydown', this.keyboardToScreen.bind(this))
  }

  /** View metods */
  viewResult(result, inputPlace) {
    inputPlace.value = result;
  }

  keyboardToScreen(event) {
    const isKeyDown = event.type === 'keydown';

    if (!isKeyDown) {
      var button = event.target.textContent;
    } else if (!(event.keyCode === ENTER_KEYCODE || event.keyCode === ESC_KEYCODE)) return;

    if (isKeyDown) event.preventDefault();

    if (button === 'c' || event.keyCode === ESC_KEYCODE) {
      this.calcScreen.value = '';
      this.clearStoreFromView()
      return
    } else if (button === '=' || event.keyCode === ENTER_KEYCODE) {
      this.viewInputVerification(true)
      return
    }

    this.calcScreen.value = this.calcScreen.value + button;
    this.viewInputVerification()
  }

  viewInputVerification(isResultVerification) {
    const target = this.calcScreen;

    if (isResultVerification) {
      this.prepareBeforeParse(target.value)
      this.mapToParser()
      return;
    }

    target.value = this.replaceExcessSymbols(target.value);

    if (target.value.length < 1) return;

    let isPrevResObj = { result: false }
    target.value = this.mainVerification(target.value, isPrevResObj);

    if (isPrevResObj.result) return;

    target.value = this.piecesVerification(target.value);
  }


  /** Verification methods */
  clearStoreFromView(store = this.calcStore) {
    for (let key in store) {
      store[key] = '';
    }
  }

  prepareBeforeParse(value, emptyBracketsRule = this.emptyBracketsRegExp, oneNegativeNumRule = this.oneNumInBracketsRegExp) {
    /** This method delets all brackets those empty, adds close brackets if they did not add while */
    /** typing, changs negative symbol for parser better understandig and delets brackets */
    /** around of negative number */

    value = value.replace(emptyBracketsRule, '')

    const bracketsCountDiffer = this.openBracketsCount - this.closeBracketsCount;

    for (let i = 0; i < bracketsCountDiffer; i += 1) {
      value += ')'
    }

    /** for parser understanding where are negative numbers */
    value = value.replace(/\(\-/g, '(_');

    let oneNegativeNumInBrackets = oneNegativeNumRule.exec(value);

    while (oneNegativeNumInBrackets !== null) {
      const firstIndex = oneNegativeNumInBrackets['index'];
      const lastIndex = value.indexOf(')', firstIndex);

      let firstPartValue = value.substring(0, firstIndex);
      let negativeNum = value.substring(firstIndex + 1, lastIndex);
      let lastPartValue = value.substring(lastIndex + 1, value.length)
      negativeNum = negativeNum.replace(/[\(\)]/g, '')

      value = firstPartValue + negativeNum + lastPartValue
      oneNegativeNumInBrackets = oneNegativeNumRule.exec(value);
    }

    this.calcStore.inputVal = value;
  }

  replaceExcessSymbols(value, replaceRule = this.replaceRegExp) {
    /** if is pasted with keyboard */
    const res = value.replace(replaceRule, '')
    if (res.length < 1) this.calcStore.prevInputVal = '';
    return res
  }

  mainVerification(value, isPrevResObj, verificationRule = this.fullStringVerificationRegExp) {
    const isVerified = verificationRule.test(value);

    if (!isVerified) {
      isPrevResObj.result = true;
      return this.calcStore.prevInputVal
    }

    return value
  }

  piecesVerification(value, smallVerification = this.piecesOfStringRegExp) {
    this.openBracketsCount = value.replace(/[^\(]/g, '').length;
    this.closeBracketsCount = value.replace(/[^\)]/g, '').length;

    if (this.closeBracketsCount > this.openBracketsCount || smallVerification.test(value)) {
      return this.calcStore.prevInputVal
    }

    this.calcStore.prevInputVal = value;
    this.calcStore.inputVal = value;
    return value;
  }


  /** PARSER METHODS */
  connectBracketExprToResult(expression, isIntermediateResult) {
    let arrExprNow = this.cutStringToArrayExpr(expression);
    const resNum = this.parseCalc(arrExprNow)
    let numAsString;

    if (isIntermediateResult) {
      /** negative number in bracketParser is figured out like '_Number' */
      resNum > 0 ? numAsString = resNum + '' : numAsString = `_${Math.abs(resNum)}`;

      this.calcStore.inputVal = this.replaceBracketExprToNum(this.calcStore.inputVal, expression, numAsString);
      return
    }

    this.mapResultToView(resNum)
  }

  bracketParser(calcStore) {
    while (true) {
      const calcString = calcStore.inputVal

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

      if (stringInfo === null) { /** last element lost (only operand) */
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

        i -= 1; /**three array elements turned into one in this line. And for following in next */
        /** iteration to next array element we need turn back to previous array element. I didn't */
        /** use forEach because we can't do this step in functionals loop */
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
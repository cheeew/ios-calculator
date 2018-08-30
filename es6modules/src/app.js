// Load lightweight mathjs
import core from 'mathjs/core';
const math = core.create();
// Import format to resolve floating point conundrum
math.import(require('mathjs/lib/function/string/format'));


const numberButtons = [...document.querySelectorAll('.row li .number')],
operatorButtons = [...document.querySelectorAll('.row li .operator')],
calcDisplay = document.querySelector('.display .value'),
clearButton = document.querySelector('#AC'),
plusMinus = document.querySelector('#plus-minus'),
percentage = document.querySelector('#percentage'),
equals = document.querySelector('#equals');
let currentValue = '',
prevCurrent = '',
lastValue = '',
result = '',
firstOp = '',
selectedOperator = '';

function clearLogic() {
    calcDisplay.innerHTML = '0';
    clearButton.innerHTML = 'AC';

    // Clears everything on calculator
    if (!currentValue && calcDisplay.innerHTML === '0') {
        currentValue = '';
        lastValue = '';
        selectedOperator = '';
        result = '';
        prevCurrent = '';
        
        // Clears any active operators
        operatorButtons.map(button => {
            if (button.className === 'operator active') {
                button.classList.remove('active');
            }
        });
    }

    // Clears everything if equals button was last button pressed
    if(equals.className === 'operator pressed') {
        lastValue = '';
        currentValue = 0;
        calcDisplay.innerHTML = currentValue;
        selectedOperator = '';
    }

    // Allows user to clear second value w/o erasing previously entered value
    if (selectedOperator) {
        calcDisplay.innerHTML = '0';
        currentValue = '';
        
        operatorButtons.map(button => {
            // Re-highlights last selected operator
            if (button.dataset.symbol === selectedOperator) {
                button.classList.add('active');
            }
        });
    } 
}

function numberWithCommas(num) {
    // Function to add commas
    const number = num.toString().replace(/,/g, '');
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function displayEntry() {
    // Changes initial zero to selected number, changes AC button to display C
    if (calcDisplay.innerHTML === '0') {
        clearButton.innerHTML === 'AC' ? clearButton.innerHTML = 'C' : '';
        calcDisplay.innerHTML = this.textContent;  

        // keeps starting zero value for values < 1
        this.textContent === '.' ? calcDisplay.innerHTML = "0." : '';
    }

    // Limits length to 11 character
    else if (calcDisplay.innerHTML.length === 11) return; 

    // Adds commas to the entry
    else if (calcDisplay !== '0' && !calcDisplay.innerHTML.includes('.')) {
        const number = `${calcDisplay.textContent}${this.textContent}`;
        calcDisplay.innerHTML = numberWithCommas(number);
    }

    // In response to the presence of a decimal
    else if (calcDisplay.innerHTML.includes('.')) {
        // Present "0." if decimal is pressed after selecting an operator
        operatorButtons.map(button => { 
            if (button.className === "operator active" && this.textContent === '.') {
                calcDisplay.innerHTML = '0.';
                button.classList.remove('active');
            }
        });

        // Curtails additional commas after decimal has been entered
        if (this.innerHTML === '.') return;

        //  Appends numbers onto display when decimal is present
        calcDisplay.innerHTML = `${calcDisplay.textContent}${this.textContent}`;
    }

    // Stores previous value after having selected an operator and new number
    operatorButtons.forEach(button => {
        const isActive = button.className==='operator active';
        if (isActive && this.textContent === '.') {
            button.classList.remove('active');
            calcDisplay.innerHTML = '0.';
        }
        else if (isActive) {
            button.classList.remove('active');
            calcDisplay.innerHTML = this.textContent;
        }
    });

    if (equals.className.includes('pressed')) { 
        calcDisplay.innerHTML = this.textContent === '.' ? '0.' : this.textContent;
        equals.classList.remove('pressed');
        result = '';
        lastValue = '';
        prevCurrent = '';
    }

    // Stores current value displayed on calculator
    const hasNoComma = calcDisplay.innerHTML.replace(/,/g, '');
    currentValue = parseFloat(hasNoComma);
}

const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '/': (a, b) => a / b,
    '*': (a, b) => a * b
}

function pemdasLogic() {
    // Enables pemdas recursion
    if(firstOp && (this.dataset.symbol === '*' || this.dataset.symbol === '/')) {
        this.classList.add('active');
        prevCurrent = operators[selectedOperator](prevCurrent, currentValue);
        calcDisplay.innerHTML = prevCurrent;
        selectedOperator = this.dataset.symbol;
        return;
    }

    // If pemdas is in effect, multiplication & division portion will be handled first
    // Remaining portion gets computed on lines 168 - 174
    if (lastValue && prevCurrent && currentValue) {
        const pemdasResult = operators[selectedOperator](prevCurrent, currentValue);
        currentValue = pemdasResult;
        prevCurrent = '';
        selectedOperator = firstOp;
        return firstOp = '';
    }
    
    // Captures previously selected operator
    firstOp = selectedOperator;

    // Stores current value to prevCurrent variable if pemdas equation is in effect
    if ((firstOp === '+' || firstOp === '-') && (this.dataset.symbol === '/' || this.dataset.symbol === '*')) {
        console.log(this);
        selectedOperator = this.dataset.symbol;
        this.classList.add('active');
        prevCurrent = currentValue;
        currentValue = '';
    }
}


function chooseOperator() {
    // Removes "active" class from the previously selected operator
    operatorButtons.map(button => button.className === 'operator active' && !prevCurrent ? button.classList.remove('active') : '');

    // Allows user to continually calculate without needing to hit the equals button
    if (lastValue && !result && this.id !== 'equals') {

        // if pemdas equation is in order do not calculate anything
        if (prevCurrent) return

        // if pemdas equation does not exist or has already computed then perform regular calculation
        if (!prevCurrent) {
            this.classList.add('active');
            prevCurrent = '';
            const ans = operators[selectedOperator](lastValue, currentValue);
            lastValue = parseFloat(math.format(ans, {precision: 10}));
            selectedOperator = this.dataset.symbol;
            currentValue = '';
            calcDisplay.innerHTML = lastValue.toLocaleString('en', {maximumSignificantDigits: 9});
            firstOp = '';
        }
    }

    // Stores previous numerical value, selected operator & highlights active operator
    if (this.id !== 'equals' && !lastValue) {
        lastValue = currentValue;
        selectedOperator = this.dataset.symbol;
        this.classList.add('active');
    }

    // Allows user to continue computing additional equations after having pressed equals button
    operatorButtons.map(button => {
        if (result === lastValue && equals.className === 'operator pressed') {
            this.id !== 'equals' ? this.classList.add('active') : '';
            equals.className === 'operator pressed' ? equals.classList.remove('pressed') : '';
            result = '';
            selectedOperator = this.dataset.symbol;
        }
    });

    // Removes 'pressed' id from equals if the class existed
    equals.id === 'pressed' ? equals.classList.remove('pressed') : '';
}

function calculate() {
    // Avoids duplicate pemdas calculations
    // pemdas calculations occurs via line 139 followed by line 170
    if(prevCurrent) return;

    // Indicates button has been pressed
    this.classList.add('pressed');
    if(!lastValue) return;
    
    const ans = operators[selectedOperator](lastValue, currentValue);
    result = parseFloat(math.format(ans, {precision: 10}));
    calcDisplay.innerHTML = result.toLocaleString('en', {maximumSignificantDigits: 9});
    firstOp = '';
    selectedOperator = '';
    const hasNoComma = result.toString().replace(/,/g, '');
    lastValue = parseFloat(hasNoComma);
}

function log() {
    console.log({ lastValue, prevCurrent, currentValue, result });
    console.log(`firstOp: ${firstOp}, selectedOperator: ${selectedOperator}`);
}

clearButton.addEventListener('click', clearLogic);
numberButtons.map(button => button.addEventListener('click', displayEntry));
operatorButtons.map(button => button.addEventListener('mouseup', pemdasLogic));
operatorButtons.map(button => button.addEventListener('mouseup', chooseOperator));
equals.addEventListener('click', calculate);
plusMinus.addEventListener('click', () => {
    calcDisplay.innerHTML *= -1;
    currentValue = parseFloat(calcDisplay.innerHTML);
});
percentage.addEventListener('click', () => {
    calcDisplay.innerHTML *= 0.01;
    currentValue = parseFloat(calcDisplay.innerHTML);
});
document.body.addEventListener('click', log);

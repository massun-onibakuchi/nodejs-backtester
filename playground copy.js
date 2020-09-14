function f(phrase, parentClass) {
    return class Dog extends parentClass {
        constructor(phrase) {
            super(phrase)
            this.phrase = phrase;
        }
        sayHi() { console.log('phrase :>> ', phrase) }
   
    }
}
function genBackTest(phrase, parentClass) {
    return class Dog extends parentClass {
        constructor(phrase) {
            super(phrase)
            this.phrase = phrase;
        }
        sayHi() { console.log('phrase :>> ', phrase) }
        runTest() {
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
            console.log('backtsting');
        }
    }
}
function genBackTest(phrase, parentClass) {
    return class BackTester extends parentClass {
        constructor(phrase) {
            super(phrase)
            this.phrase = phrase;
        }
        sayHi() { console.log('phrase :>> ', phrase) }
        runTest() {
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
            console.log('backtsting');
        }
    }
}

class Animal {

    constructor(name) {
        this.speed = 0;
        this.name = name;
    }

    run(speed) {
        this.speed += speed;
        console.log(`${this.name} runs with speed ${this.speed}.`);
    }

    stop() {
        this.speed = 0;
        console.log(`${this.name} stopped.`);
    }
}


class Base {
    constructor(ohlcv, profit, loss, dd) {
        this.ohlcv = ohlcv;
        this.profit = profit;
        this.loss = loss;
        this.dd = dd;
    }
    runTest() {
    }
    addOhlcv(ohlcv) {
        this.ohlcv = ohlcv
        console.log('backtsting');
    }
}
class Strategy /*extends  Base */ {
    constructor(...args) {
        super(...args);
    }
    sma() { }
    next() { console.log('next'); }
    init() { }
    /*     addOhlcv() {
            super.addOhlcv([0, 0, 0, 0])
            console.log('addOhlcv');
        } */
}

class MyStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }
    next() {
        super.next()
        console.log('next');
    }
    init() { }
    addOhlcv() {
        super.addOhlcv()
        console.log('addOhlcv in myStrategy');
    }
}

class User extends f("Hello", Animal) { }
// class User2 extends f { }

instance = new User(); // Hello
// instance2 = new User2("Hello", Animal); // Hello
DogClass = f('hoe', Animal);
console.log('instance :>> ', instance);
console.log('DogClass :>> ', DogClass);
dog = new DogClass('hoge')
console.log('dog :>> ', dog);

// console.log('Animal :>> ', Animal);
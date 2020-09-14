'use strict'

function genBackTest(ohlcv, parentClass) {
    return new class BackTester extends parentClass {
        constructor(allOhlcv, balance, commsion) {
            super(ohlcv)
            this.allOhlcv = allOhlcv.reverse()
            this.length = ohlcv.length;
            this.ohlcv = []
            this.open = []
            this.high = []
            this.low = []
            this.close = []
            this.volume = []
            this.position = { timestamp: 0, qty: 0, aveOpenPrice: 0 }
        }
        runTest() {
            super.next()
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
            console.log('backtsting');
        }
        entry(qty) {
            // this.position = { timestamp: length, qty: qty, aveOpenPrice: this.open[this.open.length - 1] }
            this.position['timestamp'] = length;
            const originQty = this.position['qty'];
            this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + this.allOhlcv[this.length - 1][0] * qty) / (originQty + qty)
            this.position['qty'] += qty;
        }
        buy() {
            this.buyEntry = { timestamp: Date.now(), qty: 1, price: this.open[this.open.length - 1] }
        }
        sell() {
            this.buyEntry = { timestamp: Date.now(), qty: 1, price: this.open[this.open.length - 1] }
        }
        //最後にnextで呼ぶ
        updateOhlcv() {
            const next = this.allOhlcv.pop();
            this.Ohlcv.push(next); //nextOhlcv
        }
    }(ohlcv)
}
//必要か？？backtest classにつければいいんじゃね>?
class TradeManagement {
    constructor(allOhlcv, balance, commsion) {
        this.allOhlcv = allOhlcv.reverse()
        this.length = ohlcv.length;
        this.ohlcv = []
        this.open = []
        this.high = []
        this.low = []
        this.close = []
        this.volume = []
        this.position = { timestamp: 0, qty: 0, aveOpenPrice: 0 }
    }

    entry(qty) {
        // this.position = { timestamp: length, qty: qty, aveOpenPrice: this.open[this.open.length - 1] }
        this.position['timestamp'] = length;
        const originQty = this.position['qty'];
        this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + this.allOhlcv[this.length - 1][0] * qty) / (originQty + qty)
        this.position['qty'] += qty;
    }
    buy() {
        this.buyEntry = { timestamp: Date.now(), qty: 1, price: this.open[this.open.length - 1] }
    }
    sell() {
        this.buyEntry = { timestamp: Date.now(), qty: 1, price: this.open[this.open.length - 1] }
    }
    //最後にnextで呼ぶ
    updateOhlcv() {
        const next = this.allOhlcv.pop();
        this.Ohlcv.push(next); //nextOhlcv
    }

}

class Strategy extends TradeManagement {
    // constructor(ohlcv, balance, commsion) {
    //     super(ohlcv, balance, commsion)
    //     this.profit = 0
    //     this.loss = 0
    //     this.dd = 0
    // }

    sma() { return this.ohlcv }
    //nextはStrategyには不要かも
    next() {
        // 
    }

    init() { }
}

class MyStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }
    // イテレートするアルゴ
    next() {
        //nextはStrategyには不要かも
        super.next()
        super.buy()
    }
    // innjiとかの初期化
    init() { }
    /*     addOhlcv() {
            super.addOhlcv()
            console.log('addOhlcv in myStrategy');
        } */
}


const bt = genBackTest([1, 2, 3, 4, 5], MyStrategy);
console.log('bt :>> ', bt);
console.log('bt instanceof MyStrategy :>> ', bt instanceof MyStrategy);
console.log('bt instanceof Strategy :>> ', bt instanceof Strategy);
console.log('bt.profit :>> ', bt.profit);
console.log('bt.buyEntry :>> ', bt.buyEntry);
console.log('bt.sma() :>> ', bt.sma());
console.log('bt.next() :>> ', bt.next());
console.log('bt.addOhlcv([0,32,21,1,2]) :>> ', bt.addOhlcv([0, 32, 21, 1, 2]));
console.log('bt.ohlcv :>> ', bt.ohlcv);
console.log('bt.buyEntry :>> ', bt.buyEntry);


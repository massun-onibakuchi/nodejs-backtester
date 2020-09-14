'use strict'

function genBackTest(ohlcv, parentClass, from) {
    return new class BackTester extends parentClass {
        constructor(allOhlcv, balance, commsion, from) {
            // super();
            this.from = from
            this.allOhlcv = allOhlcv.reverse()
            this.length = this.allOhlcv.length;
            this.ohlcv = []
            this.open = []
            this.high = []
            this.low = []
            this.close = []
            this.volume = []
            super.init() //インジ初期化
        }
        runTest() {
            // イテレートする for??
            super.next()
            this.updateOhlcv()
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
            console.log('backtsting');
        }
        updateOhlcv() {
            const next = this.allOhlcv.pop();
            this.ohlcv.push(next); //nextOhlcv
            this.length--;
        }

    }(ohlcv, from)
}

class TradeManagement {
    constructor() {
        // this.profit = 0
        // this.loss = 0
        // this.dd = 0
        this.snapshot = this.balance;
        this.lot = 1
        this.buyPnL = []
        this.sellPnL = []
        this.buyRecord=[,]
        this.sellRecord=[,]
        this.position = { timestamp: 0, qty: 0, aveOpenPrice: 0 }
    }

    entry(qty) {
        // this.position = { timestamp: length, qty: qty, aveOpenPrice: this.open[this.open.length - 1] }

        this.position['timestamp'] = length;
        const originQty = this.position['qty'];
        this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + this.allOhlcv[this.length - 1][0] * qty) / (originQty + qty)
        this.position['qty'] += qty;

        this.recordPnL();
    }
    buy() {
        this.position['timestamp'] = length;
        const originQty = this.position['qty'];
        this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + this.allOhlcv[this.length - 1][0] * qty) / (originQty + qty)
        this.position['qty'] += qty;

        if (originQty < 0) {

            this.recordPnL();
        }
    }
    sell(ordQty) {
        const qty = ordQty > 0 ? -ordQty : ordQty;
        const originQty = this.position['qty'];
        /**@todo ピラッミッディング制限*/

        if (originQty > 0) {
            this.position['aveOpenPrice'] = this.allOhlcv[this.length - 1][0];
            this.position['qty'] = qty;
            this.recordPnL();
        }
        if (originQty < 0) {
            // if (qty > originQty) qty
            this.position['timestamp'] = length;
            this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + this.allOhlcv[this.length - 1][0] * qty) / (originQty + qty)
            this.position['qty'] += qty;
        }
  
    }
    //最後にnextで呼ぶ
    // updateOhlcv() {
    //     const next = this.allOhlcv.pop();
    //     this.Ohlcv.push(next); //nextOhlcv
    // }
    parseOhlcv() { }
    recordPnL() {
        this.balance
    }
}

class Strategy extends TradeManagement {
    constructor(ohlcv, balance, commsion) {
        super(ohlcv, balance, commsion)
        // this.profit = 0
        // this.loss = 0
        // this.dd = 0
    }
    sma() {

    }
    //nextはStrategyには不要かも
    next() {
        // 
    }
    setUnusedLength() { }
    init() { }
}

class MyStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }
    // イテレートするアルゴ
    next() {
        //nextはStrategyには不要かも
        // super.next()
        // super.buy()
    }
    signal() { }
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
console.log('bt.sma() :>> ', bt.sma());
console.log('bt.next() :>> ', bt.next());
console.log('bt.addOhlcv([0,32,21,1,2]) :>> ', bt.addOhlcv([0, 32, 21, 1, 2]));
console.log('bt.ohlcv :>> ', bt.ohlcv);
console.log('bt.buyEntry :>> ', bt.buyEntry);
bt.callHoge()

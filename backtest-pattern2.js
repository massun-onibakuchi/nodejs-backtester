'use strict'

function genBackTest(ohlcv, parentClass, from) {
    return new class BackTester extends parentClass {
        constructor(allOhlcv, balance, commsion, maxPyramiding, from) {
            super(allOhlcv);
            this.from = from
            this.maxPyramiding = maxPyramiding;
            this.balance = balance;
            this.allOhlcv = allOhlcv.reverse()
            // this.length = allOhlcv.length;
            // this.ohlcv = [];
            this.ohlcv = allOhlcv.slice(0, from);
            this.open = []
            this.high = []
            this.low = []
            this.close = []
            this.volume = []
            this.parseOhlcv(ohlcv)
            super.init(allOhlcv) //インジ初期化
        }
        runTest() {
            // イテレートする for??
            const length = this.allOhlcv.length - this.ohlcv.length
            for (let i = 0; i < length; i++) {
                super.next()
                this.updateOhlcv()
                this.updateDrawDown()
            }
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
        }
        parseOhlcv(ohlcv) {
            const length = ohlcv.length;
            for (let i = 0; i < length; i++) {
                const el = ohlcv[i];
                this.open.push(el[0])
                this.high.push(el[1])
                this.low.push(el[2])
                this.close.push(el[3])
                this.volume.push(el[4])
            }

        }
        updateOhlcv() {
            const next = this.allOhlcv.pop();
            this.ohlcv.unshift(next); //nextOhlcv
            // this.ohlcv.push(next); //nextOhlcv
            this.length--;
            this.count++;
        }
        updateDrawDown() {
            const dd = this.maxBalance - this.provisionalBalance[this.ohlcv.length - 1]
            if (dd - this.maxDD > 0) this.maxDD = dd;
        }

    }(ohlcv, from)
}

class TradeManagement {
    constructor() {
        // this.profit = 0
        // this.loss = 0
        // this.dd = 0
        this.buyPnL = []
        this.sellPnL = []
        this.maxDD = 0;
        this.maxBalance = this.balance;
        this.provisionalBalance = [this.balance];
        this.position = { timestamp: 0, qty: 0, aveOpenPrice: 0 }
    }

    entry(qty) {
        // const prevQty = this.position['qty'];
        // const qty = ordQty > 0 ? -ordQty : ordQty;
        // this._entry(qty, (ordQty > 0 ? 1 : -1) * prevQty);
        return (qty > 0 ? this.buy(qty) : this.sell(qty))
    }
    _entry(qty, prevQty) {
        const length = this.open.length
        if (qty == 0) return
        const open = this.allOhlcv[length - 1][0]
        // buypositionなら手仕舞ってドテン
        let pnl = 0;
        if (prevQty < 0) {
            pnl = this.recordPnL(open, prevQty);
            this.position['aveOpenPrice'] = open;
            this.position['qty'] = qty;
        }
        //sellpositionなら積む
        /**@todo ピラッミッディング 含み益なら積む*/
        if (prevQty > 0) {
            if (Math.abs(qty) >= this.maxPyramiding) return
            this.position['timestamp'] = length;
            this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * prevQty + open * qty) / (prevQty + qty)
            this.position['qty'] += qty;
        }
        return pnl
    }
    buy(qty) {
        const prevQty = this.position['qty'];
        const pnl = this._entry(qty, prevQty);
        this.sellPnL[this.ohlcv.length - 1] = pnl;
        this.updateBalance(pnl);
    }
    sell(ordQty) {
        const qty = ordQty > 0 ? -ordQty : ordQty;
        const prevQty = this.position['qty'];
        const pnl = this._entry(qty, -prevQty);
        this.buyPnL[this.ohlcv.length - 1] = pnl;
        this.updateBalance(pnl);
        // /* 
        //         const qty = ordQty > 0 ? -ordQty : ordQty;
        //         const originQty = this.position['qty'];
        //         const open = this.allOhlcv[this.length - 1][0]

        //         // buypositionなら手仕舞ってドテン
        //         if (originQty > 0) {
        //             this.recordPnL(open, originQty);
        //             this.position['aveOpenPrice'] = open;
        //             this.position['qty'] = qty;
        //         }

        //         //sellpositionなら積む
        //         /**@todo ピラッミッディング 含み益なら積む*/
        // if (originQty < 0) {
        //     if (Math.abs(qty) >= this.maxPyramiding) return
        //     this.position['timestamp'] = length;
        //     this.position['aveOpenPrice'] = (this.position['aveOpenPrice'] * originQty + open * qty) / (originQty + qty)
        //     this.position['qty'] += qty;
        // } 
    }
    updateBalance(pnl) {
        const length = this.provisionalBalance.length;
        this.provisionalBalance[length - 1] = this.provisionalBalance[length - 2] + pnl;
    }
    getBalance() {
        return this.provisionalBalance[this.ohlcv.length - 1];
    }
    recordPnl(exitPrice, qty) {
        return qty * (exitPrice - this.position['aveOpenPrice']);
    }
    valuate() {
        //buyPnlからトレード数
        const winBuyPnl = this.buyPnL.filter(el => el > 0)
        const lossBuyPnl = this.buyPnL.filter(el => el < 0)
        // const nonZeroSellPnl = this.sellPnL.filter(el => el > 0)

        const tradeCount = winBuyPnl.length + nonZeroSellPnl.length;
        //勝率
        const buyWinRatio = winBuyPnl.length / lossBuyPnl.length;
        //総利益 
        const buyProfit = winBuyPnL.reduce(accu, current => accu + current)

        // 総損失 
        const buyLoss = lossBuyPnL.reduce(accu, current => accu + current)

        // 総損益 
        const totalReturn = this.provisionalBalance[this.provisionalBalance.length - 1]

        // プロフィットファクター

        //DD:資産額を時系列で並べて、それぞれの時点以前の最大資産額からの差を計算して、 そのうち最大のマイナス幅のものが最大ドローダウン
        const maxDD = this.maxDD

    }
}

class Strategy extends TradeManagement {
    constructor(balance, commsion) {
        super(balance, commsion);
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
console.log('bt.sma() :>> ', bt.sma());
console.log('bt.next() :>> ', bt.next());
console.log('bt.addOhlcv([0,32,21,1,2]) :>> ', bt.addOhlcv([0, 32, 21, 1, 2]));
console.log('bt.ohlcv :>> ', bt.ohlcv);
console.log('bt.buyEntry :>> ', bt.buyEntry);

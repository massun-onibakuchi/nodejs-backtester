'use strict'
const { fetchOHLCV } = require('./ccxtExchange');

function genBackTest(ohlcv, parentClass, balance, commsion, pyramiding, from) {
    return new class BackTester extends parentClass {
        constructor(allOhlcv, balance, commsion, pyramiding, from) {
            super(balance, commsion, pyramiding);
            // this.ohlcv = [];
            this.allOhlcv = allOhlcv.reverse()
            this.ohlcv = allOhlcv.slice(0, from);
            this.timestamp=[]
            this.open = []
            this.high = []
            this.low = []
            this.close = []
            this.volume = []
            this.parseOhlcv(ohlcv)
            this.from = from;
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
            this.valuate()
        }
        addOhlcv(ohlcv) {
            this.ohlcv = ohlcv
        }
        parseOhlcv(ohlcv) {
            const length = ohlcv.length;
            for (let i = 0; i < length; i++) {
                const el = ohlcv[i];
                this.timestamp.push(el[0])
                this.open.push(el[1])
                this.high.push(el[2])
                this.low.push(el[3])
                this.close.push(el[4])
                this.volume.push(el[5])
            }

        }
        updateOhlcv() {
            const next = this.allOhlcv.pop();
            this.ohlcv.unshift(next); //nextOhlcv
            // this.ohlcv.push(next); //nextOhlcv
            this.timestamp.push(next[0])
            this.open.push(next[1])
            this.high.push(next[2])
            this.low.push(next[3])
            this.close.push(next[4])
            this.volume.push(next[5])
            this.count++;
        }
        updateDrawDown() {
            const dd = this.maxBalance - this.provisionalBalance[this.ohlcv.length - 1]
            if (dd - this.maxDD > 0) this.maxDD = dd;
        }
        plot() { }

    }(ohlcv, balance, commsion, pyramiding, from)
}

class TradeManagement {
    constructor(balance, commsion, pyramiding) {
        this.commsion = commsion;
        this.pyramiding = pyramiding;
        this.buyPnL = []
        this.sellPnL = []
        this.maxDD = 0;
        this.maxBalance = balance;
        this.provisionalBalance = [balance];
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
        // 違うサイドのpositionなら手仕舞ってドテン
        let pnl = 0;
        if (prevQty < 0) {
            pnl = this.recordPnL(open, prevQty);
            this.position['aveOpenPrice'] = open;
            this.position['qty'] = qty;
        }
        //同じサイドのpositionなら積む
        /**@todo ピラッミッディング 含み益なら積む*/
        if (prevQty > 0 && Math.abs(qty) < this.pyramiding) {
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
        const winBuyPnL = this.buyPnL.filter(el => el > 0)
        const lossBuyPnL = this.buyPnL.filter(el => el < 0)
        const winSellPnL = this.sellPnL.filter(el => el > 0)
        const lossSellPnL = this.sellPnL.filter(el => el > 0)

        const tradeCount = winBuyPnL.length + lossBuyPnL.length + winSellPnL.length + lossSellPnL.length;
        //勝率
        const winRatio = (winBuyPnL.length + winSellPnL.length) / tradeCount;
        //総利益 
        const buyProfit = winBuyPnL.reduce((accu, current) => accu + current,0)
        const sellProfit = winSellPnL.reduce((accu, current) => accu + current,0)
        // 総損失 
        const buyLoss = lossBuyPnL.reduce((accu, current) => accu + current,0)
        const sellLoss = lossSellPnL.reduce((accu, current) => accu + current,0)
        // 総損益 
        const totalReturn = this.provisionalBalance[this.provisionalBalance.length - 1]
        // プロフィットファクター
        const profitFactor = (buyProfit + sellProfit) / (buyLoss + sellLoss);
        //DD:資産額を時系列で並べて、それぞれの時点以前の最大資産額からの差を計算して、 そのうち最大のマイナス幅のものが最大ドローダウン
        const maxDD = this.maxDD
        console.log(`
        ------------------------------------------
        initial balance:${this.balance}
        total return:${totalReturn}
        PF:${profitFactor}
        max draw down:${maxDD}
        win ration:${winRatio}
        trade counts:${tradeCount}
        ------------------------------------------
        ------------------|        long   
        total             |${buyProfit - buyLoss}
        profit            |${buyProfit}
        loss              |${buyLoss}
        trade count       |${winBuyPnL.length}
        trade win count   |${winBuyPnL.length}
        trade loss count  |${lossBuyPnL.length}
        -------------------------------------------
        ------------------|        shor
        total             |${sellProfit - sellLoss}
        profit            |${sellProfit}
        loss              |${sellLoss} 
        trade count       |${winBuyPnL.length}
        trade win count   |${winBuyPnL.length}
        trade loss count  |${lossSellPnL.length}
        `);
        return this.provisionalBalance
    }
}

class Strategy extends TradeManagement {
    constructor(...args) {
        super(...args)
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

        if (this.close[0] > this.open[0] && this.close[1] > this.open[1]) this.buy(1)
        if (this.open[0] > this.close[0] && this.open[1] > this.close[1]) this.sell(1)
    }
    // innjiとかの初期化
    init() { }
    /*     addOhlcv() {
            super.addOhlcv()
            console.log('addOhlcv in myStrategy');
        } */
}

(async () => {
    const ohlcv = await fetchOHLCV('BTC-PERP', '1d')
    // console.log('ohlcv :>> ', ohlcv);
    const bt = genBackTest(ohlcv, MyStrategy,100000,0,0,3);
    console.log('bt :>> ', bt);
    console.log('bt instanceof MyStrategy :>> ', bt instanceof MyStrategy);
    console.log('bt instanceof Strategy :>> ', bt instanceof Strategy);
    console.log('bt.ohlcv :>> ', bt.ohlcv);
    // console.log('bt.next() :>> ', bt.next());
    // console.log('bt.valuate() :>> ', bt.valuate());
})()

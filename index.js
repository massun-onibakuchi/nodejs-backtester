const { genBackTest,TradeManagement } = require('./backtest-pattern2');
const { fetchOHLCV } = require('./ccxtExchange');
const nodeplotlib = require('nodeplotlib');

(async () => {
    const ohlcv = await fetchOHLCV('BTC-PERP', '1d')
    // console.log('ohlcv :>> ', ohlcv);
    const bt = genBackTest(ohlcv, MyStrategy, 100000, 0, 0, 3);
    // console.log('bt instanceof MyStrategy :>> ', bt instanceof MyStrategy);
    // console.log('bt instanceof Strategy :>> ', bt instanceof Strategy);
    // console.log('bt.ohlcv :>> ', bt.ohlcv);
    // console.log('bt.next() :>> ', bt.next());
    bt.run()
    // bt.plot()
    // console.log('bt.valuate() :>> ', bt.valuate());
    // console.log('bt :>> ', bt);
})()

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
        else if (this.open[0] > this.close[0] && this.open[1] > this.close[1]) this.sell(1)
    }
    // innjiとかの初期化
    init() { }
    /*     addOhlcv() {
            super.addOhlcv()
            console.log('addOhlcv in myStrategy');
        } */
}


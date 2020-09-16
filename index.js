const { genBackTest, TradeManagement } = require('./backtester');
const { fetchOHLCV } = require('./ccxtExchange');
const { calcMomentum } = require('./indicator');

(async () => {
    const ohlcv = await fetchOHLCV('BTC-PERP', '1d')
    // console.log('ohlcv :>> ', ohlcv);
    const bt = genBackTest(ohlcv, MyStrategy, 100000, 0, 0, 5);
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
        this.ttmHistory;
        this.ttm;
    }
    //nextはStrategyには不要かも
    next() {
        // 
    }
    updateIndi() {
        const next = this.ttmHistory.pop()
        this.ttm.unshift(next)
    }

    init(data) {
        const length = data.length;
        const [open, high, low, close] = [[], [], [], []]
        for (let i = 0; i < length; i++) {
            const el = data[i];
            open.push(el[1])
            high.push(el[2])
            low.push(el[3])
            close.push(el[4])
        }
        const ttm = calcMomentum([open, high, low, close], 20)
        this.ttmHistory = ttm.reverse()
        this.ttm = ttm.slice(0, this.from).reverse()

    }
}

class MyStrategy extends Strategy {
    constructor(...args) {
        super(...args);
    }
    // イテレートするアルゴ
    next() {
        //変曲点の前後でローソク足2本ずつ続いたら
        const isUpContinual = this.ttm[0] >= this.ttm[1] && this.ttm[4] >= this.ttm[3]
        const isDownContinual = this.ttm[0] <= this.ttm[1] && this.ttm[3] >= this.ttm[4]
        // const isOver10Ave = (this.volume[0] + this.volume[1]) / 2 >= this.volume.slice(0, 11).reduce((accum, current) => accum + current) / 10
        // const isDownStrong = isOver10Ave

        // TTMの傾きの符号が変化し，それが変曲点の前後でローソク足2本ずつ続いたら
        const isUpTrend = this.ttm[1] > this.ttm[2] && this.ttm[3] > this.ttm[2] && isUpContinual
        const isDownTrend = this.ttm[1] < this.ttm[2] && this.ttm[2] > this.ttm[3] && isDownContinual //and isDownStrong 

        //現在の前つまり，直前にTTM傾きの符号が変化していたか，つまり頻繁に変曲点があるのか
        const isBuyFrequent = this.ttm[2] > this.ttm[3] && this.ttm[4] > this.ttm[3]
        const isSellFrequent = this.ttm[2] < this.ttm[3] && this.ttm[3] > this.ttm[4]
        const isBreakDown = this.close[0] - this.open[0] < 0;

        const isBuyEntry = isUpTrend &&(! isSellFrequent) // && isBreakUp 
        const isShortEntry = isDownTrend &&(! isBuyFrequent) && isBreakDown

        if (isBuyEntry) this.buy(1)
        if (isShortEntry) this.sell(1)
        // if (this.close[0] > this.open[0] && this.close[1] > this.open[1]) this.buy(1)
        // else if (this.open[0] > this.close[0] && this.open[1] > this.close[1]) this.sell(1)
    }
    // innjiとかの初期化
    init() { }
    /*     addOhlcv() {
            super.addOhlcv()
            console.log('addOhlcv in myStrategy');
        } */
}


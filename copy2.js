'use strict'

function genBackTest(ohlcv, parentClass, balance, commsion, pyramiding, from) {
    return new class BackTester extends parentClass {
        constructor(data, balance, commsion, pyramiding, from) {
            super(balance, commsion, pyramiding);
            // this.ohlcv = [];
            this.from = from;
            this.data = data.reverse() //this.data new->old //data old->new
            this.ohlcv = data.slice(0, from).reverse();// new->old
            this.timestamp = [] //new->old
            this.open = []
            this.high = []
            this.low = []
            this.close = []
            this.volume = []
            this.parseOhlcv()
            super.init(data) //インジ初期化
        }
        run() {
            // イテレートする for??
            const length = this.data.length - this.ohlcv.length
            for (let i = 0; i < length; i++) {
                console.log(
                    'this.timestamp[0] :>> ', this.timestamp[0],
                //     'i :>> ', i,
                    '.buyPnL[]', this.buyPnL[this.buyPnL.length - 1],
                    '.sellPnL[]', this.sellPnL[this.sellPnL.length - 1],
                    'provisional[pre last]:>> ', this.provisionalBalance[this.provisionalBalance.length - 2],
                    'provisional[last]:>> ', this.provisionalBalance[this.provisionalBalance.length - 1],
                //     //     'this.data.length :>> ', this.data.length,
                //     //     'this.data[最後の要素] :>> ', this.data[this.data.length - 1],
                //     //     'this.open[0] :>> ', this.open[0],
                )
                // console.log('this.maxDD :>> ', this.maxDD);

                super.next()
                this.updateBalance()
                this.updateDrawDown()

                this.updateOhlcv()
            }
            this.valuate()
        }
        // addOhlcv(ohlcv) {
        //     this.ohlcv = ohlcv
        // }
        parseOhlcv() {
            const length = this.ohlcv.length;
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
            //next new
            const next = this.data.pop();
            this.ohlcv.unshift(next);
            this.timestamp.unshift(next[0])
            this.open.unshift(next[1])
            this.high.unshift(next[2])
            this.low.unshift(next[3])
            this.close.unshift(next[4])
            this.volume.unshift(next[5])
        }
        updateDrawDown() {
            const dd = this.maxBalance - this.provisionalBalance[this.provisionalBalance.length - 1]
            if (dd - this.maxDD > 0) this.maxDD = dd;
        }
        plot() { }

    }(ohlcv, balance, commsion, pyramiding, from)
}

class TradeManagement {
    constructor(balance, commsion, pyramiding) {
        this.balance = balance;
        this.commsion = commsion;
        this.pyramiding = pyramiding;
        this.buyPnL = [0]
        this.sellPnL = [0]
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
        const length = this.data.length
        const open = this.data[length - 1][1]
        let pnl = 0;
        // ノーポジ
        if (prevQty == 0) {
            this.position['aveOpenPrice'] = open;
            this.position['qty'] = qty;
        }
        // 違うサイドのpositionなら手仕舞ってドテン
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
        // this.sellPnL[this.ohlcv.length - 1] = pnl;
        // this.buyPnL[this.ohlcv.length - 1] = 0;
        this.sellPnL.push(pnl);
        this.buyPnL.push(0);
        // this.updateBalance(pnl);
    }
    sell(ordQty) {
        const qty = ordQty > 0 ? -ordQty : ordQty;
        const prevQty = this.position['qty'];
        const pnl = -1 * this._entry(qty, -prevQty);
        this.buyPnL.push(pnl);
        this.sellPnL.push(0);
        // this.buyPnL[this.ohlcv.length - 1] = pnl;
        // this.sellPnL[this.ohlcv.length - 1] = 0;
        // this.updateBalance(pnl);
    }
    updateBalance() {
        const length = this.provisionalBalance.length;
        const pnlLength = this.buyPnL.length;
        const balance = this.provisionalBalance[length - 1] + this.buyPnL[pnlLength - 1] + this.sellPnL[pnlLength - 1];
        this.provisionalBalance.push(balance)
    }
    // getBalance() {
    //     return this.provisionalBalance[this.ohlcv.length - 1];
    // }
    recordPnL(exitPrice, qty) {
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
        const buyProfit = winBuyPnL.reduce((accu, current) => accu + current, 0)
        const sellProfit = winSellPnL.reduce((accu, current) => accu + current, 0)
        // 総損失 
        const buyLoss = lossBuyPnL.reduce((accu, current) => accu + current, 0)
        const sellLoss = lossSellPnL.reduce((accu, current) => accu + current, 0)
        // 総損益 
        const totalReturn = this.provisionalBalance[this.provisionalBalance.length - 1]
        // プロフィットファクター
        const profitFactor = -(buyProfit + sellProfit) / (buyLoss + sellLoss);
        //DD:資産額を時系列で並べて、それぞれの時点以前の最大資産額からの差を計算して、 そのうち最大のマイナス幅のものが最大ドローダウン
        const maxDD = this.maxDD
        console.log(`
        ------------------------------
        initial balance:${this.balance}
        total return:${totalReturn}
        PF:${profitFactor}
        max draw down:${maxDD}
        win ration:${winRatio}
        trade counts:${tradeCount}
        ------------------------------
                        long   
        total             |${buyProfit + buyLoss}
        profit            |${buyProfit}
        loss              |${buyLoss}
        trade count       |${winBuyPnL.length + lossBuyPnL.length}
        trade win count   |${winBuyPnL.length}
        trade loss count  |${lossBuyPnL.length}
        -------------------------------
                        short
        total             |${sellProfit + sellLoss}
        profit            |${sellProfit}
        loss              |${sellLoss} 
        trade count       |${winSellPnL.length + lossSellPnL.length}
        trade win count   |${winSellPnL.length}
        trade loss count  |${lossSellPnL.length}
        `);
        // console.log('this.buyPnL :>> ', this.buyPnL);
        // console.log('this.sellPnL :>> ', this.sellPnL);
        return this.provisionalBalance
    }
}


module.exports = { genBackTest, TradeManagement }


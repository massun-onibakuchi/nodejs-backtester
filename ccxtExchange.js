const sortOHLCV = (candles) => {
    const OHLVC = [[], [], [], [], []];
    candles.forEach(el => {
        OHLVC[0].push(parseFloat(el[1]));
        OHLVC[1].push(parseFloat(el[2]))
        OHLVC[2].push(parseFloat(el[3]))
        OHLVC[3].push(parseFloat(el[4]));
        OHLVC[4].push(parseFloat(el[5]));
    })
    return OHLVC
}

const fetchOHLCV = async (symbol, candleType) => {
    const since = exchange.milliseconds() - 3600000;
    try {
        const result = await exchange.fetchOHLCV(symbol, candleType, since);
        // const OHLCV = ohlcvUtils.sortOHLCV(result)
        const OHLCV = sortOHLCV(result);
        return OHLCV
    } catch (e) {
        console.log('e :>> ', e);
        if (e.name === 'BadRequest' || e.name === 'RequestTimeout' || e.name === 'NetworkError' || e.name === 'ExchangeError') return
        else throw e
    }
}
const exchangeId = 'ftx'
const exchange = new ccxt[exchangeId.toLowerCase()]();


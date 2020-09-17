'use strict';

/**
* 終値の配列{source}のデータから期間{period}SMAのもっとも古い値を返す
* @param  {Number} period smaの期間のparam 20 50 など
* @param  {Number[]} source priceの配列
* @return {Number} もっとも古いsmaを返す
*/
const calcOldestSma = (period, source) => {
    let priceSum = 0;
    for (let i = 0; i < period; i++) {
        priceSum += source[i];
    }
    return Math.round(100 * priceSum / period) / 100;
};

/**
 * 終値の配列{closeArray}から期間{period}SMAの最新値を返す
* @param  {string} period smaの期間のparam 20 50 など
* @param  {string[]} closeArray retriveCandlesticks()で取得したhlcvs
* ohlcv[open, high, low, close, volume, unix timestamp (milliseconds)]
* @param  {Number || 0} latestPrice  
* YYYYMMDD: 1min, 5min, 15min, 30min, 1hour
* YYYY: 4hour, 8hour, 12hour, 1day, 1week
* @return {Number} 最新のローソク足から12個分の期間{period}のSMAの値の配列(最新の順)
*/
const calcLatestSma = (period, closeArray) => {
    console.log('---Calling calcLastestSma()---');
    let priceSum;
    // if (latestPrice === 0) {
    //     for (let i = 1; i <= period; i++) {
    //         priceSum += parseFloat(closeArray.slice(-i)[0][3]);
    //     }
    //     console.log('Math.round(priceSum/period) :>> ', Math.round(priceSum / period));
    //     return Math.round(priceSum / period, 1);
    // }
    // 現在の形成中の足(latestPrice)を含むSMAを計算するように，timePeriodを-1
    for (let i = 1; i <= period; i++) {
        priceSum += parseFloat(closeArray[-i]);
    }
    console.log('Math.round(priceSum/period) :>> ', Math.round(100 * priceSum / period) / 100);
    return Math.round(100 * priceSum / period) / 100;
};

/**
*ローソク足から期間{period}のSMAの値の配列を返す
* @param  {Number} period smaの期間のparam 20 50 など
* @param  {Number[]} source ohlcv [open, high, low, close, volume]
* @return {Number[]} result  {source}から得られる{period}のSMAの配列
*/
const calcSma = (period, source) => {
    // どこかから取得する形にした方がいい.
    let todaySma;
    const length = source.length;
    let yestdaySma = calcOldestSma(period, source);
    const result = [yestdaySma];
    for (let k = period; k < length; k++) {
        todaySma = yestdaySma + (source[k] - source[k - period]) / period;
        yestdaySma = todaySma;
        result.push(Math.round(100 * todaySma) / 100);
    }
    // console.log('result:SMA=\n', result);
    // console.log('LatestSma=', result[result.length - 1]);
    return result;
};

const calcNextEma = async (source, emaArray, period) => {
    /**
    * @param  {Number[]} source
    * @param  {Number[]} emaArray
    * @param  {Number} period
    * @return {Number[]} emaArray 
    * ohlcv [open, high, low, close, volume, unix timestamp (milliseconds)]
    */
    console.log('---Calling calcNextEma---');
    let smooth = 2 / (period + 1);
    let latestEma = emaArray[emaArray.length - 1];
    let nextEma = Math.round((1 - smooth) * latestEma + smooth * source[source.length - 1][3], 2);
    return emaArray.push(nextEma)
};

/** BBの配列を返す．
* @param  {Number[]} source price data
* @param  {Number} period integer 
* @param  {Number} sigma 1,2,3
* @return {Number[]} [upper,sma,lower]
*/
const calcBB = (source, period, sigma) => {
    const result = [];
    const sma = calcSma(period, source);
    const dev = calcStd2(source, period);
    const length = sma.length;
    for (let i = 0; i < length; i++) {
        const upper = Math.round(10 * (sma[i] + sigma * dev[i])) / 10;
        const lower = Math.round(10 * (sma[i] - sigma * dev[i])) / 10;
        result.push([upper, sma[i], lower]);
    }
    return result
}

const calcMultiBB = (ohlcv, period, multi) => {
    console.log('------call calcMultiBB------');
    const [, high, low, ,] = ohlcv;
    const hiAve = calcSma(period, high);
    const loAve = calcSma(period, low);
    const maLength = hiAve.length;
    const result = [];
    
    for (let i = 0; i < maLength; i++) {
        let hiSum = 0;
        let loSum = 0;
        for (let k = 0; k < period; k++) {
            hiSum += (high[i + k] - hiAve[i]) ** 2;
            loSum += (low[i + k] - loAve[i]) ** 2;
        }
        let hiDev = Math.sqrt(hiSum / (period - 1));
        let loDev = Math.sqrt(loSum / (period - 1));
        let upper = Math.round(10 * (hiAve[i] + multi * hiDev)) / 10;
        let lower = Math.round(10 * (loAve[i] - multi * loDev)) / 10;

        result.push([upper, lower]);
    }
    return result
}

const calcMultiBB2 = (ohlcv, period, multi) => {
    console.log('------call calcMultiBB------');
    const [, high, low, ,] = ohlcv;
    const hiAve = calcSma(period, high);
    const loAve = calcSma(period, low);
    const maLength = hiAve.length;
    const result = [];
    for (let i = 0; i < maLength; i++) {
        let hiSum = 0;
        let loSum = 0;
        for (let k = 0; k < period; k++) {
            hiSum += (high[i + k] - hiAve[i]) ** 2;
            loSum += (low[i + k] - loAve[i]) ** 2;
        }
        let hiDev = Math.sqrt(hiSum / (period - 1));
        let loDev = Math.sqrt(loSum / (period - 1));
        let upper = Math.round(10 * (hiAve[i] + multi * hiDev)) / 10;
        let lower = Math.round(10 * (loAve[i] - multi * loDev)) / 10;
        result.push([upper, lower]);
    }
    return result
}

const calcKC = (ohlc, period) => {
    /**
    *ローソク足から期間{period}のKCの配列を返す
    *Trの単純移動平均のATRから式 SMA+/-ATRのKC
    * TradingViewのATRとは違う
    * @param {String[]} ohlc [[open],[high], [low], [close]]
    * @param  {Number} period smaの期間のparam 20 50 など
    * @return {Number[]} result {ohlc}から得られる{period}のSMAの配列
    */
    console.log('------Calling calcKC()-----');
    const length = ohlc[0].length;
    const smaArray = calcSma(period, ohlc);
    const smaArrLen = smaArray.length;

    // trueRangeの配列を作る
    //前日のデータを用いるため初日のtrは作れないので index0はundifinedとする
    let trueRange = [undefined];
    for (let i = 1; i < length; i++) {
        const high = parseFloat(ohlc[i][1]);
        const low = parseFloat(ohlc[i][2]);
        const prevClose = parseFloat(ohlc[i - 1][3]);
        trueRange.push(Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose),
        ));
    }
    // 初項のtrはhigh -lowとする流儀もある
    // trueRange[1] = parseFloat(ohlc[1][1]) - parseFloat(ohlc[1][2]);

    let rangeMa = 0;
    let nextRangeMa = 0;
    let priceSum = 0;
    // trのMaの初項を求める
    // trの式の性質上 k=1から
    for (let k = 1; k <= period; k++) {
        priceSum += parseFloat(trueRange[k]);
    }
    rangeMa = priceSum / period;
    let kc = [[undefined, undefined], [smaArray[1] + rangeMa * 1.5, smaArray[1] - rangeMa * 1.5]];
    //  二日目以降のtrのma(ATR)を漸化式で求め，kcを計算
    for (let i = 2; i < smaArrLen; i++) {
        nextRangeMa = rangeMa + (trueRange[i - 1 + period] - trueRange[i - 1]) / period;
        rangeMa = nextRangeMa;
        console.log('-------------------');
        console.log('smaArray index :>> ', i);
        console.log('trueRange i - 1 :>> ', i - 1);
        console.log('trueRange i-1+period :>> ', i - 1 + period);
        console.log('kc.kength :>> ', kc.length);
        // rangeMaArrayは必要はない
        // rangeMaArray.push(rangeMa);
        const upperKc = Math.round(100 * (smaArray[i] + rangeMa * 1.5)) / 100;
        const lowerKc = Math.round(100 * (smaArray[i] - rangeMa * 1.5)) / 100;
        console.log('i :>> ', i, 'upperKc :>> ', upperKc, 'rangeMa', rangeMa, 'smaArray[i] :>> ', smaArray[i]);
        console.log('-------------------');
        kc.push([upperKc, lowerKc]);
    }
    console.log('-----Result--------------');
    console.log('ohlc.length :>> ', ohlc.length);
    console.log('trueRange.length :>> ', trueRange.length);
    console.log('smaArray.length :>> ', smaArrLen);
    console.log('kc.length:calcKC :>> ', kc.length);
    console.log('kc:calcKC \n:>> ', kc);
}

/**true range のSMAによるATRの配列を返す
* @param  {Number[]} ohlc
* @param  {Number} period
* @return {Number[]}
*/
const calcAtr = (ohlc, period) => {
    const [open, high, low, close,] = ohlc;
    const tr = [];
    for (let i = 1; i < open.length; i++) {
        const val = [high[i] - low[i], high[i] - close[i - 1], close[i - 1] - low[i]]
        tr.push(Math.max(...val));
    }
    return calcSma(period, tr);
}

/**標本標準偏差を計算し，結果の配列を返す
* @param  {Number[]} priceData
* @param  {Number} period
* @return {Number[]} 
*/
const calcStd = (source, period) => {
    console.log('-----Calling calsStd----');
    let squareSource = source.map(el => el ** 2);
    let squareSma = calcSma(period, squareSource);
    let smaSquare = calcSma(period, source).map(el => el ** 2);
    const length = smaSquare.length;
    const result = [];
    for (let i = 0; i < length; i++) {
        let diff = squareSma[i] - smaSquare[i];
        const sigma = Math.sqrt(period * diff / (period - 1));
        let value = Math.round(10 * sigma) / 10;
        result.push(value);
        if (isNaN(value)) {
            console.log('value :>> ', value);
            console.log('diff :>> ', diff);
            console.log('period * diff / (period - 1) :>> ', period * diff / (period - 1));
            console.log('squareSma :>> ', squareSma[i]);
            console.log('smaSquare :>> ', smaSquare[i]);
        }
    }
    return result
}

const calcStd2 = (source, period) => {
    console.log('-----Calling calcStd----');
    const ave = calcSma(period, source);
    const length = ave.length;
    const result = [];
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (let k = 0; k < period; k++) {
            sum += (source[i + k] - ave[i]) ** 2;
        }
        const dev = Math.sqrt(sum / (period - 1))
        result.push(dev);
    }
    return result
}

/**
 * x:sourceを最小二乗法に基づくslop,interceptを求め，線形回帰直線により求めたy配列を返す
* @param {Number[]} source 一次元配列
* @param  {Number} period 計算期間 20 50 など
* @return {Number[]} result 
*/
const calcLinreg = (source, period) => {
    console.log('-----Calling calcLinreg()-----');
    let result = [];
    const lengthAve = (period + 1) / 2;
    const sourceSma = calcSma(period, source);
    const smaLen = sourceSma.length;

    // slop = Cov[date, source] / Var[date]
    // slopの計算式の分母=分散のperiod倍:定数を計算
    let squDevSum = 0;
    for (let idx = 1; idx <= period; idx++) {
        squDevSum += (idx - lengthAve) ** 2;
    }

    //slopの計算式の分子=共分散のperiod倍：を計算
    for (let k = 0; k < smaLen; k++) {
        let covSum = 0;
        for (let i = 1; i <= period; i++) {
            covSum += (i - lengthAve) * (source[k + i - 1] - sourceSma[k]);
        }
        // slop,interceptの計算
        const slop = covSum / squDevSum;
        const intersept = sourceSma[k] - slop * lengthAve;
        result.push(Math.round(10 * (slop * period + intersept)) / 10);
    }
    console.log('calcLinreg result');
    return result;
}

/**
* 線形回帰を利用したMomentumインジケーター
* @param {Number[][]} source 
* @param  {Number} period 計算期間 20 50 など
* @return {Number[]} result
*/
const calcMomentum = (ohlc, period) => {
    console.log('-----Caliing calcMomentum()------');
    let high, low, close;
    [, high, low, close] = ohlc;
    const ma = calcSma(period, close);
    const maLength = ma.length;
    let source = [];

    //同時刻のデータは ohlc[k+period-1]とma[k]
    for (let k = 0; k < maLength; k++) {

        // period期間のhighest/lowestを探す
        //hlAve: period期間のhighest - lowestの平均
        let highest = Math.max(...high.slice(k, k + period));
        let lowest = Math.min(...low.slice(k, k + period));
        const hlAve = (highest + lowest) / 2;
        const wAve = (hlAve + ma[k]) / 2;
        source.push(Math.round(10000 * (close[k + period - 1] - wAve)) / 10000);
        // console.log('source = close[k+peropd -1] - wAve:', [Math.round(close[k + period - 1] - wAve)]);
    }
    return calcLinreg(source, period);
}

/**
* 引数に与えらた数値の0.5区切りに丸めたfloatを返す  
* e.g.   80.0=>80.0, 80.2=>80.0, 80.4=>80.5, 80.6=>80.5, 80.9=>81.0
* @param {Number} num 
* @return {Number} 少数第一位のNumber
*/
const roundToTickSize = (num) => {
    return Math.round(10 * num / 5) * 5 / 10;
}

module.exports = {
    calcSma,
    calcAtr,
    calcBB,
    calcStd,
    calcStd2,
    calcMultiBB,
   calcMomentum,
   roundToTickSize
}

# nodejs backtester

## Introduction
 - Create a Strategy

```javascript
const { Strategy } = require('./backtester');

class MyStrategy extends Strategy {
    constructr(..args){
        super(...args);
    }
    next(){
   // logic
    }
}

```
And then
 - Load data and create a Backtester instance 

 `const bt = genBackTest(data,MyStrategy,10000,0,0,5)`

 And then
  - Execute `bt.run()`
  - Visual feedback use:` bt.plot()`

## BackTester
 - 引数に`data:[[timestamp],[open],[high],[low],[close]]`と`Strategy`を継承したクラスを渡す
  - トレード結果を表示`bt.run()`
- 資産曲線を表示`bt.plot()`


## Strategy
- Strategyクラスを継承してつくる  
 - next()のなかにエントリールールを書く
 - call every times in a cycle  
    `next()`        

 - use order
```javascript
entry(qty)
buy(qty)
sell(qty)
```


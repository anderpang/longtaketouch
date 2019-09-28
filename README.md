## LongTakeTouch

长镜头应用中顺滑的位移数字

Smooth scrolling.

## Install

```js
npm install longtaketouch
```

## Usage

```js
new LongTakeTouch({
  change:function(value){
      console.log(value)
  }
});
```

```js
new LongTakeTouch({
    el:window,                //碰触对象         {String|DOM}
    vertical：false,          //水平、或垂直方向  {Boolean} 
    min:-10,                  //位移最小值       {Number}
    max:0,                    //位移最大值       {Number}
    value:0,                  //位移初始值       {Number}
    sensitivity:1,            //整体灵敏度       {Number}
    speed:1,                  //位移速度         {Number}
    inertia:100,              //惯性指数         {Number}
    maxSpeed:3,               //惯性最大速度     {Number}
    friction:0.97,            //惯性摩擦系数      {Number}
    //值改变时响应函数{Function}
    change:function(value){
        console.log(value);
    }      
});
```


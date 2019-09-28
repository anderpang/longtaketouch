/*! <anderpang@foxmail.com>  2019-09-26 */
/**
 * 长镜移动插件
 * 全都是可选参数
 * @param el {String|DOM}         碰触对象
 * @param vertical {Boolean}      水平、或垂直方向
 * @param min {Number}            位移最小值
 * @param max {Number}            位移最大值
 * @param value {Number}          位移初始值
 * @param sensitivity {Number}    整体灵敏度
 * @param speed {Nubmer}          位移速度
 * @param inertia {Nubmer}        惯性指数
 * @param maxSpeed {Nubmer}       惯性最大速度
 * @param friction {Nubmer}       惯性摩擦系数
 * @param change {Function}       值改变时响应函数
 */
"use strict";
(function(ctx,factory){
    if(typeof exports === 'object' && typeof module === 'object' ){
        module.exports = factory();
    }
    else{
        ctx.LongTakeTouch=factory();
    }
})(this,function(){
    var eventsMap={
        mouse:{
            start:"mousedown",
            move:"mousemove",
            end:["mouseup","mouseleave"]
        },
        touch:{
            start:"touchstart",
            move:"touchmove",
            end:["touchend","touchcancel"]
        }
    },
    raf=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function (f){
        return setTimeout(f,16.666);
    },
    caf=window.cancelAnimationFrame||webkitCancelAnimationFrame||function(t){
        clearTimeout(t);
    },
    eventType=eventsMap[typeof window.ontouchstart==="undefined"?"mouse":"touch"];

    function LongTakeTouch(options){
        options=options||{};
        this.el=options.el?typeof options.el==="string"?document.querySelector(options.el):options.el:window;
        this.options=options;
        this.min=isNaN(options.min)?-10:options.min;
        this.max=isNaN(options.max)?0:options.max;
        this.vertical=options.vertical;                    
        this.sensitivity=options.sensitivity||1;   
        this.maxSpeed=(options.maxSpeed||3)*this.sensitivity;
        this.friction=options.friction||0.97;      
        this.inertia=options.inertia||100;        
        this._value=options.value||0;
        this.speed=(options.speed||1)*this.sensitivity; 

        this.change=options.change||this._noop;

        this._calc=this._calc.bind(this);

        this.init();
    }

    LongTakeTouch.prototype={
        constructor:LongTakeTouch,
        init:function(){
            this.el.addEventListener(eventType.start,this,false);
            window.addEventListener(eventType.move,this,false);
            window.addEventListener(eventType.end[0],this,false);
            window.addEventListener(eventType.end[1],this,false);
        },
         handleEvent:function(e){
             var type=e.type;
             switch(type){
                 case eventType.start:
                       this._events.start.call(this,e);
                  break;
                 case eventType.move:
                      this._events.move.call(this,e);
                  break;
                 case eventType.end[0]:
                 case eventType.end[1]:
                      this._events.end.call(this,e);
                  break;
             }
        },
         clamp:function(v,a,b){
              return Math.max(a,Math.min(b,v));
        },
         _noop:function(a){console.log(a)},
         _calc:function(){
              this._timer=raf(this._calc);
               if(this._step!==0){
                   this._value=this.clamp(this._value+this._step,this.min,this.max);
                   this._step=0;
                   this.change(this._value,this.min,this.max);
               }
        },
         _events:{
             start:function(e){
                   if(e.type==="touchstart"){
                       this._startValue =this.vertical?e.touches[0].clientY:e.touches[0].clientX;
                       this._startValue2=this.vertical?e.touches[0].clientX:e.touches[0].clientY;
                   }
                   else{
                        this._startValue =this.vertical?e.clientY:e.clientX;
                       this._startValue2=this.vertical?e.clientX:e.clientY;
                   }
                   
                   this._startTime=e.timeStamp;
                   this._moveValue=this._startValue;
                   this._step=0;
                   this._isDown=true;
                   caf(this._timer);
                   caf(this._timer2);
                   this._calc();
             },
             move:function(e){
                 if(this._isDown){
                        var curValue,
                               curValue2;
                         if(e.type==="touchmove"){
                               curValue= this.vertical?e.touches[0].clientY:e.touches[0].clientX;
                               curValue2= this.vertical?e.touches[0].clientX:e.touches[0].clientY;
                         }
                         else{
                              curValue=this.vertical?e.clientY:e.clientX;
                               curValue2=this.vertical?e.clientX:e.clientY;
                         }

                        if(Math.abs(curValue2-this._startValue2)>Math.abs(curValue-this._startValue) || curValue===this._moveValue){
                             this._step=0;
                        }
                        else if(curValue>this._moveValue){
                            this._step=this.speed;
                            this._moveValue=curValue;
                        }
                        else{
                            this._step=-this.speed;
                            this._moveValue=curValue;
                        }      
                 }
             },
             end:function(e){
                  if(this._isDown){
                      var dt=e.timeStamp-this._startTime,
                            endValue=e.type==="touchend" || e.type==="touchcancel"?
                                      (this.vertical?e.changedTouches[0].clientY:e.changedTouches[0].clientX):
                                      (this.vertical?e.clientY:e.clientX),
                            dv=endValue-this._startValue,
                             v;
                       this._isDown=false;
                       caf(this._timer);
                       
                       if(dt>0 && dt<300 && Math.abs(dv)>5){
                            v=dv/dt*this.inertia*this.sensitivity;
                            this._ease(v);
                       }
                 }
             }
        },
         _ease:function(v){
                var speed,
                       friction=this.friction,
                       maxSpeed=this.maxSpeed,
                      min=this.min,
                      max=this.max,
                       f=function(){
                            if(this._value!==min && this._value!==max && Math.abs(v)>0.001){
                                 this._timer2=raf(f);
                            }
                            v*=friction;
                            if(v>0){
                                 speed=v>maxSpeed?maxSpeed:v;                                  
                            }
                            else{
                                speed=v<-maxSpeed?-maxSpeed:v;
                            }

                             this._value=this.clamp(this._value+speed,min,max);
                              this.change(this._value,min,max);                         
                       }.bind(this);
                
                f();
        }
    };

    return LongTakeTouch;
});
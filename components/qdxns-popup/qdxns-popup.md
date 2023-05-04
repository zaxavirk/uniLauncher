
###### 该组件是qdxns-popup的迭代组件由于改动过大，并且砍掉了抽屉模式，所以单独发版。
#### 兼容性说明
亲测app，app（nvue），微信小程序ios与安卓，qq小程序ios与安卓。h5测了几个浏览器（chrome, viov手机的自带浏览器）都可完美运行。

###### 注意
1. 在使用组件时一定要注意是否开启自适应弹出方向选项，某些情况下自适应可能会导致弹出位置出错
2. h5调用时要注意windowTop的值。``uni.getSystemInfoSync()``中可获取windowTop。
3. 长按时一定要传入是否有原生导航栏。

#### 使用方式
1. 将此组件进入你的项目中的 /components/ 目录中
2. 在某个页面中使用该插件

在 script 中引用组件

```js
    import qdxnsPop from '@/components/qdxns-popup/qdxns-popup.vue';
    export default {
      components: {qdxPop},
      data() {},
      onLoad() {},
      methods: {
        longTap(e) {
          this.$refs.qdxPop.open(e);
          // #ifdef H5
          e.preventDefault()
          return false
          // #endif
        }
      },
    }
```

在 template 中使用组件
```html
        <view @longpress="longTap">
          <text :data-itemid="item.id" class="">长按出现 </text>
        </view>
        <qdxns-pop :height="300" :width="300" ref="qdxPop">
          <view style="height: 300rpx; width: 300rpx; background: #f40"></view>
        </qdxns-pop>
```

#### 参数
| 属性        | 类型    | 默认值                    | 说明                                                                                                          |
| ----------- | ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| isMask      | Boolean | true                      | 是否显示遮罩层                                                                                                |
| maskColor   | String  | 'rgba(100, 100, 100, .4)' | 遮罩层背景色                                                                                                  |
| type        | String  | zoom                      | 弹窗动画模式 zoom为缩放 fade为淡入淡出                                                                        |
| width       | Number  | 0                         | 弹窗宽度单位rpx                                                                                               |
| height      | Number  | 0                         | 弹窗高度单位rpx                                                                                               |
| top         | Number  | 0                         | 弹窗定位 顶部距离  可ref 调用时传入  ref没有传入这个就是默认定位 单位px                                       |
| left        | Number  | 0                         | 弹窗定位 左侧距离  可ref 调用时传入  ref没有传入这个就是默认定位 单位px                                       |
| maskHide    | Boolean | true                      | 点击蒙层是否关闭                                                                                              |
| hasNav      | Boolean | true                      | 是否有 原生状态栏 是否存在原生状态栏会影响弹出高度的计算                                                      |
| popupOrigin | String  | left top                  | 弹窗弹出的起点，前面是横向的方向，后面是纵向方向中间空格连接                                                  |
| adaption    | Boolean | true                      | 是否开启自适应, 一般在长按在手指位置弹出时开启，防止弹窗弹到屏幕以外，自行传入弹出位置的x,y值时最好关闭自适应 |


#### ref方法
组件是由ref方式调用，调用时传入两个参数，都是非必传参数.
| 方法                    | 说明                                                                                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| open([position][,isMe]) | 方法可传入连个参数，第一个参数是对象形式,当为长按自适应时直接传入长按返回的系统对象就可以，要传入自定义位置时`` {x: Number, y:Number} ``,这是需要传入``isMe``参数为``true``,x和y的单位是`` px ``,不传入`` position ``时需要在`` props ``中传入 `` top ``和``left`` 来确定弹出位置. |
| close()                 | 用ref方式调用此方法则弹窗关闭                                                                                                                                                                                                                                                      |

* 具体调用方式还可参考示例项目。




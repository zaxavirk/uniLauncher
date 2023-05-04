<template>
  <div class="p_wrapper" style="z-index: 19999" v-if="isShow">
    <view v-if="isMask" ref="mask" catchtouchmove="true" bubble="true" class="mask" style="z-index: 20000" :style="maskStyle" @touchmove.stop.prevent="moveHandle" @click="clickMask" :class="[notNvueAni ? 'not_animation_show_mask' : 'not_animation_hide_mask']"></view>
    <view ref="popup" id="popup" class="content" :class="{
				not_def_show: type == 'zoom',
				not_def_show_f: type != 'zoom',
				not_nvue_animation_show: notNvueAni && type == 'zoom',
				not_nvue_animation_hide: !notNvueAni && type == 'zoom',
				not_nvue_animation_show_f: notNvueAni && type != 'zoom',
				not_nvue_animation_hide_f: !notNvueAni && type != 'zoom'
			}" style="z-index: 20001;" :style="contentStyle">
      <slot></slot>
    </view>
  </div>
</template>

<script>
/**
 * 名称
 * @author		前端小能手
 */
// #ifdef APP-PLUS-NVUE
const animation = weex.requireModule('animation')
// #endif
export default {
  props: {
    // 是否显示蒙层
    isMask: {
      type: Boolean,
      default: true,
    },
    // 蒙层颜色
    maskColor: {
      type: String,
      default: 'rgba(100, 100, 100, .4)',
    },
    // 弹窗模式 有 zoom  fade
    type: {
      type: String,
      default: 'zoom',
    },
    // 内容区 宽度 单位rpx
    width: {
      type: Number,
      default: 0,
    },
    // 内容区 高度 单位 rpx
    height: {
      type: Number,
      default: 0,
    },
    // 弹窗定位 顶部距离  可ref 调用时传入  ref没有传入这个就是默认定位 单位px
    top: {
      type: Number,
      default: 0,
    },
    // 弹窗定位 左侧距离  可ref 调用时传入  ref没有传入这个就是默认定位 单位px
    left: {
      type: Number,
      default: 0,
    },
    // 点击蒙层是否关闭
    maskHide: {
      type: Boolean,
      default: true,
    },
    // 是否有 原生状态栏
    hasNav: {
      type: Boolean,
      default: true,
    },
    // 自定义弹出方向
    popupOrigin: {
      type: String,
      default: 'left top',
    },
    // 是否 开启自适应
    adaption: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      origin: 'left top', // 动画的定位点
      x: 0, // 弹窗弹出位置 定位点
      y: 0, // 弹窗弹出位置 定位点
      maxX: 0, // 最大 x 值 用于判断弹窗定位点
      maxY: 0, // 最大 y 值 用于判断弹窗定位点
      winH: 0, // 屏幕 总高度
      winW: 0, // 屏幕 总宽度
      windowTop: 0, // h5 下的顶部距离
      notNvueAni: false, // 控制非nvue动画
      hideTarget: 'scale(0,0)', // 隐藏目标
      isShow: false, // 是否显示
      statusBarHeight: 0, // 手机状态栏高度
    }
  },
  methods: {
    // 点击遮罩层 关闭
    clickMask() {
      if (this.maskHide) {
        this.close()
      }
    },
    // 一些状态下 阻止 遮罩下滚动
    moveHandle() {
      return
    },
    // 打开弹窗
    async open(e, isMe) {
      this.comMax()
      let x, y
      if (isMe && e) {
        // 自己传入 x y 定位
        x = e.x
        y = e.y
      } else if (e) {
        // 自动传入长按事件 对象
        // app nvue 的情况 拿取 长按位置
        // #ifdef APP-NVUE
        if (Array.isArray(e.changedTouches) && e.changedTouches.length > 0) {
          // nvue 安卓下 获取pageX pageY 会有问题 所以 统一使用 screenX screenY
          x = e.changedTouches[0].screenX
          y =
            e.changedTouches[0].screenY -
            this.statusBarHeight -
            (this.hasNav ? 40 : 0)
        } else {
          const { position } = e
          x = position.x
          y = position.y
        }
        // #endif
        // app 非nvue 的情况 拿取 长按位置
        // #ifdef APP-VUE
        if (Array.isArray(e.changedTouches) && e.changedTouches.length > 0) {
          x = e.changedTouches[0].pageX
          y = e.changedTouches[0].pageY
        } else {
          const { position } = e
          x = position.x
          y = position.y
        }
        // #endif
        // 小程序的 情况 拿取 长按位置
        // #ifdef MP

        x = e.touches[0].clientX
        y = e.touches[0].clientY
        // #endif
        // h5的 情况 拿取 长按位置
        // #ifdef H5
        if (Array.isArray(e.changedTouches) && e.changedTouches.length > 0) {
          x = e.changedTouches[0].clientX
          y = e.changedTouches[0].clientY + this.windowTop
        }
        // #endif
      }
      // 固定定位  props 传入
      if (!e) {
        x = this.left
        y = this.top
      }

      const originArr = this.popupOrigin.split(' ')
      let originX = originArr[0]
      let originY = originArr[1]
      if (this.adaption) {
        if (x > this.maxX && y > this.maxY) {
          // this.origin = 'right bottom';
          originX = 'right'
          originY = 'bottom'
        } else if (x < uni.upx2px(this.width) && y < uni.upx2px(this.height)) {
          originX = 'left'
          originY = 'top'
        } else if (x > this.maxX) {
          originX = 'right'
        } else if (y > this.maxY) {
          originY = 'bottom'
        } else if (x < uni.upx2px(this.width)) {
          originX = 'left'
        } else if (y < uni.upx2px(this.height)) {
          originY = 'top'
        }
        this.origin = originX + ' ' + originY
      }
      // 检测到 极限位置 开边弹出方向
      if (this.adaption) {
        if (originY === 'top') {
          this.y = y
        } else {
          this.y = y - uni.upx2px(this.height)
        }
        if (originX === 'left') {
          this.x = x
        } else {
          this.x = x - uni.upx2px(this.width)
        }
      } else {
        this.x = x
        this.y = y
      }

      this.isShow = true
      // #ifndef APP-NVUE
      setTimeout(() => {
        this.notNvueAni = true
      }, 10)
      // #endif
      this.hideTarget = 'scale(0,0)'
      setTimeout(() => {
        this.animationShow()
      }, 30)
    },
    close() {
      // #ifdef APP-NVUE
      this.animationHide()
      // #endif
      // #ifndef APP-NVUE
      this.notNvueAni = false
      setTimeout(() => {
        this.isShow = false
      }, 300)
      // #endif
    },
    // 检测极限位置
    comMax() {
      let sizeArr = [this.width, this.height]
      let width = uni.upx2px(Number(sizeArr[0]))
      let height = uni.upx2px(Number(sizeArr[1]))
      this.maxX = this.winW - width
      this.maxY = this.winH - height
    },
    // nvue 打开 动画
    animationShow() {
      // #ifdef APP-PLUS-NVUE
      let tranget = ''
      if (this.type === 'zoom') {
        tranget = 'scale(1,1)'
      }
      animation.transition(this.$refs.popup, {
        styles: {
          transformOrigin: this.origin,
          transform: tranget,
          opacity: 1,
        },
        duration: 200, //ms
        timingFunction: 'ease',
      })

      if (this.$refs.mask) {
        animation.transition(this.$refs.mask, {
          styles: {
            opacity: 1,
          },
          duration: 200, //ms
          timingFunction: 'ease',
        })
      }
      // #endif
    },
    // nvue 关闭 动画
    animationHide() {
      // #ifdef APP-PLUS-NVUE
      this.$nextTick(() => {
        animation.transition(
          this.$refs.popup,
          {
            styles: {
              transform: this.type === 'zoom' ? this.hideTarget : '',
              transformOrigin: this.origin,
              opacity: 0,
            },
            duration: 200, //ms
            timingFunction: 'ease',
          },
          () => {
            this.isShow = false
          }
        )

        if (this.$refs.mask) {
          animation.transition(this.$refs.mask, {
            styles: {
              opacity: 0,
            },
            duration: 200, //ms
            timingFunction: 'ease',
          })
        }
      })
      // #endif
    },
    // 获取系统 信息
    getSystemSize() {
      this.$nextTick(() => {
        const winSize = uni.getSystemInfoSync()
        const { windowHeight, windowWidth, statusBarHeight } = winSize
        this.statusBarHeight = statusBarHeight
        this.winH = windowHeight
        this.winW = windowWidth
        // #ifdef H5
        const { windowTop } = winSize
        this.windowTop = windowTop
        // #endif
      })
    },
  },
  // 组件初始化
  created() {
    this.getSystemSize()
  },
  computed: {
    // 蒙层样式
    maskStyle() {
      return `background-color: ${this.maskColor}; `
    },
    // 主弹窗样式
    contentStyle() {
      let width, height, x, y
      switch (this.type) {
        case 'zoom': // 当default时 样式
          width = this.width
          height = this.height
          x = this.x
          y = this.y
          let origin = this.origin
          return `left: ${x}px; top: ${y}px; width: ${width}rpx; height: ${height}rpx; transform-origin: ${origin};`
        default:
          width = this.width
          height = this.height
          x = this.x
          y = this.y
          return `left: ${x}px; top: ${y}px; width: ${width}rpx; height: ${height}rpx;`
      }
    },
  },
}
</script>

<style scoped>
.p_wrapper {
  /* position: fixed; */
  position: fixed;
  /* #ifndef APP-NVUE */
  z-index: 10000;
  /* #endif */
}

.mask {
  /* #ifndef APP-NVUE */
  z-index: 10000;
  /* #endif */
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.content {
  /* #ifndef APP-NVUE */
  z-index: 10001;
  /* #endif */
  position: fixed;
  border-radius: 10rpx;
}

.not_def_show {
  transform: scale(0, 0);
  opacity: 0;
}
.not_def_show_f {
  opacity: 0;
}

.not_animation_show_mask {
  transition: opacity 200;
  opacity: 1;
}
.not_animation_hide_mask {
  transition: opacity 200;
  opacity: 0;
}
/* #ifndef APP-NVUE */
.not_nvue_animation_show {
  transition: all 200ms;
  transform: scale(1, 1);
  opacity: 1;
}

.not_nvue_animation_hide {
  transition: all 200ms;
  transform: scale(0, 0);
  opacity: 0;
}
.not_nvue_animation_show_f {
  transition: all 400ms;
  opacity: 1;
}
.not_nvue_animation_hide_f {
  transition: all 400ms;
  opacity: 0;
}
/* #endif */
</style>

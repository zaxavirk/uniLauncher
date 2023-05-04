<template>
    <view>
        <view class="loading" v-if="systemLoading">
            <image class="logo" src="../../static/loading.gif" mode=""></image>
            <view class="tips">正在获取应用列表，请稍后...<br />(首次获取应用需要较长时间，请耐心等待。)</view>
        </view>
        <view class="main">
            <view class="menu">
                <uni-icons type="list" color="#fff" size="50" @click="showSetting"></uni-icons>
            </view>
            <uni-drawer ref="settingDrawer" :width="318" mode="right">
                <view class="menuList" scroll-y>
                    <view class="button" @click="getAgain">
                        重新获取应用列表
                    </view>
                </view>
            </uni-drawer>
            <view class="dotBar">
                <view :class="{'dot':true,'thisDot':current==index}" v-for="(item,index) in apkList" :key="index">
                </view>
            </view>
            <swiper class="swiper" :style="{height:'88vh'}" vertical @change="current = $event.detail.current">
                <swiper-item v-for="(item,index) in apkList" :key="index">
                    <view class="userWindow">
                        <uni-grid :column="5" :showBorder="false" :highlight="false" :square="false">
                            <uni-grid-item v-for="(items, indexs) in item" :index="index" :key="items.packageName">
                                <view class="item" @click="click(items.packageName)" @longpress="longTap($event,items.packageName)">
                                    <img :src="items.appIcon" class="icon" />
                                    <view class="text">{{ items.appName }}</view>
                                </view>
                            </uni-grid-item>
                        </uni-grid>
                    </view>
                </swiper-item>
            </swiper>
             <qdx-pop adaption :hasNav="false" ref="qdxPop">
                <view class="popMenu">
                    <view class="popBtn" hover-class="click-popBtn" @click="uninstall">
                        卸载
                    </view>
                    <view class="popBtn" hover-class="click-popBtn" @click="hide">
                        隐藏
                    </view>
                </view>
            </qdx-pop>
        </view>
    </view>
</template>

<script>
    import {
        getAppList,
        clipList,
        localSave,
        uninstallApp,
        hideApp
    } from '../../common/utils.js'
    import qdxPop from '@/components/qdxns-popup/qdxns-popup.vue';
    export default {
         components: {qdxPop},
        data() {
            return {
                apkList: [],
                current: 0,
                systemLoading: true, //
                dotsStyles: {
                    backgroundColor: 'rgba(255, 153, 0, 0.3)',
                    border: '1px rgba(255, 153, 0,0.3) solid',
                    selectedBackgroundColor: 'rgba(255, 123, 0,0.9)',
                    selectedBorder: '1px rgba(255, 123, 0,0.9) solid',
                    bottom: 30
                },
                longTapPackageName:'', // 被长按的应用报名
            }
        },
        onLoad() {
            uni.getStorage({
                key: 'appList',
                success: (res) => {
                    this.apkList = res.data
                    console.log(res.data)
                    this.systemLoading = false
                },
                fail: (err) => {
                    this.getAppList()
                    this.systemLoading = false
                }
            })
        },
        methods: {
            async getAppList() {
                let array = await getAppList()
                this.apkList = clipList(array)
                localSave(this.apkList)
            },

            // 点击图标跳转应用
            click(packageName) {
                plus.runtime.launchApplication({
                        pname: packageName
                    },
                    function(e) {
                        uni.showModal({
                            title: '提示',
                            content: '暂不支持打开的应用',
                        });
                    });
            },
            // 长按图标显示菜单
            longTap(e,packageName) {
                this.$refs.qdxPop.open(e);
                this.longTapPackageName = packageName
            },
            //卸载
            uninstall(){
                uninstallApp(this.longTapPackageName)
                localSave(this.apkList)
                this.$refs.qdxPop.close();
                this.longTapPackageName = ''
            },
            // 隐藏
            hide() {
              this.apkList = hideApp(this.apkList,this.longTapPackageName) 
              localSave(this.apkList)
              this.$refs.qdxPop.close();
              this.longTapPackageName = ''
            },

            showSetting() {
                this.$refs.settingDrawer.open()
            },

            getAgain() {
                this.$refs.settingDrawer.close()
                this.systemLoading = true
                this.$nextTick(() => {
                    this.getAppList()
                    this.systemLoading = false
                })
            },

        }
    }
</script>

<style lang="scss" scoped>
    /**加载动画*/
    .loading {
        z-index: 99999;
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #111315;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        .logo {
            width: 60px;
            height: 60px;
        }

        .tips {
            margin-top: 26px;
            font-size: 26px;
            color: #fff;
            text-align: center;
        }
    }

    .main {
        width: 100vw;
        height: 100vh;
        background-color: #111315;
    }

    .menu {
        height: 36.5px;
        padding: 36.5px 36.5px 0 0;
        text-align: right;
        // font-weight: bold;
    }

    .dotBar {
        height: 100%;
        position: absolute;
        left: 81.8px;
        top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .dot {
            margin-top: 5px;
            width: 2px;
            height: 25px;
            background-color: #b8b8b8;
        }

        .thisDot {
            height: 45px;
            background-color: #ff9900;
        }
    }

    .userWindow {
        padding: 29.2px 127.75px 0 127.75px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-around;
        /// 菜单按钮      
    }

    .item {
        padding: 10upx 0;
        text-align: center;

        .text {
            font-size: 24.8px;
            padding: 7.3px 0 73px 0;
            color: #fff;
            letter-spacing: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .icon {
            width: 76.75px;
            height: 76.75px;
            // border-radius: 18px;
            object-fit: cover;
            display: inline;
        }
    }

    .menuList {
        background-color: #111315;
        border-left: #414445 2px solid;
        min-height: 100vh;
        padding: 80px 40px 40px;

        .button {
            font-size: 20.44px;
            text-align: center;
            border: 1px solid #e3b069;
            background-color: #5a4426;
            color: #fff;
            padding: 13.14px 0;
            margin-bottom: 5upx;
        }
    }
    
    .popMenu{
        width:100px;
        // height: 120px;
        background-color: #414445;
        .popBtn{
            text-align: center;
            font-size: 22px;
            color: #fff;
            padding: 18px;   
        }
        .click-popBtn{
             background-color: #6f7476;
        }
    }
</style>

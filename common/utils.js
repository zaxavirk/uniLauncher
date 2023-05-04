
import {apps} from './apps.js'
/// 获取应用列表
export const getAppList = () => {
    return new Promise((resolve,reject)=>{ 
        let apkArray = []
        apkArray = apps
        plus.android.importClass('android.graphics.drawable.BitmapDrawable');
        var BitmapFactory = plus.android.importClass("android.graphics.BitmapFactory");
        var Base64 = plus.android.importClass("android.util.Base64");
        var Bitmap = plus.android.importClass('android.graphics.Bitmap');
        var ByteArrayOutputStream = plus.android.importClass("java.io.ByteArrayOutputStream");
        var Canvas = plus.android.importClass('android.graphics.Canvas');
        plus.android.importClass('java.util.ArrayList');
        plus.android.importClass('android.content.pm.PackageInfo');
        plus.android.importClass('android.content.pm.PackageManager');
        var ApplicationInfo = plus.android.importClass('android.content.pm.ApplicationInfo');
        var MainActivity = plus.android.runtimeMainActivity();
        var PackageManager = MainActivity.getPackageManager();
        var pinfo = plus.android.invoke(PackageManager, 'getInstalledPackages', 0)
        if (pinfo != null) {
            for (var i = 0; i < pinfo.size(); i++) {
                var pkginfo = pinfo.get(i);
                var issysapk = ((pkginfo.plusGetAttribute("applicationInfo").plusGetAttribute("flags") &
                    ApplicationInfo.FLAG_SYSTEM) != 0) ? true : false
                if (issysapk == false && pkginfo.plusGetAttribute("applicationInfo").loadLabel(PackageManager)
                            .toString()!='我的应用') {
                    const apkinfo = {
                        appName: pkginfo.plusGetAttribute("applicationInfo").loadLabel(PackageManager)
                            .toString(),
                        packageName: pkginfo.plusGetAttribute("packageName"),
                        versionName: pkginfo.plusGetAttribute("versionName"),
                        versionCode: pkginfo.plusGetAttribute("versionCode"),
                        appIco: pkginfo.plusGetAttribute("applicationInfo").loadIcon(PackageManager)
                    };
                    var bimp = null;
                    try {
                        bimp = apkinfo.appIco.getBitmap();
                    } catch (e) {
                        console.log(e)
                        bimp = Bitmap.createBitmap(apkinfo.appIco.getIntrinsicWidth(), apkinfo.appIco
                            .getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                        var canvas = new Canvas(bimp);
                        apkinfo.appIco.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                        apkinfo.appIco.draw(canvas);
                    }
                    var baos = new ByteArrayOutputStream();
                    bimp.compress(Bitmap.CompressFormat.PNG, 100, baos);
                    baos.flush();
                    baos.close();
                    var bitmapBytes = baos.toByteArray();
                    var result = "data:image/png;base64," + Base64.encodeToString(bitmapBytes, Base64.DEFAULT);
                    apkinfo.appIcon = result;
                    apkArray.push(apkinfo);
                };
            };
        };
        resolve(apkArray)
    })
}

/**
 * 卸载
 * @param {string} packageName 要卸载的包名
 */
export const uninstallApp = (packageName) => {
    var Intent = plus.android.importClass("android.content.Intent");
    var Uri = plus.android.importClass('android.net.Uri');
    var main = plus.android.runtimeMainActivity();
    var _intent = new Intent(Intent.ACTION_DELETE, Uri.fromParts("package", packageName, null))
    main.startActivity(_intent);
}

/**
 * 本地存储应用信息列表
 * @param {Array} list 分页好的应用列表
 */
export const localSave = (list) => {
    return new Promise((resolve,reject)=>{
        uni.setStorage({
            key: 'appList',
            data:list,
            success: (value) => {
                resolve(value)
            },
            fail: (value) => {
                reject(value)
            }
        });
        
    })
}

/**
 * 裁剪数组
 *@param {array} arr
 *@param {number}  size 每一页有多少个值
 *@return {array}
 */
export const clipList = (arr, size=10) => {
    var result = [];
    for (var i = 0, len = arr.length; i < len; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * 隐藏应用
 * @param {Array} arr 
 * @param {string} packageName 要隐藏的包名
 * @return {Array}
 */
export const hideApp = (arr, packageName) => {
    let list = arr.flat(Infinity)
    var newArr = []
    for (let i = 0; i<list.length; i++) {
        if(list[i].packageName!=packageName){
            newArr.push(list[i])
        }
    }
    return clipList(newArr,10)
    
} 
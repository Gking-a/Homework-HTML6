# 功能说明：
# 1.统合标签
## 将img,video,audio,embed统合为一个标签，同时保留其各自独有的属性配置。当指定type属性时会使用此属性，未指定时会通过src后缀名自动判断。
### 例：...
###   < src="myvideo.mp4" type="video/mp4" autoplay controls></>
###   < src="a.mp3" controls></>
###   < src="b.png"></>
### 注：部分属性存在渲染问题，未能解决。
## 示例见./automedia.html
# 2.景深布局
## 通过指定滑动速度，达到不同的滑动效果，从而实现景深布局
## 属性:xvh:调整容器的宽度(单位默认为vh且不可修改)
## 属性:yvh:调整容器的高度(单位默认为vh且不可修改)
## 子元素属性：depth:当speed=0.5时,scroll操作时元素相对位置与用户视角保持不变（即一直处于用户屏幕中的原位置）
## 子元素属性：offset:与布局左上角的距离
## 子元素属性：axis:X:沿X轴滑动，Y：沿Y轴滑动，XY：沿X和Y轴滑动
## 示例见./depthlayout.html
# 3.记录布局
## 可以记录用户的mouse和input操作
## 具有函数：start(),stop(),generateJson()
## 示例见./timerecord.html
# 4.手势布局
## 检测用户鼠标手势，提供上下左右、左上左下右上右下共八个方向的相应，以及长按和双击的相应
## 属性：on-swipe-up,on-swipe-down,on-swipe-left,on-swipe-right,on-swipe-up-left,on-swipe-up-right,on-swipe-down-left,on-swipe-down-right,on-double-tap,on-long-press
## 属性值皆为自定义函数
## 示例见./gesture.html
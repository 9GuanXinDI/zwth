# lime-ball 小球飞入
- uniapp vue3 添加商品小球跳到购物车效果，目前仅在H5、微信小程序、nvue上测试过
- 初版可能有BUG，nvue 连续点击会有卡顿，如果你有更好的发送实现，麻烦告之


## 使用
- 导入插件后直接使用

```html
<!-- 点击加入 -->
<button @click="onClick">加入</button>

<!-- 使用标签包住你的购物车 -->
<l-ball ref="ballRef">
	<!-- 可以导出active变量，小球将要达到时，给这购物车加点动画 -->
	<template #default="{active}">
		<view :class="{active}">购物车</view>
	</template>
</l-ball>
```
```js
const ballRef = ref(null)
// 注意nvue目前点击无法获取坐标，需要你单独处理
const onClick = (e) => {
	if(!ballRef.value) return
	ballRef.value.action(e)
}
```


### 查看示例
导入后直接使用这个标签查看演示效果，
```html
// 代码位于 uni_modules/lime-ball/compoents/lime-ball
<lime-ball />
```

### 插件标签
- 默认 l-ball 为 component
- 默认 lime-ball 为 demo

## API

### Props

| 参数                       | 说明                                                         | 类型             | 默认值       |
| --------------------------| ------------------------------------------------------------ | ---------------- | ------------ |
| duration                   | 过渡时间                                                   | <em>number</em>  | `600`        |
| offset                    | 小球被抛的高度                                                | <em>number `|` number[]</em>  | `150`        |
| size                      | 小球的尺寸                                                    | <em>string `|` number</em>  | `-`     |
| color           		    | 小球的颜色                                                    | <em>string</em>  | `-`      |


## 主题定制

### 样式变量
- 在nvue下不支持
组件提供了下列 CSS 变量，可用于自定义样式

| 名称                              | 默认值                     | 描述 |
| --------------------------------- | -------------------------- | ---- |
| --l-ball-size       | _30rpx_                     | -    |
| --l-ball-color | _red_                     | -    |



## 打赏

如果你觉得本插件，解决了你的问题，赠人玫瑰，手留余香。  
![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png)
![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png)
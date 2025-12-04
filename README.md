# 电商应用项目 (mall-app-web)

这是一个基于 uni-app 开发的跨平台电商应用项目，支持多端运行（微信小程序、H5、App等）。

## 技术栈

- **框架**: uni-app
- **开发语言**: Vue.js
- **网络请求**: luch-request (封装的 uni.request)
- **状态管理**: Vuex

## 项目结构

```
mall-app-web/
├── .gitignore              # Git忽略文件
├── App.vue                 # 应用入口文件
├── LICENSE                 # 项目许可证
├── README.md               # 项目说明文档
├── main.js                 # 应用入口js文件
├── manifest.json           # 应用配置文件
├── pages.json              # 页面路由配置
├── uni.scss                # uni-app全局样式文件
├── api/                    # API接口目录
│   ├── address.js          # 地址管理API
│   ├── brand.js            # 品牌管理API
│   ├── cart.js             # 购物车API
│   ├── coupon.js           # 优惠券API
│   ├── home.js             # 首页API
│   ├── member.js           # 会员API
│   ├── memberBrandAttention.js  # 会员品牌关注API
│   ├── memberProductCollection.js  # 会员商品收藏API
│   ├── memberReadHistory.js  # 会员阅读历史API
│   ├── order.js            # 订单管理API
│   └── product.js          # 商品管理API
├── components/             # 组件目录
│   ├── empty.vue           # 空状态组件
│   ├── mix-list-cell.vue   # 列表单元格组件
│   ├── mix-loading/        # 加载组件
│   │   └── mix-loading.vue
│   ├── share.vue           # 分享组件
│   ├── uni-load-more/      # 加载更多组件
│   │   └── uni-load-more.vue
│   ├── uni-number-box.vue  # 数字输入框组件
│   └── upload-images.vue   # 图片上传组件
├── images/                 # 图片资源目录
│   ├── mall_app_web_preview_01.png  # 应用预览图1
│   ├── mall_app_web_preview_02.png  # 应用预览图2
│   ├── mall_app_web_preview_03.png  # 应用预览图3
│   ├── mall_app_web_preview_04.png  # 应用预览图4
│   ├── mall_app_web_preview_05.png  # 应用预览图5
│   ├── mall_app_web_preview_06.png  # 应用预览图6
│   ├── mall_app_web_preview_07.png  # 应用预览图7
│   ├── mall_app_web_preview_08.png  # 应用预览图8
│   ├── mall_app_web_preview_09.png  # 应用预览图9
│   └── mall_app_web_preview_10.png  # 应用预览图10
├── js_sdk/                 # 第三方SDK目录
│   └── luch-request/       # luch-request网络请求库
│       ├── readme.md       # luch-request说明文档
│       └── request.js      # luch-request核心文件
├── pages/                  # 页面目录
│   ├── address/            # 地址管理页面
│   │   ├── address.vue     # 地址详情/编辑页面
│   │   └── addressManage.vue  # 地址列表页面
│   ├── brand/              # 品牌页面
│   │   ├── brandDetail.vue  # 品牌详情页面
│   │   └── list.vue        # 品牌列表页面
│   ├── cart/               # 购物车页面
│   │   └── cart.vue        # 购物车页面
│   ├── category/           # 分类页面
│   │   └── category.vue    # 分类页面
│   ├── coupon/             # 优惠券页面
│   │   └── couponList.vue  # 优惠券列表页面
│   ├── index/              # 首页
│   │   └── index.vue       # 首页
│   ├── money/              # 支付相关页面
│   │   ├── money.vue       # 订单金额页面
│   │   ├── pay.vue         # 支付页面
│   │   └── paySuccess.vue  # 支付成功页面
│   ├── notice/             # 通知页面
│   │   └── notice.vue      # 通知页面
│   ├── order/              # 订单管理页面
│   │   ├── createOrder.vue  # 创建订单页面
│   │   ├── order.vue       # 订单列表页面
│   │   └── orderDetail.vue  # 订单详情页面
│   ├── product/            # 商品相关页面
│   │   ├── hotProductList.vue  # 热销商品列表
│   │   ├── list.vue        # 商品列表页面
│   │   ├── newProductList.vue  # 新品列表页面
│   │   └── product.vue     # 商品详情页面
│   ├── public/             # 公共页面
│   │   ├── login.vue       # 登录页面
│   │   └── register.vue    # 注册页面
│   ├── set/                # 设置页面
│   │   └── set.vue         # 设置页面
│   ├── user/               # 用户相关页面
│   │   ├── brandAttention.vue  # 品牌关注页面
│   │   ├── productCollection.vue  # 商品收藏页面
│   │   ├── readHistory.vue  # 阅读历史页面
│   │   └── user.vue        # 用户中心页面
│   └── userinfo/           # 用户信息页面
│       └── userinfo.vue    # 用户信息页面
├── static/                 # 静态资源目录
│   ├── arc.png             # 弧度图片
│   ├── emptyCart.jpg       # 空购物车图片
│   ├── errorImage.jpg      # 错误图片
│   ├── hot_product_banner.png  # 热销商品横幅
│   ├── icon_close.png      # 关闭图标
│   ├── icon_deliver.png    # 配送图标
│   ├── icon_finish.png     # 完成图标
│   ├── icon_flash_promotion.png  # 闪购图标
│   ├── icon_home_brand.png  # 首页品牌图标
│   ├── icon_hot_product.png  # 热销商品图标
│   ├── icon_new_product.png  # 新品图标
│   ├── icon_receive.png    # 收货图标
│   ├── icon_recommend_product.png  # 推荐商品图标
│   ├── icon_wait.png       # 等待图标
│   ├── missing-face.png    # 缺失头像图片
│   ├── new_product_banner.png  # 新品横幅
│   ├── recommend_brand_banner.png  # 推荐品牌横幅
│   ├── select.png          # 未选中图标
│   ├── selected.png        # 选中图标
│   ├── tab-cart-current.png  # 当前购物车标签图标
│   ├── tab-cart.png        # 购物车标签图标
│   ├── tab-cate-current.png  # 当前分类标签图标
│   ├── tab-cate.png        # 分类标签图标
│   ├── tab-home-current.png  # 当前首页标签图标
│   ├── tab-home.png        # 首页标签图标
│   ├── tab-my-current.png  # 当前我的标签图标
│   ├── tab-my.png          # 我的标签图标
│   ├── temp/               # 临时资源目录
│   │   ├── ad-splash.jpg   # 启动广告图片
│   │   ├── ad1.jpg         # 广告图片1
│   │   ├── ad2.jpg         # 广告图片2
│   │   ├── ad3.jpg         # 广告图片3
│   │   ├── banner1.jpg     # 横幅图片1
│   │   ├── banner2.jpg     # 横幅图片2
│   │   ├── banner3.jpg     # 横幅图片3
│   │   ├── banner4.jpg     # 横幅图片4
│   │   ├── c1.png          # 分类图片1
│   │   ├── c2.png          # 分类图片2
│   │   ├── c3.png          # 分类图片3
│   │   ├── c4.png          # 分类图片4
│   │   ├── c5.png          # 分类图片5
│   │   ├── c6.png          # 分类图片6
│   │   ├── c7.png          # 分类图片7
│   │   ├── c8.png          # 分类图片8
│   │   ├── cate1.jpg       # 分类图片1
│   │   ├── cate10.jpg      # 分类图片10
│   │   ├── cate11.jpg      # 分类图片11
│   │   ├── cate12.jpg      # 分类图片12
│   │   ├── cate13.jpg      # 分类图片13
│   │   ├── cate14.jpg      # 分类图片14
│   │   ├── cate15.jpg      # 分类图片15
│   │   ├── cate16.jpg      # 分类图片16
│   │   ├── cate17.jpg      # 分类图片17
│   │   ├── cate18.jpg      # 分类图片18
│   │   ├── cate19.jpg      # 分类图片19
│   │   ├── cate2.jpg       # 分类图片2
│   │   ├── cate20.jpg      # 分类图片20
│   │   ├── cate21.jpg      # 分类图片21
│   │   ├── cate22.jpg      # 分类图片22
│   │   ├── cate23.jpg      # 分类图片23
│   │   ├── cate24.jpg      # 分类图片24
│   │   ├── cate3.jpg       # 分类图片3
│   │   ├── cate4.jpg       # 分类图片4
│   │   ├── cate5.jpg       # 分类图片5
│   │   ├── cate6.jpg       # 分类图片6
│   │   ├── cate7.jpg       # 分类图片7
│   │   ├── cate8.jpg       # 分类图片8
│   │   ├── cate9.jpg       # 分类图片9
│   │   ├── h1.png          # 首页图片1
│   │   ├── secskill-img.jpg  # 秒杀图片
│   │   ├── share_moment.png  # 分享到朋友圈图标
│   │   ├── share_qq.png    # 分享到QQ图标
│   │   ├── share_qqzone.png  # 分享到QQ空间图标
│   │   └── share_wechat.png  # 分享到微信图标
│   ├── user-bg.jpg         # 用户背景图片
│   ├── vip-card-bg.png     # VIP卡片背景
│   └── yticon.ttf          # 自定义字体
├── store/                  # 状态管理目录
│   └── index.js            # Vuex状态管理
└── utils/                  # 工具函数目录
    ├── appConfig.js        # 应用配置
    ├── date.js             # 日期处理工具
    └── requestUtil.js      # 请求工具
```

## 功能模块

### 1. 用户模块
- 用户注册/登录
- 用户信息管理
- 会员中心

### 2. 商品模块
- 商品列表
- 商品详情
- 商品分类
- 新品/热销商品展示

### 3. 购物车模块
- 商品添加/删除/修改数量
- 购物车结算

### 4. 订单模块
- 创建订单
- 订单列表
- 订单详情
- 支付功能

### 5. 地址模块
- 地址列表
- 地址添加/编辑/删除

### 6. 优惠券模块
- 优惠券列表展示

### 7. 收藏模块
- 商品收藏管理
- 品牌关注管理
- 阅读历史记录

## 开发说明

### 运行项目

```bash
# 安装依赖
npm install

# 运行H5
npm run dev:h5

# 运行微信小程序
npm run dev:mp-weixin

# 运行App
npm run dev:app-plus
```

### 构建项目

```bash
# 构建H5
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建App
npm run build:app-plus
```

## 注意事项

1. 项目基于uni-app开发，需使用HBuilderX或Vue CLI进行开发和构建
2. 网络请求使用了luch-request库，已封装在js_sdk/luch-request目录
3. 组件使用了uni-app官方组件和自定义组件
4. 图片资源主要存放在images和static目录
5. 项目支持多端运行，但部分功能可能需要根据不同平台进行适配

## License

MIT
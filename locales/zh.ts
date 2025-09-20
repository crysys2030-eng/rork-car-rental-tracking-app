export const zh = {
  // Navigation
  dashboard: '仪表板',
  cars: 'VIP汽车',
  rentals: '租赁',
  tracking: '追踪',
  back: '返回',
  
  // Common
  add: '添加',
  edit: '编辑',
  delete: '删除',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  close: '关闭',
  loading: '加载中...',
  error: '错误',
  success: '成功',
  warning: '警告',
  info: '信息',
  yes: '是',
  no: '否',
  ok: '确定',
  
  // Dashboard
  dashboardTitle: 'VIP汽车租赁',
  dashboardSubtitle: '豪华汽车租赁管理',
  totalRentals: '总租赁数',
  activeRentals: '活跃租赁',
  totalRevenue: '总收入',
  availableCars: '可用汽车',
  vatIncluded: '含增值税',
  fleetSummary: '车队概况',
  fleetDescription: '大排量VIP汽车',
  newBooking: '新预订',
  
  // Cars
  carsTitle: 'VIP车队',
  addCar: '添加汽车',
  carDetails: '车辆详情',
  available: '可用',
  rented: '已租赁',
  viewDetails: '查看详情',
  brand: '品牌',
  model: '型号',
  year: '年份',
  engine: '发动机',
  horsepower: '马力 (HP)',
  seats: '座位',
  doors: '车门',
  pricePerDay: '每日价格 (€)',
  pricePerHour: '每小时价格 (€)',
  description: '描述',
  category: '类别',
  vehicleType: '车辆类型',
  fuelType: '燃料类型',
  transmission: '变速器',
  imageUrl: '图片URL',
  specifications: '规格',
  performance: '性能',
  prices: '价格 (含增值税)',
  features: '特征',
  
  // Vehicle Types
  coupe: '轿跑车',
  convertible: '敞篷车',
  sedan: '轿车',
  suv: 'SUV',
  hatchback: '掀背车',
  
  // Fuel Types
  gasoline: '汽油',
  diesel: '柴油',
  hybrid: '混合动力',
  electric: '电动',
  
  // Transmission Types
  manual: '手动',
  automatic: '自动',
  semiAutomatic: '半自动',
  
  // Categories
  supercar: '超级跑车',
  luxury: '豪华',
  sport: '运动',
  
  // Rentals
  rentalsTitle: '租赁',
  newRental: '新租赁',
  customerData: '客户数据',
  rentalDetails: '租赁详情',
  fullName: '全名',
  email: '邮箱',
  phone: '电话 (葡萄牙)',
  licenseNumber: '驾照号码',
  rentalType: '租赁类型',
  duration: '持续时间',
  startDate: '开始日期',
  endDate: '结束日期',
  enableTracking: '启用GPS追踪',
  priceSummary: '价格摘要',
  createRental: '创建租赁',
  selectVehicle: '选择车辆',
  
  // Rental Types
  hours: '小时',
  days: '天',
  perHour: '按小时',
  perDay: '按天',
  
  // Rental Status
  pending: '待处理',
  active: '活跃',
  completed: '已完成',
  cancelled: '已取消',
  approve: '批准',
  complete: '完成',
  
  // Tracking
  trackingTitle: 'GPS追踪',
  vehiclesTracked: '正在追踪的车辆',
  noVehiclesTracked: '没有正在追踪的车辆',
  trackingDescription: '启用追踪的活跃租赁车辆将显示在这里',
  located: '已定位',
  noGps: '无GPS',
  currentLocation: '当前位置',
  latitude: '纬度',
  longitude: '经度',
  lastUpdate: '最后更新',
  update: '更新',
  updating: '更新中...',
  yourLocation: '您的位置',
  accuracy: '精度',
  trackingActive: '追踪活跃',
  
  // Messages
  fillRequiredFields: '请填写所有必填字段。',
  invalidPhone: '请输入有效的葡萄牙电话号码。',
  selectDates: '请选择开始和结束日期。',
  carAddedSuccess: '汽车添加成功！',
  rentalCreatedSuccess: '租赁创建成功！',
  locationUpdatedSuccess: '位置更新成功！',
  locationUpdateError: '无法获取当前位置。',
  locationPermissionDenied: '使用追踪功能需要位置访问权限。',
  webTrackingNotice: '⚠️ 网页版GPS追踪为模拟。请使用移动设备获取真实GPS。',
  webLocationSimulated: '模拟位置已更新 (网页版)',
  noRentalsYet: '暂无租赁',
  noRentalsDescription: '点击 + 按钮创建新租赁',
  
  // Language Settings
  language: '语言',
  selectLanguage: '选择语言',
  changeLanguage: '更改语言',
  
  // Car Views
  exterior: '外观',
  interior: '内饰',
} as const;
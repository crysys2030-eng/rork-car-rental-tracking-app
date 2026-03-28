export const ja = {
  // Navigation
  dashboard: 'ダッシュボード',
  cars: 'VIP車両',
  rentals: 'レンタル',
  tracking: '追跡',
  back: '戻る',
  
  // Common
  add: '追加',
  edit: '編集',
  delete: '削除',
  save: '保存',
  cancel: 'キャンセル',
  confirm: '確認',
  close: '閉じる',
  loading: '読み込み中...',
  error: 'エラー',
  success: '成功',
  warning: '警告',
  info: '情報',
  yes: 'はい',
  no: 'いいえ',
  ok: 'OK',
  
  // Dashboard
  dashboardTitle: 'VIPカーレンタル',
  dashboardSubtitle: '高級車レンタル管理',
  totalRentals: '総レンタル数',
  activeRentals: 'アクティブレンタル',
  totalRevenue: '総収益',
  availableCars: '利用可能車両',
  vatIncluded: '消費税込み',
  fleetSummary: 'フリート概要',
  fleetDescription: '大排気量VIP車両',
  newBooking: '新規予約',
  
  // Cars
  carsTitle: 'VIPフリート',
  addCar: '車両追加',
  carDetails: '車両詳細',
  available: '利用可能',
  rented: 'レンタル中',
  viewDetails: '詳細を見る',
  brand: 'ブランド',
  model: 'モデル',
  year: '年式',
  engine: 'エンジン',
  horsepower: '馬力 (HP)',
  seats: '座席数',
  doors: 'ドア数',
  pricePerDay: '1日料金 (€)',
  pricePerHour: '1時間料金 (€)',
  description: '説明',
  category: 'カテゴリー',
  vehicleType: '車両タイプ',
  fuelType: '燃料タイプ',
  transmission: 'トランスミッション',
  imageUrl: '画像URL',
  specifications: '仕様',
  performance: 'パフォーマンス',
  prices: '料金 (消費税込み)',
  features: '特徴',
  
  // Vehicle Types
  coupe: 'クーペ',
  convertible: 'コンバーチブル',
  sedan: 'セダン',
  suv: 'SUV',
  hatchback: 'ハッチバック',
  
  // Fuel Types
  gasoline: 'ガソリン',
  diesel: 'ディーゼル',
  hybrid: 'ハイブリッド',
  electric: '電気',
  
  // Transmission Types
  manual: 'マニュアル',
  automatic: 'オートマチック',
  semiAutomatic: 'セミオートマチック',
  
  // Categories
  supercar: 'スーパーカー',
  luxury: 'ラグジュアリー',
  sport: 'スポーツ',
  
  // Rentals
  rentalsTitle: 'レンタル',
  newRental: '新規レンタル',
  customerData: '顧客データ',
  rentalDetails: 'レンタル詳細',
  fullName: 'フルネーム',
  email: 'メール',
  phone: '電話 (ポルトガル)',
  licenseNumber: '免許証番号',
  rentalType: 'レンタルタイプ',
  duration: '期間',
  startDate: '開始日',
  endDate: '終了日',
  enableTracking: 'GPS追跡を有効にする',
  priceSummary: '料金概要',
  createRental: 'レンタル作成',
  selectVehicle: '車両選択',
  
  // Rental Types
  hours: '時間',
  days: '日',
  perHour: '時間単位',
  perDay: '日単位',
  
  // Rental Status
  pending: '保留中',
  active: 'アクティブ',
  completed: '完了',
  cancelled: 'キャンセル',
  approve: '承認',
  complete: '完了',
  
  // Tracking
  trackingTitle: 'GPS追跡',
  vehiclesTracked: '追跡中の車両',
  noVehiclesTracked: '追跡中の車両なし',
  trackingDescription: 'アクティブなレンタルと追跡が有効な車両がここに表示されます',
  located: '位置確認済み',
  noGps: 'GPS無し',
  currentLocation: '現在位置',
  latitude: '緯度',
  longitude: '経度',
  lastUpdate: '最終更新',
  update: '更新',
  updating: '更新中...',
  yourLocation: 'あなたの位置',
  accuracy: '精度',
  trackingActive: '追跡アクティブ',
  
  // Messages
  fillRequiredFields: '必須フィールドをすべて入力してください。',
  invalidPhone: '有効なポルトガルの電話番号を入力してください。',
  selectDates: '開始日と終了日を選択してください。',
  carAddedSuccess: '車両が正常に追加されました！',
  rentalCreatedSuccess: 'レンタルが正常に作成されました！',
  locationUpdatedSuccess: '位置が正常に更新されました！',
  locationUpdateError: '現在位置を取得できませんでした。',
  locationPermissionDenied: '追跡を使用するには位置アクセス許可が必要です。',
  webTrackingNotice: '⚠️ ウェブ版ではGPS追跡はシミュレートされます。実際のGPSにはモバイルデバイスを使用してください。',
  webLocationSimulated: 'シミュレート位置が更新されました (ウェブ版)',
  noRentalsYet: 'まだレンタルがありません',
  noRentalsDescription: '+ボタンをタップして新しいレンタルを作成',
  
  // Language Settings
  language: '言語',
  selectLanguage: '言語選択',
  changeLanguage: '言語変更',
  
  // Car Views
  exterior: '外観',
  interior: '内装',
} as const;
export const ru = {
  // Navigation
  dashboard: 'Панель управления',
  cars: 'VIP автомобили',
  rentals: 'Аренда',
  tracking: 'Отслеживание',
  back: 'Назад',
  
  // Common
  add: 'Добавить',
  edit: 'Редактировать',
  delete: 'Удалить',
  save: 'Сохранить',
  cancel: 'Отмена',
  confirm: 'Подтвердить',
  close: 'Закрыть',
  loading: 'Загрузка...',
  error: 'Ошибка',
  success: 'Успех',
  warning: 'Предупреждение',
  info: 'Информация',
  yes: 'Да',
  no: 'Нет',
  ok: 'OK',
  
  // Dashboard
  dashboardTitle: 'Аренда VIP автомобилей',
  dashboardSubtitle: 'Управление арендой роскошных автомобилей',
  totalRentals: 'Всего аренд',
  activeRentals: 'Активные аренды',
  totalRevenue: 'Общий доход',
  availableCars: 'Доступные автомобили',
  vatIncluded: 'НДС включен',
  fleetSummary: 'Обзор автопарка',
  fleetDescription: 'VIP автомобили с большим объемом двигателя',
  newBooking: 'Новое бронирование',
  
  // Cars
  carsTitle: 'VIP автопарк',
  addCar: 'Добавить автомобиль',
  carDetails: 'Детали автомобиля',
  available: 'Доступен',
  rented: 'Арендован',
  viewDetails: 'Посмотреть детали',
  brand: 'Марка',
  model: 'Модель',
  year: 'Год',
  engine: 'Двигатель',
  horsepower: 'Мощность (л.с.)',
  seats: 'Места',
  doors: 'Двери',
  pricePerDay: 'Цена/День (€)',
  pricePerHour: 'Цена/Час (€)',
  description: 'Описание',
  category: 'Категория',
  vehicleType: 'Тип автомобиля',
  fuelType: 'Тип топлива',
  transmission: 'Коробка передач',
  imageUrl: 'URL изображения',
  specifications: 'Характеристики',
  performance: 'Производительность',
  prices: 'Цены (НДС включен)',
  features: 'Особенности',
  
  // Vehicle Types
  coupe: 'Купе',
  convertible: 'Кабриолет',
  sedan: 'Седан',
  suv: 'Внедорожник',
  hatchback: 'Хэтчбек',
  
  // Fuel Types
  gasoline: 'Бензин',
  diesel: 'Дизель',
  hybrid: 'Гибрид',
  electric: 'Электрический',
  
  // Transmission Types
  manual: 'Механическая',
  automatic: 'Автоматическая',
  semiAutomatic: 'Полуавтоматическая',
  
  // Categories
  supercar: 'Суперкар',
  luxury: 'Люкс',
  sport: 'Спортивный',
  
  // Rentals
  rentalsTitle: 'Аренда',
  newRental: 'Новая аренда',
  customerData: 'Данные клиента',
  rentalDetails: 'Детали аренды',
  fullName: 'Полное имя',
  email: 'Email',
  phone: 'Телефон (Португалия)',
  licenseNumber: 'Номер лицензии',
  rentalType: 'Тип аренды',
  duration: 'Продолжительность',
  startDate: 'Дата начала',
  endDate: 'Дата окончания',
  enableTracking: 'Включить GPS отслеживание',
  priceSummary: 'Сводка по цене',
  createRental: 'Создать аренду',
  selectVehicle: 'Выбрать автомобиль',
  
  // Rental Types
  hours: 'часов',
  days: 'дней',
  perHour: 'По часам',
  perDay: 'По дням',
  
  // Rental Status
  pending: 'Ожидание',
  active: 'Активный',
  completed: 'Завершен',
  cancelled: 'Отменен',
  approve: 'Одобрить',
  complete: 'Завершить',
  
  // Tracking
  trackingTitle: 'GPS отслеживание',
  vehiclesTracked: 'отслеживаемых автомобилей',
  noVehiclesTracked: 'Нет отслеживаемых автомобилей',
  trackingDescription: 'Автомобили с активной арендой и включенным отслеживанием появятся здесь',
  located: 'Найден',
  noGps: 'Нет GPS',
  currentLocation: 'Текущее местоположение',
  latitude: 'Широта',
  longitude: 'Долгота',
  lastUpdate: 'Последнее обновление',
  update: 'Обновить',
  updating: 'Обновление...',
  yourLocation: 'Ваше местоположение',
  accuracy: 'Точность',
  trackingActive: 'Отслеживание активно',
  
  // Messages
  fillRequiredFields: 'Пожалуйста, заполните все обязательные поля.',
  invalidPhone: 'Пожалуйста, введите действительный португальский номер телефона.',
  selectDates: 'Пожалуйста, выберите даты начала и окончания.',
  carAddedSuccess: 'Автомобиль успешно добавлен!',
  rentalCreatedSuccess: 'Аренда успешно создана!',
  locationUpdatedSuccess: 'Местоположение успешно обновлено!',
  locationUpdateError: 'Не удалось получить текущее местоположение.',
  locationPermissionDenied: 'Для использования отслеживания требуется разрешение на доступ к местоположению.',
  webTrackingNotice: '⚠️ GPS отслеживание симулируется в веб-версии. Используйте мобильное устройство для реального GPS.',
  webLocationSimulated: 'Симулированное местоположение обновлено (веб-версия)',
  noRentalsYet: 'Пока нет аренд',
  noRentalsDescription: 'Нажмите кнопку + чтобы создать новую аренду',
  
  // Language Settings
  language: 'Язык',
  selectLanguage: 'Выбрать язык',
  changeLanguage: 'Изменить язык',
  
  // Car Views
  exterior: 'Экстерьер',
  interior: 'Интерьер',
} as const;
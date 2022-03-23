import {HumanReadableError, NormalizedError} from '../../../models/errors-text';

export const commonErrors: Record<NormalizedError, HumanReadableError> = {
  'no connection': 'Не удается подключиться к серверу. Попробуйте позже.',
  'unhandled error': 'Неизвестная ошибка. Попробуйте позже.',
  'not found': 'Нет такой картинки/функции/предмента',
  'service unavailable': 'Ошибка на сервере. Попробуйте позже.',
  'internal server error': 'Критическая ошибка на сервере. Попробуйте позже.',
  'bad gateway': 'Сервер не смог обработать ошибку. Попробуйте позже.',
  'gateway timeout': 'Сервер не успел ответить на запрос (504). Попробуйте позже.',
  'failed auth': 'Неправильный логин или пароль',
  forbidden: 'Нет доступа.',
  'timeout has occurred': 'Долгое соединенеие с сервером. Проверьте подключение к интернету.',
  'permission denied': 'Нет доступа',
  timeout: 'Обработка запроса заняла слишком много времени',
  'unknown method': 'Неизвестная функция',
  'database failed': 'Фатальная ошибка базы данных',
  'invalid image': 'Некорректное изображение',
  'image disabled': 'Изображение не требуется',
  'auth required': 'Требуется авторизация',
  'missing credentials': 'Данные для авторизации отсутствуют',
  'invalid version': 'Старая версия сайта, обновите страницу',
  'invalid token': 'Некорректный токен авторизации',
}

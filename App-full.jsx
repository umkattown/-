import { useState, useEffect } from 'react'
import ProductCharts from './components/ProductCharts'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    min_price: null,
    max_price: null,
    min_rating: null,
    min_reviews: null,
    sort_by: 'id',
    sort_order: 'asc',
    page: 1
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Загрузка товаров
  const fetchProducts = async (currentFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })

      const response = await fetch(`${API_BASE_URL}/products/?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(data.products || [])
      setPagination(data.pagination)
      
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Поиск новых товаров
  const searchProducts = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products/parse/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          limit: 50
        })
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при поиске товаров')
      }
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Успех: Найдено и добавлено ${data.count} товаров`)
        setSearchQuery('')
        fetchProducts()
      } else {
        throw new Error(data.message || 'Ошибка при поиске товаров')
      }
      
    } catch (error) {
      console.error('Ошибка при поиске товаров:', error)
      alert(`Ошибка: ${error.message || "Не удалось найти товары"}`)
    } finally {
      setSearchLoading(false)
    }
  }

  // Обработка изменения фильтров
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    fetchProducts(newFilters)
  }

  // Обработка изменения страницы
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchProducts(newFilters)
  }

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchProducts()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Аналитика товаров Wildberries
          </h1>
          <p className="text-gray-600 text-lg">
            Поиск, анализ и сравнение товаров с детальной фильтрацией и визуализацией
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего товаров</p>
                <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
              </div>
              <div className="text-blue-500">📦</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средняя цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length > 0 
                    ? formatPrice(products.reduce((sum, p) => sum + (p.discounted_price || p.price), 0) / products.length)
                    : '0 ₽'
                  }
                </p>
              </div>
              <div className="text-green-500">💰</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средний рейтинг</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length > 0 
                    ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="text-yellow-500">⭐</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Средняя скидка</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length > 0 
                    ? (products.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) / products.length).toFixed(1) + '%'
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-red-500">🏷️</div>
            </div>
          </div>
        </div>

        {/* Поиск новых товаров */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Поиск новых товаров</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Введите запрос для поиска товаров (например: смартфон, ноутбук)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={searchLoading}
            />
            <button
              onClick={searchProducts}
              disabled={!searchQuery.trim() || searchLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Поиск...' : 'Найти'}
            </button>
          </div>
          {searchLoading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-semibold text-blue-900">Поиск товаров...</p>
                  <p className="text-sm text-blue-700">Это может занять несколько секунд</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Фильтры */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Фильтры</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Минимальная цена</label>
              <input
                type="number"
                placeholder="0"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Максимальная цена</label>
              <input
                type="number"
                placeholder="100000"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Минимальный рейтинг</label>
              <select
                value={filters.min_rating || ''}
                onChange={(e) => handleFilterChange('min_rating', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Любой рейтинг</option>
                <option value="1">1+ звезд</option>
                <option value="2">2+ звезд</option>
                <option value="3">3+ звезд</option>
                <option value="4">4+ звезд</option>
                <option value="4.5">4.5+ звезд</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Минимальное количество отзывов</label>
              <select
                value={filters.min_reviews || ''}
                onChange={(e) => handleFilterChange('min_reviews', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Любое количество</option>
                <option value="10">10+ отзывов</option>
                <option value="50">50+ отзывов</option>
                <option value="100">100+ отзывов</option>
                <option value="500">500+ отзывов</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сортировать по</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Названию</option>
                <option value="price">Цене</option>
                <option value="rating">Рейтингу</option>
                <option value="reviews_count">Количеству отзывов</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Порядок</label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">По возрастанию</option>
                <option value="desc">По убыванию</option>
              </select>
            </div>
          </div>
        </div>

        {/* Графики */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Аналитика и визуализация</h2>
          <ProductCharts filters={filters} />
        </div>

        {/* Таблица товаров */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Товары ({pagination?.total || 0})</h2>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <div className="text-lg">Загрузка товаров...</div>
            </div>
          )}
          
          {error && (
            <div className="p-6">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Ошибка: {error}
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Название
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена со скидкой
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Рейтинг
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Отзывы
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.category && (
                              <div className="text-sm text-gray-500">{product.category}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {product.discounted_price ? (
                              <div>
                                <span className="text-green-600 font-semibold">
                                  {formatPrice(product.discounted_price)}
                                </span>
                                {product.discount_percentage > 0 && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    -{product.discount_percentage}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">Нет скидки</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">⭐</span>
                              {product.rating ? product.rating.toFixed(1) : 'Нет'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.reviews_count?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Товары не найдены</p>
                </div>
              )}

              {/* Пагинация */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Показано {((pagination.page - 1) * pagination.per_page) + 1}-{Math.min(pagination.page * pagination.per_page, pagination.total)} из {pagination.total} товаров
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.has_prev || loading}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        Назад
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Страница {pagination.page} из {pagination.pages}
                      </span>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.has_next || loading}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        Вперед
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App


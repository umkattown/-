import { useState, useEffect } from 'react'
import ProductFilters from './components/ProductFilters'
import ProductTable from './components/ProductTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Package, Search } from 'lucide-react'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [filters, setFilters] = useState({
    min_price: 0,
    max_price: 100000,
    min_rating: null,
    min_reviews: null,
    sort_by: 'id',
    sort_order: 'asc',
    page: 1
  })
  
  // Загрузка товаров
  const fetchProducts = async (currentFilters = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })

      const response = await fetch(`${API_BASE_URL}/products/?${params}`)
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров')
      }
      
      const data = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
      
      // Обновляем диапазон цен на основе загруженных данных
      if (data.products.length > 0) {
        const prices = data.products.map(p => p.discounted_price || p.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        
        if (currentFilters.min_price === priceRange.min && currentFilters.max_price === priceRange.max) {
          setPriceRange({ min: Math.floor(minPrice / 100) * 100, max: Math.ceil(maxPrice / 100) * 100 })
        }
      }
      
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error)
      alert('Ошибка: Не удалось загрузить товары. Проверьте подключение к серверу.')
    } finally {
      setLoading(false)
    }
  }

  // Поиск новых товаров
  const searchProducts = async (query) => {
    setSearchLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products/parse/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          limit: 50
        })
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при поиске товаров')
      }
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Успех: Найдено и добавлено ${data.count} товаров`)
        // Перезагружаем список товаров
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
  const handleFiltersChange = (newFilters) => {
    const updatedFilters = { ...newFilters, page: 1 }
    setFilters(updatedFilters)
    fetchProducts(updatedFilters)
  }

  // Обработка изменения страницы
  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    fetchProducts(updatedFilters)
  }

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Аналитика товаров Wildberries
          </h1>
          <p className="text-muted-foreground text-lg">
            Поиск, анализ и сравнение товаров с детальной фильтрацией
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя цена</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.length > 0 
                  ? new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(
                      products.reduce((sum, p) => sum + (p.discounted_price || p.price), 0) / products.length
                    )
                  : '0 ₽'
                }
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.length > 0 
                  ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
                  : '0.0'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Индикатор поиска */}
        {searchLoading && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-semibold text-blue-900">Поиск товаров...</p>
                  <p className="text-sm text-blue-700">Это может занять несколько секунд</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Фильтры */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          priceRange={priceRange}
          onSearch={searchProducts}
        />

        {/* Таблица товаров */}
        <ProductTable
          products={products}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default App

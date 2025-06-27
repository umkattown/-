import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, RotateCcw } from 'lucide-react'

const ProductFilters = ({ filters, onFiltersChange, priceRange, onSearch }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (values) => {
    const newFilters = {
      ...localFilters,
      min_price: values[0],
      max_price: values[1]
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const resetFilters = {
      min_price: priceRange.min,
      max_price: priceRange.max,
      min_rating: null,
      min_reviews: null,
      sort_by: 'id',
      sort_order: 'asc'
    }
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setSearchQuery('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Фильтры и поиск
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Поиск новых товаров */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск новых товаров</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Введите запрос для поиска товаров (например: смартфон, ноутбук)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Найти
            </Button>
          </div>
        </div>

        {/* Диапазон цен */}
        <div className="space-y-3">
          <Label>Диапазон цен: {localFilters.min_price?.toLocaleString()} - {localFilters.max_price?.toLocaleString()} ₽</Label>
          <Slider
            value={[localFilters.min_price || priceRange.min, localFilters.max_price || priceRange.max]}
            onValueChange={handlePriceRangeChange}
            max={priceRange.max}
            min={priceRange.min}
            step={100}
            className="w-full"
          />
        </div>

        {/* Минимальный рейтинг */}
        <div className="space-y-2">
          <Label htmlFor="rating">Минимальный рейтинг</Label>
          <Select
            value={localFilters.min_rating?.toString() || ''}
            onValueChange={(value) => handleFilterChange('min_rating', value ? parseFloat(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите минимальный рейтинг" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любой рейтинг</SelectItem>
              <SelectItem value="1">1+ звезд</SelectItem>
              <SelectItem value="2">2+ звезд</SelectItem>
              <SelectItem value="3">3+ звезд</SelectItem>
              <SelectItem value="4">4+ звезд</SelectItem>
              <SelectItem value="4.5">4.5+ звезд</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Минимальное количество отзывов */}
        <div className="space-y-2">
          <Label htmlFor="reviews">Минимальное количество отзывов</Label>
          <Select
            value={localFilters.min_reviews?.toString() || ''}
            onValueChange={(value) => handleFilterChange('min_reviews', value ? parseInt(value) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите минимальное количество отзывов" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любое количество</SelectItem>
              <SelectItem value="10">10+ отзывов</SelectItem>
              <SelectItem value="50">50+ отзывов</SelectItem>
              <SelectItem value="100">100+ отзывов</SelectItem>
              <SelectItem value="500">500+ отзывов</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Сортировка */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Сортировать по</Label>
            <Select
              value={localFilters.sort_by}
              onValueChange={(value) => handleFilterChange('sort_by', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Названию</SelectItem>
                <SelectItem value="price">Цене</SelectItem>
                <SelectItem value="rating">Рейтингу</SelectItem>
                <SelectItem value="reviews_count">Количеству отзывов</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Порядок</Label>
            <Select
              value={localFilters.sort_order}
              onValueChange={(value) => handleFilterChange('sort_order', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">По возрастанию</SelectItem>
                <SelectItem value="desc">По убыванию</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Кнопка сброса */}
        <Button variant="outline" onClick={resetFilters} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Сбросить фильтры
        </Button>
      </CardContent>
    </Card>
  )
}

export default ProductFilters


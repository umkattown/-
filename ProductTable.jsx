import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Star, MessageSquare, Package } from 'lucide-react'

const ProductTable = ({ products, pagination, onPageChange, loading }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'Нет'
  }

  const formatReviews = (count) => {
    return count ? count.toLocaleString() : '0'
  }

  const getDiscountBadge = (discountPercentage) => {
    if (!discountPercentage || discountPercentage === 0) return null
    
    return (
      <Badge variant="destructive" className="ml-2">
        -{discountPercentage}%
      </Badge>
    )
  }

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null

    const pages = []
    const currentPage = pagination.page
    const totalPages = pagination.pages

    // Показываем максимум 5 страниц
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + 4)
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={loading}
        >
          {i}
        </Button>
      )
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Показано {((currentPage - 1) * pagination.per_page) + 1}-{Math.min(currentPage * pagination.per_page, pagination.total)} из {pagination.total} товаров
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.has_prev || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </Button>
          {pages}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.has_next || loading}
          >
            Вперед
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Товары
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Загрузка товаров...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Товары
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить фильтры или выполнить поиск новых товаров
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Товары ({pagination?.total || products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Название товара</TableHead>
                <TableHead className="w-[15%]">Цена</TableHead>
                <TableHead className="w-[15%]">Цена со скидкой</TableHead>
                <TableHead className="w-[15%]">Рейтинг</TableHead>
                <TableHead className="w-[15%]">Отзывы</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-sm leading-tight mb-1">
                        {product.name}
                      </div>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {formatPrice(product.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {product.discounted_price ? (
                        <>
                          <span className="font-semibold text-green-600">
                            {formatPrice(product.discounted_price)}
                          </span>
                          {getDiscountBadge(product.discount_percentage)}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Нет скидки</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {formatRating(product.rating)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{formatReviews(product.reviews_count)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {renderPagination()}
      </CardContent>
    </Card>
  )
}

export default ProductTable


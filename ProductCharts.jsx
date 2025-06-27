import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from 'recharts'

const ProductCharts = ({ filters }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загрузка данных для графиков
  const fetchChartData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && key !== 'page') {
          params.append(key, value)
        }
      })

      const response = await fetch(`/api/products/stats/?${params}`)
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных для графиков')
      }
      
      const data = await response.json()
      setChartData(data)
      
    } catch (error) {
      console.error('Ошибка при загрузке данных для графиков:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [filters])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <div className="text-lg">Загрузка данных для графиков...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Ошибка загрузки данных для графиков: {error}
        </div>
      </div>
    )
  }

  if (!chartData) {
    return null
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg max-w-xs">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm">Рейтинг: {data.rating}</p>
          <p className="text-sm">Скидка: {data.discount_percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Гистограмма распределения цен */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Распределение цен товаров</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.price_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="range" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'Количество товаров', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                name="Количество товаров"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Всего товаров: {chartData.total_products}
        </p>
      </div>

      {/* Линейный график скидки vs рейтинг */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Зависимость размера скидки от рейтинга</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData.discount_vs_rating}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="rating" 
                domain={[0, 5]}
                label={{ value: 'Рейтинг', position: 'insideBottom', offset: -10 }}
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="discount_percentage"
                label={{ value: 'Размер скидки (%)', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                name="Товары" 
                dataKey="discount_percentage" 
                fill="#EF4444"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Каждая точка представляет один товар. Наведите курсор для подробной информации.
        </p>
      </div>
    </div>
  )
}

export default ProductCharts


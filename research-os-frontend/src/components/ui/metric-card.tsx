import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon?: React.ComponentType<{ className?: string }>
}

export function MetricCard({ label, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {(trend === 'up' ? <TrendingUp className="inline h-3 w-3 mr-1" /> : trend === 'down' ? <TrendingDown className="inline h-3 w-3 mr-1" /> : null)} {change}
              </p>
            )}
          </div>
          {Icon && <div className="p-2 bg-muted rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
        </div>
      </CardContent>
    </Card>
  )
}
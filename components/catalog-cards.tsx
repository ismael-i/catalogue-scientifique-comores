import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CatalogItem {
  id: string
  title: string
  category: string
  description: string
  specimens?: number
  icon: string
}

interface CatalogCardsProps {
  items: CatalogItem[]
}

export function CatalogCards({ items }: CatalogCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card 
          key={item.id} 
          className="hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 bg-white group"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs mt-1 font-medium">
                  {item.category}
                </CardDescription>
              </div>
              <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">
                {item.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
            {item.specimens && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                {item.specimens.toLocaleString('fr-FR')} spécimens
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

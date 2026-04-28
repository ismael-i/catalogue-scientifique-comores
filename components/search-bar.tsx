'use client'

import { useState } from 'react'
import { SearchIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Rechercher dans le catalogue...' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleClear = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="w-full flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
        Rechercher
      </Button>
    </div>
  )
}

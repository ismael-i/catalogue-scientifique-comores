'use client'

import { Users } from 'lucide-react'

interface ResearcherCardProps {
  id: string
  name: string
  affiliation: string
  specialty: string
  avatar?: string
}

export function ResearcherCard({ name, affiliation, specialty, avatar }: ResearcherCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users size={24} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {affiliation}
          </p>
          <p className="text-xs text-gray-700 mt-2 line-clamp-2">
            {specialty}
          </p>
        </div>
      </div>
    </div>
  )
}

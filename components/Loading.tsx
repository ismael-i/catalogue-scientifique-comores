"use client"

import React from "react"

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={`p-6 bg-white rounded-2xl border border-gray-100 shadow-sm ${className ?? ""}`}>
      <div className="animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-3/5 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-4/5 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />

        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-24 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

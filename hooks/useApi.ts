"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "./useAuth"
import { ApiError } from "@/lib/api/client"

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  refresh: () => void
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: ApiError) => void
  } = {}
): UseApiReturn<T> {
  const { token } = useAuth()
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Injecter le token automatiquement si la fonction en a besoin
      const result = await apiFunction(...args, token)
      setState({ data: result, isLoading: false, error: null })
      options.onSuccess?.(result)
      return result
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : "Une erreur est survenue"
      
      setState(prev => ({ ...prev, isLoading: false, error: message }))
      options.onError?.(error as ApiError)
      return null
    }
  }, [apiFunction, token, options.onSuccess, options.onError])

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  useEffect(() => {
    if (options.immediate) {
      execute()
    }
  }, [execute, refreshKey])

  return {
    ...state,
    execute,
    refresh,
    reset,
  }
}
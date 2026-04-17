'use client'

import { useEffect, useState, type ReactNode } from 'react'

export default function AdminAuth({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/auth')
      .then((res) => (res.ok ? res.json() : { authed: false }))
      .then((data) => {
        if (!cancelled) setAuthed(Boolean(data?.authed))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: code }),
      })

      if (res.ok) {
        setAuthed(true)
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || '잘못된 코드입니다.')
      }
    } catch {
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#FCFCFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#888',
          fontSize: '0.85rem',
          letterSpacing: '2px',
        }}
      >
        확인 중...
      </main>
    )
  }

  if (authed) return <>{children}</>

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FCFCFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '48px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>
          ADMIN ACCESS
        </h1>
        <input
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError('') }}
          placeholder="관리자 코드 입력"
          autoFocus
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '220px',
            textAlign: 'center',
          }}
        />
        {error && <p style={{ color: '#c03020', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#999' : '#2c2c2c',
            color: '#fff',
            padding: '10px 28px',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? '확인 중' : '확인'}
        </button>
      </form>
    </main>
  )
}

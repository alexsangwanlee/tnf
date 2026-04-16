'use client'

import { useState, type ReactNode } from 'react'

const ADMIN_CODE = 'tnf2025'

export default function AdminAuth({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === ADMIN_CODE) {
      setAuthed(true)
      setError('')
    } else {
      setError('잘못된 코드입니다.')
    }
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
          style={{
            background: '#2c2c2c',
            color: '#fff',
            padding: '10px 28px',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          확인
        </button>
      </form>
    </main>
  )
}

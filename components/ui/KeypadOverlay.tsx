'use client'

import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

export default function KeypadOverlay() {
  const { gameState, isError, setCodeInput, setError, closeKeypad, unlock } = useGameStore()
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (gameState === 'KEYPAD') {
      setInput('')
      setError(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [gameState, setError])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeKeypad()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeKeypad])

  if (gameState !== 'KEYPAD') return null

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!input.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input }),
      })

      const data = await response.json()

      if (data.success) {
        setCodeInput(input)
        unlock()
        return
      }

      setError(true)
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch {
      setError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeKeypad()
      }}
    >
      <div
        className="relative flex flex-col items-center gap-5"
        style={{
          background: 'rgba(252,250,245,0.97)',
          border: `1px solid ${isError ? 'rgba(192,57,43,0.3)' : 'rgba(0,0,0,0.07)'}`,
          borderRadius: '3px',
          padding: '48px 44px 44px',
          minWidth: '300px',
          boxShadow: isError
            ? '0 40px 90px rgba(0,0,0,0.35), 0 0 0 3px rgba(192,57,43,0.15)'
            : '0 40px 90px rgba(0,0,0,0.35)',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        <button
          onClick={closeKeypad}
          className="absolute top-3 right-4 flex items-center gap-1 opacity-30 transition-opacity hover:opacity-70"
          style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: '#2c2c2c' }}
        >
          닫기
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/textures/tnf.png" alt="THE NORTH FACE" style={{ width: '90px', opacity: 0.85 }} />

        <div style={{ width: '40px', height: '1px', background: 'rgba(0,0,0,0.12)' }} />

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#2c2c2c',
              letterSpacing: '0.5px',
              lineHeight: 1.5,
            }}
          >
            BUMSUP과 함께하는
            <br />
            K-POP 댄스 클래스
          </p>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            color: '#999',
            letterSpacing: '0.3px',
          }}
        >
          초대장 코드를 입력해 주세요
        </p>

        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value.toUpperCase())
              setError(false)
            }}
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-center outline-none"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              letterSpacing: '6px',
              color: isError ? '#c0392b' : '#2c2c2c',
              borderBottom: `2px solid ${isError ? '#c0392b' : 'rgba(0,0,0,0.18)'}`,
              paddingBottom: '10px',
              caretColor: '#2c2c2c',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          />

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#c0392b',
              opacity: isError ? 1 : 0,
              transform: isError ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 0.25s, transform 0.25s',
              height: '18px',
              marginTop: '-8px',
            }}
          >
            올바르지 않은 코드입니다.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !input.trim()}
            style={{
              background: '#2c2c2c',
              color: '#fff',
              border: 'none',
              padding: '12px 40px',
              fontFamily: 'var(--font-serif)',
              fontSize: '0.75rem',
              letterSpacing: '4px',
              borderRadius: '2px',
              cursor: isSubmitting || !input.trim() ? 'default' : 'pointer',
              opacity: !input.trim() ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isSubmitting ? '확인 중' : 'UNLOCK'}
          </button>
        </form>
      </div>
    </div>
  )
}

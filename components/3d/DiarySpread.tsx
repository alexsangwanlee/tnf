'use client'

import { useState, useRef } from 'react'
import { useGameStore } from '@/store/useGameStore'

// Rendered inside <Html transform> — pure HTML/CSS, no Three.js
export default function DiarySpread() {
  const [form, setForm] = useState({ name: '', phone: '', guests: '1', expectation: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('이름과 연락처를 적어주세요.'); return }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/submit-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setIsSuccess(true)
    } catch {
      setError('제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={styles.spread}>
      {/* ─── LEFT PAGE ─── */}
      <div style={styles.page}>
        {/* Faint ruled lines */}
        <Lines />

        <div style={styles.leftContent}>
          <p style={styles.subLabel}>THE NORTH FACE × BEOMJEOP</p>

          <h1 style={styles.title}>DANCE<br />CLASS</h1>

          <div style={styles.divider} />

          <p style={styles.body}>
            자유로운 영혼의 무용수들이<br />
            모이는 <em>은밀한 댄스 클래스</em>에<br />
            당신을 초대합니다.
          </p>

          <div style={styles.divider} />

          <p style={styles.body}>
            리듬과 함께 본연의 나를 발견하고,<br />
            새로운 영감을 나누는 특별한 밤.<br />
            음악이 시작되면 우리는 하나가 됩니다.
          </p>

          <p style={{ ...styles.subLabel, marginTop: '28px' }}>THE NORTH FACE</p>
        </div>
      </div>

      {/* Spine shadow */}
      <div style={styles.spine} />

      {/* ─── RIGHT PAGE ─── */}
      <div style={styles.page}>
        <Lines />

        {isSuccess ? (
          <div style={{ ...styles.rightContent, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <p style={styles.title}>CONFIRMED</p>
            <p style={{ ...styles.body, marginTop: '12px' }}>
              응모가 완료되었습니다.<br />
              초대장은 개별 발송됩니다.
            </p>
          </div>
        ) : (
          <div style={styles.rightContent}>
            <p style={{ ...styles.subLabel, textAlign: 'center', marginBottom: '16px' }}>RSVP</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.row}>
                <Field label="이름 *">
                  <input name="name" value={form.name} onChange={handleChange}
                    placeholder="홍길동" style={styles.input} />
                </Field>
                <Field label="연락처 *">
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="010-0000-0000" style={styles.input} />
                </Field>
              </div>

              <Field label="참석 인원">
                <select name="guests" value={form.guests} onChange={handleChange} style={styles.input}>
                  <option value="1">본인 (1인)</option>
                  <option value="2">동반 1인 (총 2인)</option>
                </select>
              </Field>

              <Field label="기대평">
                <textarea name="expectation" value={form.expectation} onChange={handleChange}
                  placeholder="이번 클래스에 대한 기대를 자유롭게..."
                  rows={3} style={{ ...styles.input, resize: 'none', lineHeight: 1.8 }} />
              </Field>

              {error && <p style={styles.error}>{error}</p>}

              <button type="submit" disabled={isSubmitting} style={styles.btn}>
                {isSubmitting ? '···' : 'CONFIRM →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  )
}

// Faint horizontal ruled lines to mimic notebook paper
function Lines() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 22 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${32 + i * 18}px`,
            height: '1px',
            background: 'rgba(180,160,130,0.18)',
          }}
        />
      ))}
    </div>
  )
}

const pageBase: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  background: 'rgba(250, 246, 238, 0.92)',
  padding: '28px 20px',
  overflow: 'hidden',
}

const inputBase: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dashed rgba(60,40,20,0.35)',
  outline: 'none',
  fontFamily: 'var(--font-handwriting), cursive',
  fontSize: '17px',
  color: '#2c1f10',
  mixBlendMode: 'multiply',
  width: '100%',
  padding: '2px 0 4px',
}

const styles: Record<string, React.CSSProperties> = {
  spread: {
    display: 'flex',
    width: '560px',
    height: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    borderRadius: '1px',
    overflow: 'hidden',
    userSelect: 'none',
  },
  page: { ...pageBase },
  spine: {
    width: '6px',
    background: 'linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.04), rgba(0,0,0,0.10))',
    flexShrink: 0,
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  },
  rightContent: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  subLabel: {
    fontFamily: 'var(--font-serif)',
    fontSize: '7px',
    letterSpacing: '3px',
    color: '#8a7060',
    mixBlendMode: 'multiply',
  } as React.CSSProperties,
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '22px',
    fontWeight: 600,
    letterSpacing: '4px',
    color: '#1a1008',
    lineHeight: 1.3,
    margin: '10px 0 8px',
    mixBlendMode: 'multiply',
  } as React.CSSProperties,
  divider: {
    width: '24px',
    height: '1px',
    background: 'rgba(100,70,40,0.3)',
    margin: '8px auto',
  },
  body: {
    fontFamily: 'var(--font-sans)',
    fontSize: '10px',
    lineHeight: 1.9,
    color: '#3a2c1e',
    mixBlendMode: 'multiply',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  row: { display: 'flex', gap: '10px' },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '8px',
    letterSpacing: '1px',
    color: '#8a7060',
    textTransform: 'uppercase' as const,
  },
  input: inputBase,
  error: {
    fontFamily: 'var(--font-sans)',
    fontSize: '9px',
    color: '#b03020',
  },
  btn: {
    marginTop: 'auto',
    alignSelf: 'center',
    background: 'transparent',
    border: '1px solid rgba(40,25,10,0.4)',
    padding: '7px 20px',
    fontFamily: 'var(--font-serif)',
    fontSize: '9px',
    letterSpacing: '3px',
    color: '#1a1008',
    cursor: 'pointer',
    mixBlendMode: 'multiply',
  } as React.CSSProperties,
}

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

interface FormData {
  name: string
  phone: string
  relationship: string
  guests: string
  expectation: string
}

export default function WriteForm() {
  const gameState = useGameStore((state) => state.gameState)
  const setGameState = useGameStore((state) => state.setGameState)

  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    relationship: '',
    guests: '2',
    expectation: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(gameState === 'OPENED')
  }, [gameState])

  const handleBack = () => {
    setMounted(false)
    setTimeout(() => {
      setIsSuccess(false)
      setError('')
      setGameState('INTRO')
    }, 400)
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name || !form.phone || !form.relationship) {
      setError('아이 이름, 연락처, 보호자와의 관계를 입력해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(data?.error || '응모 정보를 저장하지 못했습니다.')
      }

      setIsSuccess(true)
      setError('')
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '제출 중 오류가 발생했습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (gameState !== 'OPENED') return null

  return (
    <div
      className={`fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#fcfcfc] transition-opacity duration-400 md:items-center ${
        mounted ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backgroundColor: '#fcfcfc' }}
    >
      {isSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[6px]">
          <div className="relative w-[300px] overflow-hidden rounded-[12px] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <img
              src="/textures/inner.png"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative flex flex-col items-center justify-center gap-5 px-8 py-12 text-center">
              <div className="flex flex-col items-center gap-1">
                <p className="font-sans text-[0.58rem] tracking-[0.2em] text-[#9a7a50] uppercase">발표일</p>
                <p className="font-serif text-[0.95rem] tracking-[0.15em] text-[#1f150b]">2026년 4월 30일</p>
              </div>
              <div className="h-px w-12 bg-[#9a8060]/40" />
              <h3 className="font-serif text-[1.6rem] tracking-[0.2em] text-[#1f150b]">
                응모 완료
              </h3>
              <button
                type="button"
                onClick={handleBack}
                className="mt-2 rounded-[999px] border border-[rgba(80,50,20,0.22)] bg-[rgba(255,255,255,0.55)] px-6 py-2.5 font-sans text-[0.68rem] tracking-[0.22em] text-[#5b4128] uppercase backdrop-blur-sm transition hover:bg-[rgba(255,255,255,0.8)]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex min-h-full w-full items-start justify-center px-3 py-12 md:min-h-screen md:items-center md:px-0 md:py-0">
        <button
          onClick={handleBack}
          className="absolute top-5 left-6 z-40 border-none bg-transparent font-sans text-xs tracking-widest text-[#3c280a]/50 transition-colors hover:text-[#3c280a]/90"
        >
          돌아가기
        </button>

        <div
          className="relative flex w-full max-w-[1040px] flex-col items-center gap-3 rounded-[10px] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:w-auto md:max-w-none md:flex-row md:items-stretch md:justify-center md:gap-0 md:rounded-[8px] md:p-3"
          style={{
            backgroundColor: '#cdbfae',
            backgroundImage:
              'linear-gradient(115deg, #b29f86 0%, #e7ddcf 18%, #c8b79f 36%, #f3ece1 50%, #c4b095 66%, #e1d6c7 84%, #9a866f 100%)',
          }}
        >
          <div className="relative mx-auto flex aspect-[5/7] w-[94%] max-w-[480px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[min(52vh,520px)] md:shadow-none">
            <img
              src="/textures/inner.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[66%] w-[66%] -translate-y-[6%] flex-col justify-between md:h-[70%] md:w-[70%] md:-translate-y-[10%]">
                <div className="flex select-none items-center justify-center">
                  <Image
                    src="/textures/tnf.png"
                    alt="The North Face"
                    width={72}
                    height={22}
                    className="object-contain opacity-70 mix-blend-multiply"
                  />
                </div>

                <div className="flex flex-col items-center gap-[2vh] text-center md:gap-[2.2vh]">
                  <div className="flex select-none flex-col items-center gap-[1.2vh]">
                    <h1 className="font-serif text-[min(1.1rem,5vw,2.4vh)] leading-[1.1] tracking-[0.5vh] text-[#1a1008] opacity-90 uppercase">
                      Dance Class
                    </h1>
                    <div className="flex items-center gap-[1vh]">
                      <span className="h-px w-6 bg-[#9a8060]/40" />
                      <Image
                        src="/textures/beomjeop.png"
                        alt="BUMSUP"
                        width={80}
                        height={24}
                        className="object-contain opacity-90"
                      />
                      <span className="h-px w-6 bg-[#9a8060]/40" />
                    </div>
                  </div>

                  <p className="font-sans text-[min(0.75rem,3.5vw,1.6vh)] leading-[1.9] text-[#3a2c18] mix-blend-multiply md:leading-[2.2]">
                    아이의 첫 무대를 기억하시나요?
                    <br />
                    두근거리던 그 설렘을 다시 한번—
                    <br />
                    댄스 크루 <em className="not-italic font-semibold">범접</em>과 함께,
                    <br />
                    아이가 직접 무대 위에 서는
                    <br />
                    특별한 하루에 초대합니다.
                  </p>

                  <div className="flex w-full flex-col gap-[0.7vh] px-2 text-center font-sans text-[min(0.68rem,3.2vw,1.4vh)] leading-[1.4] text-[#3a2c18] mix-blend-multiply md:gap-[0.8vh] md:leading-[1.6]">
                    <p>
                      <strong>일시:</strong> 2026년 5월 10일 오후 1시 - 5시
                    </p>
                    <p>
                      <strong>장소:</strong> 코사이어티 (서울 성동구 왕십리로 82-20)
                    </p>
                    <p>
                      <strong>대상:</strong> 초등학생 8세 - 13세 (보호자 동반)
                    </p>
                    <p>
                      <strong>모집 인원:</strong> 보호자 동반 최대 200명
                    </p>
                    <p>
                      <strong>모집 기간:</strong> 4월 - 5월 23일 마감
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <p className="font-serif text-[min(0.65rem,1.2vh)] tracking-[0.3vh] text-[#9a8060]/70 uppercase">
                    The North Face
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="z-10 hidden w-[10px] flex-shrink-0 md:block"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(143,124,101,0.95) 0%, rgba(238,229,215,0.96) 48%, rgba(168,147,121,0.95) 100%)',
            }}
          />

          <div className="relative mx-auto flex aspect-[5/7] w-[94%] max-w-[480px] flex-shrink-0 flex-col overflow-hidden pb-10 shadow-xl md:mx-0 md:w-[min(52vh,520px)] md:pb-0 md:shadow-none">
            <img
              src="/textures/inner.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-[66%] w-[55%] -translate-y-[6%] flex-col justify-between md:h-[70%] md:w-[58%] md:-translate-y-[10%]">
                <div className="flex items-center justify-center">
                  {/* TNF 로고 높이와 맞추는 spacer */}
                  <div style={{ height: 22 }} />
                </div>

                <div className="flex flex-1 flex-col justify-center py-[1.2vh] md:py-[2vh]">
                  <h2 className="mb-[1.2vh] text-center font-serif text-[min(1.1rem,5vw,2.4vh)] leading-[1.1] tracking-[0.5vh] text-[#1a1008] opacity-90 uppercase">
                    RSVP
                  </h2>
                  <form
                    id="rsvp-form"
                    onSubmit={handleSubmit}
                    onClick={(event) => event.stopPropagation()}
                    className="flex w-full flex-col gap-[0.3vh] md:gap-[0.8vh]"
                  >
                    <div className="flex flex-col gap-[0.3vh] md:gap-[0.8vh]">
                      <Field label="아이 이름 *">
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="예: 김하늘"
                          style={{ ...inputStyle, fontSize: 'min(0.72rem, 2.8vw, 1.5vh)' }}
                        />
                      </Field>
                      <Field label="보호자 연락처 *">
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          placeholder="010-0000-0000"
                          style={{ ...inputStyle, fontSize: 'min(0.72rem, 2.8vw, 1.5vh)' }}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-col gap-[0.3vh] md:gap-[0.8vh]">
                      <Field label="보호자와의 관계 *">
                        <input
                          name="relationship"
                          value={form.relationship}
                          onChange={handleChange}
                          required
                          placeholder="예: 엄마, 아빠"
                          style={{ ...inputStyle, fontSize: 'min(0.72rem, 2.8vw, 1.5vh)' }}
                        />
                      </Field>
                      <Field label="총 인원 *">
                        <select
                          name="guests"
                          value={form.guests}
                          onChange={handleChange}
                          style={{ ...inputStyle, fontSize: 'min(0.72rem, 2.8vw, 1.5vh)' }}
                        >
                          {[1, 2, 3, 4, 5].map((count) => (
                            <option key={count} value={count}>
                              {count}명
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="기대평 (200자 이내)">
                      <textarea
                        name="expectation"
                        value={form.expectation}
                        onChange={handleChange}
                        rows={2}
                        maxLength={200}
                        placeholder="행사에 기대하는 점을 적어 주세요."
                        style={{
                          ...inputStyle,
                          fontSize: 'min(0.72rem, 2.8vw, 1.5vh)',
                          resize: 'none',
                          lineHeight: 1.35,
                          paddingTop: '0.45vh',
                        }}
                      />
                    </Field>

                    {error ? (
                      <p className="font-sans text-[min(0.58rem,2.5vw,1.05vh)] text-[#b03020] md:text-[min(0.7rem,1.3vh)]">
                        {error}
                      </p>
                    ) : null}
                  </form>
                </div>

                <div className="flex justify-center pt-1.5 md:pt-2">
                  <button
                    type="submit"
                    form="rsvp-form"
                    disabled={isSubmitting}
                    style={buttonStyle}
                    className="transition-colors duration-200 hover:bg-[#1a1008]/5"
                  >
                    {isSubmitting ? '접수 중' : '응모하기'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[0.3vh] md:gap-[0.8vh]">
      <label className="font-sans text-[min(0.52rem,2vw,0.9vh)] tracking-[0.06vh] text-[#9a7a50] italic uppercase md:text-[min(0.58rem,2.2vw,1.1vh)] md:tracking-[0.08vh]">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dashed rgba(80,50,20,0.28)',
  outline: 'none',
  fontFamily: 'var(--font-handwriting), cursive',
  fontSize: '0.85rem',
  color: '#1a1008',
  width: '100%',
  padding: '1px 0 3px',
}

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(40,25,5,0.32)',
  padding: 'clamp(0.35rem, 0.55vh, 0.8vh) clamp(0.9rem, 2.2vh, 3vh)',
  fontFamily: 'var(--font-serif)',
  fontSize: 'clamp(0.62rem, 2.2vw, 0.75rem)',
  letterSpacing: 'clamp(0.12rem, 0.24vh, 0.4vh)',
  color: '#1a1008',
  cursor: 'pointer',
}

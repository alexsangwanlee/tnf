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

  const closeSuccessPopup = () => {
    setIsSuccess(false)
  }

  if (gameState !== 'OPENED') return null

  return (
    <div
      className={`fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#fcfcfc] transition-opacity duration-400 md:items-center ${
        mounted ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backgroundColor: '#fcfcfc' }}
    >
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
                <div className="flex select-none items-center justify-center gap-3">
                  <Image
                    src="/textures/tnf.png"
                    alt="The North Face"
                    width={64}
                    height={20}
                    className="object-contain opacity-70 mix-blend-multiply"
                  />
                  <span className="font-serif text-[0.8rem] text-[#9a8060]">×</span>
                  <Image
                    src="/textures/beomjeop.png"
                    alt="BUMSUP"
                    width={64}
                    height={20}
                    className="object-contain grayscale opacity-65 mix-blend-multiply"
                  />
                </div>

                <div className="flex flex-col items-center gap-[2.4vh] text-center md:gap-[2.5vh]">
                  <h1 className="font-serif text-[min(1.8rem,8vw,4vh)] leading-[1.1] tracking-[0.4vh] text-[#1a1008] opacity-90 uppercase">
                    Dance
                    <br />
                    Class
                  </h1>

                  <p className="font-sans text-[min(0.75rem,3.5vw,1.6vh)] leading-[1.8] text-[#3a2c18] mix-blend-multiply md:leading-[2.2]">
                    가족의 달을 맞아 부모님과 아이가 함께 빛나는
                    <br />
                    <em className="not-italic font-semibold">스페셜 클래스</em>에 여러분을 초대합니다.
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
                    <p className="mt-[1.2vh] text-[min(0.6rem,2.8vw,1.2vh)] italic opacity-80">
                      노스페이스 제품 20만원 이상 구매 고객 한정
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
              <div className="flex h-[66%] w-[66%] -translate-y-[6%] flex-col justify-between md:h-[70%] md:w-[70%] md:-translate-y-[10%]">
                <div className="flex items-center justify-center">
                  <h2 className="font-serif text-[min(1.45rem,4.8vw,2.8vh)] leading-none tracking-[0.7vh] text-[#1a1008] opacity-90 uppercase md:text-[min(1.8rem,5.5vw,3.4vh)] md:tracking-[1vh]">
                    RSVP
                  </h2>
                </div>

                <div className="flex flex-1 flex-col justify-center py-[1.2vh] md:py-[2vh]">
                  <form
                    id="rsvp-form"
                    onSubmit={handleSubmit}
                    onClick={(event) => event.stopPropagation()}
                    className="flex w-full flex-col gap-[0.45vh] md:gap-[1.2vh]"
                  >
                    <div className="flex flex-col gap-[0.45vh] md:flex-row md:gap-[1.5vh]">
                      <Field label="아이 이름 *">
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="예: 김하늘"
                          style={{ ...inputStyle, fontSize: 'min(0.92rem, 3.8vw, 1.95vh)' }}
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
                          style={{ ...inputStyle, fontSize: 'min(0.92rem, 3.8vw, 1.95vh)' }}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-col gap-[0.45vh] md:flex-row md:gap-[1.5vh]">
                      <Field label="보호자와의 관계 *">
                        <input
                          name="relationship"
                          value={form.relationship}
                          onChange={handleChange}
                          required
                          placeholder="예: 엄마, 아빠"
                          style={{ ...inputStyle, fontSize: 'min(0.92rem, 3.8vw, 1.95vh)' }}
                        />
                      </Field>
                      <Field label="총 인원 *">
                        <select
                          name="guests"
                          value={form.guests}
                          onChange={handleChange}
                          style={{ ...inputStyle, fontSize: 'min(1rem, 3.9vw, 2vh)' }}
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
                          fontSize: 'min(0.96rem, 3.8vw, 1.95vh)',
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

            {isSuccess ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(249,245,238,0.72)] p-5 backdrop-blur-[3px]">
                <div className="relative w-full max-w-[290px] overflow-hidden rounded-[18px] border border-[rgba(151,126,93,0.26)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,235,220,0.96))] px-6 py-7 text-center shadow-[0_22px_55px_rgba(77,52,25,0.18)]">
                  <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(171,139,93,0.72),transparent)]" />
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(171,139,93,0.3)] bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.98),rgba(231,213,182,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <span className="font-serif text-[1.2rem] text-[#8b6740]">✓</span>
                  </div>
                  <p className="font-serif text-[0.62rem] tracking-[0.35em] text-[#9a7a50] uppercase">
                    Entry Complete
                  </p>
                  <h3 className="mt-3 font-serif text-[1.5rem] tracking-[0.18em] text-[#1f150b]">
                    응모 완료
                  </h3>
                  <p className="mt-3 font-sans text-[0.78rem] leading-6 text-[#6f5334]">
                    소중한 응모가 정상적으로 접수되었습니다.
                    <br />
                    선정 결과는 개별 안내드릴 예정입니다.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-2 opacity-70">
                    <span className="h-px w-10 bg-[rgba(154,122,80,0.35)]" />
                    <span className="font-serif text-[0.58rem] tracking-[0.35em] text-[#9a7a50] uppercase">
                      The North Face
                    </span>
                    <span className="h-px w-10 bg-[rgba(154,122,80,0.35)]" />
                  </div>
                  <button
                    type="button"
                    onClick={closeSuccessPopup}
                    className="mt-6 w-full rounded-[999px] border border-[rgba(111,83,52,0.16)] bg-[rgba(255,255,255,0.72)] px-4 py-3 font-sans text-[0.72rem] tracking-[0.24em] text-[#5b4128] uppercase transition hover:bg-[rgba(255,255,255,0.92)]"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[0.3vh] md:gap-[0.8vh]">
      <label className="font-sans text-[min(0.58rem,2.5vw,1.05vh)] tracking-[0.08vh] text-[#9a7a50] italic uppercase md:text-[min(0.7rem,3vw,1.4vh)] md:tracking-[0.1vh]">
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
  fontSize: '1.25rem',
  color: '#1a1008',
  width: '100%',
  padding: '2px 0 4px',
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

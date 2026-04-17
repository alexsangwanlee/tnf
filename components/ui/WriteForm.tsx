'use client'

import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

type PurchaseType = 'online' | 'offline'

interface FormValues {
  purchaseType: PurchaseType
  privacyAgreed: boolean
  officialMallId: string
  phone: string
  buyerName: string
}

const purchaseOptions: { value: PurchaseType; label: string }[] = [
  { value: 'online', label: '온라인' },
  { value: 'offline', label: '오프라인' },
]

const ILLUSTRATION_PAGES = [
  '/textures/11.png',
  '/textures/22.png',
  '/textures/33.png',
  '/textures/44.png',
]

const TOTAL_SPREADS = 3

export default function WriteForm() {
  const gameState = useGameStore((state) => state.gameState)
  const setGameState = useGameStore((state) => state.setGameState)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isPopupPreview = searchParams.get('popup') === 'success'

  const [mounted, setMounted] = useState(false)
  const [currentSpread, setCurrentSpread] = useState(0)
  const [form, setForm] = useState<FormValues>({
    purchaseType: 'online',
    privacyAgreed: false,
    officialMallId: '',
    phone: '',
    buyerName: '',
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPreviewDismissed, setIsPreviewDismissed] = useState(false)
  const [error, setError] = useState('')

  const showSuccessPopup = isSuccess || (isPopupPreview && !isPreviewDismissed)
  const isOffline = form.purchaseType === 'offline'

  useEffect(() => {
    setMounted(gameState === 'OPENED' || isPopupPreview)
  }, [gameState, isPopupPreview])

  useEffect(() => {
    setIsPreviewDismissed(false)
  }, [isPopupPreview])

  const handleBack = () => {
    setMounted(false)
    setTimeout(() => {
      setIsSuccess(false)
      setIsPreviewDismissed(false)
      setError('')
      setCurrentSpread(0)
      if (isPopupPreview) {
        router.replace(pathname)
        return
      }
      setGameState('INTRO')
    }, 400)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name, type, value } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError('')
  }

  const handlePurchaseTypeChange = (purchaseType: PurchaseType) => {
    setForm((prev) => ({ ...prev, purchaseType }))
    if (purchaseType === 'online') {
      setReceiptFile(null)
    }
    setError('')
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptFile(event.target.files?.[0] ?? null)
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.privacyAgreed) {
      setError('개인 정보 수집 및 이용 동의가 필요합니다.')
      return
    }

    if (!form.phone.trim() || !form.buyerName.trim()) {
      setError('연락처와 성함을 입력해 주세요.')
      return
    }

    if (form.purchaseType === 'online' && !form.officialMallId.trim()) {
      setError('온라인 구매 고객은 공식몰 회원 ID를 입력해 주세요.')
      return
    }

    if (form.purchaseType === 'offline' && !receiptFile) {
      setError('오프라인 구매 고객은 실물 영수증 이미지를 첨부해 주세요.')
      return
    }

    const body = new FormData()
    body.append('purchaseType', form.purchaseType)
    body.append('privacyAgreed', String(form.privacyAgreed))
    body.append('officialMallId', form.officialMallId.trim())
    body.append('phone', form.phone.trim())
    body.append('buyerName', form.buyerName.trim())
    if (receiptFile) {
      body.append('receiptFile', receiptFile)
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-entry', {
        method: 'POST',
        body,
      })

      const data = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(data?.error || '응모 정보를 저장하지 못했습니다.')
      }

      setIsSuccess(true)
      setError('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goNext = () => {
    if (currentSpread < TOTAL_SPREADS - 1) setCurrentSpread((s) => s + 1)
  }
  const goPrev = () => {
    if (currentSpread > 0) setCurrentSpread((s) => s - 1)
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  if (gameState !== 'OPENED' && !isPopupPreview) return null

  return (
    <div
      className={`fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#fcfcfc] transition-opacity duration-400 md:items-center ${
        mounted ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backgroundColor: '#fcfcfc' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]">
          <div className="relative aspect-[1818/1254] w-[min(86vw,440px)] overflow-hidden rounded-[16px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:w-[min(68vw,480px)]">
            <Image
              src="/textures/popup.png"
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 768px) 86vw, 480px"
              className="object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_34%)]" />
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <div className="flex w-[60%] max-w-[240px] -translate-y-[12%] flex-col items-center justify-center gap-2">
                <Image
                  src="/textures/tnf.png"
                  alt="The North Face"
                  width={72}
                  height={22}
                  className="object-contain opacity-80"
                  draggable={false}
                />
                <div className="flex flex-col items-center gap-0.5">
                  <p className="font-sans text-[0.68rem] font-semibold tracking-[0.16em] text-[#1a1008]">
                    당첨자 발표
                  </p>
                  <p className="font-serif text-[0.78rem] tracking-[0.12em] text-[#1f150b]">
                    2025.05.04
                  </p>
                </div>
                <div className="h-px w-11 bg-[#9a8060]/40" />
                <h3 className="font-serif text-[1.18rem] tracking-[0.14em] text-[#1f150b]">
                  응모 완료
                </h3>
                <p className="max-w-[205px] font-sans text-[0.62rem] leading-[1.45] text-[#5f4428]">
                  응모가 정상적으로 접수되었습니다.
                  <br />
                  당첨자는 개별 안내드립니다.
                </p>
                <button
                  type="button"
                  onClick={isPopupPreview ? () => setIsPreviewDismissed(true) : handleBack}
                  style={buttonStyle}
                  className="min-w-[98px] px-0 transition-colors duration-200 hover:bg-[#1a1008]/5"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-full w-full items-start justify-center px-2 py-4 md:min-h-screen md:items-center md:px-0 md:py-0">
        {isPopupPreview ? (
          <div className="absolute top-5 right-6 z-40 rounded-full border border-[rgba(111,83,52,0.18)] bg-[rgba(255,255,255,0.82)] px-4 py-2 font-sans text-[0.62rem] tracking-[0.16em] text-[#6a4d31] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm uppercase">
            Popup Preview
          </div>
        ) : null}

        <button
          onClick={handleBack}
          className="absolute top-5 left-6 z-40 border-none bg-transparent font-sans text-sm tracking-widest text-[#3c280a]/60 transition-colors hover:text-[#3c280a]/90"
        >
          돌아가기
        </button>

        <div
          className="relative flex w-full max-w-[1040px] flex-col items-center gap-2 rounded-[10px] bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:w-auto md:max-w-none md:flex-row md:items-stretch md:justify-center md:gap-0 md:rounded-[8px] md:bg-transparent md:p-3"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="absolute inset-0 hidden rounded-[8px] md:block"
            style={{
              backgroundColor: '#cdbfae',
              backgroundImage:
                'linear-gradient(115deg, #b29f86 0%, #e7ddcf 18%, #c8b79f 36%, #f3ece1 50%, #c4b095 66%, #e1d6c7 84%, #9a866f 100%)',
            }}
          />

          {currentSpread === 0 && <IllustrationPage src={ILLUSTRATION_PAGES[0]} onNavigate={handleBack} direction="left" isFirst />}
          {currentSpread === 0 && <SpineDivider />}
          {currentSpread === 0 && <IllustrationPage src={ILLUSTRATION_PAGES[1]} onNavigate={goNext} direction="right" />}

          {currentSpread === 1 && <IllustrationPage src={ILLUSTRATION_PAGES[2]} onNavigate={goPrev} direction="left" />}
          {currentSpread === 1 && <SpineDivider />}
          {currentSpread === 1 && <IllustrationPage src={ILLUSTRATION_PAGES[3]} onNavigate={goNext} direction="right" />}

          {currentSpread === 2 && (
            <InfoPage onNavigate={goPrev} />
          )}
          {currentSpread === 2 && <SpineDivider />}
          {currentSpread === 2 && (
            <EntryFormPage
              form={form}
              receiptFile={receiptFile}
              isOffline={isOffline}
              isSubmitting={isSubmitting}
              error={error}
              onFormChange={handleChange}
              onPurchaseTypeChange={handlePurchaseTypeChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
            />
          )}

          <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-4 md:-bottom-10 md:gap-3">
            {Array.from({ length: TOTAL_SPREADS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpread(i)}
                className="flex h-8 w-8 items-center justify-center md:h-auto md:w-auto"
                aria-label={`페이지 ${i + 1}`}
              >
                <span
                  className="block h-2.5 w-2.5 rounded-full transition-all duration-200 md:h-2 md:w-2"
                  style={{
                    background: i === currentSpread ? '#6b543c' : 'rgba(107,84,60,0.25)',
                    transform: i === currentSpread ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpineDivider() {
  return (
    <div
      className="z-10 hidden w-[10px] flex-shrink-0 md:block"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(143,124,101,0.95) 0%, rgba(238,229,215,0.96) 48%, rgba(168,147,121,0.95) 100%)',
      }}
    />
  )
}

function IllustrationPage({
  src,
  onNavigate,
  direction,
  isFirst,
}: {
  src: string
  onNavigate: () => void
  direction: 'left' | 'right'
  isFirst?: boolean
}) {
  return (
    <div className="relative mx-auto flex aspect-[5/7] w-[94%] max-w-[480px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[min(52vh,520px)] md:shadow-none">
      <img
        src="/textures/inner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center p-[8%]">
        <img
          src={src}
          alt=""
          className="pointer-events-none h-full w-full select-none object-contain"
          draggable={false}
        />
      </div>
      {direction === 'left' && (
        <button
          onClick={onNavigate}
          className="absolute top-1/2 left-1 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:left-4 md:h-10 md:w-10"
          aria-label="이전 페이지"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {direction === 'right' && (
        <button
          onClick={onNavigate}
          className="absolute top-1/2 right-1 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:right-4 md:h-10 md:w-10"
          aria-label="다음 페이지"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      )}
    </div>
  )
}

function InfoPage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="relative mx-auto flex aspect-[5/7] w-[94%] max-w-[480px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[min(52vh,520px)] md:shadow-none">
      <img
        src="/textures/inner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        draggable={false}
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
              draggable={false}
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
                  src="/textures/BUMSUP.png"
                  alt="BUMSUP"
                  width={80}
                  height={24}
                  className="object-contain opacity-90"
                  draggable={false}
                />
                <span className="h-px w-6 bg-[#9a8060]/40" />
              </div>
            </div>

            <p className="font-sans text-[min(0.75rem,3.5vw,1.6vh)] leading-[1.9] text-[#3a2c18] mix-blend-multiply md:leading-[2.2]">
              아이의 첫 무대를 기억하시나요?
              <br />
              반짝이는 그 설렘을 다시 한번
              <br />
              댄스 아티스트 <em className="not-italic font-semibold">범접</em>과 함께,
              <br />
              아이가 직접 무대 위에 서는
              <br />
              특별한 하루로 초대합니다.
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
                <strong>모집 인원:</strong> 50~100명 추첨 (어린이 기준)
              </p>
              <p>
                <strong>모집 기간:</strong> 4/20(월) ~ 4/26(일)
              </p>
              <p className="mt-[1.2vh] text-[min(0.6rem,2.8vw,1.2vh)] italic opacity-80">
                보호자 동반 1인 포함, 총 2매 제공
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

      <button
        onClick={onNavigate}
        className="absolute top-1/2 left-1 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:left-4 md:h-10 md:w-10"
        aria-label="이전 페이지"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    </div>
  )
}

function EntryFormPage({
  form,
  receiptFile,
  isOffline,
  isSubmitting,
  error,
  onFormChange,
  onPurchaseTypeChange,
  onFileChange,
  onSubmit,
}: {
  form: FormValues
  receiptFile: File | null
  isOffline: boolean
  isSubmitting: boolean
  error: string
  onFormChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onPurchaseTypeChange: (type: PurchaseType) => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <div className="relative mx-auto flex aspect-[5/7] w-[94%] max-w-[480px] flex-shrink-0 flex-col overflow-hidden pb-10 shadow-xl md:mx-0 md:w-[min(52vh,520px)] md:pb-0 md:shadow-none">
      <img
        src="/textures/inner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[78%] w-[58%] -translate-y-[7%] flex-col justify-between md:h-[80%] md:w-[58%] md:-translate-y-[10%]">
          <div className="flex flex-1 flex-col" style={{ paddingTop: '5vh' }}>
            <h2 className="text-center font-serif text-[min(1rem,4.8vw,2vh)] leading-[1.1] tracking-[0.42vh] text-[#1a1008] opacity-90 uppercase" style={{ marginBottom: '2.5vh' }}>
              ENTRY
            </h2>

            <form
              id="rsvp-form"
              onSubmit={onSubmit}
              onClick={(event) => event.stopPropagation()}
              className="flex w-full flex-col gap-[0.55vh] md:gap-[0.7vh]"
            >
              <div className="border-y border-[rgba(154,128,96,0.24)] py-[0.8vh] text-center font-sans text-[min(0.72rem,2.6vw,1.3vh)] leading-[1.6] text-[#3a2510]">
                <strong className="font-semibold">
                  노스페이스 키즈 제품
                  <br />
                  20만원 이상 구매 고객 한정 이벤트
                </strong>
                <br />
                구매 증빙 미충족 시 당첨 제외됩니다.
              </div>

              <Field label="1. 개인 정보 동의 *">
                <label className="flex min-w-0 items-start gap-2 font-sans text-[min(0.65rem,2.5vw,1.15vh)] leading-[1.25] text-[#2c1f0e]">
                  <input
                    name="privacyAgreed"
                    type="checkbox"
                    checked={form.privacyAgreed}
                    onChange={onFormChange}
                    required
                    style={checkboxStyle}
                  />
                  <span>개인정보 수집 및 이용에 동의합니다.</span>
                </label>
              </Field>

              <Field label="구매 방식 *">
                <div className="grid grid-cols-1 gap-1">
                  {purchaseOptions.map((option) => {
                    const selected = form.purchaseType === option.value
                    return (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center justify-center border px-2 py-[0.28vh] font-sans text-[min(0.65rem,2.5vw,1.15vh)] font-medium transition-colors"
                        style={{
                          borderColor: selected ? 'rgba(40,25,5,0.48)' : 'rgba(80,50,20,0.2)',
                          background: selected ? 'rgba(154,128,96,0.15)' : 'rgba(255,255,255,0.16)',
                          color: selected ? '#1a1008' : '#6b543c',
                        }}
                      >
                        <input
                          type="radio"
                          name="purchaseType"
                          value={option.value}
                          checked={selected}
                          onChange={() => onPurchaseTypeChange(option.value)}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </Field>

              {form.purchaseType === 'online' ? (
                <Field label="2. (온라인 구매 고객) 공식몰 회원 ID *">
                  <input
                    name="officialMallId"
                    value={form.officialMallId}
                    onChange={onFormChange}
                    required
                    placeholder="예: tnfkids123"
                    style={inputStyle}
                  />
                </Field>
              ) : null}

              <Field
                label="3. 연락처 *"
                hint="연락 가능한 본인 연락처를 기입해 주세요. (부모님 등)"
              >
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onFormChange}
                  required
                  placeholder="010-0000-0000"
                  style={inputStyle}
                />
              </Field>

              <Field label="4. 성함 *" hint="구매자 본인 성함 기재">
                <input
                  name="buyerName"
                  value={form.buyerName}
                  onChange={onFormChange}
                  required
                  placeholder="예: 김하늘"
                  style={inputStyle}
                />
              </Field>

              {isOffline ? (
                <Field
                  label="5. (오프라인 구매 고객) 영수증 이미지 *"
                  hint={"구매하신 실물 영수증을 촬영하여 첨부해 주세요.\n노스페이스 키즈 제품 20만원 이상 구매 영수증"}
                >
                  <label style={fileInputStyle}>
                    <span className="truncate">
                      {receiptFile ? receiptFile.name : '📎 영수증 이미지 첨부 (클릭)'}
                    </span>
                    <input
                      name="receiptFile"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      capture="environment"
                      onChange={onFileChange}
                      required={isOffline}
                      className="sr-only"
                    />
                  </label>
                </Field>
              ) : null}

              {error ? (
                <p className="font-sans text-[min(0.58rem,2.5vw,1.05vh)] leading-[1.25] text-[#b03020] md:text-[min(0.66rem,1.2vh)]">
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
              className="transition-colors duration-200 hover:bg-[#1a1008]/5 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? '접수 중' : '응모하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[0.25vh] md:gap-[0.42vh]">
      <label className="font-sans text-[min(0.68rem,2.6vw,1.18vh)] font-semibold leading-[1.2] tracking-[0.03vh] text-[#2c1f0e] md:text-[min(0.72rem,2.2vw,1.3vh)]">
        {label}
      </label>
      {hint ? (
        <p className="whitespace-pre-line font-sans text-[min(0.64rem,2.4vw,1.15vh)] leading-[1.3] text-[#4a3520]">
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dashed rgba(80,50,20,0.28)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  fontSize: 'min(0.82rem, 3vw, 1.5vh)',
  color: '#1a1008',
  width: '100%',
  padding: '1px 0 3px',
}

const checkboxStyle: React.CSSProperties = {
  accentColor: '#9a8060',
  flex: '0 0 auto',
  marginTop: '0.12rem',
}

const fileInputStyle: React.CSSProperties = {
  alignItems: 'center',
  justifyContent: 'center',
  border: '1.5px dashed rgba(80,50,20,0.35)',
  borderRadius: '4px',
  color: '#1a1008',
  cursor: 'pointer',
  display: 'flex',
  fontFamily: 'var(--font-sans)',
  fontSize: 'min(0.82rem, 3vw, 1.5vh)',
  minHeight: '4vh',
  padding: '0.8vh 1vh',
  width: '100%',
  background: 'rgba(154,128,96,0.06)',
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

'use client'

import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/useGameStore'

type PurchaseType = 'online' | 'offline'

interface FormValues {
  purchaseType: PurchaseType | null
  privacyAgreed: boolean
  orderNumber: string
  officialMallId: string
  phone: string
  buyerName: string
}

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024

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
    purchaseType: null,
    privacyAgreed: false,
    orderNumber: '',
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
    const file = event.target.files?.[0] ?? null
    if (file && file.size > MAX_RECEIPT_SIZE) {
      setReceiptFile(null)
      event.target.value = ''
      setError('영수증 이미지는 10MB 이하로 첨부해 주세요.')
      return
    }
    if (file && !file.type.startsWith('image/')) {
      setReceiptFile(null)
      event.target.value = ''
      setError('영수증은 이미지 파일로 첨부해 주세요.')
      return
    }
    setReceiptFile(file)
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.privacyAgreed) {
      setError('개인 정보 수집 및 이용 동의가 필요합니다.')
      return
    }

    if (!form.orderNumber.trim()) {
      setError('주문 번호를 입력해 주세요.')
      return
    }

    if (!form.purchaseType) {
      setError('구매 방식을 선택해 주세요.')
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
    body.append('purchaseType', form.purchaseType!)
    body.append('privacyAgreed', String(form.privacyAgreed))
    body.append('orderNumber', form.orderNumber.trim())
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
      className={`fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#fcfcfc] transition-opacity duration-400 ${
        mounted ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ backgroundColor: '#fcfcfc' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Preload popup image as soon as form opens */}
      {mounted && !showSuccessPopup && (
        <div aria-hidden style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
          <Image src="/textures/popup.png" alt="" width={1} height={1} priority />
        </div>
      )}

      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]">
          <div className="relative aspect-[1818/1254] w-[min(86vw,520px)] overflow-hidden rounded-[16px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:w-[min(68vw,560px)]">
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
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="flex -translate-y-[8%] flex-col items-center" style={{ gap: 'max(0.8vh, 6px)', width: '52%' }}>
                <Image
                  src="/textures/tnf.png"
                  alt="The North Face"
                  width={72}
                  height={22}
                  className="object-contain opacity-70 mix-blend-multiply"
                  style={{ width: 'min(72px, 12vw)', height: 'auto', marginBottom: 'max(2vh, 12px)' }}
                  draggable={false}
                />

                <div className="flex flex-col items-center" style={{ gap: 'max(0.5vh, 4px)' }}>
                  <p className="font-sans text-[min(0.6rem,1.8vw)] font-semibold tracking-[0.18em] text-[#3a2c18] uppercase mix-blend-multiply">
                    당첨자 발표
                  </p>
                  <p className="font-serif text-[min(0.7rem,2vw)] tracking-[0.1em] text-[#1f150b] mix-blend-multiply">
                    2025.05.04
                  </p>
                </div>

                <div className="flex flex-col items-center" style={{ gap: 'max(0.6vh, 4px)' }}>
                  <h3 className="font-serif font-bold text-[min(1.1rem,3.2vw)] tracking-[0.16em] text-[#1a1008] mix-blend-multiply uppercase">
                    응모 완료
                  </h3>
                  <p className="font-sans text-[min(0.82rem,2.4vw)] leading-[1.8] text-[#5f4428] mix-blend-multiply">
                    응모가 정상적으로 접수되었습니다.
                    <br />
                    당첨자는 개별 안내드립니다.
                  </p>
                </div>

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
          className="relative my-16 flex w-full max-w-[1220px] flex-col items-center gap-2 rounded-[10px] bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:w-auto md:max-w-none md:flex-row md:items-stretch md:justify-center md:gap-0 md:rounded-[8px] md:bg-transparent md:p-3"
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

          {/* Spread 0 */}
          <div className={`contents ${currentSpread === 0 ? '' : 'hidden'}`}>
            <IllustrationPage src={ILLUSTRATION_PAGES[0]} onNavigate={handleBack} direction="left" isFirst />
            <SpineDivider />
            <IllustrationPage src={ILLUSTRATION_PAGES[1]} onNavigate={goNext} direction="right" />
          </div>

          {/* Spread 1 */}
          <div className={`contents ${currentSpread === 1 ? '' : 'hidden'}`}>
            <IllustrationPage src={ILLUSTRATION_PAGES[2]} onNavigate={goPrev} direction="left" />
            <SpineDivider />
            <IllustrationPage src={ILLUSTRATION_PAGES[3]} onNavigate={goNext} direction="right" />
          </div>

          {/* Spread 2 */}
          <div className={`contents ${currentSpread === 2 ? '' : 'hidden'}`}>
            <InfoPage onNavigate={goPrev} />
            <SpineDivider />
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
          </div>

          <div className="absolute -bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-4 md:-bottom-10 md:gap-3">
            {Array.from({ length: TOTAL_SPREADS }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSpread(i)}
                className="flex h-8 w-8 items-center justify-center md:h-auto md:w-auto"
                aria-label={`페이지 ${i + 1}`}
              >
                <span
                  className="block h-3 w-3 rounded-full transition-all duration-200 md:h-2.5 md:w-2.5"
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
      className="z-10 hidden w-[12px] flex-shrink-0 md:block"
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
    <div className="relative mx-auto flex aspect-[5/7] w-[96%] max-w-[560px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[600px] md:shadow-none">
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
          className="absolute top-1/2 left-1 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:left-4 md:h-11 md:w-11"
          aria-label="이전 페이지"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {direction === 'right' && (
        <button
          onClick={onNavigate}
          className="absolute top-1/2 right-1 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:right-4 md:h-11 md:w-11"
          aria-label="다음 페이지"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      )}
    </div>
  )
}

function InfoPage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="relative mx-auto flex aspect-[5/7] w-[96%] max-w-[560px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[600px] md:shadow-none">
      <img
        src="/textures/inner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[82%] w-[68%] translate-y-[2%] flex-col md:h-[84%] md:w-[68%] md:translate-y-[1%]">
          <div className="flex select-none items-center justify-center" style={{ marginBottom: 'max(3.5vh, 14px)' }}>
            <Image
              src="/textures/tnf.png"
              alt="The North Face"
              width={72}
              height={22}
              className="object-contain opacity-70 mix-blend-multiply"
              style={{ width: 'min(72px, 15vw)', height: 'auto' }}
              draggable={false}
            />
          </div>

          <div className="flex flex-col items-center text-center overflow-y-auto flex-1 scrollbar-hide" style={{ gap: 'max(1.2vh, 8px)' }}>
            <div className="flex select-none flex-col items-center" style={{ gap: 'max(3.5vh, 14px)' }}>
              <h1 className="font-serif text-[min(1.1rem,5vw)] leading-[1.1] tracking-[0.08em] text-[#1a1008] opacity-90 uppercase">
                Dance Class
              </h1>
              <div className="flex items-center gap-[1vh]">
                <span className="h-px w-6 bg-[#9a8060]/40" />
                <Image
                  src="/textures/BUMSUP.png"
                  alt="BUMSUP"
                  width={52}
                  height={16}
                  className="object-contain opacity-90"
                  style={{ width: 'min(52px, 11vw)', height: 'auto' }}
                  draggable={false}
                />
                <span className="h-px w-6 bg-[#9a8060]/40" />
              </div>
            </div>

            <p className="font-sans text-[min(0.72rem,3.2vw)] leading-[1.8] text-[#3a2c18] mix-blend-multiply md:leading-[2]">
              아이의 첫 무대를 기억하시나요?
              <br />
              반짝이는 그 설렘을 다시 한번
              <br />
              한국을 대표하는 댄스 크루 <em className="not-italic font-semibold">범접</em>의
              <br />
              리헤이, 효진초이, 노제와 함께,
              <br />
              아이가 직접 무대 위에 서는
              <br />
              특별한 하루로 초대합니다.
            </p>

            <div className="flex w-full flex-col px-1 text-center font-sans text-[min(0.68rem,3vw)] leading-[1.5] text-[#3a2c18] mix-blend-multiply md:leading-[1.6]" style={{ gap: 'max(0.5vh, 4px)' }}>
              <p><strong>일시:</strong> 5/10(일) 오후 1시 ~ 5시</p>
              <p><strong>장소:</strong> 코사이어티 (서울 성동구 왕십리로 82-20)</p>
              <p><strong>모집 기간:</strong> 4/20(월) ~ 4/26(일)</p>
              <p><strong>대상:</strong> 초등학생 8세 ~ 13세 (*보호자 동반 필수)</p>
              <p><strong>참여 조건:</strong> 키즈 제품 20만 원 이상 구매 고객 대상 추첨 (*온오프라인)</p>
              <p><strong>신청 방법:</strong> 해당 URL 신청 페이지 입력 후 '응모하기' 버튼 클릭</p>
              <p><strong>당첨자 발표:</strong> 5/4(월), 50인 추첨 (1인 2매, 총 100인 모집)</p>
            </div>

            <div
              className="text-left font-sans leading-[1.4] text-[#3a2c18] mix-blend-multiply"
              style={{
                marginTop: 'max(1.5vh, 10px)',
                marginLeft: '8%',
                marginRight: '8%',
                padding: 'max(0.8vh, 6px) 8px',
                fontSize: 'clamp(7.5px, 1.7vw, 8.5px)',
                border: '1px solid rgba(80,50,20,0.2)',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 'max(0.5vh, 4px)' }}>유의 사항</p>
              <p style={{ marginBottom: 'max(0.4vh, 3px)' }}>· 본 행사장은 별도 주차 공간이 마련되어 있지 않으니, 가급적 대중교통 이용을 부탁 드립니다.</p>
              <p style={{ marginBottom: 'max(0.4vh, 3px)' }}>· 당첨 후 사전 연락 없이 불참 시, 향후 유사 이벤트 참여에 제한이 있을 수 있습니다.</p>
              <p style={{ marginBottom: 'max(0.4vh, 3px)' }}>· 불참 시 취소는 5/6(수) 오전까지 상담 챗봇을 통해 요청 부탁드리며, 이후에는 어떤 사유로도 취소 불가한 점 양해 부탁드립니다.</p>
              <p>· <strong>행사 문의처:</strong> URL 하단 상담 챗봇 운영 (*오전 9시 ~ 오후 6시)</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNavigate}
        className="absolute top-1/2 left-1 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3a2c18] shadow-md backdrop-blur-sm transition-all active:scale-95 hover:bg-white/90 md:left-4 md:h-11 md:w-11"
        aria-label="이전 페이지"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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
    <div className="relative mx-auto flex aspect-[5/7] w-[96%] max-w-[560px] flex-shrink-0 flex-col overflow-hidden shadow-xl md:mx-0 md:w-[600px] md:shadow-none">
      <img
        src="/textures/inner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        draggable={false}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-[78%] w-[58%] -translate-y-[2%] flex-col justify-between md:h-[80%] md:w-[58%] md:-translate-y-[4%]">
          <div className="flex flex-1 flex-col" style={{ paddingTop: 'max(3vh, 16px)' }}>
            <h2 className="text-center font-serif text-[min(1rem,4.8vw)] leading-[1.1] tracking-[0.08em] text-[#1a1008] opacity-90 uppercase" style={{ marginBottom: 'max(2vh, 10px)' }}>
              ENTRY
            </h2>

            <form
              id="rsvp-form"
              onSubmit={onSubmit}
              onClick={(event) => event.stopPropagation()}
              className="flex w-full flex-col"
              style={{ gap: 'max(0.55vh, 5px)' }}
            >
              <div className="border-y border-[rgba(154,128,96,0.24)] text-center font-sans text-[min(0.68rem,2.4vw)] leading-[1.6] text-[#3a2510]" style={{ paddingTop: 'max(0.8vh, 5px)', paddingBottom: 'max(0.8vh, 5px)' }}>
                구매 증빙 내역 확인이 어려운 경우 또는
                <br />
                온·오프라인 구매 및 개인 정보 오기재로
                <br />
                주문 내역 확인이 불가할 경우, 추첨에서 제외될 수 있습니다.
              </div>

              <div style={{ height: 'max(1.2vh, 8px)' }} />

              <Field label="1. 개인 정보 동의 *">
                <label
                  className="flex cursor-pointer items-center justify-between font-sans transition-all active:scale-[0.99]"
                  style={{
                    border: `1px solid ${form.privacyAgreed ? 'rgba(40,25,5,0.5)' : 'rgba(80,50,20,0.2)'}`,
                    background: form.privacyAgreed ? 'rgba(154,128,96,0.15)' : 'rgba(255,255,255,0.08)',
                    padding: '6px 8px',
                    borderRadius: '2px',
                  }}
                >
                  <input
                    name="privacyAgreed"
                    type="checkbox"
                    checked={form.privacyAgreed}
                    onChange={onFormChange}
                    required
                    className="sr-only"
                  />
                  <span
                    className="font-sans leading-[1.3]"
                    style={{
                      fontSize: 'min(0.63rem, 2.4vw)',
                      color: form.privacyAgreed ? '#1a1008' : '#6b543c',
                    }}
                  >
                    개인정보 수집 및 이용에 동의합니다.
                  </span>
                  <span
                    className="ml-2 flex flex-shrink-0 items-center justify-center"
                    style={{
                      width: 14,
                      height: 14,
                      border: `1.5px solid ${form.privacyAgreed ? 'rgba(40,25,5,0.6)' : 'rgba(80,50,20,0.3)'}`,
                      background: form.privacyAgreed ? 'rgba(40,25,5,0.75)' : 'transparent',
                      borderRadius: '2px',
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                  >
                    {form.privacyAgreed && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.2 5.8L6.5 2.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </label>
              </Field>

              <Field label="2. 구매 방식 *">
                <div className="flex flex-col" style={{ gap: 5 }}>
                  {([
                    { value: 'online', label: '온라인 20만원 이상 구매 고객' },
                    { value: 'offline', label: '오프라인 20만원 이상 구매 고객' },
                  ] as { value: PurchaseType; label: string }[]).map((option) => {
                    const selected = form.purchaseType === option.value
                    return (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center transition-all active:scale-[0.99]"
                        style={{
                          gap: 7,
                          border: `1px solid ${selected ? 'rgba(40,25,5,0.5)' : 'rgba(80,50,20,0.2)'}`,
                          background: selected ? 'rgba(154,128,96,0.15)' : 'rgba(255,255,255,0.08)',
                          padding: '6px 8px',
                          borderRadius: '2px',
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
                        <span
                          className="flex flex-shrink-0 items-center justify-center rounded-full"
                          style={{
                            width: 12,
                            height: 12,
                            border: `1.5px solid ${selected ? 'rgba(40,25,5,0.6)' : 'rgba(80,50,20,0.3)'}`,
                            background: selected ? 'rgba(40,25,5,0.75)' : 'transparent',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                        >
                          {selected && (
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'white', display: 'block' }} />
                          )}
                        </span>
                        <span
                          className="font-sans leading-[1.3]"
                          style={{
                            fontSize: 'min(0.63rem, 2.4vw)',
                            color: selected ? '#1a1008' : '#6b543c',
                            fontWeight: selected ? 500 : 400,
                          }}
                        >
                          {option.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </Field>

              {form.purchaseType !== null ? (
                <>
                  {form.purchaseType === 'online' ? (
                    <>
                      <Field label="3. 주문 번호 *" hint="구매 주문 번호를 입력해 주세요.">
                        <input
                          name="orderNumber"
                          value={form.orderNumber}
                          onChange={onFormChange}
                          required
                          placeholder="예: 20240510-123456"
                          style={inputStyle}
                        />
                      </Field>
                      <Field label="4. (온라인 구매 고객) 공식몰 회원 ID *">
                        <input
                          name="officialMallId"
                          value={form.officialMallId}
                          onChange={onFormChange}
                          required
                          placeholder="예: tnfkids123"
                          style={inputStyle}
                        />
                      </Field>
                    </>
                  ) : null}

                  <Field
                    label={form.purchaseType === 'online' ? '5. 연락처 *' : '3. 연락처 *'}
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

                  <Field label={form.purchaseType === 'online' ? '6. 성함 *' : '4. 성함 *'} hint="구매자 본인 성함 기재">
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
                </>
              ) : null}

              {error ? (
                <p className="font-sans text-[min(0.62rem,2.5vw)] leading-[1.25] text-[#b03020]">
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
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col" style={{ gap: 'max(0.25vh, 2px)' }}>
      <label
        htmlFor={htmlFor}
        className="font-sans text-[min(0.72rem,2.8vw)] font-semibold leading-[1.2] tracking-[0.02em] text-[#2c1f0e] md:text-[min(0.76rem,2.4vw)]"
      >
        {label}
      </label>
      {hint ? (
        <p className="whitespace-pre-line font-sans text-[min(0.67rem,2.5vw)] leading-[1.3] text-[#4a3520]">
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
  fontSize: 'min(0.88rem, 3.2vw)',
  color: '#1a1008',
  width: '100%',
  padding: '1px 0 3px',
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
  fontSize: 'min(0.88rem, 3.2vw)',
  minHeight: 'max(4vh, 28px)',
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

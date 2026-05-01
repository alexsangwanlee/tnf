export default function Home() {
  return (
    <main
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{ background: '#FCFCFC' }}
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <img
          src="/textures/tnf.png"
          alt="THE NORTH FACE"
          className="w-32 h-auto opacity-80"
        />
        <h1
          className="text-2xl font-semibold tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-serif)', color: '#1a1a1a' }}
        >
          The North Face Danceclass
        </h1>
        <div
          className="w-12 border-t"
          style={{ borderColor: '#1a1a1a' }}
        />
        <p
          className="text-base leading-relaxed"
          style={{ fontFamily: 'Pretendard, sans-serif', color: '#444' }}
        >
          이벤트가 종료되었습니다.
          <br />
          <span style={{ color: '#888', fontSize: '0.875rem' }}>
            참여해 주셔서 감사합니다.
          </span>
        </p>
      </div>
    </main>
  )
}

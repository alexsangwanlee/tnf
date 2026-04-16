import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface Entry {
  id: string
  name: string
  phone: string
  purchase_type: 'online' | 'offline'
  privacy_agreed: boolean
  official_mall_id?: string | null
  buyer_name?: string | null
  receipt_file_name?: string | null
  receipt_file_path?: string | null
  created_at: string
}

async function getEntries(): Promise<Entry[]> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) return []

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return (data as Entry[]) || []
}

async function getReceiptUrl(entry: Entry): Promise<string | null> {
  if (!entry.receipt_file_path) return null

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) return null

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase.storage
    .from('entry-receipts')
    .createSignedUrl(entry.receipt_file_path, 60 * 60 * 24)

  if (error) return null
  return data.signedUrl
}

const cellStyle: React.CSSProperties = {
  padding: '12px',
  color: '#555',
  verticalAlign: 'top',
}

const headings = ['#', '구매방식', '개인정보동의', '성함', '연락처', '공식몰 ID', '영수증', '신청일시']

export default async function AdminPage() {
  const entries = await getEntries()

  const receiptUrls = await Promise.all(entries.map(getReceiptUrl))

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#FCFCFC',
        padding: '48px 32px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>
              ADMIN — 응모 관리
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>총 {entries.length}건의 응모</p>
          </div>
          <a
            href="/api/admin/export"
            style={{
              background: '#2c2c2c',
              color: '#fff',
              padding: '10px 20px',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textDecoration: 'none',
              borderRadius: '2px',
            }}
          >
            EXPORT CSV
          </a>
        </div>

        {entries.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>아직 접수된 응모가 없습니다.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2c2c2c' }}>
                  {headings.map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        color: '#444',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      background: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                    }}
                  >
                    <td style={{ ...cellStyle, color: '#aaa' }}>{index + 1}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: entry.purchase_type === 'online' ? '#e8f4fd' : '#fef3e2',
                          color: entry.purchase_type === 'online' ? '#1a73a7' : '#a0660a',
                        }}
                      >
                        {entry.purchase_type === 'online' ? '온라인' : '오프라인'}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: entry.privacy_agreed ? '#2a8540' : '#c03020' }}>
                        {entry.privacy_agreed ? '동의' : '미동의'}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>
                      {entry.buyer_name || entry.name}
                    </td>
                    <td style={cellStyle}>{entry.phone}</td>
                    <td style={cellStyle}>{entry.official_mall_id || '-'}</td>
                    <td style={cellStyle}>
                      {receiptUrls[index] ? (
                        <a
                          href={receiptUrls[index]!}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1a73a7', textDecoration: 'underline' }}
                        >
                          {entry.receipt_file_name || '보기'}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ ...cellStyle, color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(entry.created_at).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

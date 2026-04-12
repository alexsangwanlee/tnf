import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface Entry {
  id: string
  name: string
  phone: string
  relationship?: string | null
  guests: number
  expectation?: string | null
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

const cellStyle: React.CSSProperties = {
  padding: '12px',
  color: '#555',
  verticalAlign: 'top',
}

export default async function AdminPage() {
  const entries = await getEntries()

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
              ADMIN RSVP ENTRIES
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>총 {entries.length}건의 신청</p>
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
          <p style={{ color: '#888', fontSize: '0.9rem' }}>아직 접수된 신청이 없습니다.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2c2c2c' }}>
                  {['#', '아이 이름', '연락처', '관계', '인원', '기대평', '신청일시'].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        color: '#444',
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
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{entry.name}</td>
                    <td style={cellStyle}>{entry.phone}</td>
                    <td style={cellStyle}>{entry.relationship || '-'}</td>
                    <td style={cellStyle}>{entry.guests}명</td>
                    <td
                      style={{
                        ...cellStyle,
                        maxWidth: '260px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {entry.expectation || '-'}
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

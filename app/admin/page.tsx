'use client'

import { useCallback, useEffect, useState } from 'react'

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
  receipt_url?: string | null
  created_at: string
}

const KEY = 'tnf2025'

const cellStyle: React.CSSProperties = {
  padding: '12px',
  color: '#555',
  verticalAlign: 'middle',
}

const headings = ['#', '구매방식', '개인정보동의', '성함', '연락처', '공식몰 ID', '영수증', '신청일시', '']

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    purchaseType: 'online' as 'online' | 'offline',
    buyerName: '',
    phone: '',
    officialMallId: '',
    privacyAgreed: true,
  })
  const [addError, setAddError] = useState('')

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/entries?key=${KEY}`)
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 응모를 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/admin/entries?key=${KEY}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } else {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')

    if (!addForm.buyerName.trim() || !addForm.phone.trim()) {
      setAddError('성함과 연락처를 입력해 주세요.')
      return
    }

    const res = await fetch(`/api/admin/entries?key=${KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })

    if (res.ok) {
      setShowAddForm(false)
      setAddForm({ purchaseType: 'online', buyerName: '', phone: '', officialMallId: '', privacyAgreed: true })
      await fetchEntries()
    } else {
      const data = await res.json().catch(() => null)
      setAddError(data?.error || '추가에 실패했습니다.')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#FCFCFC', padding: '48px 32px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>
              ADMIN — 응모 관리
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>총 {entries.length}건의 응모</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowAddForm(!showAddForm)} style={actionBtnStyle('#1a73a7')}>
              {showAddForm ? '취소' : '+ 추가'}
            </button>
            <a href={`/api/admin/export?key=${KEY}`} style={{ ...actionBtnStyle('#2c2c2c'), textDecoration: 'none' }}>
              EXPORT EXCEL
            </a>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} style={{ marginBottom: '24px', padding: '20px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>성함 *</label>
              <input
                value={addForm.buyerName}
                onChange={(e) => setAddForm((p) => ({ ...p, buyerName: e.target.value }))}
                placeholder="김하늘"
                style={formInputStyle}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>연락처 *</label>
              <input
                value={addForm.phone}
                onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="010-0000-0000"
                style={formInputStyle}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>구매 방식</label>
              <select
                value={addForm.purchaseType}
                onChange={(e) => setAddForm((p) => ({ ...p, purchaseType: e.target.value as 'online' | 'offline' }))}
                style={formInputStyle}
              >
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>공식몰 ID</label>
              <input
                value={addForm.officialMallId}
                onChange={(e) => setAddForm((p) => ({ ...p, officialMallId: e.target.value }))}
                placeholder="tnfkids123"
                style={formInputStyle}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '2px' }}>
              <input
                type="checkbox"
                checked={addForm.privacyAgreed}
                onChange={(e) => setAddForm((p) => ({ ...p, privacyAgreed: e.target.checked }))}
              />
              <label style={{ fontSize: '0.8rem', color: '#555' }}>개인정보 동의</label>
            </div>
            <button type="submit" style={actionBtnStyle('#2a8540')}>등록</button>
            {addError && <p style={{ width: '100%', color: '#c03020', fontSize: '0.8rem', margin: 0 }}>{addError}</p>}
          </form>
        )}

        {loading ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>불러오는 중...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>아직 접수된 응모가 없습니다.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #2c2c2c' }}>
                  {headings.map((heading) => (
                    <th key={heading} style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, letterSpacing: '1px', fontSize: '0.75rem', color: '#444', whiteSpace: 'nowrap' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                    <td style={{ ...cellStyle, color: '#aaa' }}>{index + 1}</td>
                    <td style={cellStyle}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 500, background: entry.purchase_type === 'online' ? '#e8f4fd' : '#fef3e2', color: entry.purchase_type === 'online' ? '#1a73a7' : '#a0660a' }}>
                        {entry.purchase_type === 'online' ? '온라인' : '오프라인'}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <span style={{ color: entry.privacy_agreed ? '#2a8540' : '#c03020' }}>
                        {entry.privacy_agreed ? '동의' : '미동의'}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{entry.buyer_name || entry.name}</td>
                    <td style={cellStyle}>{entry.phone}</td>
                    <td style={cellStyle}>{entry.official_mall_id || '-'}</td>
                    <td style={cellStyle}>
                      {entry.receipt_url ? (
                        <a href={entry.receipt_url} target="_blank" rel="noopener noreferrer">
                          <img src={entry.receipt_url} alt={entry.receipt_file_name || '영수증'} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0', cursor: 'pointer' }} />
                        </a>
                      ) : '-'}
                    </td>
                    <td style={{ ...cellStyle, color: '#888', whiteSpace: 'nowrap' }}>
                      {new Date(entry.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => handleDelete(entry.id, entry.buyer_name || entry.name)}
                        style={{ background: 'none', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '4px 10px', fontSize: '0.72rem', color: '#c03020', cursor: 'pointer' }}
                      >
                        삭제
                      </button>
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

function actionBtnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    padding: '10px 20px',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
  }
}

const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' }
const labelStyle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 600, color: '#444', letterSpacing: '1px' }
const formInputStyle: React.CSSProperties = { padding: '8px 10px', fontSize: '0.85rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '140px' }

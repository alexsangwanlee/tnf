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
    const res = await fetch(`/api/admin/entries`)
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 응모를 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/admin/entries`, {
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

    const res = await fetch(`/api/admin/entries`, {
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
    <main className="admin-main">
      <style>{`
        .admin-main {
          min-height: 100vh;
          background: #FCFCFC;
          padding: 24px 16px;
          font-family: system-ui, sans-serif;
        }
        @media (min-width: 768px) {
          .admin-main { padding: 48px 32px; }
        }

        .admin-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .admin-header {
            flex-direction: row;
            align-items: baseline;
            justify-content: space-between;
            margin-bottom: 32px;
          }
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-btn {
          color: #fff;
          padding: 10px 16px;
          font-size: 0.75rem;
          letter-spacing: 2px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 768px) {
          .admin-btn { flex: none; padding: 10px 20px; }
        }

        .add-form {
          margin-bottom: 20px;
          padding: 16px;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .add-form {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-end;
            padding: 20px;
          }
        }

        .add-form input, .add-form select {
          padding: 10px 12px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .add-form input, .add-form select {
            font-size: 0.85rem;
            min-width: 140px;
            width: auto;
          }
        }

        .entry-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .entry-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          font-size: 0.85rem;
        }
        .entry-card-label {
          color: #888;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .entry-card-value {
          color: #333;
          text-align: right;
        }

        .desktop-table { display: none; }
        .mobile-cards { display: block; }
        @media (min-width: 768px) {
          .desktop-table { display: block; }
          .mobile-cards { display: none; }
        }

        .cell { padding: 12px; color: #555; vertical-align: middle; }
      `}</style>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <div className="admin-header">
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>
              ADMIN — 응모 관리
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>총 {entries.length}건의 응모</p>
          </div>
          <div className="admin-actions">
            <button onClick={() => setShowAddForm(!showAddForm)} className="admin-btn" style={{ background: '#1a73a7' }}>
              {showAddForm ? '취소' : '+ 추가'}
            </button>
            <a href={`/api/admin/export`} className="admin-btn" style={{ background: '#2c2c2c' }}>
              EXPORT EXCEL
            </a>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAdd} className="add-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#444' }}>성함 *</label>
              <input value={addForm.buyerName} onChange={(e) => setAddForm((p) => ({ ...p, buyerName: e.target.value }))} placeholder="김하늘" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#444' }}>연락처 *</label>
              <input value={addForm.phone} onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))} placeholder="010-0000-0000" type="tel" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#444' }}>구매 방식</label>
              <select value={addForm.purchaseType} onChange={(e) => setAddForm((p) => ({ ...p, purchaseType: e.target.value as 'online' | 'offline' }))}>
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#444' }}>공식몰 ID</label>
              <input value={addForm.officialMallId} onChange={(e) => setAddForm((p) => ({ ...p, officialMallId: e.target.value }))} placeholder="tnfkids123" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
              <input type="checkbox" checked={addForm.privacyAgreed} onChange={(e) => setAddForm((p) => ({ ...p, privacyAgreed: e.target.checked }))} style={{ width: 'auto' }} />
              <label style={{ fontSize: '0.8rem', color: '#555' }}>개인정보 동의</label>
            </div>
            <button type="submit" className="admin-btn" style={{ background: '#2a8540' }}>등록</button>
            {addError && <p style={{ width: '100%', color: '#c03020', fontSize: '0.8rem', margin: 0 }}>{addError}</p>}
          </form>
        )}

        {loading ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>불러오는 중...</p>
        ) : entries.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>아직 접수된 응모가 없습니다.</p>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="mobile-cards">
              {entries.map((entry, index) => (
                <div key={entry.id} className="entry-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>#{index + 1}</span>
                    <PurchaseBadge type={entry.purchase_type} />
                  </div>
                  <div className="entry-card-row">
                    <span className="entry-card-label">성함</span>
                    <span className="entry-card-value" style={{ fontWeight: 600 }}>{entry.buyer_name || entry.name}</span>
                  </div>
                  <div className="entry-card-row">
                    <span className="entry-card-label">연락처</span>
                    <span className="entry-card-value">{entry.phone}</span>
                  </div>
                  <div className="entry-card-row">
                    <span className="entry-card-label">개인정보동의</span>
                    <span style={{ color: entry.privacy_agreed ? '#2a8540' : '#c03020' }}>
                      {entry.privacy_agreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="entry-card-row">
                    <span className="entry-card-label">공식몰 ID</span>
                    <span className="entry-card-value">{entry.official_mall_id || '-'}</span>
                  </div>
                  {entry.receipt_url && (
                    <div style={{ marginTop: '8px' }}>
                      <span className="entry-card-label">영수증</span>
                      <a href={entry.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '6px' }}>
                        <img src={entry.receipt_url} alt="영수증" style={{ width: '100%', maxWidth: '200px', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                      </a>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                      {new Date(entry.created_at).toLocaleString('ko-KR')}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id, entry.buyer_name || entry.name)}
                      style={{ background: 'none', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '6px 14px', fontSize: '0.75rem', color: '#c03020', cursor: 'pointer' }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="desktop-table" style={{ overflowX: 'auto' }}>
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
                      <td className="cell" style={{ color: '#aaa' }}>{index + 1}</td>
                      <td className="cell"><PurchaseBadge type={entry.purchase_type} /></td>
                      <td className="cell">
                        <span style={{ color: entry.privacy_agreed ? '#2a8540' : '#c03020' }}>
                          {entry.privacy_agreed ? '동의' : '미동의'}
                        </span>
                      </td>
                      <td className="cell" style={{ fontWeight: 500 }}>{entry.buyer_name || entry.name}</td>
                      <td className="cell">{entry.phone}</td>
                      <td className="cell">{entry.official_mall_id || '-'}</td>
                      <td className="cell">
                        {entry.receipt_url ? (
                          <a href={entry.receipt_url} target="_blank" rel="noopener noreferrer">
                            <img src={entry.receipt_url} alt="영수증" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e0e0', cursor: 'pointer' }} />
                          </a>
                        ) : '-'}
                      </td>
                      <td className="cell" style={{ color: '#888', whiteSpace: 'nowrap' }}>
                        {new Date(entry.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="cell">
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
          </>
        )}
      </div>
    </main>
  )
}

function PurchaseBadge({ type }: { type: 'online' | 'offline' }) {
  const isOnline = type === 'online'
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '3px',
      fontSize: '0.75rem',
      fontWeight: 500,
      background: isOnline ? '#e8f4fd' : '#fef3e2',
      color: isOnline ? '#1a73a7' : '#a0660a',
    }}>
      {isOnline ? '온라인' : '오프라인'}
    </span>
  )
}

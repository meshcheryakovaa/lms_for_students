import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHEET_ID = '1ghXeNIWkevIrNItElo1VMrz-PeYYXufb6GSLMV2BIlk';
const SHEET_NAME = '*ПРЕПОДАВАТЕЛИ*';
const RANGE = 'AB1:AB105';

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

export default function TeacherSchedulePage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const parsed = text
          .split('\n')
          .map((r) => r.replace(/^"|"$/g, '').trim())
          .filter(Boolean);
        setRows(parsed);
      })
      .catch((e) => setError(`Не удалось загрузить расписание: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const header = rows[0] ?? 'Расписание';
  const dataRows = rows.slice(1);

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Расписание</h1>
        <button className="btn btn-outline" onClick={() => navigate('/teacher')}>
          ← Назад
        </button>
      </div>

      {loading && <div className="spinner">Загрузка...</div>}

      {error && <div className="error" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>}

      {!loading && !error && (
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>№</th>
                <th>{header}</th>
              </tr>
            </thead>
            <tbody>
              {dataRows.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                dataRows.map((cell, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{i + 1}</td>
                    <td>{cell}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

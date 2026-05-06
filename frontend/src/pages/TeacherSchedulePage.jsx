import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1ghXeNIWkevIrNItElo1VMrz-PeYYXufb6GSLMV2BIlk/export?format=csv&gid=1593181666&range=A1:AB105';

const REMOVE_ROWS = new Set([
  1,
  45, 46, 47, 48, 49, 50, 51, 52, 53,
  55,
  98, 99, 100, 101, 102, 103, 104, 105,
]);

const DAY_ROWS = {
  3: 'Понедельник', 10: 'Вторник', 17: 'Среда',
  24: 'Четверг',   31: 'Пятница', 38: 'Суббота',
  56: 'Понедельник', 63: 'Вторник', 70: 'Среда',
  77: 'Четверг',   84: 'Пятница', 91: 'Суббота',
};

const SEMESTER_ROWS = new Set([2, 54]);

// Полноценный CSV-парсер: корректно обрабатывает переносы строк внутри кавычек
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\r') { /* skip */ }
      else if (ch === '\n') { row.push(cell); cell = ''; rows.push(row); row = []; }
      else { cell += ch; }
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}


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
        const parsed = parseCSV(text).map((cells, idx) => ({
          rowNum: idx + 1,
          cells,
        }));
        setRows(parsed);
      })
      .catch((e) => setError(`Не удалось загрузить расписание: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const visible = rows.filter((r) => !REMOVE_ROWS.has(r.rowNum));

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Расписание</h1>
        <button className="btn btn-outline" onClick={() => navigate('/teacher')}>
          ← Назад
        </button>
      </div>

      {loading && <div className="spinner">Загрузка...</div>}
      {error && (
        <div className="error" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>
      )}

      {!loading && !error && (
        <div style={{ overflowX: 'hidden' }}>
          <table
            className="teacher-table"
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>№</th>
                <th style={{ width: 110, textAlign: 'center' }}>A / B / C</th>
                <th>AB</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ rowNum, cells }) => {
                const colA  = cells[0]  ?? '';
                const colB  = cells[1]  ?? '';
                const colC  = cells[2]  ?? '';
                const colF  = cells[5]  ?? '';
                const colAB = cells[27] ?? '';

                if (SEMESTER_ROWS.has(rowNum)) {
                  return (
                    <tr key={rowNum} style={{ background: '#ebf4ff' }}>
                      <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                      <td colSpan={2} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {colF}
                      </td>
                    </tr>
                  );
                }

                if (DAY_ROWS[rowNum]) {
                  return (
                    <tr key={rowNum} style={{ background: '#f0f4f8' }}>
                      <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                      <td colSpan={2} style={{ fontWeight: 600 }}>
                        {DAY_ROWS[rowNum]}
                      </td>
                    </tr>
                  );
                }

                const abc = [colA, colB, colC].filter(Boolean).join('\n');

                return (
                  <tr key={rowNum}>
                    <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                    <td style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', verticalAlign: 'top' }}>{abc}</td>
                    <td style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{colAB}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

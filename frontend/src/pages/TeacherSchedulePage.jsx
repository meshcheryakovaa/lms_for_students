import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1ghXeNIWkevIrNItElo1VMrz-PeYYXufb6GSLMV2BIlk/export?format=csv&gid=1593181666&range=A1:AB105';

// Строки, которые нужно скрыть (1-indexed)
const REMOVE_ROWS = new Set([
  1,
  45, 46, 47, 48, 49, 50, 51, 52, 53,
  98, 99, 100, 101, 102, 103, 104, 105,
]);

// Строки-заголовки дней недели
const DAY_ROWS = {
  3: 'Понедельник', 10: 'Вторник', 17: 'Среда',
  24: 'Четверг',   31: 'Пятница', 38: 'Суббота',
  56: 'Понедельник', 63: 'Вторник', 70: 'Среда',
  77: 'Четверг',   84: 'Пятница', 91: 'Суббота',
};

// Строки-разделители семестров (значение берётся из столбца F той же строки)
const SEMESTER_ROWS = new Set([2, 54]);

function parseCSVLine(line) {
  const result = [];
  let inQuote = false;
  let cell = '';
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(cell); cell = ''; }
    else { cell += ch; }
  }
  result.push(cell);
  return result;
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
        const parsed = text.split('\n').map((line, idx) => ({
          rowNum: idx + 1,          // номер строки в таблице (1-based)
          cells: parseCSVLine(line.trimEnd()),
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
        <div className="teacher-table-wrap">
          <table className="teacher-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>№</th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
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

                // Строки 2 и 54 — заголовок семестра/недели из столбца F
                if (SEMESTER_ROWS.has(rowNum)) {
                  return (
                    <tr key={rowNum} style={{ background: '#ebf4ff' }}>
                      <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                      <td colSpan={4} style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {colF}
                      </td>
                    </tr>
                  );
                }

                // Строки дней недели
                if (DAY_ROWS[rowNum]) {
                  return (
                    <tr key={rowNum} style={{ background: '#f0f4f8' }}>
                      <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                      <td colSpan={4} style={{ fontWeight: 600 }}>
                        {DAY_ROWS[rowNum]}
                      </td>
                    </tr>
                  );
                }

                // Обычная строка
                return (
                  <tr key={rowNum}>
                    <td style={{ color: 'var(--muted)', textAlign: 'center' }}>{rowNum}</td>
                    <td>{colA}</td>
                    <td>{colB}</td>
                    <td>{colC}</td>
                    <td>{colAB}</td>
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

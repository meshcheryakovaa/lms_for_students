import { useState, useEffect } from 'react';
import { getEntries, gradeEntry, getGroups } from '../api/client';

/* ── Бейдж оценки ─────────────────────────────────────────── */
function GradeBadge({ grade }) {
  if (grade == null) return <span className="badge badge-none">Нет оценки</span>;
  const cls = grade >= 4 ? 'good' : grade >= 3 ? 'mid' : 'bad';
  return <span className={`badge badge-${cls}`}>{grade}/5</span>;
}

/* ── Модалка выставления оценки ───────────────────────────── */
function GradeModal({ entry, onClose, onGraded }) {
  const [value, setValue] = useState(entry.grade ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const g = parseInt(value, 10);
    if (isNaN(g) || g < 1 || g > 5) { setError('Введите число от 1 до 5'); return; }
    setSaving(true);
    try {
      await gradeEntry(entry.id, g);
      onGraded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.grade?.[0] || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Выставить оценку</h3>
        <p className="modal-meta">
          Студент: <b>{entry.student?.first_name} {entry.student?.last_name}</b><br />
          Дата: <b>{entry.date}</b>
        </p>
        <p className="modal-comment">{entry.comment}</p>
        <form onSubmit={handleSubmit}>
          <label>Оценка (1–5)
            <input type="number" min={1} max={5} value={value}
              onChange={(e) => setValue(e.target.value)} autoFocus />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Сводная таблица: студент × дата ─────────────────────── */
function GroupJournal({ entries, onGradeClick }) {
  // Собираем уникальных студентов и даты
  const studentsMap = {};
  const datesSet = new Set();

  entries.forEach((e) => {
    const sid = e.student?.id;
    if (sid && !studentsMap[sid]) {
      studentsMap[sid] = e.student;
    }
    datesSet.add(e.date);
  });

  const students = Object.values(studentsMap).sort((a, b) =>
    `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
  );
  const dates = [...datesSet].sort();

  // Индекс: studentId → date → entry
  const index = {};
  entries.forEach((e) => {
    const sid = e.student?.id;
    if (!sid) return;
    if (!index[sid]) index[sid] = {};
    index[sid][e.date] = e;
  });

  if (students.length === 0) {
    return <div className="empty">Нет записей для выбранной группы</div>;
  }

  return (
    <div className="teacher-table-wrap">
      <table className="teacher-table journal-grid">
        <thead>
          <tr>
            <th className="student-col">Студент</th>
            {dates.map((d) => (
              <th key={d} className="date-col">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="student-col">
                <div className="student-name">{student.last_name} {student.first_name}</div>
                {student.group && (
                  <div className="student-email">{student.group.name}</div>
                )}
              </td>
              {dates.map((date) => {
                const entry = index[student.id]?.[date];
                if (!entry) {
                  return <td key={date} className="grade-cell grade-empty">—</td>;
                }
                const cls = entry.grade == null
                  ? 'grade-pending'
                  : entry.grade >= 4 ? 'grade-good'
                  : entry.grade >= 3 ? 'grade-mid'
                  : 'grade-bad';
                return (
                  <td
                    key={date}
                    className={`grade-cell ${cls}`}
                    title={entry.comment}
                    onClick={() => onGradeClick(entry)}
                    style={{ cursor: 'pointer' }}
                  >
                    {entry.grade ?? '?'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Главная страница ─────────────────────────────────────── */
export default function TeacherPanelPage() {
  const [entries, setEntries] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [mode, setMode] = useState('table');   // 'table' | 'journal'
  const [filters, setFilters] = useState({ search: '', graded: '', ordering: '-date', group: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { ordering: filters.ordering };
      if (filters.search) params.search = filters.search;
      if (filters.graded !== '') params.graded = filters.graded;
      if (filters.group !== '') params.group = filters.group;
      const { data } = await getEntries(params);
      setEntries(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  useEffect(() => {
    getGroups().then((r) => setGroups(r.data)).catch(() => {});
  }, []);

  const handleFilter = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const stats = {
    total: entries.length,
    graded: entries.filter((e) => e.grade != null).length,
    avg: entries.filter((e) => e.grade != null).length
      ? (entries.filter((e) => e.grade != null).reduce((s, e) => s + e.grade, 0) /
         entries.filter((e) => e.grade != null).length).toFixed(1)
      : '—',
  };

  return (
    <div className="page">
      {grading && (
        <GradeModal entry={grading} onClose={() => setGrading(null)} onGraded={load} />
      )}

      <div className="page-header">
        <h1>Панель преподавателя</h1>
        <div className="stats-row">
          <div className="stat"><span>{stats.total}</span>Всего записей</div>
          <div className="stat"><span>{stats.graded}</span>Оценено</div>
          <div className="stat"><span>{stats.total - stats.graded}</span>Ожидают оценки</div>
          <div className="stat"><span>{stats.avg}</span>Средний балл</div>
        </div>
      </div>

      {/* ── Переключатель режимов ── */}
      <div className="mode-switcher">
        <button
          className={`btn ${mode === 'table' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('table')}
        >
          📋 Таблица записей
        </button>
        <button
          className={`btn ${mode === 'journal' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('journal')}
        >
          📊 Журнал группы
        </button>
      </div>

      {/* ── Фильтры ── */}
      <div className="filters-bar">
        {mode === 'table' && (
          <input
            placeholder="Поиск по комментарию..."
            name="search"
            value={filters.search}
            onChange={handleFilter}
          />
        )}
        {groups.length > 0 && (
          <select name="group" value={filters.group} onChange={handleFilter}>
            <option value="">Все группы</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
        {mode === 'table' && (
          <>
            <select name="graded" value={filters.graded} onChange={handleFilter}>
              <option value="">Все записи</option>
              <option value="false">Без оценки</option>
              <option value="true">С оценкой</option>
            </select>
            <select name="ordering" value={filters.ordering} onChange={handleFilter}>
              <option value="-date">По дате ↓</option>
              <option value="date">По дате ↑</option>
              <option value="-grade">По оценке ↓</option>
              <option value="grade">По оценке ↑</option>
            </select>
          </>
        )}
      </div>

      {loading ? (
        <div className="spinner">Загрузка...</div>
      ) : mode === 'journal' ? (
        <GroupJournal entries={entries} onGradeClick={setGrading} />
      ) : entries.length === 0 ? (
        <div className="empty">Записей нет</div>
      ) : (
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Дата</th>
                <th>Комментарий</th>
                <th>Файл</th>
                <th>Оценка</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="student-name">
                      {entry.student?.first_name} {entry.student?.last_name}
                    </div>
                    <div className="student-email">{entry.student?.email}</div>
                    {entry.student?.group && (
                      <div className="student-email">{entry.student.group.name}</div>
                    )}
                  </td>
                  <td>{entry.date}</td>
                  <td className="comment-cell">{entry.comment}</td>
                  <td>
                    {entry.file_url
                      ? <a href={entry.file_url} target="_blank" rel="noreferrer">📎 {entry.file_name}</a>
                      : '—'}
                  </td>
                  <td><GradeBadge grade={entry.grade} /></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => setGrading(entry)}>
                      {entry.grade != null ? 'Изменить' : 'Оценить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

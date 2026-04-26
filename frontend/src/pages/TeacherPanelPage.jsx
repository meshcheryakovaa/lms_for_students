import { useState, useEffect } from 'react';
import { getEntries, gradeEntry } from '../api/client';

function GradeBadge({ grade }) {
  if (grade == null) return <span className="badge badge-none">Нет оценки</span>;
  const cls = grade >= 7 ? 'good' : grade >= 5 ? 'mid' : 'bad';
  return <span className={`badge badge-${cls}`}>{grade}/10</span>;
}

function GradeModal({ entry, onClose, onGraded }) {
  const [value, setValue] = useState(entry.grade ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const g = parseInt(value, 10);
    if (isNaN(g) || g < 1 || g > 10) { setError('Введите число от 1 до 10'); return; }
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
          <label>Оценка (1–10)
            <input type="number" min={1} max={10} value={value}
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

export default function TeacherPanelPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [filters, setFilters] = useState({ search: '', graded: '', ordering: '-date' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { ordering: filters.ordering };
      if (filters.search) params.search = filters.search;
      if (filters.graded !== '') params.graded = filters.graded;
      const { data } = await getEntries(params);
      setEntries(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

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

      <div className="filters-bar">
        <input
          placeholder="Поиск по комментарию..."
          name="search"
          value={filters.search}
          onChange={handleFilter}
        />
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
      </div>

      {loading ? (
        <div className="spinner">Загрузка...</div>
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

import { useState, useEffect, useRef } from 'react';
import { getEntries, createEntry, updateEntry, deleteEntry } from '../api/client';

const EMPTY_FORM = { date: '', comment: '', file: null };

function EntryForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleFile = (e) =>
    setForm((f) => ({ ...f, file: e.target.files[0] || null }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('date', form.date);
      fd.append('comment', form.comment);
      if (form.file) fd.append('file', form.file);
      await onSave(fd);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? JSON.stringify(d) : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="entry-form">
      <label>Дата занятия
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </label>
      <label>Что делал на занятии
        <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} required />
      </label>
      <label>Файл (необязательно)
        <input type="file" ref={fileRef} onChange={handleFile} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>Отмена</button>
        )}
      </div>
    </form>
  );
}

function GradeBadge({ grade }) {
  if (grade == null) return <span className="badge badge-none">Нет оценки</span>;
  const cls = grade >= 7 ? 'good' : grade >= 5 ? 'mid' : 'bad';
  return <span className={`badge badge-${cls}`}>{grade}/10</span>;
}

export default function StudentJournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // id записи
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const { data } = await getEntries(params);
      setEntries(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (fd) => {
    await createEntry(fd);
    setShowForm(false);
    load();
  };

  const handleUpdate = async (fd) => {
    await updateEntry(editing, fd);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить запись?')) return;
    await deleteEntry(id);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Мой журнал занятий</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Новая запись
        </button>
      </div>

      <div className="search-bar">
        <input
          placeholder="Поиск по комментарию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card">
          <h3>Новая запись</h3>
          <EntryForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <div className="spinner">Загрузка...</div>
      ) : entries.length === 0 ? (
        <div className="empty">Записей пока нет. Создайте первую!</div>
      ) : (
        <div className="entries-list">
          {entries.map((entry) => (
            <div key={entry.id} className="card entry-card">
              {editing === entry.id ? (
                <>
                  <h3>Редактирование</h3>
                  <EntryForm
                    initial={{ date: entry.date, comment: entry.comment, file: null }}
                    onSave={handleUpdate}
                    onCancel={() => setEditing(null)}
                  />
                </>
              ) : (
                <>
                  <div className="entry-header">
                    <span className="entry-date">{entry.date}</span>
                    <GradeBadge grade={entry.grade} />
                  </div>
                  <p className="entry-comment">{entry.comment}</p>
                  {entry.file_url && (
                    <a href={entry.file_url} target="_blank" rel="noreferrer" className="file-link">
                      📎 {entry.file_name}
                    </a>
                  )}
                  {entry.graded_by && (
                    <p className="graded-by">Оценил: {entry.graded_by}</p>
                  )}
                  <div className="entry-actions">
                    <button className="btn btn-sm" onClick={() => { setEditing(entry.id); setShowForm(false); }}>
                      Редактировать
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(entry.id)}>
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

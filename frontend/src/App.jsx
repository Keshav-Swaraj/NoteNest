import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Archive, ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleHelp, Clock3, FileText, Folder, Hash, Inbox, LayoutGrid, Menu, MoreHorizontal, Pencil, Pin, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { errorMessage, notesApi } from './api'

const FALLBACK_CATEGORIES = ['Personal', 'Study', 'Work', 'Ideas', 'Other']
const COLORS = ['cream', 'mint', 'peach', 'lavender', 'sky', 'rose']

function dateLabel(value) { return value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'Just now' }

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [tags, setTags] = useState([])
  const [stats, setStats] = useState({ total: 0, pinned: 0, archived: 0 })
  const [toast, setToast] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const toastTimer = useRef(null)

  const notify = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current); setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }, [])
  const refreshMeta = useCallback(async () => {
    try {
      const [nextStats, nextCategories, nextTags] = await Promise.all([notesApi.stats(), notesApi.categories(), notesApi.tags()])
      setStats(nextStats); setCategories(nextCategories); setTags(nextTags)
    } catch { /* Page requests surface API errors. */ }
  }, [])
  useEffect(() => { refreshMeta() }, [refreshMeta, location.pathname])
  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => () => clearTimeout(toastTimer.current), [])
  useEffect(() => { if (location.pathname === '/search') setSearch(new URLSearchParams(location.search).get('q') || '') }, [location])

  function submitSearch(e) {
    e.preventDefault()
    const term = search.trim()
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><BookOpen size={24} strokeWidth={2.5}/></div><div><strong>NoteNest<span>.</span></strong><small>Your little corner of clarity</small></div></div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LayoutGrid size={18}/> All notes <span className="nav-count">{stats.total}</span></NavLink>
        <NavLink to="/pinned" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Pin size={18}/> Pinned <span className="nav-count">{stats.pinned}</span></NavLink>
        <NavLink to="/archived" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Archive size={18}/> Archive <span className="nav-count">{stats.archived}</span></NavLink>
      </nav>
      <div className="sidebar-divider"/>
      <div className="sidebar-section-label">CATEGORIES</div>
      <nav aria-label="Categories" className="sidebar-nav category-nav">{categories.map((category, i) => <NavLink key={category} to={`/category/${encodeURIComponent(category)}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><span className={`category-dot dot-${i % 5}`}/>{category}</NavLink>)}</nav>
      <div className="sidebar-divider"/>
      <div className="sidebar-section-label">TAGS</div>
      <nav aria-label="Tags" className="sidebar-nav tag-nav">{tags.length ? tags.map(tag => <NavLink key={tag} to={`/tag/${encodeURIComponent(tag)}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Hash size={16}/>{tag}</NavLink>) : <span className="sidebar-hint">Tags on your notes appear here.</span>}</nav>
      <div className="sidebar-bottom"><NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><CircleHelp size={18}/> About NoteNest</NavLink><div className="sidebar-quote"><Sparkles size={18}/><p>Every great idea<br/>starts with a note.</p></div></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)}/>}
    <div className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22}/></button><form className="search-box" onSubmit={submitSearch} role="search"><Search size={19}/><input aria-label="Search notes" placeholder="Search your notes..." value={search} onChange={e => setSearch(e.target.value)}/><kbd>↵</kbd></form><div className="topbar-right"><span className="topbar-date">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><Link className="button button-primary top-create" to="/notes/new"><Plus size={18}/> New note</Link></div></header>
      <main className="content"><Routes>
        <Route path="/" element={<NotesPage type="all" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/pinned" element={<NotesPage type="pinned" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/archived" element={<NotesPage type="archived" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/category/:category" element={<NotesPage type="category" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/tag/:tag" element={<NotesPage type="tag" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/search" element={<NotesPage type="search" stats={stats} categories={categories} tags={tags} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/notes/new" element={<NoteForm categories={categories} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/notes/:id/edit" element={<NoteForm categories={categories} notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/notes/:id" element={<NoteDetail notify={notify} refreshMeta={refreshMeta}/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="*" element={<div className="empty-state"><h2>Page not found</h2><p>That page doesn’t exist.</p><Link className="button button-primary" to="/">Go to notes</Link></div>}/>
      </Routes></main>
    </div>
    {toast && <div className={`toast ${toast.type}`} role="status"><span className="toast-icon">{toast.type === 'success' ? <Check size={17}/> : <X size={17}/>}</span>{toast.message}<button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16}/></button></div>}
  </div>
}

function NotesPage({ type, stats, categories, tags, notify, refreshMeta }) {
  const { category, tag } = useParams()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('updated')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const requestId = useRef(0)
  const refresh = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true); setError('')
    try {
      const params = { sort, ...(type === 'archived' ? { archived: true } : {}), ...(type === 'pinned' ? { pinned: true } : {}), ...(type === 'category' ? { category } : categoryFilter ? { category: categoryFilter } : {}), ...(type === 'tag' ? { tag } : tagFilter ? { tag: tagFilter } : {}), ...(type === 'search' ? { q: query } : {}) }
      const result = await notesApi.list(params)
      if (id === requestId.current) setNotes(result)
    } catch (e) { if (id === requestId.current) setError(errorMessage(e)) }
    finally { if (id === requestId.current) setLoading(false) }
  }, [type, category, tag, query, categoryFilter, tagFilter, sort])
  useEffect(() => { refresh() }, [refresh])
  const title = ({ all: 'Your notes', pinned: 'Pinned notes', archived: 'Archive', category: category, tag: `#${tag}`, search: 'Search results' })[type]
  const subtitle = ({ all: 'A home for all your thoughts, ideas, and everything in between.', pinned: 'The thoughts you want to keep close.', archived: 'Out of sight, still within reach.', category: `Notes filed under ${category}.`, tag: `Notes tagged with #${tag}.`, search: `Showing notes matching “${query}”.` })[type]

  async function action(note, kind) {
    try {
      const result = kind === 'pin' ? await notesApi.pin(note.id) : await notesApi.archive(note.id)
      notify(kind === 'pin' ? (result.pinned ? 'Note pinned' : 'Note unpinned') : (result.archived ? 'Note moved to archive' : 'Note restored'))
      await Promise.all([refresh(), refreshMeta()])
    } catch (e) { notify(errorMessage(e), 'error') }
  }
  async function deleteNote() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try { await notesApi.remove(deleteTarget.id); setDeleteTarget(null); notify('Note deleted'); await Promise.all([refresh(), refreshMeta()]) }
    catch (e) { notify(errorMessage(e), 'error') }
    finally { setDeleting(false) }
  }

  return <>
    {type === 'all' && <div className="welcome"><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL SPACE</div><h1>Good to see you <span className="wave">✳</span></h1><p>Here’s what’s happening in your little corner of the world.</p></div>}
    {type === 'all' && <div className="stats-grid"><Stat icon={<FileText size={22}/>} label="Total notes" value={stats.total} color="green"/><Stat icon={<Pin size={21}/>} label="Pinned notes" value={stats.pinned} color="orange"/><Stat icon={<Archive size={21}/>} label="Archived notes" value={stats.archived} color="purple"/></div>}
    <div className="section-heading"><div><div className="eyebrow section-eyebrow">{type === 'all' ? 'YOUR COLLECTION' : 'BROWSE NOTES'}</div><h2>{type === 'all' ? 'Recently updated' : title}</h2><p>{type === 'all' ? subtitle : subtitle}</p></div><Link className="button button-primary section-create" to="/notes/new"><Plus size={18}/> Create note</Link></div>
    <div className="toolbar"><div className="toolbar-left"><span className="result-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>{type !== 'category' && type !== 'archived' && <label className="select-wrap"><Folder size={16}/><select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14}/></label>}{type !== 'tag' && type !== 'archived' && <label className="select-wrap"><Hash size={16}/><select aria-label="Filter by tag" value={tagFilter} onChange={e => setTagFilter(e.target.value)}><option value="">All tags</option>{tags.map(t => <option key={t}>{t}</option>)}</select><ChevronDown size={14}/></label>}</div><label className="select-wrap sort-select"><span>Sort:</span><select aria-label="Sort notes" value={sort} onChange={e => setSort(e.target.value)}><option value="updated">Recently updated</option><option value="newest">Newest created</option><option value="title">Title A–Z</option></select><ChevronDown size={14}/></label></div>
    {loading ? <div className="loading" role="status"><span className="spinner"/> Loading your notes...</div> : error ? <div className="empty-state error-state"><Inbox size={38}/><h3>Couldn’t load your notes</h3><p>{error}</p><button className="button button-primary" onClick={refresh}>Try again</button></div> : notes.length ? <div className="notes-grid">{notes.map(note => <NoteCard key={note.id} note={note} onAction={action} onDelete={setDeleteTarget}/>)}</div> : <div className="empty-state"><div className="empty-art"><FileText size={34}/></div><h3>{type === 'search' || categoryFilter || tagFilter ? 'No matching notes' : type === 'archived' ? 'Your archive is empty' : type === 'pinned' ? 'Nothing pinned yet' : 'A fresh page awaits'}</h3><p>{type === 'search' || categoryFilter || tagFilter ? 'Try another search or change your filters.' : type === 'archived' ? 'Archived notes will live here until you need them again.' : type === 'pinned' ? 'Pin a note to keep it easy to find.' : 'Capture your first thought and start filling your nest.'}</p>{type !== 'archived' && <Link className="button button-primary" to="/notes/new"><Plus size={17}/> Create a note</Link>}</div>}
    {deleteTarget && <div className="dialog-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}><div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"><div className="dialog-icon"><Trash2 size={23}/></div><h3 id="delete-title">Delete this note?</h3><p id="delete-description">“{deleteTarget.title}” will be permanently deleted. This can’t be undone.</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button className="button button-danger" onClick={deleteNote} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete note'}</button></div></div></div>}
  </>
}

function Stat({ icon, label, value, color }) { return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div><ArrowRight size={17} className="stat-arrow"/></div> }

function NoteCard({ note, onAction, onDelete }) {
  const [open, setOpen] = useState(false)
  return <article className={`note-card color-${note.color}`}><div className="note-card-top"><span className="note-category">{note.category}</span><div className="card-actions">{note.pinned && <Pin size={16} className="pinned-indicator" fill="currentColor" aria-label="Pinned"/>}<div className="more-wrap"><button className="icon-button more-button" aria-label={`Actions for ${note.title}`} aria-expanded={open} onClick={() => setOpen(v => !v)}><MoreHorizontal size={20}/></button>{open && <div className="card-menu"><Link to={`/notes/${note.id}/edit`} onClick={() => setOpen(false)}><Pencil size={15}/> Edit note</Link><button onClick={() => { setOpen(false); onAction(note, 'pin') }}><Pin size={15}/>{note.pinned ? 'Unpin' : 'Pin'} note</button><button onClick={() => { setOpen(false); onAction(note, 'archive') }}><Archive size={15}/>{note.archived ? 'Restore' : 'Archive'} note</button><button className="delete-item" onClick={() => { setOpen(false); onDelete(note) }}><Trash2 size={15}/> Delete note</button></div>}</div></div></div><Link to={`/notes/${note.id}`} className="card-body"><h3>{note.title}</h3><p>{note.content}</p></Link><div className="card-tags">{note.tags.slice(0, 3).map(tag => <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}>#{tag}</Link>)}{note.tags.length > 3 && <span>+{note.tags.length - 3}</span>}</div><div className="card-footer"><span><Clock3 size={14}/> {dateLabel(note.updatedAt)}</span><Link to={`/notes/${note.id}`} aria-label={`View ${note.title}`}><ArrowRight size={18}/></Link></div></article>
}

function NoteForm({ categories, notify, refreshMeta }) {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id)
  const [form, setForm] = useState({ title: '', content: '', category: 'Personal', color: 'cream', tags: '' })
  const [loading, setLoading] = useState(editing); const [saving, setSaving] = useState(false)
  const [error, setError] = useState(''); const [fieldErrors, setFieldErrors] = useState({})
  useEffect(() => { if (!editing) return; let active = true; notesApi.get(id).then(note => { if (active) setForm({ title: note.title, content: note.content, category: note.category, color: note.color, tags: note.tags.join(', ') }) }).catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [editing, id])
  function change(key, value) { setForm(f => ({ ...f, [key]: value })); setFieldErrors(f => ({ ...f, [key]: '' })) }
  async function submit(e) {
    e.preventDefault(); if (saving) return
    const errors = {}; if (!form.title.trim()) errors.title = 'Please give your note a title.'; if (!form.content.trim()) errors.content = 'Add a little content to your note.'
    const tags = [...new Set(form.tags.split(',').map(t => t.trim()).filter(Boolean))]
    if (tags.length > 10) errors.tags = 'Use at most 10 tags.'
    if (tags.some(t => t.length > 40)) errors.tags = 'Each tag must be 40 characters or less.'
    if (Object.keys(errors).length) { setFieldErrors(errors); return }
    setSaving(true); setError('')
    try { await (editing ? notesApi.update(id, { ...form, tags }) : notesApi.create({ ...form, tags })); await refreshMeta(); notify(editing ? 'Note updated' : 'Note created'); navigate('/') }
    catch (err) { setError(errorMessage(err)); if (err.response?.data?.fields) setFieldErrors(err.response.data.fields) }
    finally { setSaving(false) }
  }
  if (loading) return <div className="loading"><span className="spinner"/> Loading note...</div>
  return <div className="form-page"><Link className="back-link" to="/"><ArrowLeft size={17}/> Back to notes</Link><div className="form-header"><div className="eyebrow">{editing ? 'MAKE IT BETTER' : 'CAPTURE A THOUGHT'}</div><h1>{editing ? 'Edit your note' : 'Create a new note'}<span className="heading-spark">✳</span></h1><p>{editing ? 'Make a change and save it back to your nest.' : 'Give your idea a place to land.'}</p></div><form className="note-form" onSubmit={submit} noValidate><div className="form-grid"><div className="form-main"><label htmlFor="title">Note title <span>*</span></label><input id="title" maxLength="160" placeholder="What’s on your mind?" value={form.title} onChange={e => change('title', e.target.value)} aria-invalid={Boolean(fieldErrors.title)}/>{fieldErrors.title && <small className="field-error">{fieldErrors.title}</small>}<label htmlFor="content">Your note <span>*</span></label><textarea id="content" rows="12" placeholder="Start writing here..." value={form.content} onChange={e => change('content', e.target.value)} aria-invalid={Boolean(fieldErrors.content)}/>{fieldErrors.content && <small className="field-error">{fieldErrors.content}</small>}</div><div className="form-side"><div className="form-side-block"><h3>Details</h3><label htmlFor="category">Category</label><select id="category" value={form.category} onChange={e => change('category', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select><label htmlFor="tags">Tags</label><input id="tags" placeholder="e.g. ideas, weekend" value={form.tags} onChange={e => change('tags', e.target.value)}/><small>Separate tags with commas.</small>{fieldErrors.tags && <small className="field-error">{fieldErrors.tags}</small>}</div><div className="form-side-block"><h3>Note color</h3><div className="color-options" role="group" aria-label="Note color">{COLORS.map(color => <button type="button" key={color} className={`color-choice color-${color} ${form.color === color ? 'selected' : ''}`} aria-label={color} aria-pressed={form.color === color} onClick={() => change('color', color)}>{form.color === color && <Check size={17}/>}</button>)}</div><small>A little color for your thoughts.</small></div><div className={`preview-mini color-${form.color}`}><span>PREVIEW</span><strong>{form.title || 'Your note title'}</strong><p>{form.content || 'A little preview of your note...'}</p></div></div></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-actions"><Link className="button button-secondary" to="/">Cancel</Link><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create note'} <ArrowRight size={17}/></button></div></form></div>
}

function NoteDetail({ notify, refreshMeta }) {
  const { id } = useParams(); const navigate = useNavigate(); const [note, setNote] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [confirm, setConfirm] = useState(false)
  useEffect(() => { let active = true; notesApi.get(id).then(n => { if (active) setNote(n) }).catch(e => { if (active) setError(errorMessage(e)) }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [id])
  async function toggle(kind) { try { const n = await (kind === 'pin' ? notesApi.pin(id) : notesApi.archive(id)); setNote(n); await refreshMeta(); notify(kind === 'pin' ? (n.pinned ? 'Note pinned' : 'Note unpinned') : (n.archived ? 'Note archived' : 'Note restored')) } catch (e) { notify(errorMessage(e), 'error') } }
  async function remove() { try { await notesApi.remove(id); await refreshMeta(); notify('Note deleted'); navigate('/') } catch (e) { notify(errorMessage(e), 'error') } }
  if (loading) return <div className="loading"><span className="spinner"/> Loading note...</div>
  if (error) return <div className="empty-state error-state"><h3>Couldn’t open this note</h3><p>{error}</p><Link className="button button-primary" to="/">Back to notes</Link></div>
  return <div className="detail-page"><Link className="back-link" to={note.archived ? '/archived' : '/'}><ArrowLeft size={17}/> Back to notes</Link><article className={`detail-card color-${note.color}`}><div className="detail-top"><span className="note-category">{note.category}</span><span className="detail-date"><Clock3 size={15}/> Updated {dateLabel(note.updatedAt)}</span></div><h1>{note.title}</h1><div className="detail-tags">{note.tags.map(tag => <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div><div className="detail-content">{note.content}</div><div className="detail-actions"><Link className="button button-primary" to={`/notes/${id}/edit`}><Pencil size={17}/> Edit note</Link><button className="button button-secondary" onClick={() => toggle('pin')}><Pin size={17}/>{note.pinned ? 'Unpin' : 'Pin'}</button><button className="button button-secondary" onClick={() => toggle('archive')}><Archive size={17}/>{note.archived ? 'Restore' : 'Archive'}</button><button className="button button-text-danger" onClick={() => setConfirm(true)}><Trash2 size={17}/> Delete</button></div></article>{confirm && <div className="dialog-backdrop"><div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="detail-delete-title"><h3 id="detail-delete-title">Delete this note?</h3><p>This can’t be undone.</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setConfirm(false)}>Cancel</button><button className="button button-danger" onClick={remove}>Delete note</button></div></div></div>}</div>
}

function About() { return <div className="about-page"><div className="eyebrow">A LITTLE ABOUT US</div><h1>Make room for<br/><em>every thought.</em></h1><p className="about-lead">NoteNest is a calm place for the things you don’t want to forget. Keep ideas, study notes, plans, and passing thoughts together in one easy to use space.</p><div className="about-features"><div><Pin size={23}/><h3>Keep what matters close</h3><p>Pin your important notes so they’re always easy to find.</p></div><div><Folder size={23}/><h3>Find your way back</h3><p>Organize with categories and tags, then search in seconds.</p></div><div><Archive size={23}/><h3>Clear your space</h3><p>Archive old notes without losing them for good.</p></div></div><p className="about-footnote">NoteNest is a single-user local project. Notes are stored by the Spring Boot backend in your MySQL database.</p><Link className="button button-primary" to="/notes/new">Start writing <ArrowRight size={17}/></Link></div> }

export default App

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaArrowLeft, 
  FaSave, 
  FaTrash, 
  FaPlus, 
  FaMinus,
  FaEdit,
  FaList,
  FaCheckSquare,
  FaSquare
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import ConfirmModal from './ConfirmModal';

const NoteEditor = ({ note, onSave, onDelete, onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('text');
  const [checklist, setChecklist] = useState([]);
  const [color, setColor] = useState('#ffffff');
  const [font, setFont] = useState('sans-serif');
  const [newCheckItem, setNewCheckItem] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isNewNote = !note?._id;
  const bodyRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setSubject(note.subject || '');
      setBody(note.body || '');
      setType(note.type || 'text');
      setChecklist(note.checklist || []);
      setColor(note.color || '#ffffff');
      setFont(note.font || 'sans-serif');
    }
  }, [note]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = bodyRef.current.scrollHeight + 'px';
    }
  }, [body]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Error: Please add a title to your note!');
      return;
    }
    if (type === 'text' && !body.trim()) {
      alert('Error: Please add some content to your note!');
      return;
    }
    if (type === 'checkbox' && checklist.length === 0) {
      alert('Error: Please add at least one checklist item!');
      return;
    }
    const noteData = {
      title: title.trim() || 'Untitled',
      subject: subject.trim(),
      body: type === 'text' ? body : '',
      type: type,
      checklist: type === 'checkbox' ? checklist : [],
      color: color,
      font: font,
    };
    onSave(noteData);
  };

  const handleDelete = () => setShowConfirm(true);
  const confirmDelete = () => { onDelete(note._id); setShowConfirm(false); };

  const addCheckItem = () => {
    if (newCheckItem.trim()) {
      setChecklist([...checklist, { text: newCheckItem.trim(), checked: false }]);
      setNewCheckItem('');
    }
  };

  const toggleCheckItem = (index) => {
    const updated = [...checklist];
    updated[index].checked = !updated[index].checked;
    setChecklist(updated);
  };

  const removeCheckItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const colors = ['#ffffff', '#fef3c7', '#dbeafe', '#d1fae5', '#fce4ec', '#f3e8ff'];
  const fonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'Georgia'];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* ─── HEADER BAR ─── */}
        <div className="sticky top-16 z-40 flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FaArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {!isNewNote && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <FaTrash size={16} />
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition text-sm sm:text-base"
            >
              <FaSave className="text-sm sm:text-base" /> Save
            </button>
          </div>
        </div>

        {/* ─── NOTE FORM ─── */}
        <div
          className="rounded-2xl p-4 sm:p-6 shadow-lg transition-colors"
          style={{
            backgroundColor: color,
            color: isDark ? '#1f2937' : '#1f2937',
          }}
        >
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-400"
            style={{ fontFamily: font }}
          />

          {/* Date/Time */}
          <p className="text-xs opacity-50 mt-1">
            {new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          {/* Subject */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (Optional)"
            className="w-full mt-4 text-sm bg-transparent border-b border-gray-300/30 outline-none pb-1 placeholder-gray-400"
            style={{ fontFamily: font }}
          />

          {/* ─── BODY OR CHECKLIST ─── */}
          {type === 'text' ? (
            <>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your note here..."
                className="w-full mt-4 bg-transparent border-none outline-none resize-none min-h-[150px] sm:min-h-[200px] placeholder-gray-400 text-sm sm:text-base"
                style={{ fontFamily: font }}
              />
              <div className="flex justify-end text-xs opacity-50 mt-1">
                {body.length} characters
              </div>
            </>
          ) : (
            <div className="mt-4 space-y-2">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleCheckItem(index)}
                    className="text-xl focus:outline-none"
                  >
                    {item.checked ? (
                      <FaCheckSquare className="text-blue-500" />
                    ) : (
                      <FaSquare className="text-gray-400" />
                    )}
                  </button>
                  <span className={item.checked ? 'line-through opacity-50' : ''}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeCheckItem(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
                  >
                    <FaMinus size={12} />
                  </button>
                </div>
              ))}

              {/* ─── CHECKLIST INPUT + PLUS BUTTON (INLINE) ─── */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Add checklist item..."
                  className="flex-1 bg-transparent border-b border-gray-300/30 outline-none pb-1 placeholder-gray-400 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
                />
                <button
                  onClick={addCheckItem}
                  className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition flex-shrink-0"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md">
          {/* Type Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium opacity-70 dark:text-white">Type:</span>
            <button
              onClick={() => setType('text')}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm transition flex items-center gap-1 ${
                type === 'text'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FaEdit size={12} /> Text
            </button>
            <button
              onClick={() => setType('checkbox')}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm transition flex items-center gap-1 ${
                type === 'checkbox'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <FaList size={12} /> Checklist
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium opacity-70 dark:text-white">Color:</span>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition ${
                  color === c ? 'border-blue-500 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* ─── FONT PICKER (FIXED FOR DARK MODE) ─── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium opacity-70 dark:text-white">Font:</span>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-xs sm:text-sm outline-none text-gray-800 dark:text-white shadow-sm"
            >
              {fonts.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }} className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── CONFIRM MODAL ─── */}
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete note?"
          message="This action cannot be undone. Are you sure you want to delete this note?"
        />
      </div>
    </div>
  );
};

export default NoteEditor;
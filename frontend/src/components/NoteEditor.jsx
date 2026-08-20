import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import {useTheme} from '../context/ThemeContext';
import ConfirmModal from './ConfirmModal';

const NoteEditor = ({ note, onSave, onDelete, onBack}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [color, setColor] = useState('#ffffff');
    const [font, setFont] = useState('sans-serif');

    const [newCheckItem, setNewCheckItem] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const isNewNote = !note?._id;

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

    const bodyRef = useRef(null);

    useEffect(() => {
        if(bodyRef.current) {
            bodyRef.current.style.height = 'auto';
            bodyRef.current.style.height = bodyRef.current.scrollHeight + 'px';
        }
    })

    const handleSave = () => {
        if(!title.trim()){
            alert('Error: Please add a title to your note');
            return;
        }

        if(type === 'text' && !body.trim()){
            alert('Error: Please add some content to your note!')
        }

        if (type === 'checkbox' && checklist.length === 0){
            alert('Error: Please at least one checklist item!')
        }

        const noteData = {
            title: title.trim() || 'Untitled',
            subject: subject.trim(),
            body: type === 'text' ? body: '',
            type: type,
            color: color,
            font: font,
        };
        onSave(noteData);
    };
    
    const handleDelete = () => {
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        onDelete(note._id);
        setShowConfirm(false);
    }

    const addCheckItem = () => {
        if (newCheckItem.trim()) {
            setChecklist([...checklist, {text: newCheckItem.trim(), checked: false}]);
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
        <div className=" flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-3 z-10 border-b  border-gray-200 dark:border-gray-700 shadow-sm">
            <div className='max-w-3xl mx-auto px-4 sm:px-6 py-4'>
                <div className='flex rounded-lg p-6 items-center justify-between mb-4 sticky top-0 bg-gray-300/80 dark:bg-gray-900 py-3 z-10'>
                    <button
                        onClick={onBack}
                        className='p-2 rounded-full dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700 transition'
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <div className='flex items-center gap-3'>
                        {!isNewNote && (
                            <button
                                onClick={handleDelete}
                                className='p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition'
                            >
                                <FaTrash size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className='flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition'
                        >
                            <FaSave/> Save
                        </button>
                    </div>
                </div>

                {/* Note Form */}
                <div className='rounded-2xl p-6 shadow-lg transition-colors'
                     style={{backgroundColor: color, color: isDark ? '#1f2937' : '#1f2937'}}>
                        <input type="text"
                               value={title}
                               onChange={(e) => setTitle(e.target.value)}
                               placeholder='Note title...'
                               className='w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400'
                               style={{ fontFamily: font}}
                         />

                        <p className='text-xs opacity mt-1'>
                            {new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>

                        <input type="text" 
                               value={subject}
                               onChange={(e) => setSubject(e.target.value)}
                               placeholder="Subject (Optional)"
                               className='w-full mt-4 text-sm bg-transparent border-b border-gray-300/30 outline-none pb-1 placeholder-gray-400'
                               style={{ fontFamily: font}}
                        
                        />

                        {type === 'text' ? (
                            <>
                                <textarea 
                                    ref={bodyRef}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder='Write your note here...'
                                    className='w-full mt-4 bg-transparent border-none outline-none resize-none min-h-[200px] placeholder-gray-400'
                                    style={{ fontFamily:font }}
                                >
                                </textarea>
                                <div className='flex justify-end items-xs opacity-50 mt-1'>
                                    {body.length} characters
                                </div>
                            </>
                        ) : (
                            <div className='mt-4 space-y-2'>
                                {checklist.map((item, index) => (
                                    <div key={index} className='flex items-center gap-3 group'>
                                        <button
                                            onClick={() => toggleCheckItem(index)}
                                            className='text-xl focus:outline-none'
                                        >
                                            {item.checked ? '☑️' : '⬜'}
                                        </button>
                                        <span className={item.checked ? 'line-through opacity-50' : ''}>
                                            {item.text}
                                        </span>
                                        <button
                                            onClick={() => removeCheckItem(index)}
                                            className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition'
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                ))}

                                <div className='flex items-center gap-2 mt-2'>
                                    <input type="text" 
                                           value={newCheckItem}
                                           onChange={(e) => setNewCheckItem(e.target.value)}
                                           placeholder='Add checklist item...'
                                           className='flex-1 bg-transparent border-b border-gray-300/30 outline-none pb-1 placeholder-gray-400'
                                           onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
                                    />
                                    <button
                                        onClick={addCheckItem}
                                        className='p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition'
                                    >
                                        <FaPlus size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                </div>

                {/* Bottom Bar */}
                <div className='mt-4 flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium opacity-70 dark:text-white transition-all'>Type:</span>
                        <button
                            onClick={() => setType('text')}
                            className={`px-3 py-1 rounded-lg text-sm transition ${type === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setType('checkbox')}
                            className={`px-3 py-1 rounded-lg text-sm transition ${type === 'checkbox' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            Checklist
                        </button>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium opacity-70 dark:text-white transition'>Color:</span>
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition ${color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c}}
                            />
                        ))}
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium opacity-70 dark:text-white transition'>Font: </span>
                        <select 
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                            className='bg-transparent border dark:text-white border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm outline-none'
                        >
                            {fonts.map((f) => (
                                <option key={f} value={f} syle={{ fontFamily: font}}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <ConfirmModal 
                    isOpen={showConfirm}
                    onClose = {() => setShowConfirm(false)}
                    onConfirm = {confirmDelete}
                    title="Delete note?"
                    message="This action cannot be undone. Are you sure you want to delete this note?"
                     />
            </div>
        </div>
    );
};

export default NoteEditor;
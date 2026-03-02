import React from 'react';
import { Trash2, Plus } from 'lucide-react';

/**
 * Reusable table component with standard styling and actions
 */
export const DataTable = ({ 
    columns,  // [{ key, label, width?, render? }]
    data,
    onAdd,
    onUpdate,
    onDelete,
    maxHeight = 'max-h-96',
    className = ''
}) => (
    <div className={`overflow-x-auto ${maxHeight} overflow-y-auto ${className}`}>
        <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-700 text-white uppercase text-xs font-bold sticky top-0">
                <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    {columns.map(col => (
                        <th key={col.key} className={`p-3 ${col.width || ''}`}>
                            {col.label}
                        </th>
                    ))}
                    <th className="p-3 w-12 text-center">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {data.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-600 font-medium">{idx + 1}</td>
                        {columns.map(col => (
                            <td key={`${item.id}-${col.key}`} className="p-3">
                                {col.render 
                                    ? col.render(item[col.key], item, idx)
                                    : item[col.key]
                                }
                            </td>
                        ))}
                        <td className="p-3 text-center">
                            <button
                                onClick={() => onDelete?.(item.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/**
 * Reusable array list component (inline editable)
 */
export const ArrayList = ({ 
    items = [],
    onAdd,
    onDelete,
    onUpdate,
    fields = [],  // [{ key, label, type, options? }]
    addButtonText = 'Add Item',
    maxHeight = 'max-h-60'
}) => (
    <div className={`space-y-3 ${maxHeight} overflow-y-auto`}>
        {items.map((item, idx) => (
            <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-3 rounded border border-slate-200">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-200 text-blue-800 rounded-full text-[10px] font-bold shrink-0">
                    {idx + 1}
                </span>
                <div className="flex-1 grid grid-cols-4 gap-2">
                    {fields.map(field => (
                        <input
                            key={field.key}
                            type={field.type || 'text'}
                            value={item[field.key] || ''}
                            onChange={e => onUpdate?.(item.id, field.key, e.target.value)}
                            placeholder={field.label}
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                        />
                    ))}
                </div>
                <button
                    onClick={() => onDelete?.(item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ))}
        <button
            onClick={onAdd}
            className="text-xs w-full bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
        >
            <Plus className="w-4 h-4" /> {addButtonText}
        </button>
    </div>
);

/**
 * Reusable card layout with header and actions
 */
export const Card = ({ 
    children, 
    className = '' 
}) => (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ 
    title, 
    icon: Icon, 
    action,
    borderColor = 'border-slate-200'
}) => (
    <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            {Icon && <Icon className="w-5 h-5" />}
            {title}
        </h3>
        {action}
    </div>
);

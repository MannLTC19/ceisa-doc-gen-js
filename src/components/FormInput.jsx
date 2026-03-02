import React from 'react';

/**
 * Reusable form input component to reduce boilerplate
 */
export const FormInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '', 
    type = 'text',
    className = '',
    disabled = false,
    required = false
}) => (
    <div>
        {label && (
            <label className="block text-xs font-bold text-slate-500 mb-1">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
        )}
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full p-2 text-sm border rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 ${className}`}
        />
    </div>
);

/**
 * Reusable textarea component
 */
export const FormTextarea = ({
    label,
    value,
    onChange,
    placeholder = '',
    rows = 4,
    disabled = false,
    required = false
}) => (
    <div>
        {label && (
            <label className="block text-xs font-bold text-slate-500 mb-1">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
        )}
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 resize-none"
        />
    </div>
);

/**
 * Reusable select component
 */
export const FormSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    required = false
}) => (
    <div>
        {label && (
            <label className="block text-xs font-bold text-slate-500 mb-1">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
        )}
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-slate-100 disabled:text-slate-400 text-slate-800 cursor-pointer"
        >
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

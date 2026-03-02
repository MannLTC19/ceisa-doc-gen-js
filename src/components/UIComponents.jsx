import React from 'react';

/**
 * Reusable section header with icon and description
 */
export const SectionHeader = ({ 
    icon: Icon, 
    title, 
    subtitle = '', 
    bgColor = 'bg-blue-50',
    borderColor = 'border-blue-200',
    textColor = 'text-blue-900',
    iconColor = 'text-blue-600'
}) => (
    <div className={`${bgColor} border ${borderColor} p-4 rounded-xl flex gap-4 items-start`}>
        <Icon className={`w-6 h-6 ${iconColor} mt-1 shrink-0`} />
        <div>
            <h3 className={`font-bold ${textColor} flex items-center gap-2`}>
                {title}
            </h3>
            {subtitle && (
                <p className={`text-sm ${textColor.replace('900', '700')}`}>
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);

/**
 * Reusable section title with icon
 */
export const SectionTitle = ({ 
    number, 
    title, 
    icon: Icon, 
    iconColor = 'text-blue-600' 
}) => (
    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
        {number && <span>{number}.</span>} {title}
    </h3>
);

/**
 * Reusable button variants
 */
export const Button = ({ 
    onClick, 
    children, 
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles = 'font-bold rounded-lg transition-colors flex items-center gap-1 outline-none focus:ring-2';
    
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300',
        secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:bg-slate-100',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300',
        ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300'
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};

/**
 * Icon button (compact)
 */
export const IconButton = ({
    onClick,
    icon: Icon,
    title = '',
    variant = 'ghost',
    disabled = false,
    className = ''
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded-md transition-colors disabled:opacity-50 hover:bg-slate-100 ${className}`}
    >
        <Icon className="w-4 h-4" />
    </button>
);

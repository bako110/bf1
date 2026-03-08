import React from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Copy, 
  Layers, 
  PlayCircle,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function Button({ 
  children, 
  onClick = () => {}, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
  loading = false,
  className = ''
}) {
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'bg-white text-black border border-gray-300 hover:bg-gray-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getIcon = (iconName, sizeClass = 'w-4 h-4') => {
    switch (iconName) {
      case 'plus':
        return <Plus className={sizeClass} />;
      case 'edit':
        return <Edit2 className={sizeClass} />;
      case 'trash-2':
      case 'delete':
        return <Trash2 className={sizeClass} />;
      case 'x':
      case 'close':
        return <X className={sizeClass} />;
      case 'copy':
        return <Copy className={sizeClass} />;
      case 'layers':
        return <Layers className={sizeClass} />;
      case 'play-circle':
        return <PlayCircle className={sizeClass} />;
      case 'save':
        return <Save className={sizeClass} />;
      case 'arrow-left':
        return <ArrowLeft className={sizeClass} />;
      case 'arrow-right':
        return <ArrowRight className={sizeClass} />;
      default:
        return null;
    }
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const IconComponent = icon ? getIcon(icon, iconSize) : null;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        IconComponent
      )}
      {children && <span>{children}</span>}
    </button>
  );
}

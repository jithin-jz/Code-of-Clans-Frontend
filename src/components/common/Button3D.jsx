import { motion } from 'framer-motion';

// 3D Button Component with enhanced effects
const Button3D = ({ children, className = "", style = {}, onClick, variant = "wood", ...props }) => {
    const baseStyles = {
        wood: {
            background: 'linear-gradient(180deg, #7c6a5a 0%, #5c4a3a 20%, #4d3d30 80%, #3d3228 100%)',
            border: '3px solid #a08060',
            boxShadow: `
                inset 0 2px 4px rgba(255,255,255,0.2),
                inset 0 -2px 4px rgba(0,0,0,0.3),
                0 6px 0 #2a2218,
                0 8px 4px rgba(0,0,0,0.3),
                0 12px 16px rgba(0,0,0,0.4)
            `,
        },
        orange: {
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 30%, #b45309 70%, #92400e 100%)',
            border: '3px solid #fcd34d',
            boxShadow: `
                inset 0 2px 6px rgba(255,255,255,0.4),
                inset 0 -3px 6px rgba(0,0,0,0.3),
                0 6px 0 #78350f,
                0 8px 4px rgba(0,0,0,0.3),
                0 14px 20px rgba(180,83,9,0.4)
            `,
        },
        green: {
            background: 'linear-gradient(180deg, #4ade80 0%, #22c55e 30%, #16a34a 70%, #15803d 100%)',
            border: '4px solid #86efac',
            boxShadow: `
                inset 0 3px 8px rgba(255,255,255,0.4),
                inset 0 -4px 8px rgba(0,0,0,0.3),
                0 8px 0 #166534,
                0 10px 6px rgba(0,0,0,0.3),
                0 16px 24px rgba(22,163,74,0.5)
            `,
        },
    };

    return (
        <motion.button
            className={`relative rounded-2xl transition-all ${className}`}
            style={{ ...baseStyles[variant], ...style }}
            whileHover={{ 
                y: -2,
                boxShadow: variant === 'green' 
                    ? 'inset 0 3px 8px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.3), 0 10px 0 #166534, 0 12px 8px rgba(0,0,0,0.4), 0 20px 32px rgba(22,163,74,0.6)'
                    : variant === 'orange'
                    ? 'inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3), 0 8px 0 #78350f, 0 10px 6px rgba(0,0,0,0.4), 0 18px 28px rgba(180,83,9,0.5)'
                    : 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 8px 0 #2a2218, 0 10px 6px rgba(0,0,0,0.4), 0 16px 24px rgba(0,0,0,0.5)'
            }}
            whileTap={{ 
                y: 4,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 0 #2a2218, 0 3px 2px rgba(0,0,0,0.2)'
            }}
            onClick={onClick}
            {...props}
        >
            {/* Glossy shine overlay */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-linear-to-b from-white/20 to-transparent rounded-t-xl pointer-events-none" />
            {children}
        </motion.button>
    );
};

export default Button3D;

import React from 'react';

interface PillSliderProps {
    options: [string, string];
    value: string;
    onChange: (value: string) => void;
}

const PillSlider: React.FC<PillSliderProps> = ({ options, value, onChange }) => {
    const activeIndex = options.indexOf(value);

    return (
        <div
            style={{
                display: 'inline-flex',
                background: '#fff',
                border: '2px solid #111',
                borderRadius: '50px',
                padding: '4px',
                position: 'relative',
                gap: '0'
            }}
        >
            {/* Sliding pill background */}
            <div
                style={{
                    position: 'absolute',
                    top: '4px',
                    left: activeIndex === 0 ? '4px' : '50%',
                    width: 'calc(50% - 4px)',
                    height: 'calc(100% - 8px)',
                    background: '#FFF000',
                    borderRadius: '50px',
                    border: '2px solid #111',
                    transition: 'left 0.2s ease-out',
                    zIndex: 0
                }}
            />

            {options.map((option, index) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        padding: '8px 16px',
                        background: 'transparent',
                        border: 'none',
                        fontFamily: 'Oswald, sans-serif',
                        fontSize: '0.875rem',
                        fontWeight: value === option ? 700 : 500,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        color: '#111',
                        transition: 'font-weight 0.2s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export default PillSlider;

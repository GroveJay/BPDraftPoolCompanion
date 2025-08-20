import { useState, useEffect } from "react";
import { Range, getTrackBackground } from "react-range";

interface RangeSliderProps {
    min: number;
    max: number;
    initialMin: number;
    initialMax: number;
    onChange: (values: number[]) => void;
    formatter?: (value: number) => string;
    step?: number;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    initialMin,
    initialMax,
    onChange,
    step=0.5,
    formatter = (value: number) => value,
}) => {
    const [currentRange, setCurrentRange] = useState([initialMin, initialMax]);

    useEffect(() => {
        setCurrentRange([initialMin, initialMax]);
    }, [initialMin, initialMax])

    return (
        <Range
            step={step}
            min={min}
            max={max}
            values={currentRange}
            onChange={(values: number[]) => {
                setCurrentRange(values);
            }}
            onFinalChange={(values: number[]) => {
                onChange(values);
                setCurrentRange(values);
            }}
            renderTrack={({ props, children }) => (
                <div
                    {...props}
                    style={{
                        ...props.style,
                        height: '6px',
                        width: '100%',
                        marginTop: '3px',
                        marginBottom: '15px',
                        backgroundColor: '#ccc',
                        borderRadius: '4px',
                        background: getTrackBackground({
                            values: currentRange,
                            colors: ['#ccc', '#548BF4', '#ccc'],
                            min,
                            max,
                        }),
                    }}
                >
                    {children}
                </div>
                )}
            renderThumb={({ index, props }) => {
                const { key, style, ...otherProps } = props;
                return (
                    <div
                        key={key}
                        {...otherProps}
                        style={{
                            ...style,
                            height: '12px',
                            width: '12px',
                            borderRadius: '4px',
                            backgroundColor: '#999',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '10px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {formatter(index === 0 ? currentRange[0] : currentRange[1])}
                        </div>
                    </div>
                )
            }}
            />
    )
}

export default RangeSlider;
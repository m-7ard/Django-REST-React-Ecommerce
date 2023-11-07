import React, {useState, useEffect, useRef} from 'react';
  

export default function Select({name, options, initial, selectClassName}) {
    const [open, setOpen] = useState(false);
    const [root, setRoot] = useState(initial);
    const [optionListPositioning, setOptionListPositioning] = useState({
        top: 0,
        left: 0,
    });
    const selectRef = useRef(null);
  
  
    useEffect(() => {
        const handleWindowClick = (event) => {
            if (!(event.button === 0)) {
                return;
            };

            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
            };
        };
    
        const handleWindowResize = () => {
            if (open && selectRef.current) {
                positionOptionList(selectRef.current);
            }
        };
    
        window.addEventListener('mouseup', handleWindowClick);
        window.addEventListener('resize', handleWindowResize);
    
        return () => {
            window.removeEventListener('mouseup', handleWindowClick);
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [selectRef]);
  
    const positionOptionList = (root) => {
        const dimensions = root.getBoundingClientRect();
        setOptionListPositioning({ top: `${dimensions.bottom}px`, left: dimensions.left });
    };
  
    const toggleSelect = (event) => {
        if (open) {
            setOpen(false);
        } 
        else {
            const root = event.target.closest('[data-role="root"]');
            positionOptionList(root);
            setOpen(true);
        }
    };
  
    function Option({label, value, id}) {
        return (
            <li 
                data-role="option" 
                onClick={(event) => {
                    setRoot({label: label, value: value});
                }}
                key={id}
            >
                {label}
                <input type="radio" name={name} checked={value === root.value}  onChange={() => undefined}/>
            </li>
        )
    }

    return (
        <ul
            className={selectClassName}
            data-role="select"
            data-state={open ? 'open' : 'closed'}
            ref={selectRef}
        >
            <li
                value={root.value}
                data-role="root"
                onClick={toggleSelect}
            >
                <div className="icon icon--small" data-role="marker">
                    <i className="material-icons">
                    expand_more
                </i>
                </div>
                <div data-role="label">
                    {root.label}
                </div>
            </li>
            <ul data-role="option-list" style={{ top: optionListPositioning.top, left: optionListPositioning.left }}>
                {options.map((option) => (
                    <Option {...option} />
                ))}
            </ul>
        </ul>
    );
};


import React, { useState } from "react";


export default function Drawer({ name, className, normalizedData, topLevelChoices, initialChoice, parentChoiceHandle }) {
    const [route, setRoute] = useState(initialChoice ? normalizedData.getRoute(initialChoice) : []);
    const onChoiceSelect = (value) => {
        setRoute(normalizedData.getRoute(value));
        parentChoiceHandle && parentChoiceHandle(value);
    };

    const generateChoices = (choices) => {
        return (
            <ul data-role="choices">
                {choices.map((choice) => {
                    const subchoices = normalizedData.getSubChoices(choice.value);
                    if (subchoices.length) {
                        return (
                            <Branch choices={subchoices} root={choice} key={choice.value}/>
                        )
                    }
                    else {
                        return (
                            <Leaf {...choice} key={choice.value}/>
                        )
                    }
                })}
            </ul>
        )
    }

    function Leaf({value, label}) {
        const checked = route.includes(value);
        
        return (
            <li data-role="leaf" onClick={() => onChoiceSelect(value)}>
                {label}
                <div className="icon icon--small" data-role="check">
                    <i className="material-icons">
                        'check_circle'
                    </i>
                </div>
                <input 
                    type="radio" 
                    name={name} 
                    defaultChecked={checked} 
                    value={value}
                />
            </li>
        )
    }

    function Root({value, label}) {
        return (
            <li data-role="root" onClick={() => onChoiceSelect(value)}>
                {label}
                <div className="icon icon--small" data-role="marker">
                    <i className="material-icons">
                        'chevron_right'
                    </i>
                </div>
            </li>
        )
    }

    function Branch({root, choices}) {
        const active = route.includes(root.value);
        return (
            <ul data-role="branch" data-active={active}>
                <Root {...root}/>
                {active && generateChoices(choices)}
            </ul>
        )
    }
    
    return (
        <div className={className} data-role="drawer">
            {generateChoices(topLevelChoices)}
        </div>
    )
}
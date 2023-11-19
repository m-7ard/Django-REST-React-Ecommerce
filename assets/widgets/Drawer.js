import React, { Fragment, useState } from "react";
import { normalizedDataHelpers } from "../Utils";


export default function Drawer({ name, className, normalizedData, topLevelChoices, initialChoice, ...extraDrawerProps }) {
    const { getRoute, getSubChoices } = normalizedDataHelpers(normalizedData);
    const [route, setRoute] = useState(initialChoice ? getRoute(initialChoice) : []);
    
    function Leaf({value, label}) {
        const checked = route.includes(value);
        return (
            <li data-role="leaf" onClick={() => setRoute(getRoute(value))}>
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
            <li data-role="root" onClick={() => setRoute(getRoute(value))}>
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

    const generateChoices = (choices) => {
        return (
            <ul data-role="choices">
                {choices.map((choice) => {
                    const subchoices = getSubChoices(choice.value);
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
    
    return (
        <div className={className} data-role="drawer" {...extraDrawerProps}>
            {generateChoices(topLevelChoices)}
        </div>
    )
}
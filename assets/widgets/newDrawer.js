import React, { Fragment, useState } from "react";
import { normalizedDataHelpers } from "../Utils";


export default function newDrawer({ name, className, normalizedData, topLevelChoices, initialChoice }) {
    const { getRoute, getSubChoices } = normalizedDataHelpers(normalizedData);
    const [route, setRoute] = useState(initialChoice ? getRoute(initialChoice) : []);
    function Leaf({value, label}) {
        const checked = route.includes(value);
        return (
            <div data-role="leaf" onClick={() => setRoute(getRoute(value))}>
                {label}
                <input 
                    type="radio" 
                    name={name} 
                    defaultChecked={checked} 
                    value={value}
                />
            </div>
        )
    }

    function Root({value, label}) {
        return (
            <div data-role="root" onClick={() => setRoute(getRoute(value))}>
                {label}
            </div>
        )
    }

    function Branch({root, choices}) {
        const active = route.includes(root.value);
        return (
            <Fragment>
                <Root {...root} />
                <div className={className}>
                    {active && generateChoices(choices)}
                </div>
            </Fragment>
        )
    }

    const generateChoices = (choices) => {
        return choices.map((choice) => {
            const subchoices = getSubChoices(choice.value);
            if (subchoices.length) {
                return (
                    <Branch choices={subchoices} root={choice} />
                )
            }
            else {
                return (
                    <Leaf {...choice} />
                )
            }
        })
    }
    
    return (
        <div className={className} data-role="drawer">
            {generateChoices(topLevelChoices)}
        </div>
    )
}
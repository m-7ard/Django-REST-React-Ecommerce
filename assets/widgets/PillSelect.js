import React from "react";


export default function PillSelect({choices, name}) {
    return (
        <div className="form__pill-select-widget">
            {choices.map(({label, value}, i) => {
                return (
                    <div data-role="option" key={i}>
                        <i className="icon icon--tiny" />
                        {label}
                        <input type="radio" name={name} value={value}/>
                    </div>
                )
            })}
        </div>
    )
}
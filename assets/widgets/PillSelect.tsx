import React from 'react'

interface PillSelectProps {
    choices: Array<{ label: string, value: string }>
    name: string
}

export default function PillSelect ({ choices, name }: PillSelectProps): React.ReactNode {
    return (
        <div className="form__pill-select-widget">
            {
                choices.map(({ label, value }, i) => {
                    return (
                        <div data-role="option" key={i}>
                            <i className="icon icon--tiny" />
                            {label}
                            <input type="radio" name={name} value={value}/>
                        </div>
                    )
                })
            }
        </div>
    )
}

export function PillSelectWidget (props: Omit<PillSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => PillSelect({ name, ...props })
}

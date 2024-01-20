import React, { useRef, useState } from 'react'
import Icon from '../elements/Icon'

interface SpecificationInputProps {
    initial?: Record<string, string>
    name: string
}

function SpecificationInputField ({ initial, onDelete }: {
    initial?: {
        fieldName: string
        fieldValue: string
    }
    onDelete: () => void
}): React.ReactNode {
    const [fieldName, setFieldName] = useState(initial?.fieldName ?? '')
    const [fieldValue, setFieldValue] = useState(initial?.fieldValue ?? '')

    return (
        <div className="prop__row prop__row--centered">
            <input className='specifications@form__input specifications@form__input--name' defaultValue={fieldName} size={0} type="text" onChange={(event) => {
                setFieldName(event.target.value)
            }} />
            <input className='specifications@form__input specifications@form__input--value' defaultValue={fieldValue} size={0} type="text" onChange={(event) => {
                setFieldValue(event.target.value)
            }} />
            <div onMouseUp={onDelete}>
                <Icon name='cancel' size='small' hoverable />
            </div>
            <input type="hidden" name="specifications" value={`["${fieldName}", "${fieldValue}"]`} />
        </div>
    )
}

export default function SpecificationInput ({ initial, name }: SpecificationInputProps): React.ReactNode {
    const fieldID = useRef(0)
    const getFieldID = (): number => {
        const id = fieldID.current
        fieldID.current += 1
        return id
    }
    const [fields, setFields] = useState(initial == null
        ? []
        : Object.entries(initial).map(
            ([fieldName, fieldValue]) => {
                const id = getFieldID()
                return { id, fieldName, fieldValue }
            }
        ))

    return (
        <div className="prop__column specifications@form">
            {
                fields.map(({ id, ...initial }) => (
                    <SpecificationInputField initial={initial} onDelete={() => {
                        setFields((previous) => {
                            return previous.filter((field) => field.id !== id)
                        })
                    }} key={id} />
                ))
            }
            <div className='prop__row'>
                <div className='prop__button is-link' onMouseUp={() => {
                    setFields((previous) => {
                        const newField = { id: getFieldID(), fieldName: '', fieldValue: '' }
                        return [...previous, newField]
                    })
                }}>
                    <Icon name='add' size='small' hoverable />
                    Add New Field
                </div>
            </div>
        </div>
    )
}

export function SpecificationInputWidget (props: Omit<SpecificationInputProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => SpecificationInput({ name, ...props })
}

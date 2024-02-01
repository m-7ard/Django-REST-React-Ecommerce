import React from 'react'

export interface FormFieldInterface {
    widget: ({ name }: { name: string }) => React.ReactNode
    name: string
    label?: string
    errors?: Record<string, string[]>
    optional?: boolean
}

export default function FormField ({
    widget, name, label, errors, optional = false
}: FormFieldInterface): React.ReactNode {
    return (
        <div className="form__field" data-name={name}>
            <div className="form__label">
                {`${label}${optional ? ' (Optional)' : ''}`}
            </div>
            {widget({ name })}
            {
                !(errors == null) && (
                    errors[name]?.map((message, i) => {
                        return (
                            <div className="form__error" key={i}>
                                {message}
                            </div>
                        )
                    })
                )
            }
        </div>
    )
}

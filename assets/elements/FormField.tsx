import React from 'react'

interface FormFieldInterface {
    widget: {
        component: ({ name }: {
            name: string
            [key: string]: unknown
        }) => React.ReactNode
        props?: Record<string, unknown>
    }
    name: string
    label?: string
    errors: Record<string, string[]>
}

export default function FormField ({
    widget, name, label, errors
}: FormFieldInterface): React.ReactNode {
    const props = { ...widget.props, name }

    return (
        <div className="form__field" data-name={name}>
            <div className="form__label">
                {label}
            </div>
            <widget.component {...props} />
            {
                errors[name]?.map((message, i) => {
                    return (
                        <div className="form__error" key={i}>
                            {message}
                        </div>
                    )
                })
            }
        </div>
    )
}

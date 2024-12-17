import React, { type TextareaHTMLAttributes } from 'react'

interface CharTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    initial?: string | number
}

export default function CharTextArea ({ initial, ...props }: CharTextAreaProps): React.ReactNode {
    return (
        <textarea defaultValue={initial} className="form__char-textarea" {...props} rows={5} />
    )
}

export function CharTextAreaWidget (props: Omit<CharTextAreaProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => CharTextArea({ name, ...props })
}

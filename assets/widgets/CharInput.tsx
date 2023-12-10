import React, { type InputHTMLAttributes, type ReactNode } from 'react'

interface CharInputProps extends InputHTMLAttributes<HTMLInputElement> {
    initial?: string | number
}

export default function CharInput ({ initial, ...props }: CharInputProps): ReactNode {
    return (
        <input defaultValue={initial} className="form__char-input" {...props} />
    )
}

export function CharInputWidget (props: Omit<CharInputProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => CharInput({ name, ...props })
}

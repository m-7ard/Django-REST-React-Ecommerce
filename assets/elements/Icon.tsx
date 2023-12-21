import React from 'react'

interface IconProps {
    name: string
    size: 'small' | 'medium' | 'large'
    wrapperClass?: string
}

export default function Icon ({ name, size, wrapperClass }: IconProps): React.ReactNode {
    const iconElement = (
        <div className={`icon icon--${size}`}>
            <i className="material-icons">
                {name}
            </i>
        </div>
    )

    if (wrapperClass == null) {
        return (
            <div className={wrapperClass}>
                {iconElement}
            </div>
        )
    }
    return iconElement
}

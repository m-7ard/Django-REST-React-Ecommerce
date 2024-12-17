import React from 'react'

interface IconProps {
    name: string
    size: 'small' | 'medium' | 'large'
    hoverable?: boolean
    ignoreHeight?: boolean
    extraClass?: string
}

export default function Icon ({ name, size, extraClass, hoverable = false, ignoreHeight = false }: IconProps): React.ReactNode {
    const iconElement = (
        <div className={`icon icon--${size} ${hoverable ? 'icon--hoverable' : ''} ${ignoreHeight ? 'icon--ignore-height' : ''} ${extraClass ?? ''}`}>
            <i className="material-icons">
                {name}
            </i>
        </div>
    )

    return iconElement
}

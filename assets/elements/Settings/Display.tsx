import React from 'react'
import { Link } from 'react-router-dom'

interface DisplayProps {
    title: string,
    link: string
    current: React.ReactNode
}

export default function Display ({ title, link, current }: DisplayProps): React.ReactNode {
    return (
        <div className='settings__display prop prop--vertical'>
            <div className='prop__header'>
                <div className='prop__label'>
                    {title}
                </div>
                <Link className='prop__detail is-link' to={link}>
                    Edit
                </Link>
            </div>
            <hr className="app__divider" />
            {current}
        </div>
    )
}

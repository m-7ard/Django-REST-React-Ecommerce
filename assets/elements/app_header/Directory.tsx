import React from 'react'
import { Link } from 'react-router-dom'

export default function Directory ({ iconName, to, text }: { iconName: string, to?: string, text?: string }): React.ReactNode {
    const content = (
        <>
            <div className="icon icon--small icon--hoverable">
                <i className="material-icons">
                    {iconName}
                </i>
            </div>
            {
                text != null && (
                    <div data-role='text'>
                        {text}
                    </div>
                )
            }
        </>
    )

    if (to == null) {
        return (
            <div className="header@app__directory">
                {content}
            </div>
        )
    }

    return (
        <Link to={to} className="header@app__directory">
            {content}
        </Link>
    )
}

import React from 'react'

interface PromptProps {
    title: string
    onClose: () => void
    body?: React.ReactNode
    footer?: React.ReactNode
}

export default function Prompt ({ title, onClose, body, footer }: PromptProps): React.ReactNode {
    return (
        <div className="overlay">
            <div className="prompt prop prop--vertical">
                <div className="prop__header">
                    <div className="prop__title">
                        {title}
                    </div>
                    <div className="prompt__close" onMouseUp={onClose}>
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                close
                            </i>
                        </div>
                    </div>
                </div>
                <hr className="app__divider" />
                {body != null && (
                    <div className="prompt__body">
                        {body}
                    </div>
                )}
                <hr className="app__divider" />
                {footer != null && (
                    <div className="prop__footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

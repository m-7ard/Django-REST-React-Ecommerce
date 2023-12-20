import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface DropdownProps {
    trigger: React.ReactNode
    content: React.ReactNode
    positioning: {
        top?: 0 | string
        right?: 0 | string
        bottom?: 0 | string
        left?: 0 | string
    }
    extraClass?: string
}

export default function Dropdown ({ trigger, content, positioning, extraClass }: DropdownProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const toCloseRef = useRef<HTMLDivElement | null>(null)

    function closeOnWindowClick (event: MouseEvent): void {
        if (!(event.button === 0) || toCloseRef.current == null) {
            return
        }

        const target = event.target as HTMLElement
        if (toCloseRef.current.contains(target as Node) && target.closest('[data-role="close"]') != null) {
            window.removeEventListener('mouseup', closeOnWindowClick)
            setOpen(false)
        }

        if (!toCloseRef.current.contains(target as Node)) {
            window.removeEventListener('mouseup', closeOnWindowClick)
            setOpen(false)
        }
    }

    return (
        <div className={`dropdown ${extraClass}`} data-state={open ? 'open' : 'closed'} {...(open && { ref: toCloseRef })}>
            <div className='dropdown__trigger'
                onClick={() => {
                    setOpen(!open)
                    window.addEventListener('mouseup', closeOnWindowClick)
                }}
            >
                {trigger}
            </div>
            <div className={'dropdown__content'} style={positioning}>
                {content}
            </div>
        </div>
    )
}

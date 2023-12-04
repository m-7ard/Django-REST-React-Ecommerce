import React, { useState, useEffect, useRef } from 'react'
import { type NormalizedDataItem } from '../Types'

interface SelectInterface {
    name: string
    options: NormalizedDataItem[]
    initial?: NormalizedDataItem
    className: string
    placeholder?: string
}

export default function Select ({ name, options, initial, className, placeholder }: SelectInterface): React.ReactNode {
    /*

    TODO: redisign this whole component and consider
    changing category select to a tooltip

    */

    const [open, setOpen] = useState(false)
    const [root, setRoot] = useState(initial)
    const [optionListPositioning, setOptionListPositioning] = useState<{
        top?: string | 0
        left?: string | 0
        width: string
    }>({
        top: 0,
        left: 0,
        width: 'auto'
    })
    const selectRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleWindowClick = (event: MouseEvent): void => {
            if (!(event.button === 0) || selectRef.current == null) {
                return
            }

            if (!selectRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        const handleWindowResize = (): void => {
            if (!open && selectRef.current == null) {
                return
            }

            positionOptionList(selectRef.current as HTMLElement)
        }

        window.addEventListener('mouseup', handleWindowClick as EventListener)
        window.addEventListener('resize', handleWindowResize)

        return () => {
            window.removeEventListener('mouseup', handleWindowClick)
            window.removeEventListener('resize', handleWindowResize)
        }
    }, [selectRef])

    const positionOptionList = (selectRoot: HTMLElement): void => {
        const dimensions = selectRoot.getBoundingClientRect()
        setOptionListPositioning({
            top: `${dimensions.bottom}px`,
            left: `${dimensions.left}px`,
            width: `${selectRoot.offsetWidth}px`
        })
    }

    const toggleSelect = (event: React.MouseEvent<HTMLButtonElement>): void => {
        if (open) {
            setOpen(false)
            return
        }

        if (!(event.target instanceof Element)) {
            return
        }

        const selectRoot: HTMLElement | null = event.target.closest('[data-role="root"]')
        if (selectRoot == null) {
            return
        }

        positionOptionList(selectRoot)
        setOpen(true)
    }

    function Option ({ option }: { option: NormalizedDataItem }): React.ReactNode {
        return (
            <button
                data-role="option"
                onClick={() => {
                    setRoot(option)
                }}
            >
                <div data-role="label">
                    {option.label}
                </div>
                <input type="radio" name={name} checked={option.value === root.value} onChange={() => undefined} />
            </button>
        )
    }

    return (
        <div
            className={className}
            data-role="select"
            data-state={open ? 'open' : 'closed'}
            ref={selectRef}
        >
            <button
                value={root == null ? placeholder : root.value}
                data-role="root"
                onClick={toggleSelect}
            >
                <div className="icon icon--small" data-role="marker">
                    <i className="material-icons">
                        expand_more
                    </i>
                </div>
                <div data-role="label">
                    {root == null ? placeholder : root.label}
                </div>
            </button>
            <div data-role="option-list" style={{ ...optionListPositioning }}>
                {options.map((option, i) => (
                    <Option option={option} key={i} />
                ))}
            </div>
        </div>
    )
}

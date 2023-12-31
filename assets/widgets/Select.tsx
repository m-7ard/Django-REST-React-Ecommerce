import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { type NormalizedData } from '../Utils'
import { type NormalizedDataItem } from '../Types'
import Icon from '../elements/Icon'

interface SelectProps {
    name: string
    normalizedData: NormalizedData
    placeholder: string
    initial?: number
    selectClass?: string
    rootClass?: string
    optionListClass?: string
    optionClass?: string
    rows?: number
}

export default function Select ({ name, normalizedData, initial, placeholder, selectClass, rootClass, optionListClass, optionClass, rows }: SelectProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const [choice, setChoice] = useState(initial == null ? null : normalizedData.getChoice(initial))
    const [optionListPositioning, setOptionListPositioning] = useState<{
        top?: string | 0
        left?: string | 0
        width: string
        height: string
    }>({
        top: 0,
        left: 0,
        width: 'auto',
        height: 'auto'
    })
    const selectRef = useRef<HTMLDivElement | null>(null)
    const rootRef = useRef<HTMLDivElement | null>(null)

    useLayoutEffect(() => {
        if (open) {
            positionOptionList()
        }
    }, [open])

    const positionOptionList = (): void => {
        if (rootRef.current == null) {
            return
        }

        const dimensions = rootRef.current.getBoundingClientRect()
        setOptionListPositioning({
            top: `${dimensions.bottom}px`,
            left: `${dimensions.left}px`,
            width: `${rootRef.current.offsetWidth}px`,
            height: `${rootRef.current.offsetHeight * (rows ?? 1)}px`
        })
    }

    useEffect(() => {
        const closeOnWindowClick = (event: MouseEvent): void => {
            if (!(event.button === 0) || selectRef.current == null) {
                return
            }

            const target = event.target as HTMLElement
            if (
                selectRef.current.contains(target as Node) &&
                target.closest('[data-role="close"]') != null
            ) {
                setOpen(false)
            }

            if (!selectRef.current.contains(target as Node)) {
                setOpen(false)
            }
        }

        const handleWindowResize = (): void => {
            if (!open && selectRef.current == null) {
                return
            }

            positionOptionList()
        }

        if (open) {
            window.addEventListener('mouseup', closeOnWindowClick)
            window.addEventListener('resize', handleWindowResize)
        }

        return () => {
            window.removeEventListener('mouseup', closeOnWindowClick)
            window.removeEventListener('resize', handleWindowResize)
        }
    }, [open])

    function Option ({ value, label }: NormalizedDataItem): React.ReactNode {
        return (
            <div className={`select__option ${optionClass}`} onClick={() => {
                setChoice({ value, label })
            }}>
                {label}
                <input type='radio' name={name} defaultValue={value} defaultChecked={choice?.value === value}/>
            </div>
        )
    }

    return (
        <div
            className={`select ${selectClass}`}
            data-state={open ? 'open' : 'closed'}
            {...(open && { ref: selectRef })}
        >
            <div
                className={`select__root ${rootClass}`}
                {...(open && { ref: rootRef })}
                onClick={() => {
                    setOpen(!open)
                }}
            >
                {choice == null ? placeholder : choice.label}
                <span data-role="marker">
                    <Icon name='chevron_right' size='small' />
                </span>
            </div>
            <div className={`select__option-list ${optionListClass}`} style={optionListPositioning}>
                {normalizedData.data.map((item) => {
                    return Option(item)
                })}
            </div>
        </div>
    )
}

export function SelectWidget (props: Omit<SelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => Select({ name, ...props })
}

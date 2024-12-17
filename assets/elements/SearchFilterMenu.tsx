import React, { useRef, useState } from 'react'
import Icon from './Icon'
import Prompt from './Prompt'
import { CharInputWidget } from '../widgets/CharInput'
import FormField from './FormField'
import { useSearchParams } from 'react-router-dom'

export default function SearchFilterMenu (): React.ReactNode {
    const [open, setOpen] = useState(false)
    const filterForm = useRef<HTMLFormElement>(null)
    const [searchParams, setSearchParams] = useSearchParams()
    const submitFilters = (form: HTMLFormElement): void => {
        setSearchParams((prevSearchParams) => {
            const filterFormData = new FormData(form)
            const newParams = new URLSearchParams()
            prevSearchParams.forEach((value, key) => {
                if (key !== 'page') {
                    newParams.set(key, value)
                }
            })
            filterFormData.forEach((value, key) => {
                if (value != null && value !== '') {
                    newParams.set(key, value)
                }
            })
            return newParams
        })
        setOpen(false)
    }

    return (
        <>
            <div className='prop__label is-link' onClick={() => {
                setOpen(true)
            }}>
                Filter
            </div>
            {
                open && (
                    <Prompt
                        title="Filter"
                        onClose={() => {
                            setOpen(false)
                        }}
                        body={
                            <form className="form" ref={filterForm} onSubmit={(event) => {
                                event?.preventDefault()
                                submitFilters(event.target as HTMLFormElement)
                            }}>
                                <FormField
                                    name={'min_price'}
                                    label={'Min Price'}
                                    widget={CharInputWidget({
                                        initial: searchParams.get('min_price') ?? undefined
                                    })}
                                />
                            </form>
                        }
                        footer={
                            <>
                                <div className='prompt__confirm' onClick={() => {
                                    submitFilters(filterForm.current as HTMLFormElement)
                                }}>
                                    Apply
                                </div>
                            </>
                        }
                    />
                )
            }
        </>
    )
}

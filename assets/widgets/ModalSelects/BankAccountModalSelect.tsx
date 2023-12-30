import React, { useState } from 'react'
import { BankAccount, type Address } from '../../Types'
import { usePicker } from '../../Utils'
import Prompt from '../../elements/Prompt'
import Icon from '../../elements/Icon'

interface BankAccountModalSelectProps {
    name: string
    title: string
    bankAccountList: BankAccount[]
    placeholder?: string
    initial?: number
}

export default function BankAccountModalSelect ({ name, title, bankAccountList, placeholder, initial }: BankAccountModalSelectProps): React.ReactNode {
    const [open, setOpen] = useState(false)
    const { stagedValue, confirmedValue, setStagedValue, setConfirmedValue } = usePicker<BankAccount>(
        initial == null
            ? undefined
            : bankAccountList.find((bankAccount) => bankAccount.pk === initial)
    )
    const currentlySelected = stagedValue ?? confirmedValue
    const closeModal = (): void => {
        setStagedValue(undefined)
        setOpen(false)
    }

    return (
        <>
            <input name={name} defaultValue={confirmedValue?.pk} type='hidden' />
            <div className="select@form" onClick={() => {
                setOpen(true)
            }}>
                <div className="select@form__root">
                    <div data-role="label">
                        {confirmedValue == null ? placeholder : `${confirmedValue.iban}, ${confirmedValue.owner}`}
                    </div>
                    <Icon name='web_asset' size='small' ignoreHeight />
                </div>
            </div>
            {
                open && (
                    <Prompt
                        title={title}
                        onClose={() => {
                            closeModal()
                        }}
                        body={
                            <div className='card-grid'>
                                {bankAccountList.map((bankAccount, i) => {
                                    const address = bankAccount.address
                                    const isSelected = currentlySelected?.pk === bankAccount.pk
                                    return (
                                        <div className={`prop prop--vertical prop--highlighted card-grid__item ${isSelected ? 'card-grid__item--selected' : ''}`} key={i} onClick={() => {
                                            setStagedValue(bankAccount)
                                        }}>
                                            <div className="prop__header">
                                                <div>
                                                    <div className="prop__label">
                                                        {bankAccount.owner}
                                                    </div>
                                                    <div className='prop__detail'>
                                                        {bankAccount.iban}
                                                    </div>
                                                </div>
                                                {
                                                    isSelected && (
                                                        <Icon name='check_circle' size='small' ignoreHeight />
                                                    )
                                                }
                                            </div>
                                            <hr className="app__divider" />
                                            <div>
                                                <div className='prop__detail'> {address.name} </div>
                                                <div className='prop__detail'> {address.street} </div>
                                                <div className='prop__detail'> {address.locality} </div>
                                                <div className='prop__detail'> {address.zip_code} </div>
                                                <div className='prop__detail'> {address.country_display} </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        }
                        footer={
                            <div className={`prompt__confirm ${currentlySelected == null ? 'prompt__confirm--disabled' : ''}`} onClick={() => {
                                if (currentlySelected == null) {
                                    return
                                }

                                setConfirmedValue(currentlySelected)
                                closeModal()
                            }}>
                                Confirm
                            </div>
                        }
                    />
                )
            }
        </>
    )
}

export function BankAccountModalSelectWidget (props: Omit<BankAccountModalSelectProps, 'name'>): ({ name }: { name: string }) => React.ReactNode {
    return ({ name }: { name: string }) => BankAccountModalSelect({ name, ...props })
}

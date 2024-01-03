import React, { useState } from 'react'
import Icon from '../../elements/Icon'
import { Link, useLoaderData } from 'react-router-dom'
import { type BankAccount } from '../../Types'
import { useUserContext } from '../../Context'
import { getCookie } from '../../Utils'

export default function ManageBankAccounts (): React.ReactNode {
    const bankAccounts = useLoaderData() as BankAccount[]
    const { user } = useUserContext()
    const [defaultBankAccount, setDefaultBankAccount] = useState(user.default_bank)

    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Bank Accounts
                </div>
            </div>
            <hr className="app__divider" />
            <Link className='prop prop--vertical prop--highlighted' to={'add/'}>
                <div className='prop prop__header'>
                    <div className='prop__label'>
                        Add New Bank Account
                    </div>
                    <Icon name='add' size='small' hoverable ignoreHeight />
                </div>
            </Link>
            <div className='card-grid'>
                {
                    bankAccounts.map((bankAccount, i) => {
                        const address = bankAccount.address
                        const updateDefaultBankAccount = async (): Promise<void> => {
                            const csrfToken = getCookie('csrftoken')
                            const response = await fetch(`/api/bank-accounts/${bankAccount.pk}/set-as-default/`, {
                                method: 'PATCH',
                                ...(csrfToken != null && {
                                    headers: {
                                        'X-CSRFToken': csrfToken
                                    }
                                })
                            })
                            if (response.ok) {
                                setDefaultBankAccount(bankAccount.pk)
                            }
                        }

                        return (
                            <div className='bank-account prop prop--vertical prop--highlighted' key={i}>
                                <div className="prop__header">
                                    <div>
                                        <div className="prop__label">
                                            {bankAccount.owner}
                                        </div>
                                        <div className='prop__detail'>
                                            {bankAccount.iban}
                                        </div>
                                    </div>
                                </div>
                                <hr className="app__divider" />
                                <div>
                                    <div className='prop__detail'> {address.name} </div>
                                    <div className='prop__detail'> {address.street} </div>
                                    <div className='prop__detail'> {address.locality} </div>
                                    <div className='prop__detail'> {address.zip_code} </div>
                                    <div className='prop__detail'> {address.country_display} </div>
                                </div>
                                <div className='prop__row'>
                                    <Link className='prop__detail is-link' to={`${address.pk}/edit/`}>
                                        Edit
                                    </Link>
                                    <Link className='prop__detail is-link' to={`${address.pk}/delete/`}>
                                        Delete
                                    </Link>
                                    {
                                        bankAccount.pk === defaultBankAccount
                                            ? (
                                                <div className="prop__detail">
                                                    Default
                                                </div>
                                            )
                                            : (
                                                <div className='prop__detail is-link' onClick={() => {
                                                    void updateDefaultBankAccount()
                                                }}>
                                                    Set as Default
                                                </div>
                                            )
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

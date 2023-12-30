import React from 'react'

import { useLoaderData, useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import GenericForm from '../../elements/GenericForm'
import { type BankAccount } from '../../Types'
import { BankAccountModalSelectWidget } from '../../widgets/ModalSelects/BankAccountModalSelect'

export default function AddFunds (): React.ReactNode {
    const navigate = useNavigate()
    const bankAccounts = useLoaderData() as BankAccount[]

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action="/api/ads/"
            title="Add Funds"
            button={{ label: 'Add Funds' }}
            hasCSRF
            fields={[
                {
                    name: 'amount',
                    label: 'Amount',
                    widget: CharInputWidget({
                        type: 'text',
                        maxLength: 64
                    })
                },
                {
                    name: 'bank_account',
                    label: 'Bank Account to Withdraw From',
                    widget: BankAccountModalSelectWidget({
                        bankAccountList: bankAccounts,
                        title: 'Select a Bank Account',
                        placeholder: 'Select a Bank Account',

                    })
                }
            ]}
            onSuccess={async (response: Response) => {
                const ad = await response.json()
                navigate('success/', { state: ad })
            }}
        />
    )
}
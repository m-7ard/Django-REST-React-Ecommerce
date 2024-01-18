import React from 'react'

import { useLoaderData, useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import GenericForm from '../../elements/GenericForm'
import { type BankAccount } from '../../Types'
import { BankAccountModalSelectWidget } from '../../widgets/ModalSelects/BankAccountModalSelect'

export default function WithdrawFunds (): React.ReactNode {
    const navigate = useNavigate()
    const bankAccounts = useLoaderData() as BankAccount[]

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action="/api/withdraw/"
            title="Withdraw Funds"
            button={{ label: 'Withdraw Funds' }}
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
                    name: 'action_bank_account',
                    label: 'Bank Account to Transfer To',
                    widget: BankAccountModalSelectWidget({
                        bankAccountList: bankAccounts,
                        title: 'Select a Bank Account',
                        placeholder: 'Select a Bank Account'

                    })
                }
            ]}
            onSuccess={async (response) => {
                navigate('/funds/')
            }}
        />
    )
}

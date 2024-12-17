import React from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { AdBoostSelectWidget } from '../../widgets/AdBoostSelect'
import GenericForm from '../../elements/GenericForm'
import { BankAccountModalSelectWidget } from '../../widgets/ModalSelects/BankAccountModalSelect'
import { type BankAccount } from '../../Types'

export default function AdBoost (): React.ReactNode {
    const { pk } = useParams()
    const bankAccounts = useLoaderData() as BankAccount[]
    const navigate = useNavigate()

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action={`/api/ads/${pk}/boost/`}
            title="Boost Ad"
            button={{ label: 'Boost Ad' }}
            hasCSRF
            fields={[
                {
                    name: 'boosts',
                    label: 'Select one or more Boosts',
                    widget: AdBoostSelectWidget({})
                },
                {
                    name: 'bank_account',
                    label: 'Bank Account to Pay With',
                    widget: BankAccountModalSelectWidget({
                        bankAccountList: bankAccounts,
                        title: 'Select a Bank Account',
                        placeholder: 'Select a Bank Account'
                    })
                }
            ]}
            onSuccess={async () => {
                navigate('/account/')
            }}
        />
    )
}

import React from 'react'
import { useNavigate } from 'react-router-dom'
import PillSelect from '../widgets/PillSelect'
import CharInput from '../widgets/CharInput'
import GenericForm from '../elements/GenericForm'

export default function Register (): React.ReactNode {
    const navigate = useNavigate()

    return (
        <GenericForm
            title='Register New Account'
            extraClass="pamphlet"
            method="POST"
            action="/api/register/"
            button={{ label: 'Resgister' }}
            fields={[
                {
                    name: 'account_type',
                    label: 'Account Type',
                    widget: PillSelect({
                        name: 'account_type',
                        choices: [
                            { label: 'Individual', value: 'individual' },
                            { label: 'Business', value: 'business' }
                        ]
                    })
                },
                {
                    name: 'display_name',
                    label: 'Display Name',
                    widget: CharInput({ name: 'display_name', type: 'text' })
                },
                {
                    name: 'email',
                    label: 'Email',
                    widget: CharInput({ name: 'email', type: 'email' })
                },
                {
                    name: 'password',
                    label: 'Password',
                    widget: CharInput({ name: 'password', type: 'password' })
                }
            ]}
            onSuccess={async (response: Response) => {
                navigate('/')
            }}
        />
    )
}

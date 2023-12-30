import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PillSelectWidget } from '../../widgets/PillSelect'
import { CharInputWidget } from '../../widgets/CharInput'
import GenericForm from '../../elements/GenericForm'

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
                    widget: PillSelectWidget({
                        choices: [
                            { label: 'Individual', value: 'individual' },
                            { label: 'Business', value: 'business' }
                        ]
                    })
                },
                {
                    name: 'display_name',
                    label: 'Display Name',
                    widget: CharInputWidget({
                        type: 'text'
                    })
                },
                {
                    name: 'email',
                    label: 'Email',
                    widget: CharInputWidget({
                        type: 'email'
                    })
                },
                {
                    name: 'password',
                    label: 'Password',
                    widget: CharInputWidget({
                        type: 'password'
                    })
                }
            ]}
            onSuccess={async (response: Response) => {
                navigate('/')
            }}
        />
    )
}

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import { useUserContext } from '../../Context'
import GenericForm from '../../elements/GenericForm'

export default function Login (): React.ReactNode {
    const navigate = useNavigate()
    const { user, setUser } = useUserContext()
    const [searchParams, setSearchParams] = useSearchParams()
    const next = searchParams.get('next')

    useEffect(() => {
        if (user.is_authenticated) {
            navigate('/')
        }
    })

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action="/api/login/"
            title='Login'
            button={{ label: 'Login' }}
            hasCSRF
            fields={[
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
                next == null ? navigate('/') : navigate(next)
            }}
        />
    )
}

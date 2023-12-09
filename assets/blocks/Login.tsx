import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import FormField from '../elements/FormField'
import CharInput from '../widgets/CharInput'
import { useUserContext } from '../Context'
import GenericForm from '../elements/GenericForm'

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
                    widget: CharInput({
                        name: 'email',
                        type: 'email'
                    })
                },
                {
                    name: 'password',
                    label: 'Password',
                    widget: CharInput({
                        name: 'password',
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

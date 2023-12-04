import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import FormField from '../elements/FormField'
import CharInput from '../widgets/CharInput'
import { useUserContext } from '../Context'
import { type HTMLEvent } from '../Types'

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

    const handleForm = async (event: Event): Promise<void> => {
        event.preventDefault()

        const form = (event.target as HTMLElement).closest('form')

        if (form == null) {
            return
        }

        const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form)
        })

        if (response.ok) {
            const requestUser = await response.json()
            setUser({ ...requestUser, is_authenticated: true })
            next == null ? navigate('/') : navigate(next)
        }
        else {
            const data = await response.json()
            setErrors(data)
        }
    }

    const [errors, setErrors] = useState({})
    /* TODO: IMPLEMENT GENERIC FORM DOWN THERE  */

    return (
        <form className="form pamphlet" method="POST" action="/api/login/" onSubmit={handleForm}>
            <div className="form__header">
                <div className="form__title">
                    Login Into Existing Account
                </div>
            </div>
            <hr className="app__divider" />
            <div className="form__body">
                {
                    (errors.non_field_errors != null) && (
                        <div className="form__field">
                            {
                                errors.non_field_errors.map((message) => (
                                    <div className="form__error">
                                        {message}
                                    </div>
                                ))
                            }
                        </div>

                    )
                }
                <FormField
                    name="email"
                    label="Email"
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'text'
                        }
                    }}
                />
                <FormField
                    name="password"
                    label="Password"
                    errors={errors}
                    widget={{
                        component: CharInput,
                        props: {
                            type: 'password'
                        }
                    }}
                />
            </div>
            <hr className="app__divider" />
            <div className="form__footer">
                <Link to="/register/">
                    <div className="app__link">
                        Don't have an account?
                    </div>
                </Link>
                <button type="submit" className="form__submit">
                    Login
                </button>
            </div>
        </form>
    )
}

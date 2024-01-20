import React, { type FormEvent, useState } from 'react'
import FormField from './FormField'
import { getCookie } from '../Utils'
import Icon from './Icon'

interface GenericFormPromptInteface {
    action: string
    title: string
    fields: Array<{
        name: string
        label: string
        widget: ({ name }: { name: string }) => React.ReactNode
    }>
    button: {
        label: string
    }
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    extraClass?: string
    onSuccess: (reponse: Response) => Promise<void>
    hasCSRF?: boolean
    onClose: () => void
}

export default function GenericFormPrompt ({
    action, extraClass, method, title, button, fields, onSuccess, onClose, hasCSRF = false
}: GenericFormPromptInteface): React.ReactNode {
    const [errors, setErrors] = useState<Record<string, string[]> | undefined>()

    async function handleForm (event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault()
        const form = (event.target as HTMLElement).closest('form')

        if (form == null) {
            return
        }

        const requestHeaders: {
            'X-CSRFToken'?: string
        } = {}

        if (hasCSRF) {
            const csrfToken = getCookie('csrftoken')

            if (csrfToken == null) {
                throw Error('Failed to get csrftoken')
            }

            requestHeaders['X-CSRFToken'] = csrfToken
        }

        const response = await fetch(form.action, {
            method,
            body: new FormData(form),
            headers: requestHeaders
        })

        if (response.ok) {
            await onSuccess(response)
        }
        else {
            const data = await response.json()
            console.log(data)
            setErrors(data)
        }
    }

    return (
        <div className="overlay">
            <form action={action} className={`form prop prop--vertical prompt ${extraClass}`} onSubmit={(event) => {
                void handleForm(event)
            }}>
                <div className="prop__header">
                    <div className="prop__title">
                        {title}
                    </div>
                    <div className="prompt__close" onMouseUp={onClose}>
                        <Icon name='close' size='small' hoverable={true} />
                    </div>
                </div>
                <hr className="app__divider" />
                <div className="prop__body">
                    {
                        (errors?.non_field_errors != null) && (
                            <div className="form__field">
                                {
                                    errors.non_field_errors?.map((message: string, i: number) => (
                                        <div className="form__error" key={i}>
                                            {message}
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }
                    {
                        fields.map(({ widget, name, label }, i) => (
                            <FormField widget={widget} name={name} label={label} errors={errors} key={i}/>
                        ))
                    }
                </div>
                <hr className="app__divider" />
                <div className="prop__footer">
                    <button type="submit" className="form__submit">
                        {button.label}
                    </button>
                </div>
            </form>
        </div>
    )
}

import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useLoginRequired } from '../Utils'
import CharInput from '../widgets/CharInput'
import CharTextArea from '../widgets/CharTextArea'
import CategoryPicker from '../widgets/CategoryPicker'
import AdImageInput from '../widgets/AdImageInput'
import GenericForm from '../elements/GenericForm'

export default function PostAd (): React.ReactNode {
    useLoginRequired()
    const navigate = useNavigate()

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action="/api/ads/"
            title="Post Ad"
            button={{ label: 'Post Ad' }}
            hasCSRF
            resettable
            fields={[
                {
                    name: 'title',
                    label: 'Title',
                    widget: {
                        component: CharInput,
                        props: {
                            type: 'text',
                            maxLength: 64
                        }
                    }
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: {
                        component: CharInput,
                        props: {
                            inputMode: 'numeric'
                        }
                    }
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: {
                        component: CharTextArea,
                        props: {
                            maxLength: 4096
                        }
                    }
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: {
                        component: CategoryPicker,
                        props: {}
                    }
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: {
                        component: AdImageInput,
                        props: {}
                    }
                }
            ]}
            onSuccess={async (response: Response) => {
                const ad = await response.json()
                navigate('success/', { state: ad })
            }}
        />
    )
}

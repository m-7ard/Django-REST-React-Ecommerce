import React from 'react'

import { useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../widgets/CharInput'
import { CharTextAreaWidget } from '../widgets/CharTextArea'
import { CategoryPickerWidget } from '../widgets/CategoryPicker'
import { AdImageInputWidget } from '../widgets/AdImageInput'
import GenericForm from '../elements/GenericForm'

export default function PostAd (): React.ReactNode {
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
                    widget: CharInputWidget({
                        type: 'text',
                        maxLength: 64
                    })
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: CharInputWidget({
                        inputMode: 'numeric'
                    })
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: CharTextAreaWidget({
                        maxLength: 4096
                    })
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: CategoryPickerWidget({})
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: AdImageInputWidget({})
                }
            ]}
            onSuccess={async (response: Response) => {
                const ad = await response.json()
                navigate('success/', { state: ad })
            }}
        />
    )
}

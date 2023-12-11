import React from 'react'
import { Navigate, useLoaderData, useNavigate } from 'react-router-dom'
import GenericForm from '../elements/GenericForm'
import { CharInputWidget } from '../widgets/CharInput'
import { CharTextAreaWidget } from '../widgets/CharTextArea'
import { CategoryPickerWidget } from '../widgets/CategoryPicker'
import { AdImageInputWidget } from '../widgets/AdImageInput'
import { type BaseAd } from '../Types'
import { getAdData } from '../Fetchers'
import { useUserContext } from '../Context'

export async function loader ({ params }: { params: { pk: number } }): Promise<BaseAd> {
    const ad = await getAdData(params.pk)
    return ad
}

export default function AdEdit (): React.ReactNode {
    const navigate = useNavigate()
    const ad = useLoaderData() as BaseAd
    const { user } = useUserContext()

    if (ad.created_by.pk !== user.pk) {
        return <Navigate to={'/'} />
    }

    return (
        <GenericForm
            extraClass="pamphlet"
            method="PATCH"
            action={`/api/ads/${ad.pk}/`}
            title="Edit Ad"
            button={{ label: 'Edit Ad' }}
            hasCSRF
            resettable
            fields={[
                {
                    name: 'title',
                    label: 'Title',
                    widget: CharInputWidget({
                        type: 'text',
                        maxLength: 64,
                        initial: ad.title
                    })
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: CharInputWidget({
                        inputMode: 'numeric',
                        initial: ad.price
                    })
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: CharTextAreaWidget({
                        maxLength: 4096,
                        initial: ad.description
                    })
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: CategoryPickerWidget({
                        initial: ad.category
                    })
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: AdImageInputWidget({
                        initial: ad.images
                    })
                }
            ]}
            onSuccess={async () => {
                navigate('success/', { state: ad })
            }}
        />
    )
}

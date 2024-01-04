import React from 'react'
import { Navigate, useLoaderData, useNavigate } from 'react-router-dom'
import GenericForm from '../../elements/GenericForm'
import { CharInputWidget } from '../../widgets/CharInput'
import { CharTextAreaWidget } from '../../widgets/CharTextArea'
import { AdImageInputWidget } from '../../widgets/AdImageInput'
import { type BaseAd } from '../../Types'
import { getAdData } from '../../Fetchers'
import { useUserContext } from '../../Context'
import { CategoryModalSelectWidget } from '../../widgets/ModalSelects/CategoryModalSelect'
import { PlainModalSelectWidget } from '../../widgets/ModalSelects/PlainModalSelect'
import { AD_CONDITIONS, AD_RETURN_POLICIES, NormalizedData } from '../../Utils'

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
                    name: 'shipping',
                    label: 'Shipping Cost',
                    widget: CharInputWidget({
                        inputMode: 'numeric',
                        initial: ad.shipping
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
                    widget: CategoryModalSelectWidget({
                        initial: ad.category
                    })
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: AdImageInputWidget({
                        initial: ad.images
                    })
                },
                {
                    name: 'available',
                    label: 'Amount Available',
                    widget: CharInputWidget({
                        inputMode: 'numeric',
                        initial: ad.available
                    })
                },
                {
                    name: 'condition',
                    label: 'Condition (Optional)',
                    widget: PlainModalSelectWidget({
                        normalizedData: new NormalizedData({
                            data: AD_CONDITIONS,
                            labelKey: 'label',
                            valueKey: 'value'
                        }),
                        title: 'Select Condition',
                        placeholder: 'Select Condition',
                        initial: ad.condition
                    })
                },
                {
                    name: 'return_policy',
                    label: 'Return Policy',
                    widget: PlainModalSelectWidget({
                        normalizedData: new NormalizedData({
                            data: AD_RETURN_POLICIES,
                            labelKey: 'label',
                            valueKey: 'value'
                        }),
                        title: 'Select Return Policy',
                        placeholder: 'Select Return Policy',
                        initial: ad.return_policy
                    })
                }
            ]}
            onSuccess={async () => {
                navigate('success/', { state: ad })
            }}
        />
    )
}

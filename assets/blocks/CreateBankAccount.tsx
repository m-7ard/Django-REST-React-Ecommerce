import React from 'react'
import GenericForm from '../elements/GenericForm'
import { useNavigate } from 'react-router-dom'

export default function CreateBankAccount (): React.ReactNode {
    const navigate = useNavigate()

    return <GenericForm
        title=''
    />
}

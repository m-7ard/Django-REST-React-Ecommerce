import React from 'react'
import { useUserContext } from '../../Context'
import Display from '../../elements/Settings/Display'
import { useLoaderData } from 'react-router-dom'
import { getRequestUserAddresses, getRequestUserBankAccounts } from '../../Fetchers'
import { type Address, type BankAccount } from '../../Types'

interface loaderReturn {
    bankAccounts: BankAccount[]
    addresses: Address[]
}

export async function loader (): Promise<loaderReturn> {
    const bankAccounts = await getRequestUserBankAccounts()
    const addresses = await getRequestUserAddresses()
    return { bankAccounts, addresses }
}

export default function Settings (): React.ReactNode {
    const { user } = useUserContext()
    const { bankAccounts, addresses } = useLoaderData() as loaderReturn
    const defaultBankAccount = bankAccounts.find((bankAccount) => bankAccount.pk === user.default_bank)
    const defaultAddress = addresses.find((address) => address.pk === user.default_address)

    return (
        <div className="settings prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Settings
                </div>
            </div>
            <hr className="app__divider" />
            <Display title='Display Name' link='/' current={(
                <>
                    <div className='prop__detail'>
                        {user.display_name}
                    </div>
                </>
            )} />
            <Display title='Email' link='/' current={(
                <>
                    <div className='prop__detail'>
                        {user.email}
                    </div>
                </>
            )} />
            <Display title='Password' link='/' current={(
                <>
                    <div className='prop__detail'>
                        ****
                    </div>
                </>
            )} />
            <Display title='Bank Accounts' link='/bank-accounts/' current={
                defaultBankAccount == null
                    ? (
                        <>
                            <div className='prop prop--vertical'>
                                <div className="prop__header">
                                    <div className="prop__label">
                                        No Default Bank Account
                                    </div>
                                </div>
                            </div>
                            <div className="prop__label">
                                {bankAccounts.length} Linked Bank Accounts
                            </div>
                        </>
                    )
                    : (
                        <>
                            <div className='prop prop--vertical prop--highlighted'>
                                <div className="prop__header">
                                    <div>
                                        <div className="prop__label">
                                            {defaultBankAccount.owner}
                                        </div>
                                        <div className='prop__detail'>
                                            {defaultBankAccount.iban}
                                        </div>
                                    </div>
                                </div>
                                <hr className="app__divider" />
                                <div>
                                    <div className='prop__detail'> {defaultBankAccount.address.name} </div>
                                    <div className='prop__detail'> {defaultBankAccount.address.street} </div>
                                    <div className='prop__detail'> {defaultBankAccount.address.locality} </div>
                                    <div className='prop__detail'> {defaultBankAccount.address.zip_code} </div>
                                    <div className='prop__detail'> {defaultBankAccount.address.country_display} </div>
                                </div>
                            </div>
                            <div className="prop__label">
                                {bankAccounts.length} Linked Bank Accounts
                            </div>
                        </>
                    )
            } />
            <Display title='Addresses' link='/addresses/' current={
                defaultAddress == null
                    ? (
                        <>
                            <div className='prop prop--vertical prop--highlighted'>
                                <div className="prop__header">
                                    <div className="prop__label">
                                        No Default Address
                                    </div>
                                </div>
                            </div>
                            <div className="prop__label">
                                {addresses.length} Linked Addrersses
                            </div>
                        </>
                    )
                    : (
                        <>
                            <div className='prop prop--vertical prop--highlighted'>
                                <div className='prop__header'>
                                    <div className='prop__label'>
                                        {defaultAddress.name}
                                    </div>
                                </div>
                                <hr className="app__divider" />
                                <div>
                                    <div className='prop__detail'> {defaultAddress.street} </div>
                                    <div className='prop__detail'> {defaultAddress.locality} </div>
                                    <div className='prop__detail'> {defaultAddress.zip_code} </div>
                                    <div className='prop__detail'> {defaultAddress.country_display} </div>
                                </div>
                            </div>
                            <div className='prop__label'>
                                {addresses.length} Linked Addresses
                            </div>
                        </>
                    )} />
        </div>
    )
}

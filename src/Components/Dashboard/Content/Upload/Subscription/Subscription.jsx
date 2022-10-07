import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import './Subscription.css'

export default function Subscription({ setRemainingFiles }) {
	const { user } = useAuth0()
	const [subscriptionWarning, setSubscriptionWarning] = useState()

	useEffect(() => {
		handleSubscription()
	}, [])

	async function handleSubscription() {
		const [subscription, pastFiles] = await Promise.all([GETSubscription(), GETPastFiles()])

		if (!subscription?.Item?.subscriptions?.data[0]?.plan?.amount) {
			const newRemainingFiles = Math.max(2 - pastFiles.Count || 0, 0)
			const newSubscriptionWarning = `You are on the Free Plan. You have ${newRemainingFiles} free file uploads remaining. Click here to upgrade`
			setRemainingFiles(newRemainingFiles)
			setSubscriptionWarning(newSubscriptionWarning)
		}
	}

	async function GETSubscription() {
		return axios
			.get(`https://leano.ai/v2/subscriptions?id=${user.sub.replace('auth0|', '')}`)
			.then(({ data }) => data)
			.catch(console.error)
	}

	function GETPastFiles() {
		return axios
			.get(`https://leano.ai/v2/transcriptions?u=${user.sub.replace('auth0|', '')}`)
			.then(({ data }) => data)
			.catch(console.error)
	}

	return subscriptionWarning ? (
		<Link className='Subscription' to='/dashboard/pricing'>
			<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>
				<path d='M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32z' />
			</svg>
			<div>{subscriptionWarning}</div>
		</Link>
	) : (
		<div className='SubscriptionEmpty' />
	)
}

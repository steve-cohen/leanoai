import { useEffect, useState } from 'react'
import { withAuthenticationRequired, useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import Content from './Content/Content'
import Navigation from './Navigation/Navigation'
import './Dashboard.css'

function Dashboard({ version }) {
	const { user } = useAuth0()
	const [file, setFile] = useState()
	const [isLoading, setIsLoading] = useState(true)
	const [subscription, setSubscription] = useState({})

	useEffect(() => {
		console.log('Sub')
		axios
			.get(`https://leano.ai/v2/subscriptions?id=${user.sub.replace('auth0|', '')}`)
			.then(({ data }) => {
				setSubscription(data)
				setIsLoading(false)
			})
			.catch(error => {
				alert(error)
				setIsLoading(false)
			})
	}, [])

	function render() {
		if (isLoading) return <div className='Loading Pulse'>Loading</div>

		// if (subscription && !subscription.Item) {
		// 	return (
		// 		<div className='PricingTable'>
		// 			<stripe-pricing-table
		// 				client-reference-id={user.sub.replace('auth0|', '')}
		// 				customer-email={user.email}
		// 				pricing-table-id={
		// 					process.env.NODE_ENV === 'development'
		// 						? 'prctbl_1LohawGevqKmdSivE0bWoYef'
		// 						: 'prctbl_1LoiZVGevqKmdSiv9KqLbVfw'
		// 				}
		// 				publishable-key={
		// 					process.env.NODE_ENV === 'development'
		// 						? 'pk_test_51LczAlGevqKmdSivNHMy4cgnQOxMMkGCgwmBFzeWJsknpHrcA57XnIeiQm45N71mrRGTIxpG52QfwBKiwNPapLO200J8QKVxN1'
		// 						: 'pk_live_51LczAlGevqKmdSivKpj30FXU6BCcqGsroX6lQb8feswpd8t5lhKmesp7j6ilMZprnmjDKE71uq5L7uS5PzyUJEk400gDz4F883'
		// 				}
		// 			/>
		// 		</div>
		// 	)
		// }

		return (
			<div className='Dashboard'>
				<Navigation setFile={setFile} />
				<Content file={file} setFile={setFile} subscription={subscription} version={version} />
			</div>
		)
	}

	return isLoading ? (
		<div className='Loading Pulse'>Loading</div>
	) : (
		<div className='Dashboard'>
			<Navigation setFile={setFile} />
			<Content file={file} setFile={setFile} subscription={subscription} version={version} />
		</div>
	)
}

export default withAuthenticationRequired(Dashboard)

import { useAuth0 } from '@auth0/auth0-react'
import './Pricing.css'

export default function Pricing() {
	const { user } = useAuth0()

	return (
		<div className='Pricing'>
			<stripe-pricing-table
				client-reference-id={user.sub.replace('auth0|', '')}
				customer-email={user.email}
				pricing-table-id={
					process.env.NODE_ENV === 'development' ? 'prctbl_1LohawGevqKmdSivE0bWoYef' : 'prctbl_1LoiZVGevqKmdSiv9KqLbVfw'
				}
				publishable-key={
					process.env.NODE_ENV === 'development'
						? 'pk_test_51LczAlGevqKmdSivNHMy4cgnQOxMMkGCgwmBFzeWJsknpHrcA57XnIeiQm45N71mrRGTIxpG52QfwBKiwNPapLO200J8QKVxN1'
						: 'pk_live_51LczAlGevqKmdSivKpj30FXU6BCcqGsroX6lQb8feswpd8t5lhKmesp7j6ilMZprnmjDKE71uq5L7uS5PzyUJEk400gDz4F883'
				}
			/>
		</div>
	)
}

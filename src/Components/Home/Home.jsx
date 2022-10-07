import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import './Home.css'

export default function Home({ version }) {
	const { loginWithRedirect } = useAuth0()

	return (
		<div className='Home'>
			<div className='Hero'>
				<div className='Action'>
					<div className='Title'>{`Cut Podcasts & Interviews\ninto Short Clips\nusing AI`}</div>
					<div className='Description'>
						Create more content in less time. Build your audience faster. Increase monetization.
					</div>
					{/* <Link className='GetStarted' to='/dashboard'>
						Click Here to Try Beta {version}
					</Link> */}
					{/* <Link className='GetStarted' to='/signup'>
						Try Beta {version} for Free
					</Link> */}
					<div className='GetStarted' onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
						Try Beta {version} for Free
					</div>
					<div className='SignIn' onClick={() => loginWithRedirect({ screen_hint: 'signin' })}>
						Sign In
					</div>
				</div>
				<div />
			</div>
		</div>
	)
}

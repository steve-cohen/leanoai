import { useState } from 'react'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Content from './Content/Content'
import Navigation from './Navigation/Navigation'
import './Dashboard.css'

function Dashboard({ version }) {
	const [file, setFile] = useState()

	return (
		<div className='Dashboard'>
			<Navigation setFile={setFile} />
			<Content file={file} setFile={setFile} version={version} />
		</div>
	)
}

export default withAuthenticationRequired(Dashboard)

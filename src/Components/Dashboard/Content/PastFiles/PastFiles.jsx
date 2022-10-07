import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import './PastFiles.css'

export default function PastFiles({ setFile }) {
	const { user } = useAuth0()
	const navigate = useNavigate()

	const [isLoading, setIsLoading] = useState(false)
	const [transcriptions, setTranscriptions] = useState()

	useEffect(() => {
		setIsLoading(true)
		axios
			.get(`https://leano.ai/v2/transcriptions?u=${user.sub.replace('auth0|', '')}`)
			.then(({ data }) => {
				setTranscriptions(data)
				setIsLoading(false)
			})
			.catch(alert)
	}, [])

	function handlePastFile(transcriptId) {
		setFile()
		navigate(`/dashboard/clips?i=${transcriptId}`)
	}

	return (
		<div className='PastFiles'>
			<table>
				<caption>
					<div className='Title'>Past Files</div>
				</caption>
				<thead>
					<tr>
						<th className='Bold'>DATE</th>
						<th className='Bold'>FILE</th>
						<th className='Right'>SIZE</th>
						<th className='Break'>TYPE</th>
					</tr>
				</thead>
				<tbody>
					{transcriptions?.Items?.map(({ filename, filesize, filetype, timestamp, transcriptId }) => (
						<tr key={`Transcription ${transcriptId}`} onClick={() => handlePastFile(transcriptId)}>
							<td className='Bold'>{new Date(timestamp).toLocaleString()}</td>
							<td className='Bold Link'>{filename}</td>
							<td className='Right'>{(filesize / 1000 ** 2).toFixed(1)} MB</td>
							<td className='Break'>{filetype}</td>
						</tr>
					))}
					{isLoading && (
						<tr>
							<td className='Pulse'>Loading</td>
						</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<td className='Bold Link' onClick={() => navigate('/dashboard/upload')}>
							+ Upload New File
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	)
}

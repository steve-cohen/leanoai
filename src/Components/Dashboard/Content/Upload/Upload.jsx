import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import axios from 'axios'
import './Upload.css'
import Subscription from './Subscription/Subscription'

// Single Thread
const ffmpeg = createFFmpeg({
	corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
	log: process.env.NODE_ENV === 'development' ? true : false,
	mainName: 'main'
})

export default function Upload({ setFile }) {
	const { user } = useAuth0()
	const audioRef = useRef()
	const navigate = useNavigate()

	const [error, setError] = useState()
	const [duration, setDuration] = useState()
	const [formatProgress, setFormatProgress] = useState('Formatting File')
	const [isUploading, setIsUploading] = useState(false)
	const [remainingFiles, setRemainingFiles] = useState()
	const [uploadFile, setUploadFile] = useState()
	const [uploadProgress, setUploadProgress] = useState('0.00% Uploaded')

	useEffect(() => {
		clearForm()
	}, [])

	function clearForm() {
		setError()
		setDuration()
		setFormatProgress('Formatting')
		setIsUploading(false)
		setUploadFile()
		setUploadProgress('0.00% Uploaded')
	}

	function handleSubmit(e) {
		e.preventDefault()
		setError()
		setIsUploading(true)

		if (!uploadFile) {
			setError('Please select a file')
			setIsUploading(false)
			return
		}

		if (uploadFile.size > 2000000000) {
			setError('The maximum file size is 2 GB')
			setUploadFile()
			setIsUploading(false)
			return
		}

		if (duration > 7200) {
			setError('The maximum duration is 2 Hours')
			setUploadFile()
			setIsUploading(false)
			return
		}

		if (remainingFiles === 0) {
			setError('You have 0 free file uploads remaining')
			setIsUploading(false)
			return
		}

		setFile(uploadFile)
		upload(uploadFile)
	}

	async function upload(file) {
		// [1.0] Strip Audio from File
		let newFile = file

		if (file.type.includes('video')) {
			if (!ffmpeg.isLoaded()) await ffmpeg.load()
			// ffmpeg.setProgress(({ ratio }) => setFormatProgress((100 * ratio).toFixed(2) + '% Formatted'))
			ffmpeg.FS('writeFile', file.name, await fetchFile(file))
			await ffmpeg.run('-i', file.name, '-vn', 'audio.mp3')
			newFile = new File([ffmpeg.FS('readFile', 'audio.mp3')], { type: 'audio/mp3' })
			ffmpeg.exit()
		}
		setFormatProgress('100.00% Formatted')

		// [2.0] Upload Audio
		let formData = new FormData()
		formData.append('selectedFile', newFile)
		const uploadURL = await axios
			.request({
				data: formData,
				method: 'POST',
				onUploadProgress: p => setUploadProgress(((100 * p.loaded) / p.total).toFixed(2) + '% Uploaded'),
				url: 'https://leano.ai/v2/upload'
			})
			.then(({ data }) => data.upload_url)
			.catch(alert)

		// [3.0] Analyze
		const transcriptId = await axios
			.request({
				data: {
					audio_url: uploadURL,
					auto_chapters: true,
					auto_highlights: true,
					content_safety: true,
					speaker_labels: true,

					entity_detection: true,
					iab_categories: true,
					sentiment_analysis: true
				},
				method: 'POST',
				url: `https://leano.ai/v2/transcript`
			})
			.then(({ data }) => data.id)
			.catch(alert)

		// [4.0] Save TranscriptionId
		await axios
			.post('https://leano.ai/v2/transcriptions', {
				filename: file.name,
				filesize: file.size,
				filetype: file.type,
				client_reference_id: user.sub.replace('auth0|', ''),
				customer_email: user.email,
				duration,
				transcriptId
			})
			.catch(console.log)

		// [5.0] Navigate to Clips
		localStorage.setItem(
			transcriptId,
			JSON.stringify({ start: new Date().getTime(), end: new Date().getTime() + duration * 1000 * 0.2 })
		)
		navigate(`/dashboard/clips?i=${transcriptId}`)
	}

	return (
		<>
			<Subscription setRemainingFiles={setRemainingFiles} />
			<div className='Upload NewForm NewFormWrapper'>
				{!isUploading ? (
					<form onSubmit={handleSubmit}>
						<div className='Title'>Upload a New File</div>
						<div>File (Limit 2 GB / 10 Hours)</div>
						<label className='Input'>
							<input
								accept='.3ga,.8svx,.aac,.ac3,.aif,.aiff,.alac,.amr,.ape,.au,.dss,.flac,.flv,.m4a,.m4b,.m4p,.m4r,.mp3,.mpga,.ogg,.oga,.mogg,.opus,.qcp,.tta,.voc,.wav,.wma,.wv,.webm,.MTS,.M2TS,.TS,.mov,.mp2,.mp4,.m4p,.m4v,.mxf'
								onChange={e => e?.target?.files?.length && setUploadFile(e.target.files[0])}
								type='file'
							/>
							{uploadFile ? uploadFile.name : '+ Select a File'}
						</label>
						{uploadFile && (
							<>
								<div>Last Modified</div>
								<input disabled value={new Date(uploadFile.lastModified).toLocaleString()} />
								<div>File Size</div>
								<input disabled value={(uploadFile.size / 1000000).toFixed(1) + ' MB'} />
								<div>File Type</div>
								<input disabled value={uploadFile.type} />
							</>
						)}
						<input className='Continue' disabled={isUploading ? true : false} type='submit' value='Upload File' />
						{uploadFile && (
							<div className='Cancel' onClick={clearForm}>
								Cancel
							</div>
						)}
						<div className='Error'>
							{error === 'You have 0 free file uploads remaining' ? (
								<Link className='Red' to='/dashboard/pricing'>
									You have 0 free file uploads remaining. Click here to upgrade
								</Link>
							) : (
								error
							)}
						</div>
						{uploadFile && (
							<audio
								onLoadedMetadata={() => setDuration(audioRef.current.duration)}
								ref={audioRef}
								src={URL.createObjectURL(uploadFile)}
								style={{ display: 'none' }}
							/>
						)}
					</form>
				) : (
					<form onSubmit={null}>
						<div className='Title'>Upload New File</div>
						<div>Step 1: Format File</div>
						<input className={formatProgress === 'Formatting' ? 'Pulse' : ''} disabled value={formatProgress} />
						<div>Step 2: Upload File</div>
						<input
							className={uploadProgress === '0.00% Uploaded' || uploadProgress === '100.00% Uploaded' ? '' : 'Pulse'}
							disabled
							value={uploadProgress}
						/>
						<div>Step 3: Analyze File</div>
						<input disabled value={'0.00% Analyzed'} />
					</form>
				)}
			</div>
		</>
	)
}

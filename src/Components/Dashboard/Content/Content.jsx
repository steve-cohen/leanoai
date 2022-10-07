import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import Clips from './Clips/Clips'
import PastFiles from './PastFiles/PastFiles'
import Pricing from './Pricing/Pricing'
import Settings from './Settings/Settings'
import Transcript from './Transcript/Transcript'
import Upload from './Upload/Upload'
import Warnings from './Warnings/Warnings'

import './Content.css'

export default function Content({ file, setFile, version }) {
	const [searchParams] = useSearchParams()
	const [isLoading, setIsLoading] = useState(false)
	const [results, setResults] = useState()
	const [transcript, setTranscript] = useState()

	const resultsRef = useRef()
	resultsRef.current = results

	useEffect(() => {
		if (searchParams.get('i')) {
			setIsLoading(true)
			setResults()
			poll()

			const timer = setInterval(() => {
				if (resultsRef.current && resultsRef.current.status === 'completed') {
					setIsLoading(false)
					clearInterval(timer)
				} else if (resultsRef.current && resultsRef.current.status === 'error') {
					setIsLoading(false)
					clearInterval(timer)
					alert(resultsRef.current.error)
				} else {
					poll()
				}
			}, 5000)

			return () => clearInterval(timer)
		}
	}, [searchParams])

	function poll() {
		console.log('Poll')
		axios
			.request({ url: `https://leano.ai/v2/transcript/${searchParams.get('i')}` })
			.then(({ data }) => {
				setResults(data)

				if (data.status === 'completed') {
					axios
						.request({ url: `https://leano.ai/v2/transcript/${searchParams.get('i')}/paragraphs` })
						.then(({ data }) => setTranscript(data))
						.catch(alert)
				}
			})
			.catch(alert)
	}

	return (
		<div className='Content'>
			<Routes>
				<Route path='clips' element={<Clips file={file} isLoading={isLoading} results={results} setFile={setFile} />} />
				<Route path='pricing' element={<Pricing />} />
				<Route path='settings' element={<Settings />} />
				<Route path='transcript' element={<Transcript transcript={transcript} />} />
				<Route path='upload' element={<Upload file={file} setFile={setFile} version={version} />} />
				<Route path='warnings' element={<Warnings file={file} results={results} setFile={setFile} />} />
				<Route path='*' element={<PastFiles setFile={setFile} />} />
			</Routes>
		</div>
	)
}

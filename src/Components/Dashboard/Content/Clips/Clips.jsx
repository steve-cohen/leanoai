import { useEffect, useState } from 'react'
import Clip from './Clip/Clip'
import './Clips.css'

export default function Clips({ file, isLoading, results, setFile }) {
	const [clips, setClips] = useState()
	const [isProcessing, setIsProcessing] = useState(false)
	const [percentAnalyzed, setPercentAnalyzed] = useState('0.00% Analyzed')

	useEffect(() => {
		if (results) selectClips()
		else setClips()
	}, [results])

	function filterClipsbyTime(start, end, minDuration, maxDuration) {
		const clipTime = end - start
		return clipTime >= minDuration && clipTime <= maxDuration ? true : false
	}

	function formatTranscript(start, end, words) {
		let transcript = []
		for (let i = 0; i < words.length; i++) {
			const word = words[i]
			if (word.start >= start) transcript.push(word.text)
			if (word.end >= end) break
		}

		return transcript.join(' ')
	}

	function selectClips() {
		let chapters = []
		let filteredClips = []

		if (results && results.status === 'completed') {
			setIsProcessing(false)

			// [1.0] Filter Clips
			// [1.1] Chapters
			if (results.chapters && results.words) {
				results.chapters.forEach(({ start, end }) => {
					chapters.push({ start, end, text: formatTranscript(start, end, results.words) })
				})
			}

			// [1.2] Utterances
			if (results.utterances) {
				results.utterances.forEach(clip => filteredClips.push(clip))
			}

			// [1.3] IAB Categories
			if (results.iab_categories_result.status === 'success') {
				results.iab_categories_result.results.forEach(({ text, timestamp }) => {
					filteredClips.push({ start: timestamp.start, end: timestamp.end, text: text })
				})
			}

			// [1.4] Content Safety Labels
			if (results.content_safety_labels.status === 'success') {
				results.content_safety_labels.results.forEach(clip => {
					filteredClips.push({ start: clip.timestamp.start, end: clip.timestamp.end, text: clip.text })
				})
			}

			// [2.0] Filter Clips by Time
			let timeFilteredClips = filteredClips.filter(({ start, end }) => filterClipsbyTime(start, end, 20000, 120000))
			filteredClips = timeFilteredClips

			// [3.0] Remove Duplicate Clips
			let uniqueClips = {}
			chapters.forEach(clip => (uniqueClips[`${clip.start}-${clip.end}`] = clip))
			filteredClips.forEach(clip => (uniqueClips[`${clip.start}-${clip.end}`] = clip))

			// [4.0] Sort Clips by Start Time, then by Duration
			const newClips = Object.values(uniqueClips)
				.sort((a, b) => a.end - a.start - (b.end - b.start))
				.sort((a, b) => a.start - b.start)

			setClips(newClips)
		} else if (results?.status === 'queued' || results?.status === 'processing') {
			setIsProcessing(true)
			const currentTime = new Date().getTime()
			const { start, end } = JSON.parse(localStorage.getItem(results.id))
			setPercentAnalyzed(Math.min(((currentTime - start) / (end - start)) * 100, 99.99).toFixed(2) + '% Analyzed')
		}
	}

	return !isProcessing ? (
		<table className='Clips'>
			<caption>
				{clips?.length} Clips {file?.name && `- ${file.name}`}
			</caption>
			<thead>
				<tr>
					<th>ACTIONS</th>
					<th>{file ? 'CLIP' : ''}</th>
					<th>TRANSCRIPT</th>
					<th className='Duration'>TIME</th>
					<th className='Start'>START</th>
					<th className='End'>END</th>
				</tr>
			</thead>
			<tbody>
				{clips?.map(({ end, start, text }, index) => (
					<Clip
						end={end}
						file={file}
						key={`Clip ${start}-${end}`}
						index={index}
						setFile={setFile}
						start={start}
						transcript={text}
					/>
				))}
				{isLoading && (
					<tr>
						<td className='Pulse'>Loading</td>
					</tr>
				)}
			</tbody>
		</table>
	) : (
		<div className='Clips NewForm NewFormWrapper'>
			<form onSubmit={null}>
				<div className='Title'>Upload New File</div>
				<div>Step 1: Format File</div>
				<input disabled value='100.00% Formatted' />
				<div>Step 2: Upload File</div>
				<input disabled value='100.00% Uploaded' />
				<div>Step 3: Analyze File</div>
				<input className='Pulse' disabled value={percentAnalyzed} />
			</form>
		</div>
	)
}

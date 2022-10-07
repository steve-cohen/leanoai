import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Transcript.css'

export default function Transcript({ transcript }) {
	const [searchParams] = useSearchParams()
	const [paragraphs, setParagraphs] = useState()

	useEffect(() => {
		if (transcript) createParagraphs()
	}, [transcript])

	function createParagraphs() {
		// [1.0] Create Paragraphs
		let currentSpeaker = 'A'
		let newParagraph = []
		let newParagraphs = []

		transcript.paragraphs.forEach(({ words }, index) => {
			words.forEach(word => {
				if (word.speaker === currentSpeaker) {
					newParagraph.push(word)
				} else {
					if (newParagraph.length) newParagraphs.push(newParagraph)
					newParagraph = [word]
					currentSpeaker = word.speaker
				}
			})

			if (!newParagraph[newParagraph.length - 1].text.includes('\n\n')) {
				newParagraph[newParagraph.length - 1].text += '\n\n'
			}
			if (index === transcript.paragraphs.length - 1) newParagraphs.push(newParagraph)
		})

		// [2.0] Remove Trailing Line Breaks
		newParagraphs = newParagraphs.map(newParagraph => {
			newParagraph[newParagraph.length - 1].text = newParagraph[newParagraph.length - 1].text.replace(/\n/g, '')
			return newParagraph
		})

		setParagraphs(newParagraphs)
	}

	async function handleDownload(fileType) {
		const fileContent = await fetch(`https://leano.ai/v2/transcript/${searchParams.get('i')}/${fileType}`).then(
			response => response.text()
		)
		const blob = new Blob([fileContent], { type: 'text/plain' })
		const a = document.createElement('a')
		a.setAttribute('download', `transcript.${fileType}`)
		a.setAttribute('href', window.URL.createObjectURL(blob))
		a.click()
		document.body.removeChild(a)
	}

	return (
		transcript?.paragraphs && (
			<div className='Transcript'>
				<div className='TranscriptNavigation'>
					<div onClick={() => handleDownload('srt')}>Download .SRT</div>
					<div onClick={() => handleDownload('vtt')}>Download .VTT</div>
				</div>
				<table>
					<caption>
						<div className='Title'>Full Transcript</div>
					</caption>
					<thead>
						<tr>
							<th>SPEAKER</th>
							<th>TRANSCRIPT</th>
						</tr>
					</thead>
					<tbody>
						{paragraphs?.map((paragraph, index) => (
							<tr className='Paragraph' key={`Paragraph ${index}`}>
								<td className='Bold'>Speaker {paragraph[0].speaker}: </td>
								<td className='Paragraph Break'>{paragraph.map(({ text }) => `${text} `)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		)
	)
}

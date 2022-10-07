import { useState } from 'react'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import SelectOriginalFile from './SelectOriginalFile/SelectOriginalFile'
import Video from './Video/Video'
import './Clip.css'

// Multi-Thread
// const ffmpeg = createFFmpeg({ log: process.env.NODE_ENV === 'development' ? true : false })

// Single Thread
const ffmpeg = createFFmpeg({
	corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
	log: process.env.NODE_ENV === 'development' ? true : false,
	mainName: 'main'
})

export default function Clip({ end, file, index, setFile, start, transcript }) {
	const [isDownloading, setIsDownloading] = useState(false)

	async function downloadClip() {
		if (!file) return
		setIsDownloading(true)

		// const clipName = `${formatTime(start)} - ${formatTime(end)} - ${file.name}`
		const clipName = `Clip ${index} - ${file.name}`

		// Create Clip
		if (!ffmpeg.isLoaded()) await ffmpeg.load()
		ffmpeg.FS('writeFile', file.name, await fetchFile(file))
		await ffmpeg.run(
			'-ss',
			formatTimeFFMPEG(start),
			'-i',
			file.name,
			'-to',
			formatTimeFFMPEG(end - start),
			'-c:v',
			'copy',
			'-c:a',
			'copy',
			clipName
		)
		const newClip = ffmpeg.FS('readFile', clipName)
		ffmpeg.exit()

		// Trigger Download
		const link = document.createElement('a')
		link.href = URL.createObjectURL(new Blob([newClip.buffer], { type: file.type }))
		link.download = clipName
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		setIsDownloading(false)
	}

	function formatTime(milliseconds) {
		let time = new Date(milliseconds).toISOString()

		if (milliseconds < 600000) return time.slice(15, 19)
		if (milliseconds < 3600000) return time.slice(14, 19)
		if (milliseconds < 36000000) return time.slice(12, 19)
		return time.slice(11, 19)
	}

	function formatTimeFFMPEG(milliseconds) {
		return new Date(milliseconds).toISOString().slice(11, 23)
	}

	function renderPreview() {
		if (file?.type.includes('video')) return <Video end={end} file={file} formatTime={formatTime} start={start} />
		if (file?.type.includes('audio')) return
	}

	return (
		<tr className='Clip'>
			{file ? (
				<td className={`Download${isDownloading ? ' Downloading' : ''}`}>
					<button disabled={isDownloading} onClick={downloadClip}>
						{isDownloading ? 'Downloading' : 'Download Clip'}
					</button>
				</td>
			) : (
				<td>
					<SelectOriginalFile setFile={setFile} />
				</td>
			)}
			<td>{renderPreview()}</td>
			<td className='Transcript'>
				<div>{transcript}</div>
			</td>
			<td className='Duration'>{formatTime(end - start)}</td>
			<td className='Start'>{formatTime(start)}</td>
			<td className='End'>{formatTime(end)}</td>
		</tr>
	)
}
